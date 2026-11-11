import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useDispatch, useSelector } from 'react-redux';
import type { CustomerInfo } from 'react-native-purchases';
import {
  AccessSource,
  PaywallOutcome,
  accessFromCustomerInfo,
  addCustomerInfoListener,
  configurePurchases,
  getAccessSource,
  getCustomerInfo,
  getFreshCustomerInfo,
  hasPersonalAccess,
  identifyPurchaseUser,
  isPurchasesConfigured,
  presentPaywall,
  resetPurchaseUser,
  restorePurchases,
} from './revenueCat';
import { PlanAccess, accessFromServerPlan, mergeAccess } from './accessPolicy';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS } from '../../config/constants';
import { checkAuthAsync } from '../../redux/services/authService';
import type { AppDispatch } from '../../types/store.types';

/** Push types the backend sends when a subscription starts, ends or fails to renew. */
const SUBSCRIPTION_PUSH_TYPES = ['subscription_activated', 'subscription_cancelled', 'payment_failed'];

interface PurchasesContextValue {
  customerInfo: CustomerInfo | null;
  access: PlanAccess;
  hasPersonal: boolean;
  hasBusiness: boolean;
  /** SDK configured (an API key exists for this platform). */
  ready: boolean;
  /** First customer info lookup for the current user has finished. */
  loaded: boolean;
  accessSource: AccessSource;
  refresh: () => Promise<void>;
  openPaywall: () => Promise<PaywallOutcome>;
  /** Resolves true when an active plan was found (website, store or admin granted). */
  restore: () => Promise<boolean>;
  syncAfterChange: (info?: CustomerInfo | null) => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextValue>({
  customerInfo: null,
  access: { personal: false, business: false },
  hasPersonal: false,
  hasBusiness: false,
  ready: false,
  loaded: false,
  accessSource: 'none',
  refresh: async () => {},
  openPaywall: async () => 'unavailable',
  restore: async () => false,
  syncAfterChange: async () => {},
});

export const PurchasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: any) => state.user_auth?.user_data?.id ?? null);
  const serverSub = useSelector((state: any) => state.user_auth?.user_data?.subscription ?? null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const refreshing = useRef<Promise<void> | null>(null);
  const reconciledFor = useRef<string | null>(null);

  const rcAccess = useMemo(() => accessFromCustomerInfo(customerInfo), [customerInfo]);
  const serverAccess = useMemo(
    () => accessFromServerPlan(serverSub),
    [serverSub],
  );
  const access = useMemo(() => mergeAccess(rcAccess, serverAccess), [rcAccess, serverAccess]);
  const rcState = `${rcAccess.personal}:${rcAccess.business}`;
  const serverState = `${serverAccess.personal}:${serverAccess.business}`;

  useEffect(() => {
    configurePurchases();
    setReady(isPurchasesConfigured());
  }, []);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    return addCustomerInfoListener(setCustomerInfo);
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    let cancelled = false;
    setLoaded(false);
    reconciledFor.current = null;

    const sync = async () => {
      let info: CustomerInfo | null;
      if (userId) {
        info = await identifyPurchaseUser(userId);
        // logIn for the same user returns the cached copy, which can miss a plan
        // bought on the website a moment ago.
        if (!hasPersonalAccess(info)) {
          info = (await getFreshCustomerInfo()) ?? info;
        }
      } else {
        await resetPurchaseUser();
        info = await getCustomerInfo();
      }
      if (!cancelled) {
        setCustomerInfo(info);
        setLoaded(true);
      }
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  const syncBackend = useCallback(async () => {
    if (!userId) {
      return;
    }
    try {
      await apiHandle.post(API_ENDPOINTS.PURCHASES.SYNC);
    } catch {
    }
    dispatch(checkAuthAsync());
  }, [dispatch, userId]);

  const refresh = useCallback(async () => {
    if (!ready) {
      return;
    }
    // Foreground, push and polling can all ask at once; one request is enough.
    if (!refreshing.current) {
      refreshing.current = (async () => {
        const info = await getFreshCustomerInfo();
        if (info) {
          setCustomerInfo(info);
        }
      })().finally(() => {
        refreshing.current = null;
      });
    }
    return refreshing.current;
  }, [ready]);

  // Coming back from the browser (or Settings) after buying, cancelling or changing a plan.
  useEffect(() => {
    if (!ready || !userId) {
      return undefined;
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => sub.remove();
  }, [ready, userId, refresh]);

  // The backend pushes when a subscription starts or ends, wherever it was bought.
  useEffect(() => {
    if (!ready || !userId) {
      return undefined;
    }
    return messaging().onMessage(async (message) => {
      const type = message?.data?.type ?? message?.data?.notificationType;
      if (typeof type === 'string' && SUBSCRIPTION_PUSH_TYPES.includes(type)) {
        await refresh();
        dispatch(checkAuthAsync());
      }
    });
  }, [ready, userId, refresh, dispatch]);

  useEffect(() => {
    if (!ready || !loaded || !userId || !serverSub) {
      return;
    }
    if (rcState === serverState) {
      reconciledFor.current = null;
      return;
    }
    const key = `${userId}|${rcState}|${serverState}`;
    if (reconciledFor.current === key) {
      return;
    }
    reconciledFor.current = key;
    (async () => {
      const info = await getFreshCustomerInfo();
      if (info) {
        setCustomerInfo(info);
      }
      const fresh = accessFromCustomerInfo(info);
      if (`${fresh.personal}:${fresh.business}` !== serverState) {
        syncBackend();
      }
    })();
  }, [ready, loaded, userId, serverSub, rcState, serverState, syncBackend]);

  const openPaywall = useCallback(async (): Promise<PaywallOutcome> => {
    const outcome = await presentPaywall();
    if (outcome === 'purchased' || outcome === 'restored') {
      await refresh();
      syncBackend();
    }
    return outcome;
  }, [refresh, syncBackend]);

  const restore = useCallback(async (): Promise<boolean> => {
    // A plan bought on the website or granted by an admin is already on the account;
    // only fall back to the App Store / Play Store restore when nothing is there.
    const fresh = await getFreshCustomerInfo();
    if (fresh && hasPersonalAccess(fresh)) {
      setCustomerInfo(fresh);
      syncBackend();
      return true;
    }
    const info = await restorePurchases();
    syncBackend();
    if (!info) {
      return false;
    }
    setCustomerInfo(info);
    return hasPersonalAccess(info);
  }, [syncBackend]);

  const syncAfterChange = useCallback(
    async (info?: CustomerInfo | null) => {
      if (info) {
        setCustomerInfo(info);
      } else {
        await refresh();
      }
      await syncBackend();
    },
    [refresh, syncBackend],
  );

  const value = useMemo<PurchasesContextValue>(
    () => ({
      customerInfo,
      access,
      hasPersonal: access.personal,
      hasBusiness: access.business,
      ready,
      loaded,
      accessSource: getAccessSource(customerInfo),
      refresh,
      openPaywall,
      restore,
      syncAfterChange,
    }),
    [customerInfo, access, ready, loaded, refresh, openPaywall, restore, syncAfterChange],
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
};

export const usePurchases = (): PurchasesContextValue => useContext(PurchasesContext);
