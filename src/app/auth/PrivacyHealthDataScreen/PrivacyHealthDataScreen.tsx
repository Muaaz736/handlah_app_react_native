import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  Switch,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { AuthHeader, PrimaryButton } from '../../../components/common';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { updateMeAsync } from '../../../redux/services/authService';
import { setUpdateMeStatus } from '../../../redux/slices/authSlice';
import { ASYNC_STATUS } from '../../../config/constants';
import {
  PrivacyHealthDataScreenNavigationProp,
  PrivacyHealthDataScreenProps,
  PrivacySettingType,
  ModalContent,
} from '../../../types/authTypes/PrivacyHealthDataScreen.types';
import { isIOS } from '../../../utils/helpers';
import { makePrivacyHealthDataStyles } from './PrivacyHealthDataScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const PrivacyHealthDataScreen: React.FC<PrivacyHealthDataScreenProps> = () => {
  const navigation = useNavigation<PrivacyHealthDataScreenNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makePrivacyHealthDataStyles(themeColors as RoleTheme), [themeColors]);
  const [healthDataCollection, setHealthDataCollection] =
    useState<boolean>(false);
  const [healthDataSharing, setHealthDataSharing] = useState<boolean>(false);
  const [analyticsReporting, setAnalyticsReporting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: '',
    description: '',
  });
  const [modalType, setModalType] = useState<PrivacySettingType | ''>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [isDisableModal, setIsDisableModal] = useState<boolean>(false);

  const { update_me_status } = useSelector((state: any) => state.user_auth);

  const isLoading = update_me_status === ASYNC_STATUS.LOADING;

  const handleContinue = async () => {
    const payload = {
      healthDataCollection,
      healthDataSharing,
      analyticsAndCrashReporting: analyticsReporting,
    } as any;

    try {
      await dispatch(updateMeAsync(payload)).unwrap();

      dispatch(setUpdateMeStatus());
      navigation.navigate('IdentityForm');
    } catch (error) {
      // Error is already shown by slice
    }
  };

  const showModal = (
    title: string,
    description: string,
    type: PrivacySettingType,
  ): void => {
    setModalContent({ title, description });
    setModalType(type);
    setConsentChecked(false);
    setIsDisableModal(false);
    setModalVisible(true);
  };

  const showDisableModal = (type: PrivacySettingType): void => {
    setModalType(type);
    setIsDisableModal(true);
    setModalVisible(true);
  };

  const handleModalEnable = (): void => {
    setModalVisible(false);
    setConsentChecked(false);
  };

  const handleModalCancel = (): void => {
    setModalVisible(false);
    setConsentChecked(false);
    setIsDisableModal(false);

    if (!isDisableModal) {
      switch (modalType) {
        case 'healthDataCollection':
          setHealthDataCollection(false);
          break;
        case 'healthDataSharing':
          setHealthDataSharing(false);
          break;
        case 'analyticsReporting':
          setAnalyticsReporting(false);
          break;
      }
    }
  };

  const handleDisableConfirm = () => {
    setModalVisible(false);
    setIsDisableModal(false);
    // Actually disable the toggle
    switch (modalType) {
      case 'healthDataCollection':
        setHealthDataCollection(false);
        break;
      case 'healthDataSharing':
        setHealthDataSharing(false);
        break;
      case 'analyticsReporting':
        setAnalyticsReporting(false);
        break;
    }
  };

  const handleToggle = (
    type: PrivacySettingType,
    currentValue: boolean,
  ): void => {
    if (!currentValue) {
      // Show enable modal when enabling
      switch (type) {
        case 'healthDataCollection':
          showModal(
            t('privacy_health.health_data_collection'),
            t('privacy_health.health_data_collection_description'),
            type,
          );
          setHealthDataCollection(true);
          break;
        case 'healthDataSharing':
          showModal(
            t('privacy_health.health_data_sharing'),
            t('privacy_health.health_data_sharing_description'),
            type,
          );
          setHealthDataSharing(true);
          break;
        case 'analyticsReporting':
          showModal(
            t('privacy_health.analytics_reporting_modal_title'),
            t('privacy_health.analytics_reporting_description'),
            type,
          );
          setAnalyticsReporting(true);
          break;
      }
    } else {
      // Show disable confirmation modal when disabling
      showDisableModal(type);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          <AuthHeader
            title={t('privacy_health.title')}
            onBackPress={() => navigation.goBack()}
            showBackButton={true}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          <View style={styles.optionsContainer}>
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
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('privacy_health.continue')}
          onPress={handleContinue}
          loading={isLoading}
          disabled={isLoading}
          textStyle={{ color: colors.white }}
          buttonStyle={{ borderRadius: 10, backgroundColor: themeColors.darkGreen }}
        />
      </View>

      {/* Information Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isDisableModal ? (
              // Disable Confirmation Modal
              <>
                <Text style={styles.modalTitle}>
                  {modalType === 'healthDataSharing'
                    ? t('privacy_health.turn_off_sharing_title')
                    : modalType === 'analyticsReporting'
                      ? t('privacy_health.turn_off_analytics_title')
                      : t('privacy_health.turn_off_title')}
                </Text>
                <Text style={styles.disableModalSubtitle}>
                  {modalType === 'healthDataSharing'
                    ? t('privacy_health.turn_off_sharing_description')
                    : modalType === 'analyticsReporting'
                      ? t('privacy_health.turn_off_analytics_description')
                      : t('privacy_health.turn_off_description')}
                </Text>

                <View style={styles.disableModalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleModalCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t('privacy_health.keep_on')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.enableButton, { backgroundColor: themeColors.darkGreen }]}
                    onPress={handleDisableConfirm}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.enableButtonText}>
                      {t('privacy_health.turn_off')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Enable Consent Modal
              <>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <Text style={styles.modalSubtitle}>
                  {modalType === 'healthDataSharing'
                    ? t('privacy_health.sharing_modal_subtitle')
                    : modalType === 'analyticsReporting'
                      ? t('privacy_health.analytics_modal_subtitle')
                      : t('privacy_health.modal_subtitle')}
                </Text>

                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  {modalType === 'analyticsReporting' ? (
                    // Analytics & Crash Reporting modal content
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
                  ) : modalType === 'healthDataSharing' ? (
                    // Health Data Sharing modal content
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
                  ) : (
                    // Health Data Collection modal content
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
                  )}
                </ScrollView>

                <View style={styles.consentContainer}>
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => setConsentChecked(!consentChecked)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        consentChecked && styles.checkboxChecked,
                        consentChecked && { backgroundColor: themeColors.darkGreen, borderColor: themeColors.darkGreen },
                      ]}
                    >
                      {consentChecked && (
                        <Feather name="check" size={16} color={colors.white} />
                      )}
                    </View>
                    <Text style={styles.consentText}>
                      {modalType === 'healthDataSharing'
                        ? t('privacy_health.sharing_consent_text')
                        : modalType === 'analyticsReporting'
                          ? t('privacy_health.analytics_consent_text')
                          : t('privacy_health.consent_text')}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleModalCancel}
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
                    onPress={handleModalEnable}
                    disabled={!consentChecked}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.enableButtonText}>
                      {t('privacy_health.enable')}
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

export default PrivacyHealthDataScreen;
