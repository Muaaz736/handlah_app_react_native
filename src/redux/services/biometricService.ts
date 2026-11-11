import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';

export interface RegisterBiometricDevicePayload {
  deviceId: string;
  deviceName: string;
  publicKey: string;
}

// POST /auth/biometric/register
export const registerBiometricDeviceAsync = createApiThunk<any, RegisterBiometricDevicePayload>(
  TYPE_CONSTANTS.REGISTER_BIOMETRIC_DEVICE_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.BIOMETRIC_REGISTER,
  'Failed to register biometric device. Please try again.',
  { skipOfflineQueue: true },
);

// DELETE /auth/biometric/device/{deviceId}
export const deleteBiometricDeviceAsync = async (deviceId: string): Promise<void> => {
  await apiHandle.delete(`${API_ENDPOINTS.AUTH.BIOMETRIC_DEVICE}/${deviceId}`);
};

// POST /auth/biometric/register (plain call, no redux dispatch required)
export const registerBiometricDeviceApi = async (
  payload: RegisterBiometricDevicePayload,
): Promise<void> => {
  await apiHandle.post(API_ENDPOINTS.AUTH.BIOMETRIC_REGISTER, payload);
};
