import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { makePersonalInformationStyles } from './PersonalInformation.styles';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../../../utils/colors';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  ProfileAvatar,
  ProfilePictureField,
} from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { isIOS } from '../../../../../utils/helpers';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { updateMeAsync } from '../../../../../redux/services/authService';
import {
  changeEmailSendOtpAsync,
  changeEmailVerifyOtpAsync,
  changePhoneSendOtpAsync,
  changePhoneVerifyOtpAsync,
  checkAuthAsync,
} from '../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import PhoneInput from 'react-native-phone-number-input';
import {
  showErrorAlert,
  showSuccessAlert,
} from '../../../../../utils/AlertHelper';
import {
  FormErrors,
  PersonalInformationNavigationProp,
  UserData,
} from './PersonalInformation.types';
import { AppDispatch } from '../../../../../types/store.types';

type OtpType = 'email' | 'phone' | null;

const OTP_LENGTH = 7;

const PersonalInformation: React.FC = () => {
  const navigation = useNavigation<PersonalInformationNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makePersonalInformationStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const {
    user_data,
    update_me_status,
    change_email_send_otp_status,
    change_email_verify_otp_status,
    change_phone_send_otp_status,
    change_phone_verify_otp_status,
  } = useSelector((state: any) => state.user_auth);

  const isLoading = update_me_status === ASYNC_STATUS.LOADING;

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [formData, setFormData] = useState<UserData>({
    fullname: user_data?.fullname || user_data?.firstname || '',
    email: user_data?.email || '',
    phonenumber: user_data?.phonenumber || '',
    username: user_data?.username || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [touched, setTouched] = useState({
    fullname: false,
    email: false,
    phonenumber: false,
  });

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpType, setOtpType] = useState<OtpType>(null);
  const [otpCode, setOtpCode] = useState('');

  const pendingNewEmail = useRef('');
  const pendingNewPhone = useRef('');
  const pendingCountryCode = useRef('1');

  // When both email and phone change, we verify email first and then
  // chain into the phone OTP flow. This flag tracks that pending phone step.
  const phoneChangePending = useRef(false);

  const phoneInputRef = useRef<PhoneInput>(null);

  const [phoneCountryCode, setPhoneCountryCode] =
    useState<string>('1');

  const isSendingOtp =
    change_email_send_otp_status === ASYNC_STATUS.LOADING ||
    change_phone_send_otp_status === ASYNC_STATUS.LOADING;

  const isVerifyingOtp =
    change_email_verify_otp_status === ASYNC_STATUS.LOADING ||
    change_phone_verify_otp_status === ASYNC_STATUS.LOADING;

  // The picture is kept by the id of the uploaded file; '' removes it.
  const [profilePictureId, setProfilePictureId] = useState<string>(user_data?.profilepicture || '');

  useEffect(() => {
    setProfilePictureId(user_data?.profilepicture || '');
    setFormData({
      fullname: user_data?.fullname || user_data?.firstname || '',
      email: user_data?.email || '',
      phonenumber: user_data?.phonenumber || '',
      username: user_data?.username || '',
    });
  }, [user_data]);

  useEffect(() => {
    if (
      change_email_verify_otp_status === ASYNC_STATUS.SUCCEEDED &&
      otpType === 'email'
    ) {
      setOtpCode('');

      dispatch(checkAuthAsync(undefined));

      showSuccessAlert(
        t('personal_information.email_updated_title') ||
        'Email Updated',
        t('personal_information.email_updated_message') ||
        'Your email has been updated successfully.',
      );

      // If the user also changed their phone number, chain into the
      // phone OTP flow instead of closing the modal.
      if (phoneChangePending.current) {
        phoneChangePending.current = false;
        startPhoneOtpFlow();
        return;
      }

      setOtpModalVisible(false);
      setOtpType(null);
    }
  }, [change_email_verify_otp_status]);

  useEffect(() => {
    if (
      change_phone_verify_otp_status === ASYNC_STATUS.SUCCEEDED &&
      otpType === 'phone'
    ) {
      setOtpModalVisible(false);
      setOtpCode('');
      setOtpType(null);

      dispatch(checkAuthAsync(undefined));

      showSuccessAlert(
        t('personal_information.phone_updated_title') ||
        'Phone Updated',
        t('personal_information.phone_updated_message') ||
        'Your phone number has been updated successfully.',
      );
    }
  }, [change_phone_verify_otp_status]);

  const handleInputChange = (
    field: string,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Full Name
    if (!formData.fullname.trim()) {
      newErrors.fullname =
        t(
          'update_personal_information.error_name_required',
        ) || 'Full name is required';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email =
        t(
          'update_personal_information.error_email_required',
        ) || 'Email is required';
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email =
          t(
            'update_personal_information.error_invalid_email',
          ) || 'Invalid email address';
      }
    }

    // Phone
    const phoneNumber =
      phoneInputRef.current
        ?.getNumberAfterPossiblyEliminatingZero()
        ?.number ||
      formData.phonenumber.replace(/\D/g, '');

    const isValidPhone =
      phoneInputRef.current?.isValidNumber(
        formData.phonenumber,
      ) ?? false;

    if (!phoneNumber) {
      newErrors.phonenumber =
        t(
          'common.enter_valid_phone',
        ) || 'Phone number is required';
    } else if (!isValidPhone) {
      newErrors.phonenumber =
        t(
          'common.enter_valid_phone',
        ) || 'Invalid phone number';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const startPhoneOtpFlow = async () => {
    try {
      setOtpType('phone');
      setOtpCode('');
      setOtpModalVisible(true);

      await dispatch(
        changePhoneSendOtpAsync({
          newPhone: pendingNewPhone.current,
          countryCode: pendingCountryCode.current,
          method: 'email',
        }),
      ).unwrap();
    } catch (error: any) {
      setOtpModalVisible(false);
      setOtpType(null);
      showErrorAlert(
        t('update_personal_information.error_title'),
        error?.message ||
        t('update_personal_information.error_message'),
      );
    }
  };

  const handleSaveChanges = async () => {
    setTouched({
      fullname: true,
      email: true,
      phonenumber: true,
    });

    if (!validateForm()) return;

    const emailChanged =
      formData.email.trim() !==
      (user_data?.email || '');

    const phoneChanged =
      formData.phonenumber.trim() !==
      (user_data?.phonenumber || '');

    const nameChanged =
      formData.fullname.trim() !==
      (user_data?.fullname || '');

    const pictureChanged =
      profilePictureId !== (user_data?.profilepicture || '');

    try {
      // Update Name and/or profile picture
      if (nameChanged || pictureChanged) {
        await dispatch(
          updateMeAsync({
            fullname: formData.fullname,
            ...(pictureChanged ? { profilepicture: profilePictureId } : {}),
          } as any),
        ).unwrap();
      }

      // Capture the pending phone change up-front so it survives the
      // email OTP step (the email flow re-fetches user_data, which
      // resets formData to the still-old phone number).
      if (phoneChanged) {
        const phoneNumberOnly =
          phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero();

        pendingNewPhone.current =
          phoneNumberOnly?.number ||
          formData.phonenumber.replace(/\D/g, '');
        pendingCountryCode.current =
          phoneCountryCode || '1';
      }

      // Track whether a phone OTP step is still needed after email.
      phoneChangePending.current =
        phoneChanged && emailChanged;

      // Email OTP Flow (verified first; chains into phone if needed)
      if (emailChanged) {
        pendingNewEmail.current =
          formData.email.trim();

        await dispatch(
          changeEmailSendOtpAsync({
            newEmail: pendingNewEmail.current,
            method: 'phone',
          }),
        ).unwrap();

        setOtpType('email');
        setOtpCode('');
        setOtpModalVisible(true);

        return;
      }

      // Phone OTP Flow (only phone changed)
      if (phoneChanged) {
        await startPhoneOtpFlow();

        return;
      }

      if (nameChanged) {
        showSuccessAlert(
          t(
            'update_personal_information.success_title',
          ),
          t(
            'update_personal_information.success_message',
          ),
        );
      }

      setIsEditMode(false);
    } catch (error: any) {
      showErrorAlert(
        t(
          'update_personal_information.error_title',
        ),
        error?.message ||
        t(
          'update_personal_information.error_message',
        ),
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== OTP_LENGTH) return;

    try {
      if (otpType === 'email') {
        await dispatch(
          changeEmailVerifyOtpAsync({
            newEmail: pendingNewEmail.current,
            code: otpCode,
          }),
        ).unwrap();
      } else if (otpType === 'phone') {
        await dispatch(
          changePhoneVerifyOtpAsync({
            newPhone: pendingNewPhone.current,
            countryCode:
              pendingCountryCode.current,
            code: otpCode,
          }),
        ).unwrap();
      }

      setIsEditMode(false);
    } catch (error: any) {
      showErrorAlert(
        t(
          'personal_information.otp_error_title',
        ) || 'Invalid OTP',
        error?.message ||
        t(
          'personal_information.otp_error_message',
        ) ||
        'The code you entered is incorrect.',
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      if (otpType === 'email') {
        await dispatch(
          changeEmailSendOtpAsync({
            newEmail: pendingNewEmail.current,
            method: 'phone',
          }),
        ).unwrap();
      } else if (otpType === 'phone') {
        await dispatch(
          changePhoneSendOtpAsync({
            newPhone: pendingNewPhone.current,
            countryCode:
              pendingCountryCode.current,
            method: 'email',
          }),
        ).unwrap();
      }

      setOtpCode('');
    } catch (error: any) {
      showErrorAlert(
        t(
          'update_personal_information.error_title',
        ),
        error?.message ||
        'Failed to resend OTP.',
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: user_data?.fullname || '',
      email: user_data?.email || '',
      phonenumber: user_data?.phonenumber || '',
      username: user_data?.username || '',
    });

    setErrors({});

    setTouched({
      fullname: false,
      email: false,
      phonenumber: false,
    });

    setIsEditMode(false);
  };

  const handleCloseOtpModal = () => {
    setOtpModalVisible(false);
    setOtpCode('');
    setOtpType(null);
    phoneChangePending.current = false;
  };

  return (
    <ScreenWrapper
      scrollable={false}
      showShadow={false}
      containerStyle={{
        paddingHorizontal: 16,
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={isIOS ? 'padding' : 'height'}
      >
        <AuthHeader
          title={t('personal_information.title')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            paddingTop: isIOS ? 0 : 20,
          }}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Profile picture */}
            {isEditMode ? (
              <ProfilePictureField imageId={profilePictureId} onChange={setProfilePictureId} />
            ) : (
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <ProfileAvatar
                  imageId={user_data?.profilepicture}
                  name={user_data?.fullname || user_data?.username}
                  size={96}
                />
              </View>
            )}

            {/* Full Name */}
            <CustomInput
              label={t('personal_information.name')}
              placeholder={t(
                'personal_information.name_placeholder',
              )}
              value={formData.fullname}
              editable={isEditMode}
              onBlur={() =>
                setTouched(prev => ({
                  ...prev,
                  fullname: true,
                }))
              }
              onChangeText={text =>
                handleInputChange(
                  'fullname',
                  text,
                )
              }
              error={
                touched.fullname
                  ? errors.fullname
                  : undefined
              }
            />

            {/* Username */}
            <CustomInput
              label={t(
                'personal_information.username',
              )}
              placeholder={t(
                'personal_information.username_placeholder',
              )}
              value={formData.username ?? ''}
              editable={false}
              onChangeText={() => { }}
            />

            {/* Email */}
            <CustomInput
              label={t(
                'personal_information.email_address',
              )}
              placeholder={t(
                'personal_information.email_placeholder',
              )}
              value={formData.email}
              keyboardType="email-address"
              editable={isEditMode}
              onBlur={() =>
                setTouched(prev => ({
                  ...prev,
                  email: true,
                }))
              }
              onChangeText={text =>
                handleInputChange('email', text)
              }
              error={
                touched.email
                  ? errors.email
                  : undefined
              }
            />

            {/* Phone */}
            {isEditMode ? (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: themeColors.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  {t(
                    'personal_information.phone_no',
                  )}
                </Text>

                <PhoneInput
                  ref={phoneInputRef}
                  value={formData.phonenumber.replace(
                    /^\+\d{1,3}/,
                    '',
                  )}
                  defaultCode="US"
                  layout="second"
                  onChangeCountry={() => {
                    const callingCode =
                      phoneInputRef.current?.getCallingCode();

                    if (callingCode) {
                      setPhoneCountryCode(
                        callingCode,
                      );
                    }
                  }}
                  onChangeText={text => {
                    handleInputChange(
                      'phonenumber',
                      text,
                    );

                    setErrors(prev => ({
                      ...prev,
                      phonenumber: '',
                    }));

                    const callingCode =
                      phoneInputRef.current?.getCallingCode();

                    if (callingCode) {
                      setPhoneCountryCode(
                        callingCode,
                      );
                    }
                  }}
                  onChangeFormattedText={() => {
                    const callingCode =
                      phoneInputRef.current?.getCallingCode();

                    if (callingCode) {
                      setPhoneCountryCode(
                        callingCode,
                      );
                    }
                  }}
                  withDarkTheme={themeColors.isDark}
                  withShadow
                  textInputStyle={{ color: themeColors.textPrimary }}
                  codeTextStyle={{ color: themeColors.textPrimary }}
                  textContainerStyle={{
                    backgroundColor:
                      themeColors.surface,
                    paddingVertical: isIOS
                      ? 16
                      : 5.5,
                  }}
                  containerStyle={{
                    width: '100%',
                    backgroundColor: themeColors.surface,
                    borderWidth: 1,
                    borderColor:
                      touched.phonenumber &&
                        errors.phonenumber
                        ? 'red'
                        : themeColors.border,
                    borderRadius: 8,
                    shadowColor: 'transparent',
                  }}
                />

                {touched.phonenumber &&
                  errors.phonenumber ? (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {errors.phonenumber}
                  </Text>
                ) : null}
              </View>
            ) : (
              <CustomInput
                label={t(
                  'personal_information.phone_no',
                )}
                placeholder={t(
                  'personal_information.phone_placeholder',
                )}
                value={formData.phonenumber}
                keyboardType="phone-pad"
                editable={false}
                onChangeText={() => { }}
              />
            )}

            {/* Buttons */}
            {isEditMode ? (
              <View
                style={styles.buttonsContainer}
              >
                <PrimaryButton
                  title={
                    isLoading || isSendingOtp
                      ? t('common.loading') ||
                      'Loading...'
                      : t('common.update')
                  }
                  onPress={handleSaveChanges}
                  loading={
                    isLoading || isSendingOtp
                  }
                  disabled={
                    isLoading || isSendingOtp
                  }
                  buttonStyle={{
                    backgroundColor:
                      themeColors.primary,
                    borderRadius: 12,
                    flex: 1,
                  }}
                  textStyle={{
                    color: colors.white,
                  }}
                />

                <PrimaryButton
                  title={t('common.cancel')}
                  onPress={handleCancel}
                  disabled={
                    isLoading || isSendingOtp
                  }
                  buttonStyle={{
                    backgroundColor:
                      colors.border,
                    borderRadius: 12,
                    flex: 1,
                    marginLeft: 12,
                  }}
                  textStyle={{
                    color: colors.gray,
                  }}
                />
              </View>
            ) : (
              <PrimaryButton
                title={t(
                  'personal_information.edit',
                )}
                onPress={() =>
                  setIsEditMode(true)
                }
                buttonStyle={{
                  backgroundColor:
                    themeColors.primary,
                  borderRadius: 12,
                }}
                textStyle={{
                  color: colors.white,
                }}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP MODAL */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseOtpModal}
      >
        <View style={otpModalStyles.overlay}>
          <View style={otpModalStyles.container}>
            <View style={otpModalStyles.header}>
              <Text style={otpModalStyles.title}>
                {otpType === 'email'
                  ? 'Verify New Email'
                  : 'Verify New Phone'}
              </Text>

              <TouchableOpacity
                onPress={handleCloseOtpModal}
                style={otpModalStyles.closeButton}
              >
                <Text
                  style={otpModalStyles.closeText}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <CustomInput
              value={otpCode}
              onChangeText={text =>
                setOtpCode(
                  text
                    .replace(/\D/g, '')
                    .slice(0, OTP_LENGTH),
                )
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
              title={
                isVerifyingOtp
                  ? 'Verifying...'
                  : 'Verify'
              }
              onPress={handleVerifyOtp}
              loading={isVerifyingOtp}
              disabled={
                isVerifyingOtp ||
                otpCode.length !== OTP_LENGTH
              }
              buttonStyle={{
                backgroundColor:
                  themeColors.darkGreen,
                borderRadius: 12,
                marginTop: 8,
              }}
              textStyle={{
                color: colors.white,
              }}
            />

            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isSendingOtp}
              style={otpModalStyles.resendRow}
            >
              {isSendingOtp ? (
                <ActivityIndicator
                  size="small"
                  color={
                    themeColors.darkGreen
                  }
                />
              ) : (
                <Text
                  style={[
                    otpModalStyles.resendText,
                    {
                      color:
                        themeColors.darkGreen,
                    },
                  ]}
                >
                  Resend Code
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

import { StyleSheet } from 'react-native';
import { RoleTheme } from '../../../../../types/roleManager.types';

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

export default PersonalInformation;