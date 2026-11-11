import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  BackHandler,
} from 'react-native';
import { AuthHeader, PrimaryButton, TextLink } from '../../../components/common';
import CustomOTPInput from '../../../components/customcompoent/CustomOtpInput';
import { showErrorAlert, showSuccessAlert } from '../../../utils/AlertHelper';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import { isIOS } from '../../../utils/helpers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  resendEmailOtpAsync,
  subscribePlanAsync,
  verifyPhoneAsync,
} from '../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../config/constants';
import { getVerificationToken, getAccessToken } from '../../../services/secureStorage/tokenStorage';
import {
  VerifyPhoneScreenNavigationProp,
  VerifyPhoneScreenRouteProp,
  VerifyPhoneScreenProps,
} from '../../../types/authTypes/VerifyPhoneScreen.types';
import { makeVerifyPhoneStyles } from './VerifyPhoneScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

// Persists across app kills so a cold-start remount of this screen doesn't
// silently re-send a code — the actual SMS send should only ever happen
// once per pending verification, or when the user taps "Resend".
const PHONE_OTP_IN_FLIGHT_KEY = 'phone_verification_otp_in_flight';

const VerifyPhoneScreen: React.FC<VerifyPhoneScreenProps> = () => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeVerifyPhoneStyles(themeColors as RoleTheme), [themeColors]);
  const route = useRoute<VerifyPhoneScreenRouteProp>();
  const navigation = useNavigation<VerifyPhoneScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { verify_phone_status, resend_email_otp_status, user_data } = useSelector(
    (state: any) => state.user_auth,
  );

  const phoneNumber = route?.params?.phoneNumber ? route?.params?.phoneNumber : user_data?.phonenumber || '';

  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [verificationToken, setVerificationToken] = useState<string>('');

  const isLoading = verify_phone_status === ASYNC_STATUS.LOADING;
  const timerRef = useRef<number>(null);

  useEffect(() => {
    initVerification();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        showErrorAlert(t('common.complete_phone_verification'));
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const initVerification = async () => {
    try {
      const token = (await getVerificationToken()) || (await getAccessToken());
      if (token) {
        setVerificationToken(token);
      }

      if (route?.params?.phoneNumber) {
        
        await AsyncStorage.setItem(PHONE_OTP_IN_FLIGHT_KEY, '1');
        return;
      }

      const alreadyInFlight = await AsyncStorage.getItem(PHONE_OTP_IN_FLIGHT_KEY);
      if (alreadyInFlight) {
        return;
      }

      if (token) {
        const sendData = {
          verificationToken: token,
          type: 'phone',
          newPhone: phoneNumber,
          countryCode: user_data?.countrycode || '',
        } as any;

        await dispatch(resendEmailOtpAsync(sendData)).unwrap();
      }

      await AsyncStorage.setItem(PHONE_OTP_IN_FLIGHT_KEY, '1');
    } catch (error) { }
  };

  const startCountdownTimer = useCallback(() => {
    setCanResend(false);
    setCountdown(60);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current as number);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  const handleVerifyOTP = useCallback(async () => {
    if (!otp || otp.length !== 7) {
      showErrorAlert(t('verify_phone.otp_incomplete'));
      return;
    }

    if (!verificationToken) {
      showErrorAlert(t('common.verification_token_missing'));
      return;
    }

    const verifyData = {
      verificationToken: verificationToken,
      code: otp,
      type: 'phone',
    } as any;

    try {
      const result = await dispatch(verifyPhoneAsync(verifyData)).unwrap();
      const subscribe = await dispatch(subscribePlanAsync()).unwrap();
      await AsyncStorage.removeItem(PHONE_OTP_IN_FLIGHT_KEY);
      navigation.navigate('PrivacyHealthData');
    } catch (error) { }
  }, [otp, verificationToken, dispatch, navigation, t]);

  const handleResendCode = useCallback(() => {
    if (!canResend) return;
    showSuccessAlert(t('verify_phone.otp_sent_success'));
    startCountdownTimer();
    let resendData = {
      verificationToken: verificationToken,
      type: 'phone',
      newPhone: phoneNumber,
      countryCode: user_data?.countrycode || '',
    } as any;
    dispatch(resendEmailOtpAsync(resendData));
  }, [canResend, startCountdownTimer, verificationToken, phoneNumber, user_data, dispatch]);

  const handleTryAnotherNumber = useCallback(() => {
    navigation.navigate('UpdatePhoneNumber');
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    showErrorAlert(t('common.complete_phone_verification'));
  }, []);

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
        <View style={styles.contentContainer}>
          <AuthHeader
            title={t('verify_phone.phone_number')}
            subtitle={t('verify_phone.subtitle', {
              phone: phoneNumber || '302 5555 0198',
            })}
            onBackPress={handleBackPress}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          <View style={styles.formContainer}>
            <CustomOTPInput
              length={7}
              onOTPComplete={setOtp}
              onChangeOTP={setOtp}
              autoFocus={true}
              containerStyle={styles.otpContainer}
            />

            {/* Resend OTP with Timer */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResendCode}>
                  <Text style={styles.resendActiveText}>
                    {t('verify_phone.resend_code')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendText}>
                  {t('verify_phone.submit')}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('verify_phone.submit')}
          onPress={handleVerifyOTP}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={{ backgroundColor: themeColors.primary }}
          textStyle={{ color: colors.black }}
        />

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {t('verify_phone.help_text')}{' '}
            <Text onPress={handleTryAnotherNumber} style={styles.linkText}>
              {t('verify_phone.try_another_number')}
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyPhoneScreen;
