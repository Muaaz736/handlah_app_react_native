import { View, Text, TouchableOpacity, Image } from 'react-native';
import { makeRequestAccessToDataReceiveStyles } from './RequestAccessToData.styles';
import { LinearGradient } from 'react-native-linear-gradient';
import { ICONS } from '../../../../../utils/Images';
import { PrimaryButton } from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { RequestAccessToDataRecieveNavigationProp } from './RequestAccessToData.types';
import { useMemo } from 'react';
import { RoleTheme } from '../../../../../types/roleManager.types';

const RequestAccessToDataRecieve: React.FC = () => {
  const navigation = useNavigation<RequestAccessToDataRecieveNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeRequestAccessToDataReceiveStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <LinearGradient
      colors={themeColors.gradient as any}
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
            source={ICONS.IDENTITY_HUB_SUCCESS_ICON}
            style={styles.successIcon}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('request_access_data_received.title')}</Text>
          <Text style={styles.description}>
            {t('request_access_data_received.description')}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Upload ID Button */}
          <PrimaryButton
            title={t('request_access_data_received.go_to_dashboard')}
            onPress={() => navigation.navigate("Dashboard", { screen: 'Home' })}
            buttonStyle={styles.uploadButton}
            textStyle={styles.uploadButtonText}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default RequestAccessToDataRecieve;
