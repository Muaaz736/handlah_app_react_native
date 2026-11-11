import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  AuthHeader,
  PrimaryButton,
  CustomInput,
  CustomDropDown,
  ImageUploader,
  CustomDateTimePicker,
  CustomReminderPicker,
} from '../../../components/common';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { isIOS, getLocaleDateFormat, findDefaultCountry } from '../../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import {
  passportAsync,
  countriesAsync,
  updateMeAsync,
  getDropdownOptionsAsync,
} from '../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../config/constants';
import {
  PassportScreenNavigationProp,
  PassportScreenProps,
  PassportFormData,
  ReminderOption,
  reminderOptions,
} from '../../../types/authTypes/PassportScreen.types';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import { makePassportStyles } from './PassportScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

interface PassportFormValues {
  passportNumber: string;
  countryId: string;
  countryName: string;
  expirationDate: string | Date;
  passportType: string;
  remindBefore: string;
  passportImageIds: string[];
  isAddedInWallet: boolean;
}

const PassportScreen: React.FC<PassportScreenProps> = () => {
  const navigation = useNavigation<PassportScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makePassportStyles(themeColors as RoleTheme), [themeColors]);
  const [skip, setSkip] = useState(false);
  const formikRef = useRef<FormikProps<PassportFormValues>>(null);

  const { passport_status, countries_data, update_me_status, get_dropdown_options_data } = useSelector(
    (state: any) => state.user_auth,
  );

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('PassportType'));
  }, [dispatch]));

  const isLoading = passport_status === ASYNC_STATUS.LOADING;

  const initialValues: PassportFormValues = {
    passportNumber: '',
    countryId: '',
    countryName: '',
    expirationDate: '',
    passportType: '',
    remindBefore: '90',
    passportImageIds: [],
    isAddedInWallet: true,
  };

  useEffect(() => {
    dispatch(countriesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (update_me_status === ASYNC_STATUS.SUCCEEDED) {
      if (skip) {
        navigation.navigate('Dashboard');
      }
    }
  }, [update_me_status]);

  const handleCountryChange = (value: string) => {
    const selectedCountry = countries_data?.find(
      (country: any) => country.id.toString() === value,
    );
    formikRef.current?.setFieldValue('countryId', value);
    formikRef.current?.setFieldValue('countryName', selectedCountry?.countryname || '');
  };

  useEffect(() => {
    if (formikRef.current?.values.countryId) return;
    const usCountry = findDefaultCountry(countries_data);
    if (usCountry) {
      handleCountryChange(usCountry.id.toString());
    }
  }, [countries_data]);

  const handleImageUploaded = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids].filter(Boolean);
    formikRef.current?.setFieldValue('passportImageIds', idArray);
  };

  const passportTypeOptions = [
    { label: t('passport.type_book'), value: 'book' },
    { label: t('passport.type_card'), value: 'card' },
  ];

  const handleContinue = async (values: PassportFormValues) => {
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
        passportNumber: values.passportNumber,
        countryId: parseInt(values.countryId, 10),
        expirationDate: formattedDate,
        passportType: values.passportType,
        imageUrl: values.passportImageIds.length > 0 ? values.passportImageIds : [],
        isAddedInWallet: values.isAddedInWallet,
        reminderDaysBefore: parseInt(values.remindBefore, 10),
      } as any;

      await dispatch(passportAsync(payload)).unwrap();
      navigation.navigate('LicensesCertifications');
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
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema('passport')}
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
                  title={t('passport.header_title')}
                  subtitle={t('passport.header_subtitle')}
                  onBackPress={() => navigation.goBack()}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('passport.section_title')}</Text>
              </View>

              <View style={styles.contentContainer}>
                <View style={styles.formContainer}>
                  {/* Passport Number */}
                  <CustomInput
                    label={`${t('passport.passport_number')} *`}
                    placeholder={`${t('passport.passport_placeholder')} *`}
                    value={values.passportNumber}
                    onChangeText={handleChange('passportNumber')}
                    error={touched.passportNumber && errors.passportNumber}
                  />

                  {/* Country Dropdown */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>{t('passport.country')} *</Text>
                    <CustomDropDown
                      options={
                        countries_data?.map((country: any) => ({
                          label: country.countryname,
                          value: country.id.toString(),
                        })) || []
                      }
                      value={values.countryId}
                      onSelect={(val: any) => handleCountryChange(val)}
                      placeholder={t('passport.country_placeholder')}
                      search={true}
                      searchPlaceholder={t('common.search_country')}
                      maxHeight={300}
                      style={styles.dropdown}
                      leftIcon={true}
                    />
                    {touched.countryId && errors.countryId && (
                      <Text style={styles.errorText}>{errors.countryId}</Text>
                    )}
                  </View>

                  {/* Expiration Date and Type */}
                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>
                        {t('passport.expiration_date')} *
                      </Text>

                      <CustomDateTimePicker
                        value={values.expirationDate}
                        onChange={value => setFieldValue('expirationDate', value)}
                        placeholder={t('passport.expiration_placeholder')}
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
                      {touched.expirationDate && errors.expirationDate && (
                        <Text style={styles.errorText}>{errors.expirationDate}</Text>
                      )}
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}> {t('passport.type')} *</Text>
                      <CustomDropDown
                        options={get_dropdown_options_data}
                        value={values.passportType}
                        onSelect={(value: any) =>
                          setFieldValue('passportType', value)
                        }
                        placeholder={t('passport.default_type')}
                        search={false}
                        leftIcon={true}
                        style={styles.dropdown}
                      />
                      {touched.passportType && errors.passportType && (
                        <Text style={styles.errorText}>{errors.passportType}</Text>
                      )}
                    </View>
                  </View>

                  {/* Remind me before expiration */}
                  <CustomReminderPicker
                    value={values.remindBefore}
                    onChange={(value) => setFieldValue('remindBefore', value)}
                    label={t('passport.reminder_label')}
                    modalTitle={t('common.enter_number_of_days')}
                    modalPlaceholder={t('common.enter_days_placeholder')}
                  />

                  {/* Upload Passport */}
                  <View style={styles.uploadSection}>
                    <Text style={styles.uploadLabel}>
                      {t('passport.upload_label')}
                    </Text>
                    <ImageUploader
                      multiple={true}
                      maxImages={5}
                      imageIds={values.passportImageIds}
                      onImageSelect={() => { }}
                      onImageUploaded={handleImageUploaded}
                      uploadType="box"
                      placeholder={t('passport.upload')}
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

            {/* Footer */}
            <View style={styles.footerContainer}>
              <PrimaryButton
                title={t('passport.continue')}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                buttonStyle={{ backgroundColor: themeColors.primary, borderRadius: 10 }}
                textStyle={{ color: colors.black }}
              />
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}> {t('passport.skip')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default PassportScreen;
