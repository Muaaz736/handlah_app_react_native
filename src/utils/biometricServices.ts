import { Alert } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const FALLBACK_PASSCODE_SERVICE = 'com.handla.auth.fallbackPasscode';
const FALLBACK_PASSCODE_USERNAME = 'fallback_passcode';

interface BiometricOptions {
  promptMessage?: string;
  cancelButtonText?: string;
  fallbackLabel?: string;
  onSuccess?: (() => void) | null;
  onCancel?: (() => void) | null;
  onError?: ((error: unknown) => void) | null;
  allowDeviceCredentials?: boolean;
  disableBiometric?: boolean;
}

interface PasscodeOptions {
  promptMessage?: string;
  onSuccess?: (() => void) | null;
  onCancel?: (() => void) | null;
  onError?: ((error: unknown) => void) | null;
}

interface AlertOptions {
  promptMessage?: string;
  cancelButtonText?: string;
  failureTitle?: string;
  failureMessage?: string;
  okButtonText?: string;
  onSuccess?: (() => void) | null;
  allowDeviceCredentials?: boolean;
  showFailureAlert?: boolean;
}


const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });


export const isBiometricAvailable = async (): Promise<{
  available: boolean;
  biometryType: string | null;
  biometryName: string | null;
  error: string | null;
}> => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

    if (!available) {
      return {
        available: false,
        biometryType: null,
        biometryName: null,
        error: 'No biometric authentication available on this device',
      };
    }

    let biometryName = 'Biometric';
    if (biometryType === BiometryTypes.FaceID) {
      biometryName = 'Face ID';
    } else if (biometryType === BiometryTypes.TouchID) {
      biometryName = 'Touch ID';
    } else if (biometryType === BiometryTypes.Biometrics) {
      biometryName = 'Fingerprint';
    }

    return { available, biometryType: biometryType ?? null, biometryName, error: null };
  } catch {
    return {
      available: false,
      biometryType: null,
      biometryName: null,
      error: 'Unable to check biometric availability',
    };
  }
};


const authenticateWithPasscode = async (options: PasscodeOptions = {}): Promise<boolean> => {
  const {
    promptMessage = 'Enter your device passcode',
    onSuccess = null,
    onCancel = null,
    onError = null,
  } = options;

  try {
    const rnBiometricsWithCredentials = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });

    const { success } = await rnBiometricsWithCredentials.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });

    if (success) {
      if (onSuccess) { onSuccess(); }
      return true;
    } else {
      if (onCancel) { onCancel(); }
      return false;
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : '';
    if (errMessage.includes('not set')) {
      if (onSuccess) { onSuccess(); }
      return true;
    }
    if (onError) { onError(err); }
    return false;
  }
};


export const authenticateWithBiometric = async (options: BiometricOptions = {}): Promise<boolean> => {
  const {
    promptMessage = 'Authenticate to continue',
    cancelButtonText = 'Cancel',
    onSuccess = null,
    onCancel = null,
    onError = null,
    allowDeviceCredentials = true,
    disableBiometric = false,
  } = options;

  try {
    if (!disableBiometric) {
      const { available, biometryType } = await isBiometricAvailable();

      if (available && biometryType) {
        try {
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage,
            cancelButtonText,
          });

          if (success) {
            if (onSuccess) { onSuccess(); }
            return true;
          }

          if (allowDeviceCredentials) {
            return await authenticateWithPasscode({ promptMessage, onSuccess, onCancel, onError });
          }
          if (onCancel) { onCancel(); }
          return false;

        } catch (bioErr: unknown) {
          const errMsg = bioErr instanceof Error ? bioErr.message : String(bioErr);

          if (errMsg.includes('cancel') || errMsg.includes('Cancel')) {
            if (onCancel) { onCancel(); }
            return false;
          }

          if (errMsg.includes('lockout') || errMsg.includes('locked')) {
            if (allowDeviceCredentials) {
              return await authenticateWithPasscode({
                promptMessage: 'Too many failed attempts. Please use your device passcode.',
                onSuccess,
                onCancel,
                onError,
              });
            }
          }

          if (allowDeviceCredentials) {
            return await authenticateWithPasscode({ promptMessage, onSuccess, onCancel, onError });
          }
          if (onError) { onError(bioErr); }
          return false;
        }
      } else {
        if (allowDeviceCredentials) {
          return await authenticateWithPasscode({ promptMessage, onSuccess, onCancel, onError });
        }
        if (onSuccess) { onSuccess(); }
        return true;
      }
    } else {
      if (allowDeviceCredentials) {
        return await authenticateWithPasscode({ promptMessage, onSuccess, onCancel, onError });
      }
      if (onSuccess) { onSuccess(); }
      return true;
    }
  } catch (err: unknown) {
    if (allowDeviceCredentials) {
      try {
        return await authenticateWithPasscode({ promptMessage, onSuccess, onCancel, onError });
      } catch {
        if (onError) { onError(err); }
        return false;
      }
    }
    if (onError) { onError(err); }
    return false;
  }
};


export const authenticateWithAlert = async (options: AlertOptions = {}): Promise<boolean> => {
  const {
    promptMessage = 'Authenticate to continue',
    cancelButtonText = 'Cancel',
    failureTitle = 'Authentication Failed',
    failureMessage = 'Authentication is required to continue',
    okButtonText = 'OK',
    onSuccess = null,
    allowDeviceCredentials = true,
    showFailureAlert = true,
  } = options;

  const success = await authenticateWithBiometric({
    promptMessage,
    cancelButtonText,
    onSuccess,
    allowDeviceCredentials,
    onCancel: () => {
      if (showFailureAlert) {
        Alert.alert(failureTitle, failureMessage, [{ text: okButtonText }]);
      }
    },
    onError: (err: unknown) => {
      if (showFailureAlert) {
        let message = failureMessage;
        const errStr = err instanceof Error ? err.message : String(err);

        const i18n = require('i18next').default;
        if (errStr.includes('lockout') || errStr.includes('locked')) {
          message = i18n.t('common.biometric_lockout');
        } else if (errStr.includes('not available') || errStr.includes('not set')) {
          message = i18n.t('common.biometric_not_setup');
        } else if (errStr.includes('permission')) {
          message = i18n.t('common.biometric_permission_denied');
        }

        Alert.alert(failureTitle, message, [{ text: okButtonText }]);
      }
    },
  });

  return success;
};


export const createBiometricKeys = async (_keyName = 'biometric_key'): Promise<{ publicKey: string }> => {
  try {
    const { publicKey } = await rnBiometrics.createKeys();
    return { publicKey };
  } catch (err) {
    throw err;
  }
};

export const deleteBiometricKeys = async (): Promise<boolean> => {
  try {
    const { keysDeleted } = await rnBiometrics.deleteKeys();
    return keysDeleted;
  } catch {
    return false;
  }
};

export const biometricKeysExist = async (): Promise<boolean> => {
  try {
    const { keysExist } = await rnBiometrics.biometricKeysExist();
    return keysExist;
  } catch {
    return false;
  }
};

export const signBiometricChallenge = async (
  challenge: string,
  promptMessage = 'Confirm your identity to unlock',
): Promise<string> => {
  const { success, signature, error } = await rnBiometrics.createSignature({
    promptMessage,
    payload: challenge,
    cancelButtonText: 'Cancel',
  });

  if (!success || !signature) {
    throw new Error(error || 'Biometric authentication was cancelled or failed.');
  }

  return signature;
};


export const setFallbackPasscode = async (passcode: string): Promise<boolean> => {
  try {
    const result = await Keychain.setGenericPassword(
      FALLBACK_PASSCODE_USERNAME,
      passcode,
      {
        service: FALLBACK_PASSCODE_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
    return result !== false;
  } catch (err) {
    console.error('Failed to securely store fallback passcode:', err);
    return false;
  }
};


export const getFallbackPasscode = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: FALLBACK_PASSCODE_SERVICE,
    });
    return credentials ? credentials.password : null;
  } catch (err) {
    console.error('Failed to retrieve fallback passcode:', err);
    return null;
  }
};


export const removeFallbackPasscode = async (): Promise<boolean> => {
  try {
    return await Keychain.resetGenericPassword({
      service: FALLBACK_PASSCODE_SERVICE,
    });
  } catch (err) {
    console.error('Failed to remove fallback passcode:', err);
    return false;
  }
};

export const hasFallbackPasscode = async (): Promise<boolean> => {
  try {
    return await Keychain.hasGenericPassword({
      service: FALLBACK_PASSCODE_SERVICE,
    });
  } catch (err) {
    console.error('Failed to check fallback passcode existence:', err);
    return false;
  }
};


export const verifyFallbackPasscode = async (passcode: string): Promise<boolean> => {
  const stored = await getFallbackPasscode();
  return stored !== null && stored === passcode;
};

export default {
  isBiometricAvailable,
  authenticateWithBiometric,
  authenticateWithAlert,
  createBiometricKeys,
  deleteBiometricKeys,
  biometricKeysExist,
  signBiometricChallenge,
  setFallbackPasscode,
  getFallbackPasscode,
  removeFallbackPasscode,
  hasFallbackPasscode,
  verifyFallbackPasscode,
};
