import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  Switch,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { makePrivacyHealthDataStyles } from './PrivacyHealthData.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHeader } from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { updateMeAsync } from '../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { isIOS } from '../../../../../utils/helpers';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

type PrivacySettingType =
  | 'healthDataCollection'
  | 'healthDataSharing'
  | 'analyticsReporting';

const PrivacyHealthData: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makePrivacyHealthDataStyles(themeColors as RoleTheme), [themeColors]);

  const { user_data, update_me_status } = useSelector(
    (state: any) => state.user_auth,
  );

  const isLoading = update_me_status === ASYNC_STATUS.LOADING;

  // Local toggle state — initialised from existing user data
  const [healthDataCollection, setHealthDataCollection] = useState<boolean>(
    user_data?.healthdatacollection ?? false,
  );
  const [healthDataSharing, setHealthDataSharing] = useState<boolean>(
    user_data?.healthdatasharing ?? false,
  );
  const [analyticsReporting, setAnalyticsReporting] = useState<boolean>(
    user_data?.analyticsandcrashreporting ?? false,
  );

  // Which toggle triggered the current modal
  const [pendingType, setPendingType] = useState<PrivacySettingType | null>(
    null,
  );
  const [isEnableModal, setIsEnableModal] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  // Sync local state when user_data updates (after a successful save)
  useEffect(() => {
    if (!user_data) return;
    setHealthDataCollection(user_data.healthdatacollection ?? false);
    setHealthDataSharing(user_data.healthdatasharing ?? false);
    setAnalyticsReporting(user_data.analyticsandcrashreporting ?? false);
  }, [user_data]);

  const openEnableModal = (type: PrivacySettingType) => {
    // Optimistically flip the toggle so Switch animates
    applyToggleState(type, true);
    setPendingType(type);
    setIsEnableModal(true);
    setConsentChecked(false);
    setModalVisible(true);
  };

  const openDisableModal = (type: PrivacySettingType) => {
    setPendingType(type);
    setIsEnableModal(false);
    setModalVisible(true);
  };

  const applyToggleState = (type: PrivacySettingType, value: boolean) => {
    switch (type) {
      case 'healthDataCollection':
        setHealthDataCollection(value);
        break;
      case 'healthDataSharing':
        setHealthDataSharing(value);
        break;
      case 'analyticsReporting':
        setAnalyticsReporting(value);
        break;
    }
  };

  const handleToggle = (type: PrivacySettingType, currentValue: boolean) => {
    if (!currentValue) {
      openEnableModal(type);
    } else {
      openDisableModal(type);
    }
  };

  /** User cancelled enabling — revert toggle */
  const handleEnableCancel = () => {
    if (pendingType) applyToggleState(pendingType, false);
    setModalVisible(false);
    setConsentChecked(false);
    setPendingType(null);
  };

  /** User confirmed enabling (checkbox ticked + Enable pressed) */
  const handleEnableConfirm = async () => {
    setModalVisible(false);
    setConsentChecked(false);
    await savePrivacySettings();
    setPendingType(null);
  };

  /** User chose "Keep On" — close without changes */
  const handleDisableKeepOn = () => {
    setModalVisible(false);
    setPendingType(null);
  };

  /** User confirmed turning off */
  const handleDisableConfirm = async () => {
    if (pendingType) applyToggleState(pendingType, false);
    setModalVisible(false);
    await savePrivacySettingsWithOverride(pendingType!, false);
    setPendingType(null);
  };

  const buildPayload = (
    overrideType?: PrivacySettingType,
    overrideValue?: boolean,
  ) => {
    const hdc =
      overrideType === 'healthDataCollection'
        ? overrideValue!
        : healthDataCollection;
    const hds =
      overrideType === 'healthDataSharing'
        ? overrideValue!
        : healthDataSharing;
    const acr =
      overrideType === 'analyticsReporting' ? overrideValue! : analyticsReporting;
    return {
      healthDataCollection: hdc,
      healthDataSharing: hds,
      analyticsAndCrashReporting: acr,
    };
  };

  const savePrivacySettings = async () => {
    try {
      await dispatch(updateMeAsync(buildPayload({} as any) as any)).unwrap();
    } catch (_) {}
  };

  const savePrivacySettingsWithOverride = async (
    type: PrivacySettingType,
    value: boolean,
  ) => {
    try {
      await dispatch(updateMeAsync(buildPayload(type, value) as any)).unwrap();
    } catch (_) {}
  };


  const getDisableTitle = () => {
    switch (pendingType) {
      case 'healthDataSharing':
        return t('privacy_health.turn_off_sharing_title');
      case 'analyticsReporting':
        return t('privacy_health.turn_off_analytics_title');
      default:
        return t('privacy_health.turn_off_title');
    }
  };

  const getDisableDescription = () => {
    switch (pendingType) {
      case 'healthDataSharing':
        return t('privacy_health.turn_off_sharing_description');
      case 'analyticsReporting':
        return t('privacy_health.turn_off_analytics_description');
      default:
        return t('privacy_health.turn_off_description');
    }
  };

  const getEnableTitle = () => {
    switch (pendingType) {
      case 'healthDataCollection':
        return t('privacy_health.health_data_collection');
      case 'healthDataSharing':
        return t('privacy_health.health_data_sharing');
      case 'analyticsReporting':
        return t('privacy_health.analytics_reporting_modal_title');
      default:
        return '';
    }
  };

  const getEnableSubtitle = () => {
    switch (pendingType) {
      case 'healthDataSharing':
        return t('privacy_health.sharing_modal_subtitle');
      case 'analyticsReporting':
        return t('privacy_health.analytics_modal_subtitle');
      default:
        return t('privacy_health.modal_subtitle');
    }
  };

  const getConsentText = () => {
    switch (pendingType) {
      case 'healthDataSharing':
        return t('privacy_health.sharing_consent_text');
      case 'analyticsReporting':
        return t('privacy_health.analytics_consent_text');
      default:
        return t('privacy_health.consent_text');
    }
  };


  const renderEnableModalBody = () => {
    if (pendingType === 'analyticsReporting') {
      return (
        <>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.what_we_share_analytics')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.analytics_item_1')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.analytics_item_2')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.why_we_share_analytics')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.analytics_purpose_1')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.analytics_purpose_2')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.who_we_share_analytics')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.analytics_recipient_1')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.analytics_recipient_2')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.how_to_withdraw')}
          </Text>
          <Text style={styles.withdrawText}>
            {t('privacy_health.analytics_withdraw_text')}
          </Text>
        </>
      );
    }
    if (pendingType === 'healthDataSharing') {
      return (
        <>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.what_we_share')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_item_1')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_item_2')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.why_we_share')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_purpose_1')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_purpose_2')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_purpose_3')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.who_we_share')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_recipient_1')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_recipient_2')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_recipient_3')}
            </Text>
            <Text style={styles.bulletItem}>
              • {t('privacy_health.share_recipient_4')}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>
            {t('privacy_health.how_to_withdraw')}
          </Text>
          <Text style={styles.withdrawText}>
            {t('privacy_health.sharing_withdraw_text')}
          </Text>
        </>
      );
    }
    // healthDataCollection
    return (
      <>
        <Text style={styles.sectionTitle}>
          {t('privacy_health.what_we_collect')}
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • {t('privacy_health.collect_item_1')}
          </Text>
          <Text style={styles.bulletItem}>
            • {t('privacy_health.collect_item_2')}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>
          {t('privacy_health.why_we_use')}
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • {t('privacy_health.use_item_1')}
          </Text>
          <Text style={styles.bulletItem}>
            • {t('privacy_health.use_item_2')}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>
          {t('privacy_health.how_to_withdraw')}
        </Text>
        <Text style={styles.withdrawText}>
          {t('privacy_health.withdraw_text')}
        </Text>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AuthHeader
          title={t('privacy_health.title')}
          onBackPress={() => navigation.goBack()}
          showBackButton={true}
          containerStyle={{
            paddingHorizontal: 16,
            marginBottom: 0,
            paddingTop: isIOS ? 0 : 20,
          }}
          backButtonIconStyle={{ tintColor: themeColors.textSecondary }}
          titleStyle={{ marginBottom: 0, marginTop: 10, textAlign: 'left' }}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Health Data Collection */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>
              {t('privacy_health.health_data_collection')}
            </Text>
            <Switch
              value={healthDataCollection}
              onValueChange={() =>
                handleToggle('healthDataCollection', healthDataCollection)
              }
              trackColor={{ false: '#D1D5DB', true: themeColors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor="#D1D5DB"
              disabled={isLoading}
            />
          </View>

          {/* Health Data Sharing */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>
              {t('privacy_health.health_data_sharing')}
            </Text>
            <Switch
              value={healthDataSharing}
              onValueChange={() =>
                handleToggle('healthDataSharing', healthDataSharing)
              }
              trackColor={{ false: '#D1D5DB', true: themeColors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor="#D1D5DB"
              disabled={isLoading}
            />
          </View>

          {/* Analytics & Crash Reporting */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>
              {t('privacy_health.analytics_reporting')}
            </Text>
            <Switch
              value={analyticsReporting}
              onValueChange={() =>
                handleToggle('analyticsReporting', analyticsReporting)
              }
              trackColor={{ false: '#D1D5DB', true: themeColors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor="#D1D5DB"
              disabled={isLoading}
            />
          </View>

          {isLoading && (
            <ActivityIndicator
              size="small"
              color={themeColors.primary}
              style={{ marginTop: 12 }}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={isEnableModal ? handleEnableCancel : handleDisableKeepOn}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isEnableModal ? (
              <>
                <Text style={styles.modalTitle}>{getEnableTitle()}</Text>
                <Text style={styles.modalSubtitle}>{getEnableSubtitle()}</Text>
                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  {renderEnableModalBody()}
                </ScrollView>
                <Pressable
                  style={styles.checkboxContainer}
                  onPress={() => setConsentChecked(v => !v)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      consentChecked && {
                        backgroundColor: themeColors.darkGreen,
                        borderColor: themeColors.darkGreen,
                      },
                    ]}
                  >
                    {consentChecked && (
                      <Feather name="check" size={14} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.consentText}>{getConsentText()}</Text>
                </Pressable>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleEnableCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.enableButton,
                      { backgroundColor: themeColors.darkGreen },
                      !consentChecked && styles.enableButtonDisabled,
                    ]}
                    onPress={handleEnableConfirm}
                    disabled={!consentChecked}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.enableButtonText}>
                      {t('privacy_health.enable')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{getDisableTitle()}</Text>
                <Text style={styles.disableModalSubtitle}>
                  {getDisableDescription()}
                </Text>
                <View style={styles.disableModalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleDisableKeepOn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t('privacy_health.keep_on')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.enableButton,
                      { backgroundColor: themeColors.darkGreen },
                    ]}
                    onPress={handleDisableConfirm}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.enableButtonText}>
                      {t('privacy_health.turn_off')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PrivacyHealthData;
