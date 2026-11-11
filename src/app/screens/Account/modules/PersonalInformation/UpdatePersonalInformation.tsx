import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Alert,
} from 'react-native';
import { makeUpdatePersonalInformationStyles } from './PersonalInformation.styles';
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../../../utils/colors';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  ProfilePictureField,
} from '../../../../../components/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { isIOS } from '../../../../../utils/helpers';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { updateMeAsync } from '../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import {
  showErrorAlert,
  showSuccessAlert,
} from '../../../../../utils/AlertHelper';
import {
  UpdatePersonalInformationNavigationProp,
  UpdatePersonalInformationRouteProp,
  UserData,
  FormErrors,
} from './PersonalInformation.types';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const UpdatePersonalInformation: React.FC = () => {
  const navigation = useNavigation<UpdatePersonalInformationNavigationProp>();
  const route = useRoute<UpdatePersonalInformationRouteProp>();
  const { userData } = (route.params as { userData?: UserData }) || {};

  const [errors, setErrors] = useState<FormErrors>({});
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeUpdatePersonalInformationStyles(themeColors as RoleTheme), [themeColors]);

  const { update_me_status } = useSelector((state: any) => state.user_auth);
  const isLoading = update_me_status === ASYNC_STATUS.LOADING;

  const [formData, setFormData] = useState<UserData>({
    fullname: userData?.fullname || '',
    email: userData?.email || '',
    phonenumber: userData?.phonenumber || '',
  });

  // The picture is kept by the id of the uploaded file; '' removes it.
  const [profilePictureId, setProfilePictureId] = useState<string>(userData?.profilepicture || '');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = t('update_personal_information.error_name_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
        phonenumber: formData.phonenumber,
        profilepicture: profilePictureId,
      } as any;

      await dispatch(updateMeAsync(payload)).unwrap();

      showSuccessAlert(
        t('update_personal_information.success_title'),
        t('update_personal_information.success_message'),
      );
    } catch (error: any) {
      showErrorAlert(
        t('update_personal_information.error_title'),
        error?.message || t('update_personal_information.error_message'),
      );
    }
  };

  return (
    <ScreenWrapper
      scrollable={false}
      showShadow={false}
      containerStyle={{ paddingHorizontal: 16 }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={isIOS ? 'padding' : 'height'}
      >
        <AuthHeader
          title={t('update_personal_information.title')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <ProfilePictureField imageId={profilePictureId} onChange={setProfilePictureId} />

            <CustomInput
              label={t('update_personal_information.name')}
              placeholder={t('update_personal_information.name_placeholder')}
              value={formData.fullname}
              onChangeText={text => handleInputChange('fullname', text)}
              error={errors.fullname}
            />

            <CustomInput
              label={t('update_personal_information.email_address')}
              placeholder={t('update_personal_information.email_placeholder')}
              value={formData.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              onChangeText={() => {}}
            />

            <CustomInput
              label={t('update_personal_information.phone_no')}
              placeholder={t('update_personal_information.phone_placeholder')}
              value={formData.phonenumber}
              keyboardType="phone-pad"
              editable={false}
              onChangeText={() => {}}
            />

            <PrimaryButton
              title={t('update_personal_information.save_changes')}
              onPress={handleSaveChanges}
              loading={isLoading}
              disabled={isLoading}
              buttonStyle={{
                backgroundColor: themeColors.darkGreen,
                borderRadius: 12,
              }}
              textStyle={{ color: colors.white }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default UpdatePersonalInformation;
