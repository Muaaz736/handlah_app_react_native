import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { PrimaryButton } from '../../../components/common';
import { ICONS } from '../../../utils/Images';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  IdentityHubSuccessScreenNavigationProp,
  IdentityHubSuccessScreenProps,
} from '../../../types/authTypes/IdentityHubSuccessScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../config/constants';
import { updateMeAsync } from '../../../redux/services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeIdentityHubSuccessStyles } from './IdentityHubSuccessScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const IdentityHubSuccessScreen: React.FC<
  IdentityHubSuccessScreenProps
> = () => {
  const navigation = useNavigation<IdentityHubSuccessScreenNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeIdentityHubSuccessStyles(themeColors as RoleTheme), [themeColors]);
  const { update_me_status } = useSelector((state: any) => state.user_auth);

  useEffect(() => {
    if (update_me_status === ASYNC_STATUS.SUCCEEDED) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Dashboard',
            state: {
              routes: [{ name: 'Home' }],
            },
          },
        ],
      });
    }
  }, [update_me_status]);

  const handleGoToDashboard = () => {
    const payload = {
      isUserSetupComplete: true,
    } as any;
    dispatch(updateMeAsync(payload));
  };

  return (
    <LinearGradient
      colors={[
        themeColors.gradient[0],
        themeColors.gradient[0],
        themeColors.gradient[1],
        themeColors.gradient[2],
        themeColors.gradient[3],
        themeColors.gradient[3],
        themeColors.gradient[4],
        themeColors.gradient[4],
      ]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913, 0.7067, 0.8558, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={ICONS.BACK_ICON_WHITE}
            style={styles.backButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={ICONS.IDENTITY_HUB_SUCCESS_ICON}
              style={styles.successIcon}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('identity_hub_success.title')}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {t('identity_hub_success.subtitle')}
          </Text>

          {/* Button */}
          <PrimaryButton
            title={t('identity_hub_success.go_to_dashboard')}
            onPress={handleGoToDashboard}
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default IdentityHubSuccessScreen;
