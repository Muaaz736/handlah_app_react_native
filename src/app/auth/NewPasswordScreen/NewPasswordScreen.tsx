import React, { useMemo } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { showErrorAlert } from '../../../utils/AlertHelper';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
} from '../../../components/common';
import { ICONS } from '../../../utils/Images';
import colors from '../../../utils/colors';
import { isIOS } from '../../../utils/helpers';
import { useUserRole } from '../../../hooks/useUserRole';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { forgotResetPasswordAsync } from '../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../config/constants';
import { getVerificationToken } from '../../../services/secureStorage/tokenStorage';
import {
  NewPasswordScreenNavigationProp,
  NewPasswordScreenProps,
} from '../../../types/authTypes/NewPasswordScreen.types';
import { Formik } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import { makeNewPasswordStyles } from './NewPasswordScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

interface NewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const NewPasswordScreen: React.FC<NewPasswordScreenProps> = () => {
  const navigation = useNavigation<NewPasswordScreenNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeNewPasswordStyles(themeColors as RoleTheme), [themeColors]);
  const route = useRoute();

  const { forgot_reset_password_status } = useSelector((state:any) => state.user_auth);
  const isLoading = forgot_reset_password_status === ASYNC_STATUS.LOADING;

  const handleSubmit = async (values: NewPasswordFormValues) => {
    try {
      const resetToken = await getVerificationToken();
      
      if (!resetToken) {
        showErrorAlert(t('common.reset_token_missing'));
        return;
      }

      const resetPasswordData = {
        resetToken: resetToken,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      } as any;

      const result = await dispatch(forgotResetPasswordAsync(resetPasswordData)).unwrap();

      navigation.navigate('Login');
    } catch (error) {
    }
  };

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
            title={t('new_password.new_password')}
            subtitle={t('new_password.subtitle')}
            onBackPress={() => navigation.goBack()}
          />

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={validationSchema('new_password')}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleSubmit: formikSubmit, values, touched, errors }) => (
              <>
                <View style={styles.formContainer}>
                  <CustomInput
                    label={`${t('new_password.password')} *`}
                    placeholder={`${t('new_password.password_placeholder')} *`}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    icon={ICONS.LOCK_ICON}
                    secureTextEntry
                    editable={!isLoading}
                    error={touched.password && errors.password}
                  />

                  <CustomInput
                    label={`${t('new_password.confirm_password')} *`}
                    placeholder={`${t('new_password.confirm_password_placeholder')} *`}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    icon={ICONS.LOCK_ICON}
                    secureTextEntry
                    editable={!isLoading}
                    error={touched.confirmPassword && errors.confirmPassword}
                  />
                </View>

                <View style={styles.footerContainer}>
                  <PrimaryButton
                    title={t('new_password.submit')}
                    onPress={formikSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={{ backgroundColor: themeColors.primary, borderRadius: 34 }}
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

export default NewPasswordScreen;
