import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthHeader, PrimaryButton } from '../../../components/common';
import colors from '../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { isIOS } from '../../../utils/helpers';
import { useUserRole } from '../../../hooks/useUserRole';
import { EmailVerificationScreenRouteParams } from '../../../types/authTypes/EmailVerificationScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../config/constants';
import { showErrorAlert, showSuccessAlert } from '../../../utils/AlertHelper';
import {
  forgotPasswordAsync,
  verifyForgotAsync,
} from '../../../redux/services/authService';
import { ERROR_MESSAGES } from '../../../constants/AppConstants';
import CustomOtpInput from '../../../components/customcompoent/CustomOtpInput';
import { makeEmailVerificationStyles } from './EmailVerificationScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

type EmailVerificationScreenRouteProp = RouteProp<
  { EmailVerification: EmailVerificationScreenRouteParams },
  'EmailVerification'
>;

const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeEmailVerificationStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { username, method } = route?.params || {};
  const isPhone = method === 'phone' || !method;
  const [countdown, setCountdown] = useState<number>(10);
  const [canResend, setCanResend] = useState<boolean>(false);
  const timerRef = useRef<number>(null);

  const [otp, setOtp] = useState<string>('');

  const { verify_forgot_status, resend_email_otp_status } = useSelector(
    (state: any) => state.user_auth,
  );
  const isLoading =
    verify_forgot_status === ASYNC_STATUS.LOADING ||
    resend_email_otp_status === ASYNC_STATUS.LOADING;

  useEffect(() => {
    startCountdownTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const handleSubmit = async () => {
    if (otp.length !== 7) {
      showErrorAlert(ERROR_MESSAGES.INVALID_OTP);
      return;
    }

    if (!username) {
      showErrorAlert(t('common.username_missing'));
      return;
    }

    try {
      const verifyForgotData = {
        code: otp,
        username: username,
      } as any;

      const result = await dispatch(
        verifyForgotAsync(verifyForgotData),
      ).unwrap();

      navigation.navigate('NewPassword' as never);
    } catch (error) { }
  };

  const handleResendCode = useCallback(() => {
    if (!canResend) return;

    if (!username) {
      showErrorAlert(t('common.username_missing'));
      return;
    }

    const resendData = {
      type: method ?? 'phone',
      userName: username,
    } as any;

    dispatch(forgotPasswordAsync(resendData));
    showSuccessAlert(t('email_verification.otp_sent_success'));
    startCountdownTimer();
  }, [canResend, username, dispatch, startCountdownTimer, t]);
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
            title={isPhone ? t('email_verification.email_verification') : t('otp_verification.email_verification')}
            subtitle={isPhone
              ? t('email_verification.subtitle', { email: username || '' })
              : t('otp_verification.subtitle', { email: username || '' })}
            onBackPress={() => navigation.goBack()}
            backButtonIconStyle={{ tintColor: themeColors.primary }}
          />
          <View style={styles.formContainer}>
            <CustomOtpInput length={7} onChangeOTP={setOtp} />

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
                    {t('otp_verification.resend_in')}{' '}
                  </Text>
                  <Text style={styles.timerText}>{formatTime(countdown)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('email_verification.submit')}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={{ backgroundColor: themeColors.primary, borderRadius: 34 }}
          textStyle={{ color: colors.black }}
        />

        <Text style={styles.spamText}>
          {isPhone ? t('email_verification.spam_text') : t('otp_verification.help_text')}{' '}
          <Text
            style={[styles.spamLink, { color: themeColors.primary }]}
            onPress={() => navigation.navigate('ForgotPassword' as never)}
          >
            {isPhone ? t('email_verification.spam_link') : t('otp_verification.try_another_email')}
          </Text>
          .
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EmailVerificationScreen;
