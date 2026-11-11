import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Keyboard,
  BackHandler,
} from 'react-native';
import { AuthHeader, PrimaryButton } from '../../../components/common';
import CustomOTPInput from '../../../components/customcompoent/CustomOtpInput';
import { showErrorAlert, showSuccessAlert } from '../../../utils/AlertHelper';
import colors from '../../../utils/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { isIOS } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { ASYNC_STATUS } from '../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getVerificationToken, getAccessToken } from '../../../services/secureStorage/tokenStorage';
import {
  resendEmailOtpAsync,
  verifyPhoneAsync,
} from '../../../redux/services/authService';
import { showConfirmAlert } from '../../../utils/AlertHelper';
import {
  OTPVerificationScreenRouteProp,
  OTPVerificationScreenProps,
  OTPVerificationScreenNavigationProp,
} from '../../../types/authTypes/OtpVerificationScreen.types';
import { makeOtpVerificationStyles } from './OtpVerification.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeOtpVerificationStyles(themeColors as RoleTheme), [themeColors]);
  const { verify_phone_status, resend_email_otp_status, user_data } =
    useSelector((state: any) => state.user_auth);

  const email = route?.params?.email || user_data?.email || '';
  const [verificationToken, setVerificationToken] = useState('');
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const isLoading =
    verify_phone_status === ASYNC_STATUS.LOADING ||
    resend_email_otp_status === ASYNC_STATUS.LOADING;
  const timerRef = useRef<any>(null);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    loadVerificationToken();
    // Clear timer on component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (resend_email_otp_status === ASYNC_STATUS.SUCCEEDED) {
      loadVerificationToken();
    }
  }, [resend_email_otp_status]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        showErrorAlert(t('common.complete_email_verification'));
        return true;
      },
    );

    return () => backHandler.remove();
  }, [navigation]);

  const loadVerificationToken = async () => {
    try {
      const token = (await getVerificationToken()) || (await getAccessToken());
      if (token) {
        setVerificationToken(token);
      }
    } catch (error) { }
  };

  const startCountdownTimer = useCallback(() => {
    setCanResend(false);
    setCountdown(60);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Format time to display as 00:59, 00:58, etc.
  const formatTime = useCallback((seconds: any) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  // Handle OTP verification
  const handleVerifyOTP = useCallback(async () => {
    if (!otp || otp.length !== 7) {
      showErrorAlert(t('otp_verification.otp_incomplete'));
      return;
    }

    if (!verificationToken) {
      showErrorAlert(t('common.verification_token_missing'));
      return;
    }

    const verifyData = {
      verificationToken: verificationToken,
      code: otp,
      type: 'email',
    } as any;

    try {
      await dispatch(verifyPhoneAsync(verifyData)).unwrap();
      navigation.navigate('VerifyPhoneNumber');
    } catch (error) { }
  }, [otp, verificationToken, navigation, dispatch, t]);

  // Handle resend OTP
  const handleResendCode = useCallback(() => {
    if (!canResend) return;
    let resendData = {
      verificationToken: verificationToken,
      type: 'email',
      newEmail: email,
    } as any;
    dispatch(resendEmailOtpAsync(resendData));

    showSuccessAlert(t('otp_verification.otp_sent_success'));
    startCountdownTimer();
  }, [canResend, startCountdownTimer, verificationToken, email, dispatch]);

  const handleTryAnotherEmail = useCallback(() => {
    navigation.navigate('UpdateEmail');
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    showErrorAlert(t('common.complete_email_verification'));
  }, [navigation]);

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
            title={t('otp_verification.email_verification')}
            subtitle={t('otp_verification.subtitle', {
              email: email,
            })}
            onBackPress={handleBackPress}
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
                    {t('otp_verification.resend_code')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerContainer}>
                  <Text style={styles.resendText}>
                    {' '}
                    {t('otp_verification.resend_in')}{' '}
                  </Text>
                  <Text style={styles.timerText}>{formatTime(countdown)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer: Submit Button + Help Text - positioned at bottom */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('otp_verification.submit')}
          onPress={handleVerifyOTP}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={{ backgroundColor: themeColors.primary }}
          textStyle={{ color: colors.black }}
        />

        {/* Additional Help */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {t('otp_verification.help_text')}{' '}
            <Text
              onPress={handleTryAnotherEmail}
              style={[styles.linkText, { color: themeColors.primary }]}
            >
              {t('otp_verification.try_another_email')}
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPVerificationScreen;
