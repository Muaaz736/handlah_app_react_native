import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesEntitlementInfo,
  PurchasesPackage,
  STORE_REPLACEMENT_MODE,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { ENV } from '../../config/env';
import { ENTITLEMENT_IDS, PlanAccess, accessFromEntitlements } from './accessPolicy';

export const ENTITLEMENTS = ENTITLEMENT_IDS;

export type EntitlementId = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

const apiKey = Platform.select({
  ios: ENV.REVENUECAT_IOS_API_KEY,
  android: ENV.REVENUECAT_ANDROID_API_KEY,
});

let configured = false;

export const isPurchasesConfigured = (): boolean => configured;

export const configurePurchases = (): void => {
  if (configured || !apiKey) {
    return;
  }
  Purchases.setLogLevel(ENV.IS_PRODUCTION ? LOG_LEVEL.ERROR : LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  configured = true;
};

/**
 * Ties purchases to the signed-in account so entitlements follow the user
 * across devices and reinstalls, rather than staying on one anonymous device id.
 */
export const identifyPurchaseUser = async (userId: string): Promise<CustomerInfo | null> => {
  if (!configured) {
    return null;
  }
  try {
    const { customerInfo } = await Purchases.logIn(String(userId));
    return customerInfo;
  } catch {
    return getCustomerInfo();
  }
};

export const resetPurchaseUser = async (): Promise<void> => {
  if (!configured) {
    return;
  }
  try {
    await Purchases.logOut();
  } catch {
    // Already anonymous; nothing to reset.
  }
};

export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!configured) {
    return null;
  }
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
};

/**
 * Skips the SDK's cache (kept for up to 5 minutes), so a plan bought on the website
 * or granted by an admin shows up without restarting the app.
 */
export const getFreshCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!configured) {
    return null;
  }
  try {
    await Purchases.invalidateCustomerInfoCache();
  } catch {
    // Still worth asking; the SDK falls back to its cache.
  }
  return getCustomerInfo();
};

export const hasEntitlement = (
  customerInfo: CustomerInfo | null,
  entitlement: EntitlementId,
): boolean => Boolean(customerInfo?.entitlements.active[entitlement]);

export const accessFromCustomerInfo = (customerInfo: CustomerInfo | null): PlanAccess =>
  accessFromEntitlements(Object.keys(customerInfo?.entitlements.active ?? {}));

/** Business includes everything in personal, so either entitlement opens the app. */
export const hasPersonalAccess = (customerInfo: CustomerInfo | null): boolean =>
  accessFromCustomerInfo(customerInfo).personal;

/** The entitlement that decides the plan shown to the user: business first, then personal. */
export const getActiveEntitlement = (
  customerInfo: CustomerInfo | null,
): PurchasesEntitlementInfo | null =>
  customerInfo?.entitlements.active[ENTITLEMENTS.business] ??
  customerInfo?.entitlements.active[ENTITLEMENTS.personal] ??
  null;

/**
 * Where the active access comes from. STRIPE = bought on the website,
 * PROMOTIONAL = admin bypass, APP_STORE / PLAY_STORE = bought in this app.
 */
export type AccessSource = 'store' | 'web' | 'complimentary' | 'none';

export const getAccessSource = (customerInfo: CustomerInfo | null): AccessSource => {
  const entitlement = getActiveEntitlement(customerInfo);
  if (!entitlement) {
    return 'none';
  }
  switch (entitlement.store) {
    case 'STRIPE':
    case 'RC_BILLING':
      return 'web';
    case 'PROMOTIONAL':
      return 'complimentary';
    default:
      return 'store';
  }
};

/** Packages of the Personal + Business plan in the current offering. */
export const BUSINESS_PACKAGE_IDS = ['personal_business_monthly', 'personal_business_yearly'];

export const isYearlyProduct = (productIdentifier: string | null | undefined): boolean =>
  /year|annual/i.test(productIdentifier ?? '');

export const getBusinessPackages = async (): Promise<PurchasesPackage[]> => {
  if (!configured) {
    return [];
  }
  try {
    const offerings = await Purchases.getOfferings();
    return (offerings.current?.availablePackages ?? []).filter((p) =>
      BUSINESS_PACKAGE_IDS.includes(p.identifier),
    );
  } catch {
    return [];
  }
};

/**
 * Moves an App Store / Play Store Personal subscriber to `target` without a second subscription.
 * iOS: Apple swaps the plan itself when both products are in the same subscription group.
 * Android: Google Play needs the old subscription id; the price difference is charged now.
 * Resolves null when the user closes the store sheet.
 */
export const purchaseStoreUpgrade = async (
  target: PurchasesPackage,
  currentProductIdentifier: string,
): Promise<CustomerInfo | null> => {
  try {
    if (Platform.OS === 'android') {
      // The base plan, so a free trial on the new plan is not started by an upgrade.
      const option =
        target.product.subscriptionOptions?.find((o) => o.isBasePlan) ?? target.product.defaultOption;
      const productChangeInfo = {
        // Play ids look like "subscription:baseplan"; Google wants the subscription part.
        oldProductIdentifier: currentProductIdentifier.split(':')[0],
        replacementMode: STORE_REPLACEMENT_MODE.CHARGE_PRORATED_PRICE,
      };
      const { customerInfo } = option
        ? await Purchases.purchaseSubscriptionOption(option, productChangeInfo)
        : await Purchases.purchasePackage(target, null, productChangeInfo);
      return customerInfo;
    }
    const { customerInfo } = await Purchases.purchasePackage(target);
    return customerInfo;
  } catch (err: any) {
    if (err?.userCancelled || err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return null;
    }
    throw err;
  }
};

export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (!configured) {
    return null;
  }
  try {
    return await Purchases.restorePurchases();
  } catch {
    return null;
  }
};

export type PaywallOutcome = 'purchased' | 'restored' | 'cancelled' | 'unavailable';

export const presentPaywall = async (): Promise<PaywallOutcome> => {
  if (!configured) {
    return 'unavailable';
  }
  try {
    const result = await RevenueCatUI.presentPaywall();
    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        return 'purchased';
      case PAYWALL_RESULT.RESTORED:
        return 'restored';
      case PAYWALL_RESULT.CANCELLED:
        return 'cancelled';
      default:
        return 'unavailable';
    }
  } catch {
    return 'unavailable';
  }
};

export const addCustomerInfoListener = (
  listener: (info: CustomerInfo) => void,
): (() => void) => {
  if (!configured) {
    return () => {};
  }
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
};
