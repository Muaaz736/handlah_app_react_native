import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { apiHandle } from '../config/apiHandle';

interface StorageGuard {
  isLimitReached: boolean;
  showWarning: () => void;
}

const useStorageGuard = (): StorageGuard => {
  const [isLimitReached, setIsLimitReached] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    apiHandle
      .get<{ isLimitReached: boolean }>('user/storage-plan')
      .then(res => {
        setIsLimitReached(res.data?.isLimitReached ?? false);
      })
      .catch(() => {});
  }, []);

  const showWarning = () => {
    Alert.alert(
      'Storage Full',
      'Your storage is full. Remove existing files to upload more.',
      [{ text: 'OK', style: 'default' }],
    );
  };

  return { isLimitReached, showWarning };
};

export default useStorageGuard;
