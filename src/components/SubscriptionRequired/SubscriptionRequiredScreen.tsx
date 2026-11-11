import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import RNRestart from 'react-native-restart';
import { useUserRole } from '../../hooks/useUserRole';
import { usePurchases } from '../../services/purchases/PurchasesProvider';
import { clearAllSecureData } from '../../config/apiHandle';
import { getOrCreateDeviceId } from '../../services/notifications/NotificationService';
import { deleteFcmTokenByDeviceId } from '../../redux/services/notificationsService';
import { showErrorToast } from '../common';
import { ICONS } from '../../utils/Images';
import FONTS from '../../utils/fonts';

const RECHECK_MS = 15000;

/**
 * Shown instead of the app when a signed-in user has no trial or subscription.
 * There is no free plan, so the only ways forward are the paywall, restore, or logging out.
 */
const SubscriptionRequiredScreen: React.FC = () => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const { openPaywall, restore, refresh } = usePurchases();
  const [busy, setBusy] = useState<'paywall' | 'restore' | 'logout' | null>(null);

  // Someone paying on the website with this screen open on the phone gets in without
  // touching anything. Only while the app is in front, so it costs nothing in the background.
  useEffect(() => {
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') {
        refresh();
      }
    }, RECHECK_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const handlePaywall = async () => {
    setBusy('paywall');
    const outcome = await openPaywall();
    setBusy(null);
    if (outcome === 'unavailable') {
      showErrorToast(t('subscription_required.unavailable'));
    }
  };

  const handleRestore = async () => {
    setBusy('restore');
    const restored = await restore();
    setBusy(null);
    if (!restored) {
      showErrorToast(t('subscription_required.nothing_to_restore'));
    }
  };

  const handleLogout = async () => {
    setBusy('logout');
    try {
      const deviceId = await getOrCreateDeviceId();
      await deleteFcmTokenByDeviceId(deviceId).catch(() => {});
    } catch {
      // Logging out still works without removing the push token.
    }
    await clearAllSecureData().catch(() => {});
    RNRestart.restart();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Image source={ICONS.APP_ICON} style={styles.logo} resizeMode="contain" />

      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        {t('subscription_required.title')}
      </Text>
      <Text style={[styles.message, { color: themeColors.textSecondary }]}>
        {t('subscription_required.message')}
      </Text>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
        onPress={handlePaywall}
        disabled={busy !== null}
        activeOpacity={0.85}
      >
        {busy === 'paywall' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>{t('subscription_required.start_trial')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRestore} disabled={busy !== null} style={styles.linkBtn}>
        {busy === 'restore' ? (
          <ActivityIndicator color={themeColors.primary} />
        ) : (
          <Text style={[styles.linkText, { color: themeColors.primary }]}>
            {t('storage_plan.restore_purchases')}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} disabled={busy !== null} style={styles.linkBtn}>
        <Text style={[styles.linkText, { color: themeColors.textSecondary }]}>
          {t('common.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display_bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    fontFamily: FONTS.display_regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
  },
  linkBtn: {
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
  },
});

export default SubscriptionRequiredScreen;
