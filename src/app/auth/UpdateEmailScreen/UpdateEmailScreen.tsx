import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {
  AuthHeader,
  PrimaryButton,
  CustomInput,
} from '../../../components/common';
import { showErrorAlert } from '../../../utils/AlertHelper';
import colors from '../../../utils/colors';
import { ICONS } from '../../../utils/Images';
import { useUserRole } from '../../../hooks/useUserRole';
import { useNavigation } from '@react-navigation/native';
import { isIOS } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import {
  UpdateEmailScreenNavigationProp,
  UpdateEmailScreenProps,
} from '../../../types/authTypes/UpdateEmailScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../config/constants';
import { getAccessToken, getVerificationToken } from '../../../services/secureStorage/tokenStorage';
import { resendEmailOtpAsync } from '../../../redux/services/authService';
import { Formik } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import { makeUpdateEmailStyles } from './UpdateEmailScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const UpdateEmailScreen: React.FC<UpdateEmailScreenProps> = () => {
  const navigation = useNavigation<UpdateEmailScreenNavigationProp>();
  const { change_email_otp_status } = useSelector(
    (state: any) => state.user_auth,
  );

  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeUpdateEmailStyles(themeColors as RoleTheme), [themeColors]);
  const [verificationToken, setVerificationToken] = useState('');
  const isLoading = change_email_otp_status === ASYNC_STATUS.LOADING;

  useEffect(() => {
    loadVerificationToken();
  }, []);

  const loadVerificationToken = async () => {
    try {
      const token = await getVerificationToken();
      if (token) {
        setVerificationToken(token);
      }
    } catch (error) { }
  };

  const handleSubmit = async (values: { email: string }) => {
    try {
      // const verificationToken = await getAccessToken();

      if (!verificationToken) {
        showErrorAlert(t('common.verification_token_missing'));
        return;
      }

      const changeEmailData = {
        verificationToken: verificationToken,
        newEmail: values.email,
        type: "email"
      } as any;

      const result = await dispatch(
        resendEmailOtpAsync(changeEmailData),
      ).unwrap();

      navigation.navigate('OtpVerification', { email: values.email });
    } catch (error) { }
  };

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
            title={t('update_email.title')}
            subtitle={t('update_email.subtitle')}
            onBackPress={() => navigation.goBack()}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchema('update_email')}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleSubmit: formikSubmit, values, touched, errors }) => (
              <>
                <View style={styles.formContainer}>
                  <CustomInput
                    placeholder={`${t('signup.email_placeholder')} *`}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    icon={ICONS.EMAIL_ICON}
                    error={touched.email && errors.email}
                  />
                </View>

                <View style={styles.footerContainer}>
                  <PrimaryButton
                    title={t('update_email.submit')}
                    onPress={formikSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={{ backgroundColor: themeColors.primary }}
                    textStyle={{ color: colors.black }}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UpdateEmailScreen;
