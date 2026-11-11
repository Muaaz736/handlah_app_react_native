import { useCallback, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { PurchasesPackage } from 'react-native-purchases';
import { usePurchases } from '../services/purchases/PurchasesProvider';
import {
  ENTITLEMENTS,
  accessFromCustomerInfo,
  getBusinessPackages,
  getFreshCustomerInfo,
  isYearlyProduct,
  purchaseStoreUpgrade,
} from '../services/purchases/revenueCat';
import { getAccessToken } from '../services/secureStorage/tokenStorage';
import { ENV } from '../config/env';
import { showErrorToast, showSuccessToast } from '../components/common';

const WEB_STORES = ['RC_BILLING', 'STRIPE'];
const OWN_STORES = Platform.OS === 'ios' ? ['APP_STORE', 'MAC_APP_STORE'] : ['PLAY_STORE'];

/**
 * Personal → Personal + Business, wherever the Personal plan was bought, without a second
 * subscription:
 * - website plan: opens the website (signed in) on the upgrade options
 * - App Store / Play Store plan on this device: changes the plan in the store
 * - store plan from the other platform: says where to upgrade
 * - no plan the app can see: the normal paywall
 * Resolves true when the user ends up with Business.
 */
export const useBusinessUpgrade = () => {
  const { t } = useTranslation();
  const { access, customerInfo, openPaywall, syncAfterChange } = usePurchases();
  const serverSource = useSelector((state: any) => state.user_auth?.user_data?.subscription?.source ?? null);
  const running = useRef(false);

  const openWebsite = useCallback(async () => {
    const token = await getAccessToken().catch(() => null);
    const url = token ? `${ENV.WEBAPP_HOME_URL}?token=${token}` : ENV.WEBAPP_HOME_URL;
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const choosePackage = useCallback(
    (packages: PurchasesPackage[]) =>
      new Promise<PurchasesPackage | null>((resolve) => {
        Alert.alert(
          t('upgrade_business.choose_title'),
          t('upgrade_business.choose_message'),
          [
            ...packages.map((pkg) => ({
              text: t(isYearlyProduct(pkg.product.identifier) ? 'upgrade_business.yearly' : 'upgrade_business.monthly', {
                price: pkg.product.priceString,
              }),
              onPress: () => resolve(pkg),
            })),
            { text: t('common.cancel'), style: 'cancel' as const, onPress: () => resolve(null) },
          ],
          { cancelable: true, onDismiss: () => resolve(null) },
        );
      }),
    [t],
  );

  const upgrade = useCallback(async (): Promise<boolean> => {
    if (access.business) {
      return true;
    }
    if (running.current) {
      return false;
    }
    running.current = true;
    try {
      const info = (await getFreshCustomerInfo()) ?? customerInfo;
      if (accessFromCustomerInfo(info).business) {
        await syncAfterChange(info);
        return true;
      }

      const personal = info?.entitlements.active[ENTITLEMENTS.personal] ?? null;
      const store = personal?.store ?? null;

      const boughtOnWebsite =
        (store != null && WEB_STORES.includes(store)) ||
        (!personal && ['RevenueCatBilling', 'Stripe'].includes(serverSource ?? ''));
      if (boughtOnWebsite) {
        Alert.alert(t('upgrade_business.web_title'), t('upgrade_business.web_message'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('upgrade_business.open_website'), onPress: openWebsite },
        ]);
        return false;
      }

      if (!personal) {
        const outcome = await openPaywall();
        return outcome === 'purchased' || outcome === 'restored';
      }

      if (!store || !OWN_STORES.includes(store)) {
        Alert.alert(
          t('upgrade_business.other_platform_title'),
          t(store === 'PLAY_STORE' ? 'upgrade_business.on_android' : 'upgrade_business.on_iphone'),
        );
        return false;
      }

      const yearlyOnly = isYearlyProduct(personal.productIdentifier);
      const packages = (await getBusinessPackages()).filter(
        (p) => !yearlyOnly || isYearlyProduct(p.product.identifier),
      );
      if (packages.length === 0) {
        showErrorToast(t('upgrade_business.unavailable'));
        return false;
      }

      const target = await choosePackage(packages);
      if (!target) {
        return false;
      }

      const updated = await purchaseStoreUpgrade(target, personal.productIdentifier);
      if (!updated) {
        return false;
      }
      await syncAfterChange(updated);
      const hasBusiness = accessFromCustomerInfo(updated).business;
      if (hasBusiness) {
        showSuccessToast(t('upgrade_business.success'));
      }
      return hasBusiness;
    } catch (err: any) {
      showErrorToast(err?.message || t('upgrade_business.failed'));
      return false;
    } finally {
      running.current = false;
    }
  }, [access.business, customerInfo, serverSource, syncAfterChange, openPaywall, openWebsite, choosePackage, t]);

  return { upgrade };
};
