import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, showErrorToast, showSuccessToast } from '../../../../../components/common';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { checkAuthAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { getAuthToken } from '../../../AiAssistant/modules/AiChatbot/api';
import { ENV } from '../../../../../config/env';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { makeStoragePlanStyles } from './Storage.styles';
import { usePurchases } from '../../../../../services/purchases/PurchasesProvider';
import { getActiveEntitlement } from '../../../../../services/purchases/revenueCat';
import { useBusinessUpgrade } from '../../../../../hooks/useBusinessUpgrade';

const WEBAPP_HOME = ENV.WEBAPP_HOME_URL;

const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

const StoragePlan: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = React.useMemo(() => makeStoragePlanStyles(themeColors as RoleTheme), [themeColors]);
  const { t } = useTranslation();

  const { user_data, check_auth_status } = useSelector((state: any) => state.user_auth);
  const { customerInfo, hasPersonal, hasBusiness, restore, accessSource, refresh } = usePurchases();
  const { upgrade } = useBusinessUpgrade();
  const [restoring, setRestoring] = React.useState(false);
  const [upgrading, setUpgrading] = React.useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    await upgrade();
    setUpgrading(false);
  };

  // Refresh user data and the plan on focus, so a change made on the website shows here.
  useFocusEffect(
    useCallback(() => {
      dispatch(checkAuthAsync());
      refresh();
    }, [dispatch, refresh]),
  );

  const handleRestore = async () => {
    setRestoring(true);
    const found = await restore();
    setRestoring(false);
    if (found) {
      showSuccessToast(t('storage_plan.restore_found'));
    } else {
      showErrorToast(t('subscription_required.nothing_to_restore'));
    }
  };

  const storageSubscription = user_data?.subscription;
  const aiWallet = user_data?.aiwallet;

  // Storage
  const usedBytes = storageSubscription?.totalusagebytes ?? 0;
  const limitBytes = storageSubscription?.limitbytes ?? 0;
  const usedMB = bytesToMB(usedBytes);
  const limitMB = bytesToMB(limitBytes);
  const hasStorageLimit = limitMB > 0;
  const progress = hasStorageLimit ? Math.min(usedMB / limitMB, 1) : 0;
  const isLimitReached = hasStorageLimit && usedMB >= limitMB;

  const formatSize = (mb: number) =>
    mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb < 1 ? (mb * 1024).toFixed(0) + ' KB' : Math.round(mb) + ' MB'}`;

  const barColor = isLimitReached
    ? '#FF3B30'
    : progress > 0.85
      ? '#FF9500'
      : themeColors.primary;

  // AI Wallet
  const totalCredits: number = aiWallet?.totalcredits ?? 0;
  const creditsUsed: number = aiWallet?.totalcreditsused ?? 0;
  const freeCredits: number = aiWallet?.freecredits ?? 0;
  const purchasedCredits: number = aiWallet?.purchasedcredits ?? 0;
  const hasCredits = totalCredits > 0;
  const creditProgress = hasCredits ? Math.min(creditsUsed / totalCredits, 1) : 0;
  const creditsExhausted = hasCredits && creditsUsed >= totalCredits;
  const creditBarColor = creditsExhausted
    ? '#FF3B30'
    : creditProgress > 0.85
      ? '#FF9500'
      : themeColors.primary;
  const formatCredits = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  const isLoading = !user_data && check_auth_status === 'loading';

  const redirectToWebApp = async () => {
    const token = await getAuthToken();
    Linking.openURL(`${WEBAPP_HOME}?token=${token}`);
  }

  const activeEntitlement = getActiveEntitlement(customerInfo);
  const serverSub = user_data?.subscription;
  const isComplimentary = accessSource === 'complimentary' || serverSub?.plantype === 'Bypass';
  const isWebPurchase =
    accessSource === 'web' ||
    (!activeEntitlement && ['Stripe', 'RevenueCatBilling'].includes(serverSub?.source ?? ''));

  const tierName = hasBusiness
    ? t('storage_plan.tier_personal_business')
    : t('storage_plan.tier_personal');

  const billingLabel = activeEntitlement?.productIdentifier?.includes('yearly')
    ? t('storage_plan.billing_yearly')
    : t('storage_plan.billing_monthly');

  const onTrial = activeEntitlement?.periodType === 'TRIAL';

  const renewalDate = activeEntitlement?.expirationDate
    ? new Date(activeEntitlement.expirationDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const openStoreManagement = () => {
    if (customerInfo?.managementURL) {
      Linking.openURL(customerInfo.managementURL);
    }
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={t('storage_plan.title')}
        subtitle={t('storage_plan.subtitle')}
        showBackButton
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingHorizontal: 16, marginBottom: 8 }}
        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
      />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={themeColors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>{t('storage_plan.current_plan')}</Text>
              {activeEntitlement && !isComplimentary && (
                <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.white }]}>
                    {onTrial ? t('storage_plan.free_trial') : billingLabel}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.planName}>{tierName}</Text>

            {isComplimentary && (
              <Text style={styles.planMeta}>{t('storage_plan.complimentary_note')}</Text>
            )}

            {renewalDate && !isComplimentary && (
              <Text style={styles.planMeta}>
                {activeEntitlement?.willRenew
                  ? t('storage_plan.renews_on', { date: renewalDate })
                  : t('storage_plan.expires_on', { date: renewalDate })}
              </Text>
            )}

            {isWebPurchase && (
              <Text style={styles.planMeta}>{t('storage_plan.managed_on_web')}</Text>
            )}

            {accessSource === 'store' && customerInfo?.managementURL && (
              <TouchableOpacity
                style={[styles.manageBtn, { backgroundColor: themeColors.primary }]}
                onPress={openStoreManagement}
                activeOpacity={0.75}
              >
                <Text style={styles.manageBtnText}>{t('storage_plan.manage_subscription')}</Text>
              </TouchableOpacity>
            )}

            {hasPersonal && !hasBusiness && !isComplimentary && (
              <TouchableOpacity
                style={[styles.manageBtn, { backgroundColor: themeColors.primary }]}
                onPress={handleUpgrade}
                disabled={upgrading}
                activeOpacity={0.75}
              >
                {upgrading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.manageBtnText}>{t('upgrade_business.button')}</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleRestore} disabled={restoring} activeOpacity={0.7}>
              {restoring ? (
                <ActivityIndicator color={themeColors.primary} />
              ) : (
                <Text style={[styles.restoreText, { color: themeColors.primary }]}>
                  {t('storage_plan.restore_purchases')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('storage_plan.storage')}</Text>

            <View style={styles.usageRow}>
              <Text style={styles.usageValue}>{formatSize(usedMB)}</Text>
              {hasStorageLimit && (
                <Text style={styles.usageTotal}> {t('storage_plan.of_used', { limit: formatSize(limitMB) })}</Text>
              )}
            </View>

            {hasStorageLimit && (
              <>
                <View style={styles.trackBar}>
                  <View
                    style={[
                      styles.fillBar,
                      {
                        width: `${Math.round(progress * 100)}%` as any,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.usageLabelRow}>
                  <Text style={styles.percentText}>
                    {t('storage_plan.percent_used', { percent: Math.round(progress * 100) })}
                  </Text>
                  {isLimitReached ? (
                    <Text style={styles.warningText}>{t('storage_plan.storage_full')}</Text>
                  ) : progress > 0.85 ? (
                    <Text style={styles.cautionText}>{t('storage_plan.almost_full')}</Text>
                  ) : (
                    <Text style={styles.freeText}>
                      {t('storage_plan.available', { size: formatSize(limitMB - usedMB) })}
                    </Text>
                  )}
                </View>

                {isLimitReached && (
                  <Text style={styles.warningNote}>{t('storage_plan.storage_full_note')}</Text>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.manageBtn, { backgroundColor: themeColors.primary }]}
              onPress={redirectToWebApp}
              activeOpacity={0.75}
            >
              <Text style={styles.manageBtnText}>{t('storage_plan.manage')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>AI Credits</Text>

            <View style={styles.creditRow}>
              <View style={styles.creditChip}>
                <Text style={styles.creditChipLabel}>Free</Text>
                <Text style={[styles.creditChipValue, { color: themeColors.primary }]}>{formatCredits(freeCredits)}</Text>
              </View>
              <View style={styles.creditChip}>
                <Text style={styles.creditChipLabel}>Purchased</Text>
                <Text style={[styles.creditChipValue, { color: themeColors.primary }]}>{formatCredits(purchasedCredits)}</Text>
              </View>
              <View style={styles.creditChip}>
                <Text style={styles.creditChipLabel}>Total</Text>
                <Text style={[styles.creditChipValue, { color: themeColors.primary }]}>{formatCredits(totalCredits)}</Text>
              </View>
            </View>

            <View style={styles.usageRow}>
              <Text style={styles.usageValue}>{formatCredits(creditsUsed)}</Text>
              <Text style={styles.usageTotal}> used{hasCredits ? ` of ${formatCredits(totalCredits)}` : ''}</Text>
            </View>

            {hasCredits ? (
              <>
                <View style={styles.trackBar}>
                  <View
                    style={[
                      styles.fillBar,
                      {
                        width: `${Math.round(creditProgress * 100)}%` as any,
                        backgroundColor: creditBarColor,
                      },
                    ]}
                  />
                </View>
                <View style={styles.usageLabelRow}>
                  <Text style={styles.percentText}>{Math.round(creditProgress * 100)}% used</Text>
                  {creditsExhausted ? (
                    <Text style={styles.warningText}>Credits exhausted</Text>
                  ) : creditProgress > 0.85 ? (
                    <Text style={styles.cautionText}>Almost exhausted</Text>
                  ) : (
                    <Text style={styles.freeText}>{formatCredits(totalCredits - creditsUsed)} remaining</Text>
                  )}
                </View>
                {creditsExhausted && (
                  <Text style={styles.warningNote}>You have used all your AI credits. Purchase more to continue.</Text>
                )}
              </>
            ) : (
              <Text style={styles.noDataText}>No AI credits yet. Upgrade your plan to get credits.</Text>
            )}

            <TouchableOpacity
              style={[styles.manageBtn, { backgroundColor: themeColors.primary }]}
              onPress={redirectToWebApp}
              activeOpacity={0.75}
            >
              <Text style={styles.manageBtnText}>Get More Credits</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
};

export default StoragePlan;
