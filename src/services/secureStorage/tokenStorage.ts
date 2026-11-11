import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';


const SERVICE = {
  ACCESS_TOKEN: 'com.handlah.access_token',
  REFRESH_TOKEN: 'com.handlah.refresh_token',
  VERIFICATION_TOKEN: 'com.handlah.verification_token',
  USER_SESSION: 'com.handlah.user_session',
  FCM_TOKEN: 'com.handlah.fcm_token',
  DEVICE_ID: 'com.handlah.device_id',
} as const;


const TOKEN_OPTIONS: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  ...(Platform.OS === 'android'
    ? { securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE }
    : {}),
};


const FCM_OPTIONS: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  ...(Platform.OS === 'android'
    ? { securityLevel: Keychain.SECURITY_LEVEL.ANY }
    : {}),
};


export const saveAccessToken = async (token: string): Promise<void> => {
  if (!token) return;
  await Keychain.setGenericPassword('access_token', token, {
    service: SERVICE.ACCESS_TOKEN,
    ...TOKEN_OPTIONS,
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE.ACCESS_TOKEN,
    });
    return result ? result.password : null;
  } catch {
    return null;
  }
};


export const saveRefreshToken = async (token: string): Promise<void> => {
  if (!token) return;
  await Keychain.setGenericPassword('refresh_token', token, {
    service: SERVICE.REFRESH_TOKEN,
    ...TOKEN_OPTIONS,
  });
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE.REFRESH_TOKEN,
    });
    return result ? result.password : null;
  } catch {
    return null;
  }
};



export const saveVerificationToken = async (token: string): Promise<void> => {
  if (!token) return;
  await Keychain.setGenericPassword('verification_token', token, {
    service: SERVICE.VERIFICATION_TOKEN,
    ...TOKEN_OPTIONS,
  });
};

export const getVerificationToken = async (): Promise<string | null> => {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE.VERIFICATION_TOKEN,
    });
    return result ? result.password : null;
  } catch {
    return null;
  }
};

export const clearVerificationToken = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE.VERIFICATION_TOKEN });
  } catch { /* no-op */ }
};


export const saveUserId = async (userId: string): Promise<void> => {
  if (!userId) return;
  await Keychain.setGenericPassword('user_id', userId, {
    service: SERVICE.USER_SESSION,
    ...TOKEN_OPTIONS,
  });
};

export const getUserId = async (): Promise<string | null> => {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE.USER_SESSION,
    });
    return result ? result.password : null;
  } catch {
    return null;
  }
};

export const clearUserId = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE.USER_SESSION });
  } catch { /* no-op */ }
};


export const saveFcmToken = async (token: string): Promise<void> => {
  if (!token) return;
  await Keychain.setGenericPassword('fcm_token', token, {
    service: SERVICE.FCM_TOKEN,
    ...FCM_OPTIONS,
  });
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE.FCM_TOKEN,
    });
    return result ? result.password : null;
  } catch {
    return null;
  }
};

export const clearFcmToken = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE.FCM_TOKEN });
  } catch { /* no-op */ }
};


export const saveDeviceId = async (deviceId: string): Promise<void> => {
  if (!deviceId) return;
  await Keychain.setGenericPassword('device_id', deviceId, {
    service: SERVICE.DEVICE_ID,
    ...TOKEN_OPTIONS,
  });
};

export const getPersistedDeviceId = async (): Promise<string | null> => {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE.DEVICE_ID,
    });
    return result ? result.password : null;
  } catch {
    return null;
  }
};


export const saveTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  await Promise.all([
    saveAccessToken(accessToken),
    saveRefreshToken(refreshToken),
  ]);
};

export const getTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);
  return { accessToken, refreshToken };
};

export const clearTokens = async (): Promise<void> => {
  await Promise.all([
    Keychain.resetGenericPassword({ service: SERVICE.ACCESS_TOKEN }),
    Keychain.resetGenericPassword({ service: SERVICE.REFRESH_TOKEN }),
  ]);
};

export const clearAllSecureData = async (): Promise<void> => {
  await Promise.all([
    Keychain.resetGenericPassword({ service: SERVICE.ACCESS_TOKEN }),
    Keychain.resetGenericPassword({ service: SERVICE.REFRESH_TOKEN }),
    Keychain.resetGenericPassword({ service: SERVICE.VERIFICATION_TOKEN }),
    Keychain.resetGenericPassword({ service: SERVICE.USER_SESSION }),
    Keychain.resetGenericPassword({ service: SERVICE.FCM_TOKEN }),
  ]);
};
