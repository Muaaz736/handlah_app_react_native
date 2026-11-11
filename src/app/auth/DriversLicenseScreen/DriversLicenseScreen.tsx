import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
  CustomDateTimePicker,
  CustomReminderPicker,
} from '../../../components/common';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { isIOS, getLocaleDateFormat } from '../../../utils/helpers';
import i18next from 'i18next';
import { ImageAsset } from '../../../types/authTypes/DriversLicenseScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../config/constants';
import { setUpdateMeStatus } from '../../../redux/slices/authSlice';
import {
  driverLicenseAsync,
  getDropdownOptionsAsync,
  updateMeAsync,
} from '../../../redux/services/authService';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import { makeDriversLicenseStyles } from './DriversLicenseScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

type DriversLicenseScreenRouteProp = RouteProp<
  { DriversLicense: { uploadedImage?: ImageAsset } },
  'DriversLicense'
>;

interface DriversLicenseFormValues {
  licenseNumber: string;
  state: string;
  expirationDate: string | Date;
  classType: string;
  remindBefore: string;
  licenseImageIds: string[];
  isAddedInWallet: boolean;
}

const DriversLicenseScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<DriversLicenseScreenRouteProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeDriversLicenseStyles(themeColors as RoleTheme), [themeColors]);
  const formikRef = useRef<FormikProps<DriversLicenseFormValues>>(null);

  const { driver_license_status, update_me_status, get_dropdown_options_data } = useSelector(
    (state: any) => state.user_auth,
  );

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('DriverLicenseClass'));
  }, [dispatch]));

  const uploadedImage = route.params?.uploadedImage || null;
  const [skip, setSkip] = useState<boolean>(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const isLoading = driver_license_status === ASYNC_STATUS.LOADING;


  const initialValues: DriversLicenseFormValues = {
    licenseNumber: '',
    state: '',
    expirationDate: '',
    classType: get_dropdown_options_data?.[0]?.value || '',
    remindBefore: '90',
    licenseImageIds: [],
    isAddedInWallet: true,
  };

  useEffect(() => {
    dispatch(setUpdateMeStatus());
    if (update_me_status === ASYNC_STATUS.SUCCEEDED) {
      if (skip) {
        navigation.navigate('Dashboard' as never);
      }
    }
  }, [update_me_status]);

  const handleClassSelect = (classType: string): void => {
    formikRef.current?.setFieldValue('classType', classType);
    setShowClassPicker(false);
  };

  const handleImageUploaded = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids].filter(Boolean);
    formikRef.current?.setFieldValue('licenseImageIds', idArray);
  };

  const handleContinue = async (values: DriversLicenseFormValues) => {
    let formattedDate = null;
    if (values.expirationDate) {
      if (typeof values.expirationDate === 'string') {
        formattedDate = values.expirationDate;
      } else if (values.expirationDate instanceof Date) {
        formattedDate = values.expirationDate.toISOString();
      }
    }

    try {
      const payload = {
        licenseNumber: values.licenseNumber,
        state: values.state,
        class: values.classType,
        expirationDate: formattedDate,
        imageUrl: values.licenseImageIds.length > 0 ? values.licenseImageIds : [],
        reminderDaysBefore: parseInt(values.remindBefore, 10),
      } as any;

      await dispatch(driverLicenseAsync(payload)).unwrap();
      navigation.navigate('Passport' as never);
    } catch (error) {
      // Error is already shown by slice
    }
  };

  const handleSkip = () => {
    const payload = {
      isUserSetupComplete: true,
    } as any;
    dispatch(updateMeAsync(payload));
    setSkip(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isIOS ? 'padding' : 'height'}
    >
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema('drivers_license')}
        onSubmit={handleContinue}
      >
        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <AuthHeader
                  title={t('drivers_license.header_title')}
                  subtitle={t('drivers_license.header_subtitle')}
                  onBackPress={() => navigation.navigate('IdentityForm' as never)}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t('drivers_license.section_title')}
                </Text>
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.formContainer}>
                  {/* License Number */}
                  <CustomInput
                    label={`${t('drivers_license.license_number')} *`}
                    placeholder={`${t('drivers_license.license_placeholder')} *`}
                    value={values.licenseNumber}
                    onChangeText={handleChange('licenseNumber')}
                    error={touched.licenseNumber && errors.licenseNumber}
                  />

                  {/* State */}
                  <CustomInput
                    label={`${t('drivers_license.state')} *`}
                    placeholder={`${t('drivers_license.state_placeholder')} *`}
                    value={values.state}
                    onChangeText={handleChange('state')}
                    error={touched.state && errors.state}
                  />

                  {/* Expiration Date and Class */}
                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>
                        {t('drivers_license.expiration_date')} *
                      </Text>

                      <CustomDateTimePicker
                        value={values.expirationDate}
                        onChange={value => setFieldValue('expirationDate', value)}
                        placeholder={t('drivers_license.expiration_placeholder')}
                        mode="date"
                        displayFormat={getLocaleDateFormat(i18next.language)}
                        suffixIcon={
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={colors.black}
                          />
                        }
                      />
                      {touched.expirationDate && errors.expirationDate && (
                        <Text style={styles.errorText}>{errors.expirationDate}</Text>
                      )}
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>
                        {' '}
                        {t('drivers_license.class')} *
                      </Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowClassPicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dateInputText, { color: values.classType ? colors.text : colors.gray }]}>
                          {get_dropdown_options_data?.find((option: any) => option.value === values.classType)?.label || get_dropdown_options_data?.[0]?.label}
                        </Text>
                        <Ionicons
                          name="chevron-down-outline"
                          size={20}
                          color={colors.black}
                        />
                      </TouchableOpacity>
                      {touched.classType && errors.classType && (
                        <Text style={styles.errorText}>{errors.classType}</Text>
                      )}
                    </View>
                  </View>

                  {/* Remind me before expiration */}
                  <CustomReminderPicker
                    value={values.remindBefore}
                    onChange={(value) => setFieldValue('remindBefore', value)}
                    label={t('drivers_license.reminder_label')}
                    modalTitle={t('drivers_license.enter_days')}
                    modalPlaceholder={t('drivers_license.days_placeholder')}
                  />

                  {/* Upload Driver's License */}
                  <View style={styles.uploadSection}>
                    <Text style={styles.uploadLabel}>
                      {t('drivers_license.upload_label')}
                    </Text>
                    <ImageUploader
                      multiple={true}
                      maxImages={5}
                      imageIds={values.licenseImageIds}
                      onImageSelect={() => { }}
                      onImageUploaded={handleImageUploaded}
                      uploadType="box"
                      placeholder={t('drivers_license.upload')}
                      iconType="ionicons"
                      iconName="cloud-upload-outline"
                      iconSize={24}
                      iconColor={colors.gray}
                      autoUpload={true}
                      containerStyle={{ marginBottom: 0 }}
                      removable={true}
                      onRemove={() => { }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Class Picker Modal */}
            <Modal
              visible={showClassPicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowClassPicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowClassPicker(false)}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {t('identity_hub.select_class')}
                  </Text>
                  <View style={styles.classOptionsContainer}>
                    {get_dropdown_options_data?.length > 0 && get_dropdown_options_data.map((option: any) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.classOption,
                          values.classType === option.value && styles.classOptionSelected,
                        ]}
                        onPress={() => handleClassSelect(option.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.classOptionText,
                            values.classType === option.value &&
                            styles.classOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowClassPicker(false)}
                  >
                    <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <PrimaryButton
                title={t('drivers_license.continue')}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                buttonStyle={{ backgroundColor: themeColors.primary, borderRadius: 34 }}
                textStyle={{ color: colors.black }}
              />
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}> {t('drivers_license.skip')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default DriversLicenseScreen;
