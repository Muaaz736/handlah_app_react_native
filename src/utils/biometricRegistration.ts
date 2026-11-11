import { AppDispatch } from '../types/store.types';
import { getOrCreateDeviceId, getDeviceName } from '../services/notifications/NotificationService';
import {
  isBiometricAvailable,
  createBiometricKeys,
  deleteBiometricKeys,
  biometricKeysExist,
} from './biometricServices';
import { registerBiometricDeviceAsync } from '../redux/services/biometricService';

export const ensureBiometricDeviceRegistered = async (
  dispatch: AppDispatch,
): Promise<void> => {
  const { available } = await isBiometricAvailable();
  if (!available) return;

  const alreadyRegistered = await biometricKeysExist();
  if (alreadyRegistered) return;

  try {
    const { publicKey } = await createBiometricKeys();
    const deviceId = await getOrCreateDeviceId();
    const deviceName = getDeviceName();

    await dispatch(
      registerBiometricDeviceAsync({ deviceId, deviceName, publicKey }),
    ).unwrap();
  } catch (e) {
    await deleteBiometricKeys();
  }
};
