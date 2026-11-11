import React from 'react';
import { View, Text, Platform, TouchableOpacity, BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from './DeviceBlockedScreen.styles';


const DeviceBlockedScreen: React.FC = () => {
  const { t } = useTranslation();

  const handleExit = (): void => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>!</Text>
      </View>

      <Text style={styles.title}>{t('device_security.blocked_title')}</Text>
      <Text style={styles.message}>{t('device_security.blocked_message')}</Text>

      {Platform.OS === 'android' && (
        <TouchableOpacity style={styles.button} onPress={handleExit} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{t('device_security.exit')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DeviceBlockedScreen;
