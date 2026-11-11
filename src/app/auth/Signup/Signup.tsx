import { appleAuth } from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthHeader,
  CustomCheckbox,
  CustomInput,
  PrimaryButton,
  SocialButton,
  TextLink,
  showErrorToast,
} from '../../../components/common';
import { ASYNC_STATUS, GOOGLE_CONFIG } from '../../../config/constants';
import { useUserRole } from '../../../hooks/useUserRole';
import { appleSigninAsync, googleSigninAsync, signupAsync } from '../../../redux/services/authService';
import { resetAppleSignInStatus, resetGoogleSignInStatus, setSignupStatus } from '../../../redux/slices/authSlice';
import { markNewUserForTutorial } from '../../../tutorial/tutorialStorage';
import { User } from '../../../types/authTypes/Login.types';
import {
  CheckboxLabelPart,
  SignupScreenNavigationProp,
  SignupScreenProps,
} from '../../../types/authTypes/Signup.types';
import { RoleTheme } from '../../../types/roleManager.types';
import { AppDispatch } from '../../../types/store.types';
import { showErrorAlert } from '../../../utils/AlertHelper';
import GoogleSignInService from '../../../utils/GoogleSignInService';
import { ICONS } from '../../../utils/Images';
import { isIOS } from '../../../utils/helpers';
import { getUserCompletionStatus } from '../../../utils/routes';
import { SCREEN_TYPES } from '../../../utils/staticData';
import validationSchema from '../../../utils/validationSchemas';
import { makeSignupStyles } from './Signup.styles';

interface SignupFormValues {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC<SignupScreenProps> = () => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeSignupStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const phoneInput = useRef<PhoneInput>(null);

  const { signup_status, google_signin_status, apple_signin_status, user_data } = useSelector((state: any) => state.user_auth);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [countryCode, setCountryCode] = useState('1');
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const isLoading = signup_status === ASYNC_STATUS.LOADING;
  const isGoogleLoading = google_signin_status === ASYNC_STATUS.LOADING;
  const isAppleLoading = apple_signin_status === ASYNC_STATUS.LOADING;

  const initialValues: SignupFormValues = {
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  const handleSignup = async (values: SignupFormValues) => {
    const { name, username, email, phone, password } = values;

    if (!agreedToTerms) {
      setIsSubmittingLocal(false);
      showErrorAlert(t('common.agree_terms'));
      return;
    }

    // Validate phone number
    const isValidPhone = phoneInput.current?.isValidNumber(values.phone);
    if (!isValidPhone) {
      setIsSubmittingLocal(false);
      showErrorAlert(t('common.enter_valid_phone'));
      return;
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const phoneNumberOnly =
      phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
    const actualPhoneNumber = phoneNumberOnly?.number || phone;

    const signupData = {
      userName: username,
      password: password,
      firstName: firstName,
      lastName: lastName,
      email: email,
      mobileNumber: actualPhoneNumber,
      country: countryCode,
    };

    try {
      const result = await dispatch(signupAsync(signupData)).unwrap();
      await AsyncStorage.setItem('tutorial_show', "true");

      const verificationToken =
        result?.verificationToken || result?.token || email;

      dispatch(setSignupStatus());
      navigation.navigate('OtpVerification', {
        verificationToken: verificationToken,
        email: email,
      });
    } catch (error) {
      // Error already handled by rejectWithValue in the thunk
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await GoogleSignInService.signIn();
      if (!result.success) {
        showErrorToast('Google sign-in failed. Please try again.');
        return;
      }
      dispatch(googleSigninAsync({ idToken: result.idToken, firstName: result.givenName, lastName: result.familyName, isMobile: true } as any));
    } catch (error: any) {
      console.error('Google Sign-In Failed:', error);
      Alert.alert(t('common.login_failed'), error.message || t('common.google_signin_failed'));
    }
  };

  const signInWithApple = async () => {
    if (!isIOS) {
      Alert.alert(t('common.not_available'), t('common.apple_not_available'));
      return;
    }
    try {
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      if (appleAuthResponse && appleAuthResponse.user) {
        dispatch(appleSigninAsync({
          firstName: appleAuthResponse?.fullName?.givenName || '',
          lastName: appleAuthResponse?.fullName?.familyName || '',
          isMobile: true,
          idToken: appleAuthResponse.identityToken || '',
        } as any));
      } else {
        throw new Error(t('common.apple_failed_user_info'));
      }
    } catch (error: any) {
      let errorMessage = t('common.apple_signin_failed');
      if (error.code === appleAuth.Error.CANCELED) {
        errorMessage = t('common.apple_cancelled');
      } else if (error.code === appleAuth.Error.FAILED) {
        errorMessage = t('common.apple_failed');
      } else if (error.code === appleAuth.Error.INVALID_RESPONSE) {
        errorMessage = t('common.apple_invalid_response');
      } else if (error.code === appleAuth.Error.NOT_HANDLED) {
        errorMessage = t('common.apple_not_handled');
      } else if (error.code === appleAuth.Error.UNKNOWN) {
        errorMessage = t('common.apple_unknown_error');
      } else {
        errorMessage = `${t('common.error')}: ${error.message || t('common.apple_unknown_error')}`;
      }
      Alert.alert(t('common.apple_signin_error'), errorMessage);
    }
  };

  const navigateBasedOnUserStatus = (userData: User) => {
    if (!userData) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' as any }] });
      return;
    }
    const completionStatus = getUserCompletionStatus(userData);
    switch (completionStatus) {
      case SCREEN_TYPES.EMAIL_VERIFICATION:
        navigation.reset({ index: 0, routes: [{ name: 'OtpVerification' as any }] });
        break;
      case SCREEN_TYPES.PHONE_VERIFICATION:
        navigation.reset({ index: 0, routes: [{ name: 'VerifyPhoneNumber' as any }] });
        break;
      case SCREEN_TYPES.PROFILE_SETUP:
        markNewUserForTutorial();
        navigation.reset({ index: 0, routes: [{ name: 'IdentityForm' as any }] });
        break;
      case SCREEN_TYPES.PRIVATE:
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' as any }] });
        break;
      default:
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' as any }] });
        break;
    }
  };

  useEffect(() => {
    if (google_signin_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetGoogleSignInStatus());
      navigateBasedOnUserStatus(user_data);
    }
  }, [google_signin_status]);

  useEffect(() => {
    if (apple_signin_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetAppleSignInStatus());
      navigateBasedOnUserStatus(user_data);
    }
  }, [apple_signin_status]);

  useEffect(() => {
    try {
      GoogleSignInService.configure(
        GOOGLE_CONFIG.WEB_CLIENT_ID,
        GOOGLE_CONFIG.IOS_CLIENT_ID,
        GOOGLE_CONFIG.ANDROID_CLIENT_ID,
      );
    } catch (error) {
      console.error('Google Configuration Error:', error);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isIOS ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <AuthHeader
            title={t('signup.create_account')}
            subtitle={t('signup.signup_subtitle')}
            onBackPress={() => navigation.goBack()}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema('signup')}
            onSubmit={handleSignup}
          >
            {({ handleChange, handleSubmit, values, touched, errors, isSubmitting, validateForm }) => (
              <View style={styles.formContainer}>
                <CustomInput
                  label={`${t('signup.your_name')} *`}
                  placeholder={`${t('signup.name_placeholder')} *`}
                  value={values.name}
                  onChangeText={handleChange('name')}
                  icon={ICONS.USER_ICON}
                  editable={!isLoading}
                  error={touched.name && errors.name}
                />

                <CustomInput
                  label={`${t('signup.username')} *`}
                  placeholder={`${t('signup.username_placeholder')} *`}
                  value={values.username}
                  onChangeText={handleChange('username')}
                  icon={ICONS.USER_ICON}
                  autoCapitalize="none"
                  editable={!isLoading}
                  error={touched.username && errors.username}
                />

                <CustomInput
                  label={`${t('signup.email')} *`}
                  placeholder={`${t('signup.email_placeholder')} *`}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  icon={ICONS.EMAIL_ICON}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  error={touched.email && errors.email}
                />
                <Text style={styles.phoneLabel}>{t('signup.phone')} *</Text>

                <View pointerEvents={isSubmittingLocal ? 'none' : 'auto'}>
                  <PhoneInput
                    ref={phoneInput}
                    value={values.phone}
                    defaultCode="US"
                    layout="second"
                    onChangeCountry={() => {
                      const callingCode = phoneInput.current?.getCallingCode();
                      setCountryCode(callingCode as string);
                    }}
                    onChangeText={handleChange('phone')}
                    onChangeFormattedText={() => {
                      const callingCode = phoneInput.current?.getCallingCode();
                      setCountryCode(callingCode as string);
                    }}
                    withDarkTheme
                    withShadow
                    textContainerStyle={styles.phoneTextContainer}
                    disabled={isLoading || isSubmittingLocal}
                    disableArrowIcon={false}
                    containerStyle={styles.phoneContainer}
                    textInputStyle={{ color: themeColors.textPrimary }}
                    codeTextStyle={{ color: themeColors.textPrimary }}
                  />
                </View>
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <CustomInput
                  label={`${t('signup.password')} *`}
                  placeholder={`${t('signup.password_placeholder')} *`}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  icon={ICONS.LOCK_ICON}
                  password={true}
                  secureTextEntry={true}
                  editable={!isLoading}
                  error={touched.password && errors.password}
                />

                <CustomInput
                  label={`${t('signup.confirm_password')} *`}
                  placeholder={`${t('signup.confirm_password_placeholder')} *`}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  icon={ICONS.LOCK_ICON}
                  password={true}
                  secureTextEntry={true}
                  editable={!isLoading}
                  error={touched.confirmPassword && errors.confirmPassword}
                />
                <View style={{ marginVertical: 12 }} >
                  <CustomCheckbox
                    checked={agreedToTerms}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                    labelParts={
                      [
                        { text: t('signup.terms_text_1'), link: false },
                        {
                          text: t('signup.terms_of_service'),
                          link: true,
                          onPress: () => navigation.navigate('TermsConditions' as any),
                        },
                        { text: t('signup.and'), link: false },
                        {
                          text: t('signup.privacy_policy'),
                          link: true,
                          onPress: () => navigation.navigate('PrivacyPolicy'),
                        },
                      ] as CheckboxLabelPart[]
                    }
                    linkStyle={{ color: themeColors.primary }}
                    activeBgColorStyle={{
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.primary,
                    }}
                  />
                </View>
                <PrimaryButton
                  title={t('signup.create_account')}
                  onPress={() => {
                    setIsSubmittingLocal(true);
                    Keyboard.dismiss();
                    setTimeout(async () => {
                      const formErrors = await validateForm();
                      handleSubmit();
                      if (Object.keys(formErrors).length > 0) {
                        setIsSubmittingLocal(false);
                      }
                    }, 350);
                  }}
                  loading={isLoading}
                  disabled={isLoading || isSubmittingLocal}
                  buttonStyle={{ backgroundColor: themeColors.primary }}
                  textStyle={styles.primaryButtonText}
                />

                <TextLink
                  text={t('signup.already_have_account')}
                  linkText={t('signup.login')}
                  onPress={() => navigation.navigate('Login')}
                  disabled={isLoading}
                />

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={[styles.dividerText, { color: themeColors.textPrimary }]}>{t('login.or')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-In Button */}
                <SocialButton
                  title={t('login.sign_in_with_google')}
                  icon="google"
                  iconSource={ICONS.GOOGLE_ICON}
                  onPress={signInWithGoogle}
                  loading={isGoogleLoading}
                  disabled={isGoogleLoading}
                />

                {/* Apple Sign-In Button */}
                {isIOS && (
                  <SocialButton
                    title={t('login.sign_in_with_apple')}
                    icon="apple"
                    onPress={signInWithApple}
                    loading={isAppleLoading}
                    disabled={isAppleLoading}
                  />
                )}

              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;