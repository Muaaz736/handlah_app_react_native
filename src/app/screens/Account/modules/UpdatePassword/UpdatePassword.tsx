import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { makeUpdatePasswordStyles } from './UpdatePassword.styles';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ICONS } from '../../../../../utils/Images';
import colors from '../../../../../utils/colors';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, CustomInput, PrimaryButton } from '../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../utils/helpers';
import { UpdatePasswordNavigationProp, PasswordFormErrors } from './UpdatePassword.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { changePasswordAsync } from '../../../../../redux/services/authService';
import { setChangePasswordStatus } from '../../../../../redux/slices/authSlice';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const UpdatePassword: React.FC = () => {
  const navigation = useNavigation<UpdatePasswordNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeUpdatePasswordStyles(themeColors as RoleTheme), [themeColors]);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<PasswordFormErrors>({});

  const { change_password_status } = useSelector((state: any) => state.user_auth);

  const isLoading = change_password_status === ASYNC_STATUS.LOADING;

  const validateForm = (): boolean => {
    const newErrors: PasswordFormErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = t('update_password.error_current_required');
    }

    if (!newPassword) {
      newErrors.newPassword = t('update_password.error_new_required');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('update_password.error_password_length');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('update_password.error_confirm_required');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('update_password.error_passwords_no_match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = (): void => {
    if (validateForm()) {
      const payload = {
        currentPassword,
        newPassword,
        confirmPassword
      }

      dispatch(changePasswordAsync(payload as any));
    };
  }

  useEffect(() => {
    if (change_password_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setChangePasswordStatus());
      navigation.goBack();
    }
  }, [change_password_status]);

  return (
    <ScreenWrapper
      scrollable={false}
      containerStyle={{ paddingHorizontal: 16 }}
      showShadow={false}
    >
      {/* Header */}
      <AuthHeader
        title={t('update_password.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
        backButtonIconStyle={{ tintColor: themeColors.textSecondary }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <CustomInput
            label={t('update_password.current_password')}
            placeholder={t('update_password.current_password_placeholder')}
            value={currentPassword}
            onChangeText={(text: string) => {
              setCurrentPassword(text);
              setErrors({ ...errors, currentPassword: '' });
            }}
            password
            icon={ICONS.LOCK_ICON}
            error={errors.currentPassword}
            containerStyle={styles.inputContainer}
          />

          <CustomInput
            label={t('update_password.new_password')}
            placeholder={t('update_password.new_password_placeholder')}
            value={newPassword}
            onChangeText={(text: string) => {
              setNewPassword(text);
              setErrors({ ...errors, newPassword: '' });
            }}
            password
            icon={ICONS.LOCK_ICON}
            error={errors.newPassword}
            containerStyle={styles.inputContainer}
          />

          <CustomInput
            label={t('update_password.confirm_password')}
            placeholder={t('update_password.confirm_password_placeholder')}
            value={confirmPassword}
            onChangeText={(text: string) => {
              setConfirmPassword(text);
              setErrors({ ...errors, confirmPassword: '' });
            }}
            password
            icon={ICONS.LOCK_ICON}
            error={errors.confirmPassword}
            containerStyle={styles.inputContainer}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={t('update_password.save_changes')}
          onPress={handleSaveChanges}
          buttonStyle={{ backgroundColor: themeColors.primary }}
          textStyle={{ color: colors.white }}
          loading={isLoading}
        />
      </View>
    </ScreenWrapper>
  );
};

export default UpdatePassword;
