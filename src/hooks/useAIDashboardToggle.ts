import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@handlah_ai_dashboard_toggle';

export const useAIDashboardToggle = () => {
  const [isAIDashboardMode, setIsAIDashboardMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Read persisted value on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (value === 'true') setIsAIDashboardMode(true);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const toggleAIDashboardMode = useCallback((value: boolean) => {
    setIsAIDashboardMode(value);
    AsyncStorage.setItem(STORAGE_KEY, value ? 'true' : 'false').catch(() => {});
  }, []);

  return { isAIDashboardMode, toggleAIDashboardMode, isLoaded };
};
