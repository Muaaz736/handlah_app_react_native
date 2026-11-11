import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  AuthHeader,
  PrimaryButton,
  CustomInput,
  ImageUploader,
  ImageAsset,
  CustomDateTimePicker,
  CustomReminderPicker,
} from '../../../components/common';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { isIOS, getLocaleDateFormat } from '../../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { getDropdownOptionsAsync, licensesAsync, updateMeAsync } from '../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../config/constants';
import { setUpdateMeStatus } from '../../../redux/slices/authSlice';
import {
  LicensesCertificationsScreenNavigationProp,
  LicensesCertificationsScreenProps,
  LicenseFormData,
  LicenseFormField,
  ReminderOption,
  LicenseType,
  License,
  reminderOption,
} from '../../../types/authTypes/LicensesCertificationsScreen.types';
import validationSchema from '../../../utils/validationSchemas';
import * as Yup from 'yup';
import { makeLicensesCertificationsStyles } from './LicensesCertificationsScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

type LicenseErrors = Record<string, string>;

interface TypeOptionItemProps {
  type: { label: string; value: string };
  isSelected: boolean;
  onSelect: (value: LicenseType) => void;
  primaryColor: string;
}

const TypeOptionItem = React.memo<TypeOptionItemProps>(({ type, isSelected, onSelect, primaryColor }) => {
  const handlePress = useCallback(() => onSelect(type.value as LicenseType), [onSelect, type.value]);
  return (
    <TouchableOpacity
      style={[
        styles.typeOption,
        isSelected && styles.typeOptionSelected,
        isSelected && {
          borderColor: primaryColor,
          backgroundColor: getColorWithOpacity(primaryColor, 0.05),
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.typeOptionText,
          isSelected && styles.typeOptionTextSelected,
          isSelected && { color: primaryColor },
        ]}
      >
        {type.label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={20} color={primaryColor} />
      )}
    </TouchableOpacity>
  );
});

const LicensesCertificationsScreen: React.FC<
  LicensesCertificationsScreenProps
> = () => {
  const navigation =
    useNavigation<LicensesCertificationsScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeLicensesCertificationsStyles(themeColors as RoleTheme), [themeColors]);
  const [skip, setSkip] = useState<boolean>(false);

  const { licenses_status, update_me_status, get_dropdown_options_data } = useSelector(
    (state: any) => state.user_auth,
  );
  const [licenses, setLicenses] = useState<License[]>([
    {
      id: 1,
      type: '',
      licenseCertNumber: '',
      jurisdiction: '',
      issuerAuthority: '',
      expirationDate: '',
      remindBefore: '90',
      imageIds: [], // Multi-image default
    },
  ]);

  const [licenseErrors, setLicenseErrors] = useState<LicenseErrors[]>([{}]);
  const [showTypePicker, setShowTypePicker] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isLoading = licenses_status === ASYNC_STATUS.LOADING;

  useEffect(() => {
    dispatch(setUpdateMeStatus());
    if (update_me_status === ASYNC_STATUS.SUCCEEDED) {
      if (skip) {
        navigation.navigate('Dashboard');
      }
    }
  }, [update_me_status]);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('LicenseCertificationType'));
    
  }, [dispatch]));

  const handleInputChange = (
    index: number,
    field: LicenseFormField,
    value: string | Date,
  ) => {
    setLicenses(prev =>
      prev.map((license, i) =>
        i === index ? { ...license, [field]: value } : license,
      ),
    );
    // Clear error for the field being changed
    setLicenseErrors(prev =>
      prev.map((errors, i) => {
        if (i === index && errors[field]) {
          const { [field]: _, ...rest } = errors;
          return rest;
        }
        return errors;
      }),
    );
  };

  const handleTypeSelect = useCallback((type: LicenseType): void => {
    if (activeIndex !== null) {
      handleInputChange(activeIndex, 'type', type);
    }
    setShowTypePicker(false);
    setActiveIndex(null);
  }, [activeIndex, handleInputChange]);

  const handleAddLicense = () => {
    const newLicense = {
      id: licenses.length + 1,
      type: '',
      licenseCertNumber: '',
      jurisdiction: '',
      issuerAuthority: '',
      expirationDate: '',
      remindBefore: '90',
      imageIds: [],
    } as any;
    setLicenses(prev => [...prev, newLicense]);
    setLicenseErrors(prev => [...prev, {}]);
  };

  // For multi-image, uploadResult is string[]
  const handleImageUploaded = (index: number, uploadResult: string[] | string) => {
    const ids = Array.isArray(uploadResult) ? uploadResult : uploadResult ? [uploadResult] : [];
    setLicenses(prev =>
      prev.map((license, i) =>
        i === index ? { ...license, imageIds: ids } : license
      )
    );
  };

  const validateAllLicenses = async (): Promise<boolean> => {
    const schema = validationSchema('license_certification');
    const allErrors: LicenseErrors[] = [];
    let hasErrors = false;

    for (const license of licenses) {
      try {
        await schema.validate(license, { abortEarly: false });
        allErrors.push({});
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const fieldErrors: LicenseErrors = {};
          err.inner.forEach(e => {
            if (e.path) fieldErrors[e.path] = e.message;
          });
          allErrors.push(fieldErrors);
          hasErrors = true;
        } else {
          allErrors.push({});
        }
      }
    }

    setLicenseErrors(allErrors);
    return !hasErrors;
  };

  const handleSaveIdentity = async () => {
    const isValid = await validateAllLicenses();
    if (!isValid) return;

    // Format data for API - each license will be sent separately
    const formattedLicenses = licenses.map(license => {
      let formattedDate = null;
      if (license.expirationDate) {
        if (typeof license.expirationDate === 'string') {
          formattedDate = license.expirationDate;
        } else if (license.expirationDate instanceof Date) {
          formattedDate = license.expirationDate.toISOString();
        }
      }

      return {
        licenseNumber: license.licenseCertNumber,
        type: license.type,
        jurisdiction: license.jurisdiction,
        issuerAuthority: license.issuerAuthority,
        expirationDate: formattedDate,
        imageUrls: license.imageIds || [],
        isAddedInWallet: true,
        reminderDaysBefore: parseInt(license.remindBefore, 10),
      };
    });

    try {
      // Send each license as a separate API call using Promise.all
      await Promise.all(
        formattedLicenses.map((licenseData: any) =>
          dispatch(licensesAsync(licenseData)).unwrap(),
        ),
      );

      navigation.navigate('IdentityHubSuccess');
    } catch (error) {
      // Error already handled by rejectWithValue in the thunk
    }
  };

  const handleSkip = () => {
    const payload = {
      isUserSetupComplete: true,
    } as any;
    setSkip(true);
    dispatch(updateMeAsync(payload));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isIOS ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <AuthHeader
            title={t('licenses_certifications.header_title')}
            subtitle={t('licenses_certifications.header_subtitle')}
            onBackPress={() => navigation.navigate('Passport' as never)}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('licenses_certifications.section_title')}
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {licenses.map((license, index: number) => (
            <View key={license.id} style={styles.formContainer}>
              {/* Type Dropdown */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  {' '}
                  {t('licenses_certifications.type')} *
                </Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => {
                    setActiveIndex(index);
                    setShowTypePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>
                    {get_dropdown_options_data?.find((option: any) => option.value === license.type)?.label || t('licenses_certifications.default_type')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.gray} />
                </TouchableOpacity>
                {licenseErrors[index]?.type && (
                  <Text style={styles.errorText}>{licenseErrors[index].type}</Text>
                )}
              </View>

              {/* License/Cert Number and Jurisdiction */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label={`${t('licenses_certifications.license_cert_number')} *`}
                    placeholder={`${t(
                      'licenses_certifications.license_cert_placeholder',
                    )} *`}
                    value={license.licenseCertNumber}
                    onChangeText={value =>
                      handleInputChange(index, 'licenseCertNumber', value)
                    }
                    error={licenseErrors[index]?.licenseCertNumber}
                  />
                </View>
                <View style={styles.halfInput}>
                  <CustomInput
                    label={`${t('licenses_certifications.jurisdiction')} *`}
                    placeholder={`${t(
                      'licenses_certifications.jurisdiction_placeholder',
                    )} *`}
                    value={license.jurisdiction}
                    onChangeText={value =>
                      handleInputChange(index, 'jurisdiction', value)
                    }
                    error={licenseErrors[index]?.jurisdiction}
                  />
                </View>
              </View>

              {/* Issuer/Authority and Expiration Date */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <CustomInput
                    label={`${t('licenses_certifications.issuer_authority')} *`}
                    placeholder={`${t(
                      'licenses_certifications.issuer_authority_placeholder',
                    )} *`}
                    value={license.issuerAuthority}
                    onChangeText={value =>
                      handleInputChange(index, 'issuerAuthority', value)
                    }
                    error={licenseErrors[index]?.issuerAuthority}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>
                    {' '}
                    {t('licenses_certifications.expiration_date')} *
                  </Text>

                  <CustomDateTimePicker
                    value={license.expirationDate}
                    onChange={value =>
                      handleInputChange(index, 'expirationDate', value)
                    }
                    placeholder={t(
                      'licenses_certifications.expiration_placeholder',
                    )}
                    mode="date"
                    displayFormat={getLocaleDateFormat(i18n.language)}
                    suffixIcon={
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.black}
                      />
                    }
                  />
                  {licenseErrors[index]?.expirationDate && (
                    <Text style={styles.errorText}>
                      {licenseErrors[index].expirationDate}
                    </Text>
                  )}
                </View>
              </View>

              {/* Remind me before expiration */}
              <CustomReminderPicker
                value={license.remindBefore}
                onChange={(value) => handleInputChange(index, 'remindBefore', value)}
                label={t('licenses_certifications.reminder_label')}
                modalTitle={t('common.enter_number_of_days')}
                modalPlaceholder={t('common.enter_days_placeholder')}
              />

              {/* Upload Photo */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>
                  {' '}
                  {t('licenses_certifications.upload_photo')}
                </Text>
                <ImageUploader
                  imageIds={license.imageIds}
                  multiple={true}
                  maxImages={5}
                  onImageUploaded={uploadResult => handleImageUploaded(index, uploadResult)}
                  uploadType="box"
                  placeholder={t('licenses_certifications.upload')}
                  onImageSelect={() => {}}
                  onRemove={() =>
                    setLicenses(prev =>
                      prev.map((l, i) =>
                        i === index ? { ...l, imageIds: [] } : l,
                      ),
                    )
                  }
                />
              </View>
            </View>
          ))}

          {/* Add License Button */}
          <View style={styles.addLicenseContainer}>
            <PrimaryButton
              title={t('licenses_certifications.add_license')}
              onPress={handleAddLicense}
              buttonStyle={{
                borderRadius: 30,
                backgroundColor: colors.white,
                borderWidth: 1.5,
                borderColor: themeColors.primary,
              }}
              textStyle={{ color: themeColors.primary, fontWeight: '600' }}
            />
            <Text style={styles.tipText}>
              {t('licenses_certifications.tip_text')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('licenses_certifications.select_type')}
            </Text>
            <ScrollView style={styles.typeOptionsContainer}>
              {get_dropdown_options_data.map((type: { label: string; value: string }) => (
                <TypeOptionItem
                  key={type.value}
                  type={type}
                  isSelected={
                    activeIndex !== null &&
                    licenses[activeIndex]?.type === type.value
                  }
                  onSelect={handleTypeSelect}
                  primaryColor={themeColors.primary}
                />
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypePicker(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('licenses_certifications.save_identity')}
          onPress={handleSaveIdentity}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={{ backgroundColor: themeColors.primary, borderRadius: 10 }}
          textStyle={{ color: colors.black }}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>
            {' '}
            {t('licenses_certifications.skip')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LicensesCertificationsScreen;
