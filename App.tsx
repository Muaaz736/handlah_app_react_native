import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Stacknavigation from './src/navigation/StackNavigation/Stacknavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDefaultLanguage } from './src/localization/i18n';
import { changeLanguage } from './src/localization/languageService';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/common';
import { startSyncEngine } from './src/services/offline';
import NetworkStatusTracker from './src/services/offline/NetworkStatusTracker';
import {
  initNotifications,
  requestNotificationPermission,
  getFCMToken,
} from './src/services/notifications/NotificationService';
import crashlytics from '@react-native-firebase/crashlytics';
import { isDeviceCompromised } from './src/utils/deviceSecurity';
import DeviceBlockedScreen from './src/components/DeviceBlockedScreen/DeviceBlockedScreen';
import { PurchasesProvider } from './src/services/purchases/PurchasesProvider';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isCompromised, setIsCompromised] = useState<boolean>(false);

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        const lang = await getDefaultLanguage();
        await changeLanguage(lang);
        // Mark app session start in Crashlytics
        await crashlytics().log('App session started');
        await crashlytics().setAttribute('app_version', '1.0.0');
      } catch (error) {
        // Language initialization failed; fallback to default
      } finally {
        // Block rooted/jailbroken devices before rendering the app.
        setIsCompromised(isDeviceCompromised());
        setIsReady(true);
      }
    };

    const initializeNotifications = async (): Promise<void> => {
      const granted = await requestNotificationPermission();
      console.log('[FCM] Permission granted:', granted);
      if (granted) {
        await getFCMToken();
      }
    };

    initializeApp();
    NetworkStatusTracker.start();
    startSyncEngine();
    initializeNotifications();
    const unsubscribeNotifications = initNotifications();

    return () => {
      unsubscribeNotifications();
    };
  }, []);

  if (!isReady) {
    return null;
  }

  if (isCompromised) {
    return <DeviceBlockedScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PurchasesProvider>
          <GestureHandlerRootView style={styles.container}>
              <View style={styles.container}>
                <Stacknavigation />
                <Toast config={toastConfig} />
              </View>
          </GestureHandlerRootView>
        </PurchasesProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
