import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { showInfoToast } from '../../components/common';
import { isIOS } from '../../utils/helpers';
import {
  saveFcmToken,
  getFcmToken,
  clearFcmToken,
  saveDeviceId,
  getPersistedDeviceId,
} from '../secureStorage/tokenStorage';


export const getOrCreateDeviceId = async (): Promise<string> => {
  const stored = await getPersistedDeviceId();
  if (stored) return stored;

  const freshId = await DeviceInfo.getUniqueId();
  await saveDeviceId(freshId);
  return freshId;
};

export const getDeviceName = (): string => {
  return DeviceInfo.getDeviceNameSync();
};

export type NotificationHandler = (notification: FirebaseMessagingTypes.RemoteMessage) => void;

let _unsubscribeForeground: (() => void) | null = null;

export const requestNotificationPermission = async (): Promise<boolean> => {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const getNotificationPermissionStatus = async (): Promise<boolean> => {
  const authStatus = await messaging().hasPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const cached = await getFcmToken();
    if (cached) {
      return cached;
    }

    if (isIOS) {
      await messaging().registerDeviceForRemoteMessages();


      let token: string | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          token = await messaging().getToken();
          break;
        } catch {
          await new Promise<void>(resolve => setTimeout(resolve, 1000));
        }
      }

      if (token) {
        await saveFcmToken(token);
      } else {
        if (__DEV__) { console.log('[FCM] Could not retrieve token (simulator or APNs not ready).'); }
      }
      return token;
    }

    const token = await messaging().getToken();
    if (token) {
      await saveFcmToken(token);
    }
    return token;
  } catch {
    return null;
  }
};

export const deleteFCMToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
    await clearFcmToken();
  } catch {}
};

export const onTokenRefresh = (callback: (token: string) => void): (() => void) => {
  return messaging().onTokenRefresh(async (token) => {
    await saveFcmToken(token);
    callback(token);
  });
};

export const initNotifications = (handlers?: {
  onForeground?: NotificationHandler;
  onNavigate?: (data: Record<string, string>) => void;
}): (() => void) => {
  if (_unsubscribeForeground) {
    _unsubscribeForeground();
  }

  _unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    if (handlers?.onForeground) {
      handlers.onForeground(remoteMessage);
    } else {
      const title = remoteMessage.notification?.title ?? 'New Notification';
      const body = remoteMessage.notification?.body ?? '';
      showInfoToast(body, title);
    }
  });

  return () => {
    _unsubscribeForeground?.();
    _unsubscribeForeground = null;
  };
};

export const getInitialNotification =
  async (): Promise<FirebaseMessagingTypes.RemoteMessage | null> => {
    return messaging().getInitialNotification();
  };
