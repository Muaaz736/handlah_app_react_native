import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { makeAppealDecisionReceiveStyles } from './AppealDecision.styles';
import { LinearGradient } from 'react-native-linear-gradient';
import { ICONS } from '../../../../../utils/Images';
import { PrimaryButton } from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { AppealDecisionRecieveNavigationProp } from './AppealDecision.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const AppealDecisionRecieve: React.FC = () => {
  const navigation = useNavigation<AppealDecisionRecieveNavigationProp>();
  const { t, i18n } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeAppealDecisionReceiveStyles(themeColors as RoleTheme), [themeColors]);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Ensure i18n is fully loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  
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
          <Text style={styles.title}>{t('appeal_decision_received.title')}</Text>
          <Text style={styles.description}>
            {t('appeal_decision_received.description_1')}
          </Text>
          <Text style={styles.description}>
            {t('appeal_decision_received.description_2')}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Upload ID Button */}
          <PrimaryButton
            title={t('appeal_decision_received.go_to_dashboard')}
            onPress={() => navigation.navigate("Dashboard", { screen: 'Home' })}
            buttonStyle={styles.uploadButton}
            textStyle={styles.uploadButtonText}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default AppealDecisionRecieve;
