import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { AuthHeader, PrimaryButton } from '../../../components/common';
import CustomOTPInput from '../../../components/customcompoent/CustomOtpInput';
import { showErrorAlert } from '../../../utils/AlertHelper';
import colors from '../../../utils/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { isIOS } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { ASYNC_STATUS } from '../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { sendMfaOtpAsync, verifyMfaOtpAsync } from '../../../redux/services/authService';
import { navigateAfterAuth } from '../../../utils/routes';
import {
  MfaVerificationNavigationProp,
  MfaVerificationRouteProp,
} from '../../../types/authTypes/MfaVerificationScreen.types';
import { makeMfaVerificationStyles } from './MfaVerification.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const OTP_LENGTH = 7;

const MfaVerification: React.FC = () => {
  const navigation = useNavigation<MfaVerificationNavigationProp>();
  const route = useRoute<MfaVerificationRouteProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeMfaVerificationStyles(themeColors as RoleTheme), [themeColors]);

  const { mfa_verify_status, mfa_send_otp_status, user_data } =
    useSelector((state: any) => state.user_auth);

  const mfaToken = route?.params?.mfaToken || '';
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const timerRef = useRef<any>(null);

  const isVerifying = mfa_verify_status === ASYNC_STATUS.LOADING;
  const isResending = mfa_send_otp_status === ASYNC_STATUS.LOADING;

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

  useEffect(() => {
    startCountdownTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCountdownTimer]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  useEffect(() => {
    if (mfa_verify_status === ASYNC_STATUS.SUCCEEDED) {
      navigateAfterAuth(navigation, user_data);
    }
  }, [mfa_verify_status, navigation, user_data]);

  const handleVerifyOTP = useCallback(() => {
    if (!otp || otp.length !== OTP_LENGTH) {
      showErrorAlert(t('mfa_verification.otp_incomplete') || 'Please enter the complete code');
      return;
    }
    if (!mfaToken) {
      showErrorAlert(t('mfa_verification.token_missing') || 'Missing MFA session, please log in again');
      return;
    }

    dispatch(verifyMfaOtpAsync({ mfaToken, otp }));
  }, [otp, mfaToken, dispatch, t]);

  const handleResendCode = useCallback(() => {
    if (!canResend || !mfaToken) return;
    dispatch(sendMfaOtpAsync({ mfaToken }));
    startCountdownTimer();
  }, [canResend, mfaToken, dispatch, startCountdownTimer]);

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
            title={t('mfa_verification.title') || 'Two-Factor Verification'}
            subtitle={t('mfa_verification.subtitle') || 'Enter the verification code we sent you'}
            onBackPress={() => navigation.goBack()}
          />

          <View style={styles.formContainer}>
            <CustomOTPInput
              length={OTP_LENGTH}
              onOTPComplete={setOtp}
              onChangeOTP={setOtp}
              autoFocus={true}
              containerStyle={styles.otpContainer}
            />

            {/* Resend OTP with Timer */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
                  <Text style={styles.resendActiveText}>
                    {t('mfa_verification.resend_code') || 'Re-send code'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerContainer}>
                  <Text style={styles.resendText}>
                    {' '}
                    {t('mfa_verification.resend_in') || 'Re-send code in'}{' '}
                  </Text>
                  <Text style={styles.timerText}>{formatTime(countdown)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer: Submit Button - positioned at bottom */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('mfa_verification.submit') || 'Verify'}
          onPress={handleVerifyOTP}
          loading={isVerifying}
          disabled={isVerifying}
          buttonStyle={{ backgroundColor: themeColors.primary }}
          textStyle={{ color: colors.black }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default MfaVerification;
