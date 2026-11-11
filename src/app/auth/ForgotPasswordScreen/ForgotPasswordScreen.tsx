import React, { useMemo } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  AuthHeader,
  CustomInput,
  CustomDropDown,
  PrimaryButton,
} from '../../../components/common';
import { ICONS } from '../../../utils/Images';
import colors from '../../../utils/colors';
import { isIOS } from '../../../utils/helpers';
import { useUserRole } from '../../../hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ForgotPasswordScreenNavigationProp } from '../../../types/authTypes/ForgotPasswordScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { ASYNC_STATUS } from '../../../config/constants';
import { forgotPasswordAsync } from '../../../redux/services/authService';
import { Formik } from 'formik';
import validationSchema from '../../../utils/validationSchemas';
import { makeForgotPasswordStyles } from './ForgotPasswordScreen.styles';
import { RoleTheme } from '../../../types/roleManager.types';

const METHOD_OPTIONS = [
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
];

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeForgotPasswordStyles(themeColors as RoleTheme), [themeColors]);

  const { forgot_password_status } = useSelector(
    (state: any) => state.user_auth,
  );
  const isLoading = forgot_password_status === ASYNC_STATUS.LOADING;

  const handleSubmit = async (values: { username: string; method: string }) => {
    try {
      const forgotPasswordData = {
        userName: values.username,
        method: values.method,
      } as any;

      await dispatch(forgotPasswordAsync(forgotPasswordData)).unwrap();

      navigation.navigate('EmailVerification', {
        username: values.username,
        method: values.method as 'email' | 'phone',
      });
    } catch (error) {}
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
            title={t('forgot_password.forgot_password')}
            subtitle={t('forgot_password.subtitle')}
            onBackPress={() => navigation.goBack()}
          />

          <Formik
            initialValues={{ username: '', method: '' }}
            validationSchema={validationSchema('forgot_password')}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleSubmit: formikSubmit, setFieldValue, values, touched, errors }) => (
              <>
                <View style={styles.formContainer}>
                  <CustomInput
                    label=""
                    placeholder={`${t('forgot_password.username_placeholder')} *`}
                    value={values.username}
                    onChangeText={handleChange('username')}
                    icon={ICONS.USER_ICON}
                    autoCapitalize="none"
                    editable={!isLoading}
                    error={touched.username && errors.username}
                  />
                  <CustomDropDown
                    options={METHOD_OPTIONS}
                    value={values.method}
                    onSelect={(val) => { if (val) setFieldValue('method', val); }}
                    placeholder={t('forgot_password.method_placeholder')}
                    search={false}
                    error={!!(touched.method && errors.method)}
                  />
                </View>

                  <PrimaryButton
                    title={t('forgot_password.submit')}
                    onPress={formikSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={{ backgroundColor: themeColors.primary, borderRadius: 34 }}
                    textStyle={{ color: colors.black }}
                  />
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
