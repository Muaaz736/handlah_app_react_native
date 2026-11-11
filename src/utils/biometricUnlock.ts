import { apiHandle } from '../config/apiHandle';
import { getOrCreateDeviceId, getDeviceName } from '../services/notifications/NotificationService';
import { signBiometricChallenge, createBiometricKeys, deleteBiometricKeys } from './biometricServices';
import { registerBiometricDeviceApi } from '../redux/services/biometricService';

interface UnlockSendResponse {
  token: string;
  challenge: string;
}

const STALE_KEY_ERROR_SNIPPETS = [
  'not registered or has been revoked',
  'not registered for biometric unlock',
  'invalid signature',
];

const isStaleBiometricKeyError = (err: unknown): boolean => {
  const message = String((err as any)?.response?.data?.message || '').toLowerCase();
  return STALE_KEY_ERROR_SNIPPETS.some(snippet => message.includes(snippet));
};

const requestBiometricUnlock = async (
  module: string,
  resourceId: number,
  deviceId: string,
  ownerUserId?: number,
): Promise<any> => {
  const sendBody: Record<string, unknown> = { method: 'biometric', deviceId };
  if (ownerUserId !== undefined) {
    sendBody.ownerUserId = ownerUserId;
  }

  const sendResponse = await apiHandle.post<UnlockSendResponse>(
    `${module}/${resourceId}/unlock/send`,
    sendBody,
  );
  const { token, challenge } = sendResponse.data;

  const signature = await signBiometricChallenge(challenge);

  const verifyResponse = await apiHandle.post(`${module}/${resourceId}/unlock/verify`, {
    token,
    otp: signature,
  });

  return verifyResponse.data;
};

export const unlockResourceWithBiometric = async (
  module: string,
  resourceId: number,
  ownerUserId?: number,
): Promise<any> => {
  const deviceId = await getOrCreateDeviceId();

  try {
    return await requestBiometricUnlock(module, resourceId, deviceId, ownerUserId);
  } catch (err) {
    if (!isStaleBiometricKeyError(err)) {
      throw err;
    }

    await deleteBiometricKeys();
    const { publicKey } = await createBiometricKeys();
    await registerBiometricDeviceApi({ deviceId, deviceName: getDeviceName(), publicKey });

    return await requestBiometricUnlock(module, resourceId, deviceId, ownerUserId);
  }
};
