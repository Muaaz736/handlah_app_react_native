import React, { useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  I18nManager,
  KeyboardTypeOptions,
  Alert,
  Text,
  StyleSheet,
} from 'react-native';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  showErrorToast,
  SocialButton,
  TextLink,
} from '../../../components/common';
import { ICONS } from '../../../utils/Images';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { isIOS } from '../../../utils/helpers';
import { useUserRole } from '../../../hooks/useUserRole';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS, GOOGLE_CONFIG } from '../../../config/constants';
import {
  appleSigninAsync,
  googleSigninAsync,
  loginAsync,
  sendMfaOtpAsync,
} from '../../../redux/services/authService';
import { navigateAfterAuth } from '../../../utils/routes';
import { LoginScreenNavigationProp } from '../../../types/authTypes/Login.types';
import { Formik } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import fonts from '../../../utils/fonts';
import {
  resetAppleSignInStatus,
  resetGoogleSignInStatus,
} from '../../../redux/slices/authSlice';
import GoogleSignInService from '../../../utils/GoogleSignInService';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import colors from '../../../utils/colors';
import { AppDispatch } from '../../../types/store.types';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();

  const { login_status, login_data, user_data, apple_signin_status, google_signin_status } =
    useSelector((state: any) => state.user_auth);

  const isLoading = login_status === ASYNC_STATUS.LOADING;

  const isGoogleLoading = google_signin_status === ASYNC_STATUS.LOADING;
  const isAppleLoading = apple_signin_status === ASYNC_STATUS.LOADING;

  const handleLogin = (values: { userName: string; password: string }) => {
    dispatch(loginAsync(values));
  };

  const signInWithGoogle = async () => {
    try {
      const result = await GoogleSignInService.signIn();
      if (!result.success) {
        showErrorToast('Google sign-in failed. Please try again.');
        return;
      }

      const obj: any = {
        idToken: result.idToken,
        isMobile: true,
        firstName: result.givenName,
        lastName: result.familyName,
      };

      dispatch(googleSigninAsync(obj));
    } catch (error: any) {
      // Do not log sign-in errors — they may expose tokens or user data
      Alert.alert(t('common.login_failed'), error.message || t('common.google_signin_failed'));
    }
  };

  const signInWithApple = async () => {
    if (!isIOS) {
      Alert.alert(
        t('common.not_available'),
        t('common.apple_not_available'),
      );
      return;
    }

    try {
      const appleAuthResponse = await appleAuth
        .performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        })
        .catch(err => {
          Alert.alert(
            t('common.apple_signin_error'),
            `${t('common.error')}: ${err.message}`,
          );
          throw err;
        });
      if (appleAuthResponse && appleAuthResponse.user) {
        const appleUser: any = {
          firstName: appleAuthResponse?.fullName?.givenName || '',
          lastName: appleAuthResponse?.fullName?.familyName || '',
          isMobile: true,
          // email: appleAuthResponse.email || '',
          idToken: appleAuthResponse.identityToken || '',
        };
        dispatch(appleSigninAsync(appleUser));
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
    } finally {
      if (__DEV__) { console.log('Apple Sign-In process completed'); }
    }
  };

  useEffect(() => {
    if (login_status === ASYNC_STATUS.SUCCEEDED) {
      // Backend lowercases JSON keys in some responses, so check both casings.
      const requiresMfa = login_data?.requires2fa ?? login_data?.requires2FA;

      if (requiresMfa) {
        const mfaToken = login_data?.token ?? login_data?.mfatoken;
        dispatch(sendMfaOtpAsync({ mfaToken }));
        navigation.navigate('MfaVerification', { mfaToken });
        return;
      }

      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          navigateAfterAuth(navigation, user_data);
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [login_status]);

  useEffect(() => {
    if (google_signin_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetGoogleSignInStatus());
      navigateAfterAuth(navigation, user_data);
    }
  }, [google_signin_status]);

  useEffect(() => {
    if (apple_signin_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetAppleSignInStatus());
      navigateAfterAuth(navigation, user_data);
    }
  }, [apple_signin_status]);

  // Initialize Google Sign-In configuration
  useEffect(() => {
    try {
      GoogleSignInService.configure(
        GOOGLE_CONFIG.WEB_CLIENT_ID,
        GOOGLE_CONFIG.IOS_CLIENT_ID,
        GOOGLE_CONFIG.ANDROID_CLIENT_ID,
      );
    } catch {
      // Do not log configuration errors — they may expose client credentials
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
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
              title={t('login.login')}
              subtitle={t('login.login_subtitle')}
              onBackPress={() => navigation.goBack()}
              backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
            />

            <Formik
              initialValues={{ userName: '', password: '' }}
              validationSchema={validationSchema('login')}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleSubmit, values, touched, errors }) => (
                <View style={styles.formContainer}>
                  <CustomInput
                    label={`${t('login.username')} *`}
                    placeholder={`${t('login.username_placeholder')} *`}
                    value={values.userName}
                    onChangeText={handleChange('userName')}
                    icon={ICONS.USER_ICON}
                    keyboardType={'text' as KeyboardTypeOptions}
                    autoCapitalize="none"
                    editable={!isLoading}
                    error={touched.userName && errors.userName}
                  />

                  <CustomInput
                    label={`${t('login.password')} *`}
                    placeholder={`${t('login.password_placeholder')} *`}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    icon={ICONS.LOCK_ICON}
                    password={true}
                    secureTextEntry={true}
                    editable={!isLoading}
                    error={touched.password && errors.password}
                  />
                  <View
                    style={[
                      styles.forgotPasswordContainer,
                      {
                        alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
                      },
                    ]}
                  >
                    <TextLink
                      linkText={t('login.forgot_password')}
                      onPress={() => navigation.navigate('ForgotPassword')}
                      disabled={isLoading}
                    />
                  </View>
                  <PrimaryButton
                    title={t('login.login')}
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={{ backgroundColor: themeColors.primary }}
                    textStyle={styles.primaryButtonText}
                  />

                  <TextLink
                    text={t('login.dont_have_account')}
                    linkText={t('login.sign_up')}
                    onPress={() => navigation.navigate('Signup')}
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
    </SafeAreaView >
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 18,
    paddingTop: isIOS ? 5 : 20,
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  forgotPasswordContainer: {
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.text,
  },
  primaryButtonText: {
    color: colors.black,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border ?? '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: fonts.display_regular,
  },
});
