import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  AuthHeader,
  PrimaryButton,
  CustomInput,
  CustomDropDown,
  CustomDateTimePicker,
} from '../../../components/common';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-number-input';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { isIOS, getLocaleDateFormat, findDefaultCountry } from '../../../utils/helpers';
import {
  IdentityFormScreenNavigationProp,
  IdentityFormScreenProps,
} from '../../../types/authTypes/IdentityFormScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  countriesAsync,
  statesAsync,
  updateMeAsync,
  updateUsernameAsync,
  changePhoneSendOtpAsync,
  changePhoneVerifyOtpAsync,
} from '../../../redux/services/authService';
import { setUpdateMeStatus } from '../../../redux/slices/authSlice';
import { ASYNC_STATUS } from '../../../config/constants';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import { makeIdentityFormStyles } from './IdentityFormScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';
import { showErrorAlert } from '../../../utils/AlertHelper';

interface IdentityFormValues {
  username: string;
  fullName: string;
  dateOfBirth: string | Date;
  phoneNumber: string;
  address: string;
  city: string;
  stateId: string;
  zip: string;
  countryId: string;
  countryName: string;
}

const OTP_LENGTH = 7;

const IdentityFormScreen: React.FC<IdentityFormScreenProps> = () => {
  const navigation = useNavigation<IdentityFormScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeIdentityFormStyles(themeColors as RoleTheme), [themeColors]);

  const {
    user_data,
    countries_data,
    states_data,
    update_me_status,
    change_phone_send_otp_status,
    change_phone_verify_otp_status,
  } = useSelector((state: any) => state.user_auth);
  const dispatch = useDispatch<AppDispatch>();

  const [skip, setSkip] = useState(false);
  const [countryCode, setCountryCode] = useState('1');
  const formikRef = useRef<FormikProps<IdentityFormValues>>(null);
  const phoneInput = useRef<PhoneInput>(null);

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const pendingNewPhone = useRef('');
  const pendingCountryCode = useRef('1');
  const pendingProfileValues = useRef<IdentityFormValues | null>(null);
  const verifiedPhone = useRef('');

  const isLoading = update_me_status === ASYNC_STATUS.LOADING;
  const isSendingOtp = change_phone_send_otp_status === ASYNC_STATUS.LOADING;
  const isVerifyingOtp = change_phone_verify_otp_status === ASYNC_STATUS.LOADING;

  const isExternalAuth = !!(user_data?.isexternalauth === true ||
    (user_data?.externalauthprovider && user_data.externalauthprovider !== ''));

  const derivedFullName = user_data?.fullname
    ? user_data.fullname
    : [user_data?.firstname, user_data?.lastname].filter(Boolean).join(' ').trim();

  const initialValues: IdentityFormValues = {
    username: user_data?.username || '',
    fullName: derivedFullName || '',
    dateOfBirth: user_data?.dateofbirth || '',
    phoneNumber: user_data?.phonenumber || '',
    address: user_data?.address1 || '',
    city: user_data?.city || '',
    stateId: '',
    zip: user_data?.zipcode || '',
    countryId: '',
    countryName: '',
  };

  const handleCountryChange = (value: any) => {
    const selectedCountry = countries_data?.find(
      (c: any) => c.id.toString() === value,
    );

    formikRef.current?.setFieldValue('countryId', value);
    formikRef.current?.setFieldValue('countryName', selectedCountry?.countryname || '');
    formikRef.current?.setFieldValue('stateId', '');

    if (value) {
      dispatch(statesAsync(value));
    }
  };

  // Submits everything except the phone number — phone is only ever set
  // via the OTP-verified changePhone flow, never through updateMeAsync.
  const submitProfile = (values: IdentityFormValues) => {
    let formattedDate = null;
    if (values.dateOfBirth) {
      if (typeof values.dateOfBirth === 'string') {
        formattedDate = values.dateOfBirth;
      } else if (values.dateOfBirth instanceof Date) {
        formattedDate = values.dateOfBirth.toISOString();
      }
    }

    const payload = {
      fullName: values.fullName,
      dateOfBirth: formattedDate,
      address1: values.address,
      city: values.city,
      stateId: values.stateId ? parseInt(values.stateId) : null,
      countryName: values.countryName || null,
      zipCode: values.zip || null,
      isUserSetupComplete: true,
    } as any;

    if (isExternalAuth && values.username.trim() && values.username.trim() !== user_data?.username) {
      dispatch(updateUsernameAsync({ newUsername: values.username.trim() }));
    }

    dispatch(updateMeAsync(payload));
  };

  const startPhoneOtpFlow = async (newPhone: string, callingCode: string) => {
    try {
      pendingNewPhone.current = newPhone;
      pendingCountryCode.current = callingCode;
      setOtpCode('');
      setOtpModalVisible(true);

      await dispatch(
        changePhoneSendOtpAsync({
          newPhone,
          countryCode: callingCode,
          method: 'phone',
        }),
      ).unwrap();
    } catch (error: any) {
      setOtpModalVisible(false);
      showErrorAlert(
        error?.message || t('common.enter_valid_phone'),
        t('update_personal_information.error_title'),
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== OTP_LENGTH) return;

    try {
      await dispatch(
        changePhoneVerifyOtpAsync({
          newPhone: pendingNewPhone.current,
          countryCode: pendingCountryCode.current,
          code: otpCode,
        }),
      ).unwrap();

      verifiedPhone.current = pendingNewPhone.current;
      setOtpModalVisible(false);
      setOtpCode('');

      if (pendingProfileValues.current) {
        submitProfile(pendingProfileValues.current);
        pendingProfileValues.current = null;
      }
    } catch (error: any) {
      showErrorAlert(
        error?.message || t('personal_information.otp_error_message'),
        t('personal_information.otp_error_title'),
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(
        changePhoneSendOtpAsync({
          newPhone: pendingNewPhone.current,
          countryCode: pendingCountryCode.current,
          method: 'phone',
        }),
      ).unwrap();

      setOtpCode('');
    } catch (error: any) {
      showErrorAlert(
        error?.message || 'Failed to resend OTP.',
        t('update_personal_information.error_title'),
      );
    }
  };

  const handleCloseOtpModal = () => {
    setOtpModalVisible(false);
    setOtpCode('');
    pendingProfileValues.current = null;
  };

  const handleContinue = (values: IdentityFormValues) => {
    const trimmedPhone = values.phoneNumber?.trim();

    if (isExternalAuth && trimmedPhone) {
      const isValidPhone = phoneInput.current?.isValidNumber(trimmedPhone);
      if (!isValidPhone) {
        Alert.alert(t('common.enter_valid_phone'));
        return;
      }

      const phoneNumberOnly = phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
      const actualPhoneNumber = phoneNumberOnly?.number || trimmedPhone.replace(/\D/g, '');

      // A phone number was entered and hasn't been OTP-verified yet in this
      // session — hold off on the main submit until verification succeeds.
      if (actualPhoneNumber !== verifiedPhone.current) {
        pendingProfileValues.current = values;
        const callingCode = phoneInput.current?.getCallingCode() || countryCode || '1';
        startPhoneOtpFlow(actualPhoneNumber, callingCode);
        return;
      }
    }

    submitProfile(values);
  };

  const handleSkip = () => {
    const payload = {
      isUserSetupComplete: true,
    } as any;
    setSkip(true);
    dispatch(updateMeAsync(payload));
  };

  useEffect(() => {
    dispatch(countriesAsync());
    dispatch(setUpdateMeStatus());
  }, []);

  useEffect(() => {
    if (formikRef.current?.values.countryId) return;
    const usCountry = findDefaultCountry(countries_data);
    if (usCountry) {
      handleCountryChange(usCountry.id.toString());
    }
  }, [countries_data]);

  useEffect(() => {
    if (update_me_status === ASYNC_STATUS.SUCCEEDED) {
      if (skip) {
        navigation.navigate('Dashboard');
      } else {
        navigation.navigate('Dashboard');
      }
      dispatch(setUpdateMeStatus());
    }
  }, [update_me_status]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isIOS ? 'padding' : 'height'}
    >
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema('identity_form')}
        onSubmit={handleContinue}
      >
        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerPadding}>
                <AuthHeader
                  title={t('identity_form.title1')}
                  subtitle={t('identity_form.subtitle1')}
                  onBackPress={() => navigation.goBack()}
                  backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />
              </View>
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { paddingHorizontal: 18 }]}>
                    {t('identity_form.section_personal_info1')}
                  </Text>
                </View>
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.formContainer}>
                  {isExternalAuth && (
                    <CustomInput
                      label={`${t('identity_form.full_name')} *`}
                      placeholder={`${t('identity_form.full_name_placeholder')} *`}
                      value={values.fullName}
                      onChangeText={handleChange('fullName')}
                      error={touched.fullName && errors.fullName}
                    />
                  )}

                  {/* Username — only for Google / Apple sign-ups */}
                  {isExternalAuth && (
                    <CustomInput
                      label={t('identity_form.username')}
                      placeholder={t('identity_form.username_placeholder')}
                      value={values.username}
                      onChangeText={handleChange('username')}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}

                  {/* Date of Birth */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>
                      {' '}
                      {t('identity_form.date_of_birth')}
                    </Text>

                    <CustomDateTimePicker
                      value={values.dateOfBirth}
                      onChange={(value: string | Date) => {
                        const selectedDate = value instanceof Date ? value : new Date(value);
                        const today = new Date();

                        // Prevent future date
                        if (selectedDate > today) {
                          Alert.alert(t('identity_form.future_date_error'));
                          setFieldValue('dateOfBirth', today); // reset to today
                          return;
                        }

                        setFieldValue('dateOfBirth', selectedDate);
                      }}
                      placeholder={t('identity_form.date_placeholder')}
                      mode="date"
                      displayFormat={getLocaleDateFormat(i18n.language)}
                      suffixIcon={
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={themeColors.textSecondary}
                        />
                      }
                    />
                  </View>

                  {/* Phone Number */}
                  {isExternalAuth && (
                    <>
                      <Text style={styles.phoneLabel}>{t('identity_form.phone')}</Text>
                      <View pointerEvents={isLoading ? 'none' : 'auto'}>
                        <PhoneInput
                          ref={phoneInput}
                          value={values.phoneNumber}
                          defaultCode="US"
                          layout="second"
                          onChangeCountry={() => {
                            const callingCode = phoneInput.current?.getCallingCode();
                            setCountryCode(callingCode as string);
                          }}
                          onChangeText={handleChange('phoneNumber')}
                          onChangeFormattedText={() => {
                            const callingCode = phoneInput.current?.getCallingCode();
                            setCountryCode(callingCode as string);
                          }}
                          withDarkTheme
                          withShadow
                          textContainerStyle={styles.phoneTextContainer}
                          disabled={isLoading}
                          disableArrowIcon={false}
                          containerStyle={styles.phoneContainer}
                          textInputStyle={{ color: themeColors.textPrimary }}
                          codeTextStyle={{ color: themeColors.textPrimary }}
                        />
                      </View>
                      {touched.phoneNumber && errors.phoneNumber && (
                        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                      )}
                    </>
                  )}
                  {/* Address */}
                  <CustomInput
                    label={t('identity_form.address')}
                    placeholder={t('identity_form.address_placeholder')}
                    value={values.address}
                    onChangeText={handleChange('address')}
                  />

                  {/* Country Dropdown */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>
                      {t('identity_form.country')}
                    </Text>
                    <CustomDropDown
                      options={
                        countries_data?.map((country: any) => ({
                          label: country.countryname,
                          value: country.id.toString(),
                        })) || []
                      }
                      value={values.countryId}
                      onSelect={handleCountryChange}
                      placeholder={t('identity_form.country_placeholder')}
                      search={true}
                      searchPlaceholder={t('common.search_country')}
                      maxHeight={300}
                      style={styles.dropdown}
                      leftIcon={true}
                    />
                  </View>

                  {/* City */}
                  <CustomInput
                    label={t('identity_form.city')}
                    placeholder={t('identity_form.city_placeholder')}
                    value={values.city}
                    onChangeText={handleChange('city')}
                  />

                  {/* State and Zip */}
                  <View style={styles.rowInputs}>
                    <View style={styles.halfInput}>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>
                          {t('identity_form.state')}
                        </Text>
                        <CustomDropDown
                          options={
                            states_data?.map((state: any) => ({
                              label: state.description,
                              value: state.id.toString(),
                            })) || []
                          }
                          value={values.stateId}
                          onSelect={(value: any) =>
                            setFieldValue('stateId', value)
                          }
                          placeholder={t('identity_form.state_placeholder')}
                          search={true}
                          searchPlaceholder={t('common.search_state')}
                          maxHeight={300}
                          style={styles.dropdown}
                          leftIcon={true}
                        />
                      </View>
                    </View>
                    <View style={styles.halfInput}>
                      <CustomInput
                        label={t('identity_form.zip')}
                        placeholder={t('identity_form.zip_placeholder')}
                        value={values.zip}
                        onChangeText={handleChange('zip')}
                        keyboardType="default"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <PrimaryButton
                title={t('identity_form.continue')}
                onPress={handleSubmit}
                loading={isLoading || isSendingOtp}
                disabled={isLoading || isSendingOtp}
                buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                textStyle={styles.continueButtonText}
              />
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: themeColors.primary }]}>{t('identity_form.skip')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>

      {/* Phone OTP verification modal */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseOtpModal}
      >
        <View style={otpModalStyles.overlay}>
          <View style={otpModalStyles.container}>
            <View style={otpModalStyles.header}>
              <Text style={otpModalStyles.title}>Verify Phone Number</Text>

              <TouchableOpacity
                onPress={handleCloseOtpModal}
                style={otpModalStyles.closeButton}
              >
                <Text style={otpModalStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <CustomInput
              value={otpCode}
              onChangeText={text =>
                setOtpCode(text.replace(/\D/g, '').slice(0, OTP_LENGTH))
              }
              placeholder="Enter OTP"
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              inputStyle={{
                textAlign: 'center',
                letterSpacing: 6,
                fontSize: 20,
              }}
            />

            <PrimaryButton
              title={isVerifyingOtp ? 'Verifying...' : 'Verify'}
              onPress={handleVerifyOtp}
              loading={isVerifyingOtp}
              disabled={isVerifyingOtp || otpCode.length !== OTP_LENGTH}
              buttonStyle={{
                backgroundColor: themeColors.primary,
                borderRadius: 12,
                marginTop: 8,
              }}
              textStyle={{ color: colors.white }}
            />

            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isSendingOtp}
              style={otpModalStyles.resendRow}
            >
              {isSendingOtp ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <Text style={[otpModalStyles.resendText, { color: themeColors.primary }]}>
                  Resend Code
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const otpModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: colors.gray,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default IdentityFormScreen;
