import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import { requestCameraPermission } from '../../../services/permissions/permissionService';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { ICONS } from '../../../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PrimaryButton } from '../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  SetupIdentityHubScreenNavigationProp,
  SetupIdentityHubScreenProps,
  CameraResponse,
} from '../../../types/authTypes/SetupIdentityHubScreen.types';
import { useDispatch } from 'react-redux';
import { setUpdateMeStatus } from '../../../redux/slices/authSlice';
import { makeSetupIdentityHubStyles } from './SetupIdentityHubScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const SetupIdentityHubScreen: React.FC<SetupIdentityHubScreenProps> = () => {
  const navigation = useNavigation<SetupIdentityHubScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeSetupIdentityHubStyles(themeColors as RoleTheme), [themeColors]);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setUpdateMeStatus());
    // Ensure i18n is fully loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show nothing until ready
  if (!isReady) {
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
        style={styles.container}
        locations={[0, 0.118, 0.2774, 0.4327, 0.5913, 0.7067, 0.8558, 1]}
      />
    );
  }

  const handleUploadID = async (): Promise<void> => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    };

    launchCamera(options, (response: CameraResponse) => {
      if (response.didCancel) {
      } else if (response.errorCode) {
      } else if (response.assets && response.assets[0]) {
        navigation.navigate('IdentityForm');
      }
    });
  };

  const handleEnterDetails = (): void => {
    navigation.navigate('IdentityForm');
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
      style={styles.container}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913, 0.7067, 0.8558, 1]}
    >
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

      <View style={styles.contentContainer}>
        {/* ID Card Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={ICONS.IDENTITY_HUB_ICON}
            style={styles.identityHubIcon}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {t('identity_form.setup_your_identity_hub')}
          </Text>
          <Text style={styles.description}>
            {t('identity_form.description')}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Upload ID Button */}
          <PrimaryButton
            title={t('identity_form.upload_id')}
            onPress={handleUploadID}
            variant="primary"
            icon={
              <Ionicons name="camera-outline" size={22} color={colors.text} />
            }
            buttonStyle={styles.uploadButton}
            textStyle={styles.uploadButtonText}
          />

          {/* Enter Details Button - Direct TouchableOpacity for exact match */}
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleEnterDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsButtonText}>
              {t('identity_form.enter_details')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default SetupIdentityHubScreen;
