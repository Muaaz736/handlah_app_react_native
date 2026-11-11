import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../../utils/colors';
import type { CustomToastContentProps } from '../../types/common.types';
import NetworkStatusTracker from '../../services/offline/NetworkStatusTracker';
import { makeCustomToastStyles } from './CustomToast.styles';
import { useUserRole } from '../../hooks/useUserRole';
import { RoleTheme } from '../../types/roleManager.types';

// Custom Toast Component
const CustomToastContent: React.FC<CustomToastContentProps> = ({
  text1,
  text2,
  iconName,
  iconBgColor
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeCustomToastStyles(themeColors as RoleTheme), [themeColors]);
  return (
    <View style={styles.toastContainer}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Icon name={iconName} size={20} color={colors.white} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
};

// Toast Configuration
export const toastConfig = {
  success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <CustomToastContent
      text1={text1 || ''}
      text2={text2}
      iconName="check-circle"
      iconBgColor={colors.success}
    />
  ),
  error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <CustomToastContent
      text1={text1 || ''}
      text2={text2}
      iconName="error"
      iconBgColor={colors.error}
    />
  ),
  info: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <CustomToastContent
      text1={text1 || ''}
      text2={text2}
      iconName="info"
      iconBgColor={colors.info}
    />
  ),
  warning: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <CustomToastContent
      text1={text1 || ''}
      text2={text2}
      iconName="warning"
      iconBgColor={colors.warning}
    />
  ),
  reminder: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <CustomToastContent
      text1={text1 || ''}
      text2={text2}
      iconName="notifications"
      iconBgColor={colors.primary}
    />
  ),
};

// Utility Functions
export const showSuccessToast = (message: string, title: string = 'Success'): void => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const showErrorToast = (message: string, title: string = 'Error'): void => {
  if (message === '__OFFLINE_ERROR__') return;
  if (NetworkStatusTracker.isOffline()) return;

  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const showInfoToast = (message: string, title: string = 'Info'): void => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const showWarningToast = (message: string, title: string = 'Warning'): void => {
  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const showReminderToast = (title: string, message: string): void => {
  Toast.show({
    type: 'reminder',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
  });
};

export default Toast;
