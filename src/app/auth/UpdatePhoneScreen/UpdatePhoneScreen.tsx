import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import {
  AuthHeader,
  PrimaryButton,
  CustomInput,
} from '../../../components/common';
import { showErrorAlert, showSuccessAlert } from '../../../utils/AlertHelper';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { ICONS } from '../../../utils/Images';
import { useNavigation } from '@react-navigation/native';
import { isIOS } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import {
  UpdatePhoneScreenNavigationProp,
  UpdatePhoneScreenProps,
} from '../../../types/authTypes/UpdatePhoneScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../config/constants';
import PhoneInput from 'react-native-phone-number-input';
import { getAccessToken } from '../../../services/secureStorage/tokenStorage';
import { resendEmailOtpAsync } from '../../../redux/services/authService';
import { makeUpdatePhoneStyles } from './UpdatePhoneScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const UpdatePhoneScreen: React.FC<UpdatePhoneScreenProps> = () => {
  const navigation = useNavigation<UpdatePhoneScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeUpdatePhoneStyles(themeColors as RoleTheme), [themeColors]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('1');

  const phoneInput = useRef<PhoneInput>(null);

  const { change_phone_otp_status } = useSelector(
    (state: any) => state.user_auth,
  );

  const isLoading = change_phone_otp_status === ASYNC_STATUS.LOADING;

  const handleSubmit = useCallback(async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      showErrorAlert(t('common.enter_valid_phone'));
      return;
    }

    const isValidPhone = phoneInput.current?.isValidNumber(phoneNumber);
    if (!isValidPhone) {
      showErrorAlert(t('common.enter_valid_phone'));
      return;
    }

    try {
      const verificationToken = await getAccessToken();

      if (!verificationToken) {
        showErrorAlert(t('common.verification_token_missing'));
        return;
      }

      const phoneNumberOnly =
        phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
      const actualPhoneNumber = phoneNumberOnly?.number || phoneNumber;

      let resendData = {
        verificationToken: verificationToken,
        type: 'phone',
        newPhone: actualPhoneNumber,
        countryCode: countryCode,
      } as any;

      const result = await dispatch(resendEmailOtpAsync(resendData)).unwrap();

      navigation.navigate('VerifyPhoneNumber', {
        phoneNumber: actualPhoneNumber,
      });
    } catch (error) { }
  }, [phoneNumber, countryCode, dispatch, navigation]);

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
            title={t('update_phone.title')}
            subtitle={t('update_phone.subtitle')}
            onBackPress={() => navigation.goBack()}
            backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
          />

          <View style={styles.formContainer}>
            <Text style={styles.label}>{t('update_phone.phone_label')}</Text>
            <PhoneInput
              ref={phoneInput}
              value={phoneNumber}
              defaultCode="US"
              layout="second"
              onChangeCountry={country => {
                const callingCode = phoneInput.current?.getCallingCode();
                setCountryCode(callingCode as string);
              }}
              onChangeText={text => {
                setPhoneNumber(text);
              }}
              onChangeFormattedText={text => {
                const callingCode = phoneInput.current?.getCallingCode();
                setCountryCode(callingCode as string);
              }}
              withDarkTheme
              withShadow
              textContainerStyle={styles.phoneTextContainer}
              disabled={isLoading}
              disableArrowIcon={false}
              containerStyle={styles.phoneContainer}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('update_phone.submit')}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={{ backgroundColor: themeColors.primary }}
          textStyle={{ color: colors.black }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default UpdatePhoneScreen;
