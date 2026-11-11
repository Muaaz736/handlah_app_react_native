import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTutorialContext } from '../../../tutorial/TutorialContext';
import { PROFILE_PAGES } from '../../../utils/staticData';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import { PrimaryButton, ProfileAvatar, showErrorToast } from '../../../components/common';
import CustomInput from '../../../components/common/CustomInput';
import FONTS from '../../../utils/fonts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { showConfirmAlert } from '../../../utils/AlertHelper';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../../hooks/useUserRole';
import { apiHandle, clearAllSecureData } from '../../../config/apiHandle';
import RNRestart from 'react-native-restart';
import { useDispatch, useSelector } from 'react-redux';
import {
  AccountNavigationProp,
  ProfileItem,
  RenderItemProps,
} from './Account.types';
import { makeAccountStyles } from './Account.styles';
import { ASYNC_STATUS } from '../../../config/constants';
import { deleteUUserAccountAsync, cancelAccountDeletionAsync, updateMfaSettingsAsync } from '../../../redux/services/authService';
import { resetDeleteAccountStatus, resetCancelAccountDeletionStatus } from '../../../redux/slices/authSlice';
import { AppDispatch } from '../../../types/store.types';
import { getOrCreateDeviceId } from '../../../services/notifications/NotificationService';
import {
  deleteFcmTokenByDeviceId,
  getNotificationPreferencesAsync,
  updateNotificationPreferencesAsync,
} from '../../../redux/services/notificationsService';
import { deleteBiometricKeys } from '../../../utils/biometricServices';
import { deleteBiometricDeviceAsync } from '../../../redux/services/biometricService';
import { setReminderPreferences } from '../../../redux/slices/notificationsSlice';
import { RoleTheme } from '../../../types/roleManager.types';
import { usePurchases } from '../../../services/purchases/PurchasesProvider';
import { useShowFavorites } from '../../../hooks/useHomePreferences';

const Account: React.FC = () => {
  const navigation = useNavigation<AccountNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL: boolean = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const { hasPersonal, hasBusiness, openPaywall } = usePurchases();
  const styles = useMemo(() => makeAccountStyles(themeColors as RoleTheme), [themeColors]);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Tutorial: spotlight the "User Guide" row during the user-guide walkthrough.
  const { step: tutorialStep, setSpotlightRect, setSpotlightAction, nextStep: nextTutorialStep } = useTutorialContext();
  const scrollRef = useRef<ScrollView>(null);
  const userGuideRowRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      if (tutorialStep !== 'spotlight_user_guide') return undefined;
      // Bring the row into view (it sits near the bottom of the list), then measure.
      scrollRef.current?.scrollToEnd({ animated: true });
      const timer = setTimeout(() => {
        userGuideRowRef.current?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            setSpotlightRect({ x, y, width: w, height: h });
          }
        });
        setSpotlightAction(() => {
          nextTutorialStep();
          navigation.navigate('UserGuide' as never);
        });
      }, 500);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tutorialStep]),
  );

  const {
    user_data,
    delete_account_data,
    delete_account_status,
    cancel_account_deletion_status,
    mfa_settings_status,
  } = useSelector((state: any) => state.user_auth);

  const isUpdatingMfa = mfa_settings_status === ASYNC_STATUS.LOADING;
  const mfaEnabled: boolean = !!user_data?.twoauthenabled;
  const [mfaMethod, setMfaMethod] = useState<'email' | 'phone'>(
    user_data?.mfamethod === 'phone' ? 'phone' : 'email',
  );

  // Method-selection popup — only shown when the user switches MFA ON.
  // Turning it OFF requires no method, so it's applied immediately.
  const [mfaMethodModalVisible, setMfaMethodModalVisible] = useState<boolean>(false);
  const [pendingMfaMethod, setPendingMfaMethod] = useState<'email' | 'phone'>(mfaMethod);

  const mfaMethodOptions = useMemo(
    () => [
      { label: t('account.mfa_method_email', { defaultValue: 'Email' }), value: 'email' as const },
      { label: t('account.mfa_method_phone', { defaultValue: 'Phone' }), value: 'phone' as const },
    ],
    [t],
  );

  const handleToggleMfa = useCallback(
    (value: boolean) => {
      if (value) {
        setPendingMfaMethod(mfaMethod);
        setMfaMethodModalVisible(true);
        return;
      }
      dispatch(updateMfaSettingsAsync({ enabled: false, method: mfaMethod }));
    },
    [dispatch, mfaMethod],
  );

  const handleConfirmMfaMethod = useCallback(() => {
    setMfaMethod(pendingMfaMethod);
    dispatch(updateMfaSettingsAsync({ enabled: true, method: pendingMfaMethod }));
    setMfaMethodModalVisible(false);
  }, [dispatch, pendingMfaMethod]);

  const handleChangeMfaMethodPress = useCallback(() => {
    setPendingMfaMethod(mfaMethod);
    setMfaMethodModalVisible(true);
  }, [mfaMethod]);

  const unseenNotificationCount = useSelector(
    (state: any) => state.notifications_slice?.unseen_count ?? 0,
  );

  // Reminder notification channel preferences
  const reminderEmail = useSelector((state: any) => state.notifications_slice?.reminder_email ?? true);
  const reminderSms = useSelector((state: any) => state.notifications_slice?.reminder_sms ?? true);
  const reminderPush = useSelector((state: any) => state.notifications_slice?.reminder_push ?? true);
  const isUpdatingPreferences = useSelector(
    (state: any) => state.notifications_slice?.update_preferences_status === ASYNC_STATUS.LOADING,
  );

  // Load the user's notification preferences when the screen gains focus.
  useFocusEffect(
    useCallback(() => {
      dispatch(getNotificationPreferencesAsync());
    }, [dispatch]),
  );

  // Toggle a single channel. The PUT requires all three flags. SMS is not
  // exposed yet, so it is always sent as false.
  const handleTogglePreference = useCallback(
    (channel: 'reminderEmail' | 'reminderPush', value: boolean) => {
      const previous = { reminderEmail, reminderSms, reminderPush };
      const next = { reminderEmail, reminderPush, reminderSms: false, [channel]: value };
      // Optimistic update so the switch responds instantly.
      dispatch(setReminderPreferences(next));
      dispatch(updateNotificationPreferencesAsync(next))
        .unwrap()
        .catch(() => {
          // Revert on failure (the slice also surfaces an error toast).
          dispatch(setReminderPreferences(previous));
        });
    },
    [dispatch, reminderEmail, reminderSms, reminderPush],
  );

  const scheduledDeletionAt: string | null =
    user_data?.ispendingdeletion && user_data?.scheduleddeletionat
      ? user_data.scheduleddeletionat
      : null;
  const isCancellingDeletion = cancel_account_deletion_status === ASYNC_STATUS.LOADING;

  const getAvatarLetter = () => {
    if (user_data?.username) {
      return user_data.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const [showFavorites, setShowFavorites] = useShowFavorites();

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Notifications' as never);
  }, [navigation]);

  const getDisplayName = () => {
    if (user_data?.fullname && user_data.fullname !== 'string') {
      return user_data.fullname;
    } else if (
      user_data?.firstname &&
      user_data?.lastname &&
      user_data.firstname !== 'string' &&
      user_data.lastname !== 'string'
    ) {
      return `${user_data.firstname} ${user_data.lastname}`;
    } else if (user_data?.username) {
      return user_data.username;
    }
    return 'User';
  };

  const handleEditProfile = () => {
    navigation.navigate('PersonalInformation');
  };

  // Ends every sign-in on every device (web and app), including this one — for a lost phone or a shared computer.
  const handleSignOutEverywhere = () => {
    showConfirmAlert(
      t('account.sign_out_everywhere_confirm', {
        defaultValue: 'Sign out of NCHRG on every device, including this one? You will need to sign in again everywhere.',
      }),
      async () => {
        try {
          await apiHandle.post('auth/sign-out-everywhere');
        } catch {
          showErrorToast(t('account.sign_out_everywhere_failed', { defaultValue: "That didn't work. Please try again." }));
          return;
        }
        try {
          const deviceId = await getOrCreateDeviceId();
          try {
            await deleteFcmTokenByDeviceId(deviceId);
          } catch (e) {
          }
          await clearAllSecureData();
          RNRestart.restart();
        } catch { }
      },
      t('account.sign_out_everywhere', { defaultValue: 'Sign out everywhere' }),
    );
  };

  const handleLogout = () => {
    showConfirmAlert(
      t('common.logout_confirm'),
      async () => {
        try {
          const deviceId = await getOrCreateDeviceId();
          try {
            await deleteFcmTokenByDeviceId(deviceId);
          } catch (e) {
          }
          try {
            await deleteBiometricDeviceAsync(deviceId);
          } catch (e) {
          }
          try {
            await deleteBiometricKeys();
          } catch (e) {
          }
          await clearAllSecureData();
          RNRestart.restart();
        } catch { }
      },
      t('common.logout'),
    );
  };

  const handleDeleteAccount = () => {
    setDeletePassword('');
    setDeleteModalVisible(true);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      showErrorToast('Password is required');
      return;
    }
    try {
      setDeleteLoading(true);
      const result = await dispatch(deleteUUserAccountAsync({ password: deletePassword })).unwrap();
      setDeleteModalVisible(false);
      setDeletePassword('');
      // result contains { isSuccess, message, scheduledDeletionAt }
    } catch (error) {
      showErrorToast('Incorrect password or failed to schedule deletion');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDeletion = () => {
    showConfirmAlert(
      t('common.cancel_deletion_confirm') || 'Are you sure you want to cancel the account deletion?',
      async () => {
        try {
          await dispatch(cancelAccountDeletionAsync()).unwrap();
          dispatch(resetDeleteAccountStatus());
          dispatch(resetCancelAccountDeletionStatus());
        } catch (error) {
          showErrorToast('Failed to cancel deletion. Please try again.');
        }
      },
      t('common.cancel_deletion') || 'Cancel Deletion',
    );
  };

  const handleItemPress = async (item: ProfileItem): Promise<void> => {
    if (item.route === 'DeleteAccount') {
      handleDeleteAccount();
      return;
    }

    if (item.route === 'StoragePlan' && !hasPersonal && !hasBusiness) {
      const outcome = await openPaywall();
      // 'cancelled' means the user dismissed the paywall, so stay put.
      // 'unavailable' means it could not be shown at all; fall through to the
      // screen rather than leaving the row doing nothing.
      if (outcome === 'cancelled') {
        return;
      }
      navigation.navigate('StoragePlan' as any);
      return;
    }

    navigation.navigate(item.route as any);
  };

  const renderItem = ({ item }: RenderItemProps): any => {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleItemPress(item)}
      >
        <Text style={[styles.text]}>{t(item.titleKey)}</Text>
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={themeColors.primary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      {/* Fixed Header */}
      <CustomHeader
        onNotificationPress={handleNotificationPress}
        notificationCount={unseenNotificationCount}
      />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Scheduled Deletion Banner */}
        {scheduledDeletionAt && (
          <View style={styles.deletionBanner}>
            <View style={styles.deletionBannerContent}>
              <Ionicons name="warning-outline" size={20} color={colors.white} style={{ marginRight: 8, marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.deletionBannerTitle}>
                  {t('common.account_deletion_scheduled') || 'Account Deletion Scheduled'}
                </Text>
                <Text style={styles.deletionBannerSubtitle}>
                  {`${t('common.account_will_be_deleted') || 'Your account will be permanently deleted on'} ${new Date(scheduledDeletionAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.cancelDeletionBtn}
              onPress={handleCancelDeletion}
              disabled={isCancellingDeletion}
            >
              {isCancellingDeletion ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.cancelDeletionBtnText}>
                  {t('common.cancel_deletion') || 'Cancel Deletion'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <ProfileAvatar
              imageId={user_data?.profilepicture}
              name={user_data?.fullname || user_data?.username}
              size={100}
              variant="soft"
            />
          </View>

          {/* Name and Email */}
          <Text style={styles.name}>{getDisplayName()}</Text>
          <Text style={styles.email}>{user_data?.email || 'No email'}</Text>

          {/* Edit Profile Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              icon={<AntDesign name="edit" size={20} color={colors.white} />}
              title={t(`account.edit_profile`)}
              onPress={handleEditProfile}
              variant="primary"
              buttonStyle={[
                styles.editButton,
                { backgroundColor: themeColors.primary },
              ]}
              textStyle={styles.editButtonText}
            />
          </View>
        </View>

        {/* Profile Pages List */}
        {PROFILE_PAGES.map((item: any) => (
          <View
            key={item.id}
            style={styles.itemContainer}
            ref={item.route === 'UserGuide' ? userGuideRowRef : undefined}
            collapsable={item.route === 'UserGuide' ? false : undefined}
          >
            {renderItem({ item })}
          </View>
        ))}

        {/* Home screen */}
        <Text style={styles.prefSectionHeader}>
          {t('account.home_screen', { defaultValue: 'Home Screen' })}
        </Text>
        <View style={styles.itemContainer}>
          <View style={styles.row}>
            <Text style={styles.text}>
              {t('account.show_favorites', { defaultValue: 'Show Favorites on Home' })}
            </Text>
            <Switch
              value={showFavorites}
              onValueChange={setShowFavorites}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
              style={styles.switchScale}
            />
          </View>
        </View>

        {/* Notification Preferences */}
        <Text style={styles.prefSectionHeader}>
          {t('account.notification_preferences', { defaultValue: 'Notification Preferences' })}
        </Text>
        <View style={styles.itemContainer}>
          <View style={styles.row}>
            <Text style={styles.text}>
              {t('account.email_notifications', { defaultValue: 'Email Notifications' })}
            </Text>
            <Switch
              value={reminderEmail}
              onValueChange={(value) => handleTogglePreference('reminderEmail', value)}
              disabled={isUpdatingPreferences}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
              style={styles.switchScale}
            />
          </View>
        </View>
        <View style={styles.itemContainer}>
          <View style={styles.row}>
            <Text style={styles.text}>
              {t('account.push_notifications', { defaultValue: 'Push Notifications' })}
            </Text>
            <Switch
              value={reminderPush}
              onValueChange={(value) => handleTogglePreference('reminderPush', value)}
              disabled={isUpdatingPreferences}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
              style={styles.switchScale}
            />
          </View>
        </View>

        {/* Security / MFA */}
        <Text style={styles.prefSectionHeader}>
          {t('account.security', { defaultValue: 'Security' })}
        </Text>
        <View style={styles.itemContainer}>
          <View style={styles.row}>
            <Text style={styles.text}>
              {t('account.mfa_toggle', { defaultValue: 'Two-Factor Authentication' })}
            </Text>
            <Switch
              value={mfaEnabled}
              onValueChange={handleToggleMfa}
              disabled={isUpdatingMfa}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
              style={styles.switchScale}
            />
          </View>
        </View>
        {mfaEnabled && (
          <View style={styles.itemContainer}>
            <View style={styles.row}>
              <Text style={styles.text}>
                {t('account.mfa_method_label', { defaultValue: 'Verification Method' })}
                {': '}
                {mfaMethod === 'phone'
                  ? t('account.mfa_method_phone', { defaultValue: 'Phone' })
                  : t('account.mfa_method_email', { defaultValue: 'Email' })}
              </Text>
              <TouchableOpacity onPress={handleChangeMfaMethodPress} disabled={isUpdatingMfa}>
                <Text style={[styles.text, { color: themeColors.primary }]}>
                  {t('account.change', { defaultValue: 'Change' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.logoutContainer}>
          <PrimaryButton
            icon={<Entypo name="log-out" size={20} color={colors.white} />}
            title={t('account.logout')}
            onPress={handleLogout}
            buttonStyle={[styles.logoutButton, { backgroundColor: themeColors.primary }]}
            textStyle={styles.logoutButtonText}
          />
          <TouchableOpacity
            onPress={handleSignOutEverywhere}
            accessibilityRole="button"
            style={{ alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 12 }}
          >
            <Text style={[styles.text, { color: colors.error, textAlign: 'center' }]}>
              {t('account.sign_out_everywhere', { defaultValue: 'Sign out everywhere' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleteLoading && setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('common.delete_account_title')}</Text>
            <Text style={styles.modalSubtitle}>{t('common.delete_account_confirm')}</Text>

            <CustomInput
              label={t('common.password') || 'Password'}
              placeholder={t('common.password') || 'Enter your password'}
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              containerStyle={styles.modalInput}
              inputContainerStyle={{ height: 50 }}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel') || 'Cancel'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalDeleteBtn]}
                onPress={handleConfirmDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>{t('common.schedule_deletion') || 'Schedule Deletion'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MFA Method Selection Modal — shown when enabling two-factor auth */}
      <Modal
        visible={mfaMethodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isUpdatingMfa && setMfaMethodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {t('account.mfa_method_modal_title', { defaultValue: 'Choose Verification Method' })}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t('account.mfa_method_modal_subtitle', { defaultValue: 'How would you like to receive your verification codes?' })}
            </Text>

            {mfaMethodOptions.map(option => {
              const isSelected = pendingMfaMethod === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.mfaMethodOption,
                    isSelected && {
                      borderColor: themeColors.primary,
                      backgroundColor: getColorWithOpacity(themeColors.primary, 0.1),
                    },
                  ]}
                  onPress={() => setPendingMfaMethod(option.value)}
                  disabled={isUpdatingMfa}
                >
                  <Text
                    style={[
                      styles.text,
                      isSelected && { color: themeColors.primary, fontFamily: FONTS.display_semi_bold },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={themeColors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setMfaMethodModalVisible(false)}
                disabled={isUpdatingMfa}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel') || 'Cancel'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.primary }]}
                onPress={handleConfirmMfaMethod}
                disabled={isUpdatingMfa}
              >
                {isUpdatingMfa ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>{t('common.confirm') || 'Confirm'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default Account;
