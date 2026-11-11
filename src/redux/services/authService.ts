import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import {
  LoginData,
  LoginResponse,
  SignupData,
  SignupResponse,
  StateData,
  StatesResponse,
} from '../../types/reduxTypes/authSlice.types';

export const signupAsync = createApiThunk<SignupResponse, SignupData>(
  TYPE_CONSTANTS.SIGNUP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.REGISTER,
  'Signup failed. Please try again.',
  { skipOfflineQueue: true },
);

export const loginAsync = createApiThunk<LoginResponse, LoginData>(
  TYPE_CONSTANTS.LOGIN_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.LOGIN,
  'Login failed. Please try again.',
  { skipOfflineQueue: true },
);

// =========>>>>>>> MFA (Multi-Factor Authentication)
export interface MfaSettingsPayload {
  enabled: boolean;
  method: 'email' | 'phone';
}

export const updateMfaSettingsAsync = createApiThunk<any, MfaSettingsPayload>(
  TYPE_CONSTANTS.MFA_SETTINGS_ASYNC,
  'patch',
  API_ENDPOINTS.AUTH.MFA_SETTINGS,
  'Failed to update MFA settings. Please try again.',
  { skipOfflineQueue: true },
);

export interface MfaSendOtpPayload {
  mfaToken: string;
}

export const sendMfaOtpAsync = createApiThunk<any, MfaSendOtpPayload>(
  TYPE_CONSTANTS.MFA_SEND_OTP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.MFA_SEND_OTP,
  'Failed to send verification code. Please try again.',
  { skipOfflineQueue: true },
);

export interface MfaVerifyPayload {
  mfaToken: string;
  otp: string;
}

export const verifyMfaOtpAsync = createApiThunk<any, MfaVerifyPayload>(
  TYPE_CONSTANTS.MFA_VERIFY_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.MFA_VERIFY,
  'Failed to verify code. Please try again.',
  { skipOfflineQueue: true },
);

export const googleSigninAsync = createApiThunk(
  TYPE_CONSTANTS.GOOGLE_SIGNIN_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.GOOGLE_SIGNIN,
  'Google sign-in failed. Please try again.',
  { skipOfflineQueue: true },
);

export const appleSigninAsync = createApiThunk(
  TYPE_CONSTANTS.APPLE_SIGNIN_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.APPLE_SIGNIN,
  'Apple sign-in failed. Please try again.',
  { skipOfflineQueue: true },
);

export const checkAuthAsync = createApiThunk(
  TYPE_CONSTANTS.CHECK_AUTH_ASYNC,
  'get',
  API_ENDPOINTS.AUTH.CHECK_AUTH,
  'checkAuth failed. Please try again.',
);

export const countriesAsync = createApiThunk(
  TYPE_CONSTANTS.COUNTRIES_ASYNC,
  'get',
  API_ENDPOINTS.AUTH.COUNTRIES,
  'Countries failed. Please try again.',
);

export const statesAsync = createApiThunk<StatesResponse, StateData>(
  TYPE_CONSTANTS.STATE_ASYNC,
  'get',
  (data) => `${API_ENDPOINTS.AUTH.STATES}/${data}`,
  'States failed. Please try again.',
);

export const updateMeAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_ME_ASYNC,
  'put',
  API_ENDPOINTS.AUTH.UPDATE_ME,
  'Update me failed. Please try again.',
);

export const updateUsernameAsync = createApiThunk<any, { newUsername: string }>(
  TYPE_CONSTANTS.UPDATE_USERNAME_ASYNC,
  'put',
  API_ENDPOINTS.AUTH.UPDATE_USERNAME,
  'Update username failed. Please try again.',
  { skipOfflineQueue: true },
);

export const forgotPasswordAsync = createApiThunk(
  TYPE_CONSTANTS.FORGOT_PASSWORD_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  'Forgot password failed. Please try again.',
  { skipOfflineQueue: true },
);

export const verifyPhoneAsync = createApiThunk(
  TYPE_CONSTANTS.VERIFY_PHONE_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.VERIFY_OTP,
  'Verify phone failed. Please try again.',
  { skipOfflineQueue: true },
);

export const verifyForgotAsync = createApiThunk(
  TYPE_CONSTANTS.VERIFY_FORGOT_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.VERIFY_FORGOT,
  'Verify forgot failed. Please try again.',
  { skipOfflineQueue: true },
);

export const forgotResetPasswordAsync = createApiThunk(
  TYPE_CONSTANTS.FORGOT_RESET_PASSWORD_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.FORGOT_RESET_PASSWORD,
  'Forgot reset password failed. Please try again.',
  { skipOfflineQueue: true },
);

export const subscribePlanAsync = createApiThunk(
  TYPE_CONSTANTS.SUBSCRIBE_PLAN_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.SUBSCRIBE_PLAN,
  'Subscribe plan failed. Please try again.',
  { skipOfflineQueue: true },
);

export const driverLicenseAsync = createApiThunk(
  TYPE_CONSTANTS.DRIVER_LICENSE_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.DRIVER_LICENSE,
  'Driver license submission failed. Please try again.',
);

export const imageUploadAsync = createApiThunk(
  TYPE_CONSTANTS.IMAGE_UPLOAD_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.IMAGE_UPLOAD,
  'Image upload failed. Please try again.',
  { config: { headers: { 'Content-Type': 'multipart/form-data' } }, skipOfflineQueue: true },
);

export const getImageAsync = createApiThunk(
  TYPE_CONSTANTS.GET_IMAGE_ASYNC,
  'get',
  (imageId: string) => `${API_ENDPOINTS.AUTH.IMAGE_UPLOAD}/${imageId}`,
  'Failed to fetch image.',
);

export const getBulkSignedUrlsAsync = createApiThunk<any, { ids: string[]; expiryHours?: number }>(
  TYPE_CONSTANTS.GET_BULK_SIGNED_URLS_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.IMAGES_SIGNED_URLS,
  'Failed to fetch image URLs.',
  { skipOfflineQueue: true },
);

export const getModuleGuidesAsync = createApiThunk<any, { routeKey: string }>(
  TYPE_CONSTANTS.GET_MODULE_GUIDES_ASYNC,
  'get',
  ({ routeKey }) => `${API_ENDPOINTS.AUTH.MODULE_GUIDES}?routeKey=${encodeURIComponent(routeKey)}`,
  'Failed to fetch user guide. Please try again.',
);

export const passportAsync = createApiThunk(
  TYPE_CONSTANTS.PASSPORT_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.PASSPORT,
  'Passport submission failed. Please try again.',
);

export const licensesAsync = createApiThunk(
  TYPE_CONSTANTS.LICENSES_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.LICENSES,
  'Licenses submission failed. Please try again.',
);

export const resendEmailOtpAsync = createApiThunk(
  TYPE_CONSTANTS.RESEND_EMAIL_OTP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.RESEND_EMAIL_OTP,
  'Resend email OTP failed. Please try again.',
  { skipOfflineQueue: true },
);

export const identityHubAsync = createApiThunk(
  TYPE_CONSTANTS.IDENTITY_HUB_ASYNC,
  'get',
  (arg: any) => {
    let url: string = API_ENDPOINTS.AUTH.IDENTITY_HUB;
    if (arg?.userId) {
      url = `${API_ENDPOINTS.AUTH.IDENTITY_HUB}?userId=${arg.userId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch identity hub data. Please try again.',
);

export const updateDriverLicenseAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_DRIVER_LICENSE_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.AUTH.DRIVER_LICENSE}/${arg.id}`,
  'Failed to update driver license. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const updatePassportAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_PASSPORT_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.AUTH.PASSPORT}/${arg.id}`,
  'Failed to update passport. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const updateLicenseAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_LICENSE_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.AUTH.LICENSES}/${arg.id}`,
  'Failed to update license. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deletePassportAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_PASSPORT_ASYNC,
  'delete',
  (id: number) => `${API_ENDPOINTS.AUTH.PASSPORT}/${id}`,
  'Failed to delete passport. Please try again.',
);

export const deleteDriverLicenseAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_DRIVER_LICENSE_ASYNC,
  'delete',
  (id: number) => `${API_ENDPOINTS.AUTH.DRIVER_LICENSE}/${id}`,
  'Failed to delete driver license. Please try again.',
);

export const deleteLicenseAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_LICENSE_ASYNC,
  'delete',
  (id: number) => `${API_ENDPOINTS.AUTH.LICENSES}/${id}`,
  'Failed to delete license/certification. Please try again.',
);

export const getEditHistoryAsync = createApiThunk(
  TYPE_CONSTANTS.GET_EDIT_HISTORY_ASYNC,
  'get',
  (arg: { entityType: string; entityId: number }) => {
    const params = new URLSearchParams();
    params.append('entityType', arg.entityType);
    params.append('entityId', String(arg.entityId));
    return `${API_ENDPOINTS.AUTH.EDIT_HISTORY}?${params.toString()}`;
  },
  'Failed to fetch edit history. Please try again.',
);

export const updateUserTimeZoneAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_USER_TIMEZONE_ASYNC,
  'put',
  API_ENDPOINTS.AUTH.UPDATE_TIMEZONE,
  'Failed to update time zone. Please try again.',
);

export const registerFCMTokenAsync = createApiThunk<
  void,
  { token: string; deviceId: string; platform: string }
>(
  TYPE_CONSTANTS.REGISTER_FCM_TOKEN_ASYNC,
  'put',
  API_ENDPOINTS.NOTIFICATIONS.FCM_TOKENS,
  'Failed to register FCM token.',
  { skipOfflineQueue: true },
);
export const changePasswordAsync = createApiThunk(
  TYPE_CONSTANTS.CHANGE_PASSWORD_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
  'Failed to change password. Please try again.',
);

// =========>>>>>>> Change Email OTP Flow
export const changeEmailSendOtpAsync = createApiThunk<
  { isSuccess: boolean; message: string },
  { newEmail: string; method: string }
>(
  TYPE_CONSTANTS.CHANGE_EMAIL_SEND_OTP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.CHANGE_EMAIL_SEND_OTP,
  'Failed to send OTP to new email. Please try again.',
  { skipOfflineQueue: true },
);

export const changeEmailVerifyOtpAsync = createApiThunk<
  { isSuccess: boolean; message: string },
  { newEmail: string; code: string }
>(
  TYPE_CONSTANTS.CHANGE_EMAIL_VERIFY_OTP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.CHANGE_EMAIL_VERIFY_OTP,
  'Failed to verify OTP. Please try again.',
  { skipOfflineQueue: true },
);

// =========>>>>>>> Change Phone OTP Flow
export const changePhoneSendOtpAsync = createApiThunk<
  { isSuccess: boolean; message: string },
  { newPhone: string; countryCode: string; method: string }
>(
  TYPE_CONSTANTS.CHANGE_PHONE_SEND_OTP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.CHANGE_PHONE_SEND_OTP,
  'Failed to send OTP to new phone. Please try again.',
  { skipOfflineQueue: true },
);

export const changePhoneVerifyOtpAsync = createApiThunk<
  { isSuccess: boolean; message: string },
  { newPhone: string; countryCode: string; code: string }
>(
  TYPE_CONSTANTS.CHANGE_PHONE_VERIFY_OTP_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.CHANGE_PHONE_VERIFY_OTP,
  'Failed to verify OTP. Please try again.',
  { skipOfflineQueue: true },
);

export interface SubmitPrivacyAppealPayload {
  appealType: string;
  requestReferenceId: string;
  dateReceived: string;
  appealReason: string;
  attachmentUrl: string[] | any;
  attachmentUrls?: string[];
}

export const submitPrivacyAppealAsync = createApiThunk<any, SubmitPrivacyAppealPayload>(
  TYPE_CONSTANTS.SUBMIT_PRIVACY_APPEAL_ASYNC,
  'post',
  API_ENDPOINTS.PRIVACY.SUBMIT_APPEAL,
  'Failed to submit appeal. Please try again.',
  { skipOfflineQueue: true },
);

export interface SubmitDataAccessRequestPayload {
  accessType: string;
  scope: string;
  deliveryMethod: string;
  notes: string;
}

export const submitDataAccessRequestAsync = createApiThunk<any, SubmitDataAccessRequestPayload>(
  TYPE_CONSTANTS.SUBMIT_DATA_ACCESS_REQUEST_ASYNC,
  'post',
  API_ENDPOINTS.PRIVACY.DATA_ACCESS_REQUEST,
  'Failed to submit data access request. Please try again.',
  { skipOfflineQueue: true },
);

export interface SubmitDataDeletionRequestPayload {
  deletionScope: string;
  reason: string;
  acknowledged: boolean;
}

export const submitDataDeletionRequestAsync = createApiThunk<any, SubmitDataDeletionRequestPayload>(
  TYPE_CONSTANTS.SUBMIT_DATA_DELETION_REQUEST_ASYNC,
  'post',
  API_ENDPOINTS.PRIVACY.DATA_DELETION_REQUEST,
  'Failed to submit data deletion request. Please try again.',
  { skipOfflineQueue: true },
);


export const getDropdownOptionsAsync = createApiThunk<any, any>(
  TYPE_CONSTANTS.GET_DROPDOWN_OPTIONS_ASYNC,
  'get',
  (moduleName: string) => `${API_ENDPOINTS.DROPDOWN_OPTIONS}/${moduleName}`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getDriverLicenseClassOptionsAsync = createApiThunk<any, any>(
  TYPE_CONSTANTS.GET_DRIVER_LICENSE_CLASS_OPTIONS_ASYNC,
  'get',
  (moduleName: string) => `${API_ENDPOINTS.DROPDOWN_OPTIONS}/${moduleName}`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getMedicationTypesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_MEDICATION_TYPES_ASYNC,
  'get',
  `${API_ENDPOINTS.DROPDOWN_OPTIONS}/MedicationType`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getVehicleAccidentsTypesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_VEHICLE_ACCIDENTS_TYPES_ASYNC,
  'get',
  `${API_ENDPOINTS.DROPDOWN_OPTIONS}/VehicleInsuranceType`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getVehicleRegistrationTypesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_VEHICLE_REGISTRATION_TYPES_ASYNC,
  'get',
  `${API_ENDPOINTS.DROPDOWN_OPTIONS}/VehicleRegistrationType`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getBusinessContactTypesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_BUSINESS_CONTACT_TYPES_ASYNC,
  'get',
  `${API_ENDPOINTS.DROPDOWN_OPTIONS}/BusinessContactType`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getComplianceTypeOptionsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_COMPLIANCE_TYPE_OPTIONS_ASYNC,
  'get',
  `${API_ENDPOINTS.DROPDOWN_OPTIONS}/ComplianceType`,
  'Failed to fetch dropdown options. Please try again.',
)

export const getSubscriptionTypeOptionsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_SUBSCRIPTION_TYPE_OPTIONS_ASYNC,
  'get',
  `${API_ENDPOINTS.DROPDOWN_OPTIONS}/SubscriptionType`,
  'Failed to fetch dropdown options. Please try again.',
)

export const deleteUUserAccountAsync = createApiThunk<any, { password: string }>(
  TYPE_CONSTANTS.DELETE_USER_ACCOUNT_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.DELETE_ACCOUNT,
  'Failed to delete user account. Please try again.',
)

export const cancelAccountDeletionAsync = createApiThunk<any, void>(
  TYPE_CONSTANTS.CANCEL_USER_ACCOUNT_DELETION_ASYNC,
  'post',
  API_ENDPOINTS.AUTH.CANCEL_ACCOUNT_DELETION,
  'Failed to cancel account deletion. Please try again.',
)

// Google Sign-In
export interface GoogleSignInPayload {
  idToken: string;
  isMobile: boolean;
}

export interface GoogleSignInResponse {
  isSuccess: boolean;
  requires2FA: boolean;
  token: string;
  refreshToken: string;
  user: any;
  authId: number;
  userId: number;
  message: string;
}

