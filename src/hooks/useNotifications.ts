import { useState, useEffect, useCallback } from 'react';
import {
  getFCMToken,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  onTokenRefresh,
} from '../services/notifications/NotificationService';

interface UseNotificationsResult {
  fcmToken: string | null;
  isPermissionGranted: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsResult => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | null = null;

    const init = async () => {
      const granted = await getNotificationPermissionStatus();
      setIsPermissionGranted(granted);

      if (granted) {
        const token = await getFCMToken();
        setFcmToken(token);

        unsubscribeTokenRefresh = onTokenRefresh((newToken) => {
          setFcmToken(newToken);
        });
      }

      setIsLoading(false);
    };

    init();

    return () => {
      unsubscribeTokenRefresh?.();
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setIsPermissionGranted(granted);

    if (granted) {
      const token = await getFCMToken();
      setFcmToken(token);
    }

    return granted;
  }, []);

  return { fcmToken, isPermissionGranted, isLoading, requestPermission };
};
