import React, { useEffect, useRef, useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  Text,
  Animated,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { makeOfflineBannerStyles } from './OfflineBanner.styles';
import { RoleTheme } from '../../types/roleManager.types';

interface OfflineBannerProps {
  message?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ message }) => {
  const { isOffline, isUnknown } = useNetworkStatus();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeOfflineBannerStyles(themeColors as RoleTheme), [themeColors]);
  const translateY = useRef(new Animated.Value(-60)).current;
  const isVisible = isOffline;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : -60,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [isVisible, translateY]);

  if (!isVisible) { return null; }

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Feather name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>
        {message ?? 'You\'re offline — showing cached data'}
      </Text>
    </Animated.View>
  );
};

export default OfflineBanner;
