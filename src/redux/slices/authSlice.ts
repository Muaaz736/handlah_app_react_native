import { createSlice } from '@reduxjs/toolkit';
import {
  saveAccessToken,
  saveRefreshToken,
  saveTokens,
  saveVerificationToken,
  saveUserId,
} from '../../services/secureStorage/tokenStorage';
import { showErrorToast, showSuccessToast } from '../../components/common';
import { registerBiometricDeviceAsync } from '../services/biometricService';
import {
  checkAuthAsync,
  loginAsync,
  updateMfaSettingsAsync,
  sendMfaOtpAsync,
  verifyMfaOtpAsync,
  signupAsync,
  subscribePlanAsync,
  verifyPhoneAsync,
  resendEmailOtpAsync,
  countriesAsync,
  statesAsync,
  updateMeAsync,
  forgotPasswordAsync,
  verifyForgotAsync,
  forgotResetPasswordAsync,
  driverLicenseAsync,
  imageUploadAsync,
  passportAsync,
  licensesAsync,
  identityHubAsync,
  updateDriverLicenseAsync,
  updatePassportAsync,
  updateLicenseAsync,
  deletePassportAsync,
  deleteDriverLicenseAsync,
  deleteLicenseAsync,
  getImageAsync,
  getEditHistoryAsync,
  updateUserTimeZoneAsync,
  changePasswordAsync,
  changeEmailSendOtpAsync,
  changeEmailVerifyOtpAsync,
  changePhoneSendOtpAsync,
  changePhoneVerifyOtpAsync,
  submitPrivacyAppealAsync,
  submitDataAccessRequestAsync,
  submitDataDeletionRequestAsync,
  googleSigninAsync,
  appleSigninAsync,
  getDropdownOptionsAsync,
  getMedicationTypesAsync,
  getVehicleAccidentsTypesAsync,
  getVehicleRegistrationTypesAsync,
  getBusinessContactTypesAsync,
  getComplianceTypeOptionsAsync,
  getSubscriptionTypeOptionsAsync,
  getDriverLicenseClassOptionsAsync,
  deleteUUserAccountAsync,
  cancelAccountDeletionAsync,
} from '../services/authService';
import { ASYNC_STATUS } from '../../config/constants';
import { AuthState } from '../../types/reduxTypes/authSlice.types';
import { formatDropdoenOption } from '../../utils/helpers';

const initialState: AuthState = {
  // =========>>>>>>> Auth Initial State

  check_auth_status: ASYNC_STATUS.IDLE,
  check_auth_error: null,

  user_data: null,
  user_auth: false,
  auth_token: null,
  user_id: null,

  signup_status: ASYNC_STATUS.IDLE,

  verify_phone_status: ASYNC_STATUS.IDLE,
  verify_phone_error: null,

  resend_email_otp_status: ASYNC_STATUS.IDLE,
  resend_email_otp_data: null,
  resend_email_otp_error: null,

  countries_status: ASYNC_STATUS.IDLE,
  countries_data: null,
  countries_error: null,

  states_status: ASYNC_STATUS.IDLE,
  states_data: null,
  states_error: null,

  update_me_status: ASYNC_STATUS.IDLE,
  update_me_data: null,
  update_me_error: null,

  verify_forgot_status: ASYNC_STATUS.IDLE,
  verify_forgot_data: null,
  verify_forgot_error: null,

  forgot_reset_password_status: ASYNC_STATUS.IDLE,
  forgot_reset_password_data: null,
  forgot_reset_password_error: null,

  forgot_password_status: ASYNC_STATUS.IDLE,
  forgot_password_data: null,
  forgot_password_error: null,

  subscribe_plan_status: ASYNC_STATUS.IDLE,
  subscribe_plan_data: null,
  subscribe_plan_error: null,

  driver_license_status: ASYNC_STATUS.IDLE,
  driver_license_data: null,
  driver_license_error: null,

  image_upload_status: ASYNC_STATUS.IDLE,
  image_upload_data: null,
  image_upload_error: null,

  get_image_status: ASYNC_STATUS.IDLE,
  get_image_data: null,
  get_image_error: null,

  passport_status: ASYNC_STATUS.IDLE,
  passport_data: null,
  passport_error: null,

  licenses_status: ASYNC_STATUS.IDLE,
  licenses_data: null,
  licenses_error: null,

  identity_hub_status: ASYNC_STATUS.IDLE,
  identity_hub_data: null,
  identity_hub_error: null,

  edit_history_status: ASYNC_STATUS.IDLE,
  edit_history_data: null,
  edit_history_error: null,

  login_status: ASYNC_STATUS.IDLE,
  login_error: null,
  login_data: null,

  mfa_settings_status: ASYNC_STATUS.IDLE,
  mfa_settings_error: null,

  mfa_send_otp_status: ASYNC_STATUS.IDLE,
  mfa_send_otp_error: null,

  mfa_verify_status: ASYNC_STATUS.IDLE,
  mfa_verify_error: null,

  register_biometric_device_status: ASYNC_STATUS.IDLE,
  register_biometric_device_error: null,

  update_timezone_status: ASYNC_STATUS.IDLE,
  update_timezone_error: null,

  change_password_status: ASYNC_STATUS.IDLE,
  change_password_error: null,

  change_email_send_otp_status: ASYNC_STATUS.IDLE,
  change_email_send_otp_error: null,
  change_email_verify_otp_status: ASYNC_STATUS.IDLE,
  change_email_verify_otp_error: null,

  change_phone_send_otp_status: ASYNC_STATUS.IDLE,
  change_phone_send_otp_error: null,
  change_phone_verify_otp_status: ASYNC_STATUS.IDLE,
  change_phone_verify_otp_error: null,

  submit_appeal_status: ASYNC_STATUS.IDLE,
  submit_appeal_data: null,
  submit_appeal_error: null,

  data_access_request_status: ASYNC_STATUS.IDLE,
  data_access_request_data: null,
  data_access_request_error: null,

  data_deletion_request_status: ASYNC_STATUS.IDLE,
  data_deletion_request_data: null,
  data_deletion_request_error: null,

  google_signin_status: ASYNC_STATUS.IDLE,
  google_signin_data: ASYNC_STATUS.IDLE,
  google_signin_error: null,

  apple_signin_status: ASYNC_STATUS.IDLE,
  apple_signin_data: ASYNC_STATUS.IDLE,
  apple_signin_error: null,

  get_dropdown_options_status: ASYNC_STATUS.IDLE,
  get_dropdown_options_data: [],
  get_dropdown_options_error: null,

  get_driver_license_class_options_status: ASYNC_STATUS.IDLE,
  get_driver_license_class_options_data: [],
  get_driver_license_class_options_error: null,
  get_vehicle_registration_types_status: ASYNC_STATUS.IDLE,
  get_vehicle_registration_types_data: [],

  get_medication_types_status: ASYNC_STATUS.IDLE,
  get_medication_types_data: [],

  get_vehicle_accidents_types_status: ASYNC_STATUS.IDLE,
  get_vehicle_accidents_types_data: [],

  get_business_contact_types_status: ASYNC_STATUS.IDLE,
  get_business_contact_types_data: [],

  get_compliance_type_options_status: ASYNC_STATUS.IDLE,
  get_compliance_type_options_data: [],

  get_subscription_type_options_status: ASYNC_STATUS.IDLE,
  get_subscription_type_options_data: [],

  delete_account_status: ASYNC_STATUS.IDLE,
  delete_account_data: null,

  cancel_account_deletion_status: ASYNC_STATUS.IDLE,
  cancel_account_deletion_data: null,

  requires_verification: false,
};

const userAuthSlice = createSlice({
  name: 'user_auth',
  initialState: initialState,
  reducers: {
    setInitialAuth: (state, { payload }) => {
      state.user_auth = payload;
      state.check_auth_status = ASYNC_STATUS.SUCCEEDED;
    },
    // Used when the device is offline and the user's auth state is already persisted.
    // Skips the check-auth API call and treats the cached user_data as authoritative.
    setOfflineAuth: state => {
      // user_data is already rehydrated from persistence.
      // Mark auth as succeeded so the app navigates to the dashboard.
      state.check_auth_status = ASYNC_STATUS.SUCCEEDED;
      state.user_auth = true;
    },
    // Silently resets auth when token is cleared (e.g. on logout from offline state)
    clearAuth: state => {
      state.user_auth = false;
      state.user_data = null;
      state.user_id = null;
      state.auth_token = null;
      state.check_auth_status = ASYNC_STATUS.IDLE;
      state.requires_verification = false;
    },
    clearRequiresVerification: state => {
      state.requires_verification = false;
    },
    setUpdateMeStatus: state => {
      state.update_me_status = ASYNC_STATUS.IDLE;
    },
    setLoginStatus: state => {
      state.login_status = ASYNC_STATUS.IDLE;
    },
    setSignupStatus: state => {
      state.signup_status = ASYNC_STATUS.IDLE;
    },
    setEditHistoryStatus: state => {
      state.edit_history_status = ASYNC_STATUS.IDLE;
      state.edit_history_data = null;
      state.edit_history_error = null;
    },
    setChangePasswordStatus: state => {
      state.change_password_status = ASYNC_STATUS.IDLE;
      state.change_password_error = null;
      state.change_email_send_otp_status = ASYNC_STATUS.IDLE;
      state.change_email_send_otp_error = null;
      state.change_email_verify_otp_status = ASYNC_STATUS.IDLE;
      state.change_email_verify_otp_error = null;
      state.change_phone_send_otp_status = ASYNC_STATUS.IDLE;
      state.change_phone_send_otp_error = null;
      state.change_phone_verify_otp_status = ASYNC_STATUS.IDLE;
      state.change_phone_verify_otp_error = null;
    },
    resetSubmitAppealStatus: state => {
      state.submit_appeal_status = ASYNC_STATUS.IDLE;
      state.submit_appeal_data = null;
      state.submit_appeal_error = null;
    },
    resetDataAccessRequestStatus: state => {
      state.data_access_request_status = ASYNC_STATUS.IDLE;
      state.data_access_request_data = null;
      state.data_access_request_error = null;
    },
    resetDataDeletionRequestStatus: state => {
      state.data_deletion_request_status = ASYNC_STATUS.IDLE;
      state.data_deletion_request_data = null;
      state.data_deletion_request_error = null;
    },
    resetGoogleSignInStatus: state => {
      state.google_signin_status = ASYNC_STATUS.IDLE;
    },
    resetAppleSignInStatus: state => {
      state.apple_signin_status = ASYNC_STATUS.IDLE;
    },
    resetDeleteAccountStatus: state => {
      state.delete_account_status = ASYNC_STATUS.IDLE;
      state.delete_account_data = null;
    },
    resetCancelAccountDeletionStatus: state => {
      state.cancel_account_deletion_status = ASYNC_STATUS.IDLE;
      state.cancel_account_deletion_data = null;
    },
  },
  extraReducers: builder => {
    // =========>>>>>>> Sign Up
    builder.addCase(signupAsync.pending, (state, { payload }) => {
      state.signup_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(signupAsync.fulfilled, (state, { payload }) => {
      state.signup_status = ASYNC_STATUS.SUCCEEDED;
      state.user_data = payload?.user;
      state.user_auth = payload?.issuccess;
      const vToken = (payload.verificationtoken || payload.verificationToken) as string;
      saveVerificationToken(vToken).catch(() => {});
      showSuccessToast(payload.message as string);
    });
    builder.addCase(signupAsync.rejected, (state, action) => {
      state.signup_status = ASYNC_STATUS.ERROR;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Login
    builder.addCase(loginAsync.pending, (state, { payload }) => {
      state.login_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(loginAsync.fulfilled, (state, { payload }) => {
      state.login_status = ASYNC_STATUS.SUCCEEDED;
      state.login_data = payload;

      // Backend lowercases JSON keys in some responses, so check both casings.
      const requiresMfa = payload?.requires2fa ?? (payload as any)?.requires2FA;
      if (requiresMfa) {
        // Login isn't complete yet — the user still has to pass the MFA
        // challenge, so no tokens/user_auth are set until verify succeeds.
        return;
      }

      state.user_data = payload?.user;
      state.user_auth = payload?.issuccess;
      state.user_id = payload?.userid;
      saveTokens(payload.token, payload.refreshtoken).catch(() => {});
      if (payload?.userid) { saveUserId(String(payload.userid)).catch(() => {}); }
      if (payload.message) {
        showSuccessToast(payload.message as string);
      }
    });
    builder.addCase(loginAsync.rejected, (state, action) => {
      state.login_status = ASYNC_STATUS.ERROR;
      state.login_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> updateMfaSettingsAsync
    builder.addCase(updateMfaSettingsAsync.pending, state => {
      state.mfa_settings_status = ASYNC_STATUS.LOADING;
      state.mfa_settings_error = null;
    });
    builder.addCase(updateMfaSettingsAsync.fulfilled, (state, { payload }) => {
      state.mfa_settings_status = ASYNC_STATUS.SUCCEEDED;
      // Backend returns `mfaenabled`/`method`, not `enabled`.
      const enabled = payload?.mfaenabled ?? payload?.enabled;
      if (state.user_data) {
        state.user_data = {
          ...state.user_data,
          twoauthenabled: enabled ?? state.user_data.twoauthenabled,
          mfamethod: payload?.method ?? state.user_data.mfamethod,
        };
      }
      showSuccessToast(payload?.message || 'MFA settings updated successfully');
    });
    builder.addCase(updateMfaSettingsAsync.rejected, (state, action) => {
      state.mfa_settings_status = ASYNC_STATUS.ERROR;
      state.mfa_settings_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> registerBiometricDeviceAsync
    builder.addCase(registerBiometricDeviceAsync.pending, state => {
      state.register_biometric_device_status = ASYNC_STATUS.LOADING;
      state.register_biometric_device_error = null;
    });
    builder.addCase(registerBiometricDeviceAsync.fulfilled, state => {
      state.register_biometric_device_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(registerBiometricDeviceAsync.rejected, (state, action) => {
      state.register_biometric_device_status = ASYNC_STATUS.ERROR;
      state.register_biometric_device_error = action.payload as string;
      // showErrorToast(action.payload as string);
    });

    // =========>>>>>>> sendMfaOtpAsync
    builder.addCase(sendMfaOtpAsync.pending, state => {
      state.mfa_send_otp_status = ASYNC_STATUS.LOADING;
      state.mfa_send_otp_error = null;
    });
    builder.addCase(sendMfaOtpAsync.fulfilled, state => {
      state.mfa_send_otp_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(sendMfaOtpAsync.rejected, (state, action) => {
      state.mfa_send_otp_status = ASYNC_STATUS.ERROR;
      state.mfa_send_otp_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> verifyMfaOtpAsync
    builder.addCase(verifyMfaOtpAsync.pending, state => {
      state.mfa_verify_status = ASYNC_STATUS.LOADING;
      state.mfa_verify_error = null;
    });
    builder.addCase(verifyMfaOtpAsync.fulfilled, (state, { payload }) => {
      state.mfa_verify_status = ASYNC_STATUS.SUCCEEDED;
      // Handled exactly like a standard login success.
      state.user_data = payload?.user;
      state.user_auth = payload?.issuccess ?? true;
      state.user_id = payload?.userid;
      saveTokens(payload.token, payload.refreshtoken).catch(() => {});
      if (payload?.userid) { saveUserId(String(payload.userid)).catch(() => {}); }
    });
    builder.addCase(verifyMfaOtpAsync.rejected, (state, action) => {
      state.mfa_verify_status = ASYNC_STATUS.ERROR;
      state.mfa_verify_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Google Signin
    builder.addCase(googleSigninAsync.pending, (state, { payload }) => {
      state.google_signin_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(googleSigninAsync.fulfilled, (state, { payload }) => {
      state.google_signin_status = ASYNC_STATUS.SUCCEEDED;
      state.user_data = payload.user;
      state.user_auth = payload?.issuccess;
      state.user_id = payload?.userid;
      saveTokens(payload.token, payload.refreshtoken).catch(() => {});
      if (payload?.userid) { saveUserId(String(payload.userid)).catch(() => {}); }
    });
    builder.addCase(googleSigninAsync.rejected, (state, actions) => {
      state.google_signin_status = ASYNC_STATUS.ERROR;
      state.google_signin_error = actions.error.message;
      showErrorToast(actions.error.message as string);
    });

    // =========>>>>>>> Apple Signin
    builder.addCase(appleSigninAsync.pending, (state, { payload }) => {
      state.apple_signin_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(appleSigninAsync.fulfilled, (state, { payload }) => {
      state.apple_signin_status = ASYNC_STATUS.SUCCEEDED;
      state.user_data = payload.user;
      state.user_auth = payload?.issuccess; // Set user as authenticated after apple_signin
      state.user_id = payload?.userid;
      saveTokens(payload.token, payload.refreshtoken).catch(() => {});
      if (payload?.userid) { saveUserId(String(payload.userid)).catch(() => {}); }
    });
    builder.addCase(appleSigninAsync.rejected, (state, actions) => {
      state.apple_signin_status = ASYNC_STATUS.ERROR;
      state.apple_signin_error = actions.error.message;
      showErrorToast(actions.error.message as string);
    });

    // =========>>>>>>> Update Timezone
    builder.addCase(updateUserTimeZoneAsync.pending, (state, { payload }) => {
      state.update_timezone_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateUserTimeZoneAsync.fulfilled, (state, { payload }) => {
      state.update_timezone_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(updateUserTimeZoneAsync.rejected, (state, action) => {
      state.update_timezone_status = ASYNC_STATUS.ERROR;
      state.update_timezone_error = action.payload as string;
    });

    // =========>>>>>>> checkAuthAsync
    builder.addCase(checkAuthAsync.pending, (state, { payload }) => {
      state.check_auth_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(checkAuthAsync.fulfilled, (state, { payload }) => {
      state.check_auth_status = ASYNC_STATUS.SUCCEEDED;
      state.user_data = payload?.user;
      if (payload?.requiresverification) {
        state.user_auth = true;
        state.requires_verification = true;
      } else {
        state.user_auth = payload?.isauthenticated;
        state.requires_verification = false;
      }
    });
    builder.addCase(checkAuthAsync.rejected, (state, action) => {
      state.check_auth_status = ASYNC_STATUS.ERROR;
      state.check_auth_error = action.payload as string;
      // Note: Toast is intentionally NOT shown here.
      // The Stacknavigation layer decides how to handle rejection based on
      // network status (offline = silent, online = show error UI).
    });
    // =========>>>>>>> verifyPhoneAsync
    builder.addCase(verifyPhoneAsync.pending, (state, { payload }) => {
      state.verify_phone_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(verifyPhoneAsync.fulfilled, (state, { payload }) => {
      state.verify_phone_status = ASYNC_STATUS.SUCCEEDED;
      state.user_data = payload?.user;
      state.user_auth = payload?.issuccess;
      saveTokens(payload.token, payload.refreshtoken).catch(() => {});
      if (payload?.userid) { saveUserId(String(payload.userid)).catch(() => {}); }
      showSuccessToast(payload.message as string);
    });
    builder.addCase(verifyPhoneAsync.rejected, (state, action) => {
      state.verify_phone_status = ASYNC_STATUS.ERROR;
      state.verify_phone_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> subscribePlanAsync
    builder.addCase(subscribePlanAsync.pending, (state, { payload }) => {
      state.subscribe_plan_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(subscribePlanAsync.fulfilled, (state, { payload }) => {
      state.subscribe_plan_status = ASYNC_STATUS.SUCCEEDED;
      state.subscribe_plan_data = payload;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(subscribePlanAsync.rejected, (state, action) => {
      state.subscribe_plan_status = ASYNC_STATUS.ERROR;
      state.subscribe_plan_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> driverLicenseAsync
    builder.addCase(driverLicenseAsync.pending, (state, { payload }) => {
      state.driver_license_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(driverLicenseAsync.fulfilled, (state, { payload }) => {
      state.driver_license_status = ASYNC_STATUS.SUCCEEDED;
      state.driver_license_data = payload;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(driverLicenseAsync.rejected, (state, action) => {
      state.driver_license_status = ASYNC_STATUS.ERROR;
      state.driver_license_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> imageUploadAsync
    builder.addCase(imageUploadAsync.pending, (state, { payload }) => {
      state.image_upload_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(imageUploadAsync.fulfilled, (state, { payload }) => {
      state.image_upload_status = ASYNC_STATUS.SUCCEEDED;
      state.image_upload_data = payload;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(imageUploadAsync.rejected, (state, action) => {
      state.image_upload_status = ASYNC_STATUS.ERROR;
      state.image_upload_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    builder.addCase(getImageAsync.pending, state => {
      state.get_image_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getImageAsync.fulfilled, (state, { payload }) => {
      state.get_image_status = ASYNC_STATUS.SUCCEEDED;
      state.get_image_data = payload;
    });
    builder.addCase(getImageAsync.rejected, (state, action) => {
      state.get_image_status = ASYNC_STATUS.ERROR;
      state.get_image_error = action.payload as string;
    });

    // =========>>>>>>> passportAsync
    builder.addCase(passportAsync.pending, (state, { payload }) => {
      state.passport_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(passportAsync.fulfilled, (state, { payload }) => {
      state.passport_status = ASYNC_STATUS.SUCCEEDED;
      state.passport_data = payload;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(passportAsync.rejected, (state, action) => {
      state.passport_status = ASYNC_STATUS.ERROR;
      state.passport_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> licensesAsync
    builder.addCase(licensesAsync.pending, (state, { payload }) => {
      state.licenses_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(licensesAsync.fulfilled, (state, { payload }) => {
      state.licenses_status = ASYNC_STATUS.SUCCEEDED;
      state.licenses_data = payload;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(licensesAsync.rejected, (state, action) => {
      state.licenses_status = ASYNC_STATUS.ERROR;
      state.licenses_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> identityHubAsync
    builder.addCase(identityHubAsync.pending, (state, { payload }) => {
      state.identity_hub_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(identityHubAsync.fulfilled, (state, { payload }) => {
      state.identity_hub_status = ASYNC_STATUS.SUCCEEDED;
      state.identity_hub_data = payload;
    });
    builder.addCase(identityHubAsync.rejected, (state, action) => {
      state.identity_hub_status = ASYNC_STATUS.ERROR;
      state.identity_hub_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> updateDriverLicenseAsync
    builder.addCase(updateDriverLicenseAsync.pending, (state, { payload }) => {
      state.driver_license_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      updateDriverLicenseAsync.fulfilled,
      (state, { payload }) => {
        state.driver_license_status = ASYNC_STATUS.SUCCEEDED;
        state.driver_license_data = payload;
        showSuccessToast(
          payload.message || 'Driver license updated successfully',
        );
      },
    );
    builder.addCase(updateDriverLicenseAsync.rejected, (state, action) => {
      state.driver_license_status = ASYNC_STATUS.ERROR;
      state.driver_license_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> updatePassportAsync
    builder.addCase(updatePassportAsync.pending, (state, { payload }) => {
      state.passport_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updatePassportAsync.fulfilled, (state, { payload }) => {
      state.passport_status = ASYNC_STATUS.SUCCEEDED;
      state.passport_data = payload;
      showSuccessToast(payload.message || 'Passport updated successfully');
    });
    builder.addCase(updatePassportAsync.rejected, (state, action) => {
      state.passport_status = ASYNC_STATUS.ERROR;
      state.passport_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> updateLicenseAsync
    builder.addCase(updateLicenseAsync.pending, (state, { payload }) => {
      state.licenses_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateLicenseAsync.fulfilled, (state, { payload }) => {
      state.licenses_status = ASYNC_STATUS.SUCCEEDED;
      state.licenses_data = payload;
      showSuccessToast(payload.message || 'License updated successfully');
    });
    builder.addCase(updateLicenseAsync.rejected, (state, action) => {
      state.licenses_status = ASYNC_STATUS.ERROR;
      state.licenses_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> deletePassportAsync
    builder.addCase(deletePassportAsync.pending, state => {
      state.identity_hub_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deletePassportAsync.fulfilled, state => {
      state.identity_hub_status = ASYNC_STATUS.SUCCEEDED;
      showSuccessToast('Passport deleted successfully');
    });
    builder.addCase(deletePassportAsync.rejected, (state, action) => {
      state.identity_hub_status = ASYNC_STATUS.ERROR;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> deleteDriverLicenseAsync
    builder.addCase(deleteDriverLicenseAsync.pending, state => {
      state.identity_hub_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteDriverLicenseAsync.fulfilled, state => {
      state.identity_hub_status = ASYNC_STATUS.SUCCEEDED;
      showSuccessToast('Driver license deleted successfully');
    });
    builder.addCase(deleteDriverLicenseAsync.rejected, (state, action) => {
      state.identity_hub_status = ASYNC_STATUS.ERROR;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> deleteLicenseAsync
    builder.addCase(deleteLicenseAsync.pending, state => {
      state.identity_hub_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteLicenseAsync.fulfilled, state => {
      state.identity_hub_status = ASYNC_STATUS.SUCCEEDED;
      showSuccessToast('License/Certification deleted successfully');
    });
    builder.addCase(deleteLicenseAsync.rejected, (state, action) => {
      state.identity_hub_status = ASYNC_STATUS.ERROR;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> resendEmailOtpAsync
    builder.addCase(resendEmailOtpAsync.pending, (state, { payload }) => {
      state.resend_email_otp_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(resendEmailOtpAsync.fulfilled, (state, { payload }) => {
      state.resend_email_otp_status = ASYNC_STATUS.SUCCEEDED;
      state.resend_email_otp_data = payload?.user;
      const vToken = payload.verificationtoken || payload.verificationToken;
      saveVerificationToken(vToken).catch(() => {});
      showSuccessToast(payload.message as string);
    });
    builder.addCase(resendEmailOtpAsync.rejected, (state, action) => {
      state.resend_email_otp_status = ASYNC_STATUS.ERROR;
      state.resend_email_otp_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // =========>>>>>>> forgotPasswordAsync
    builder.addCase(forgotPasswordAsync.pending, (state, { payload }) => {
      state.forgot_password_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(forgotPasswordAsync.fulfilled, (state, { payload }) => {
      state.forgot_password_status = ASYNC_STATUS.SUCCEEDED;
      state.forgot_password_data = payload;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(forgotPasswordAsync.rejected, (state, action) => {
      state.forgot_password_status = ASYNC_STATUS.ERROR;
      state.forgot_password_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // =========>>>>>>> verifyForgotAsync
    builder.addCase(verifyForgotAsync.pending, (state, { payload }) => {
      state.verify_forgot_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(verifyForgotAsync.fulfilled, (state, { payload }) => {
      state.verify_forgot_status = ASYNC_STATUS.SUCCEEDED;
      state.verify_forgot_data = payload;
      saveVerificationToken(payload.resettoken).catch(() => {});
      showSuccessToast(payload.message as string);
    });
    builder.addCase(verifyForgotAsync.rejected, (state, action) => {
      state.verify_forgot_status = ASYNC_STATUS.ERROR;
      state.verify_forgot_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // =========>>>>>>> forgotResetPasswordAsync
    builder.addCase(forgotResetPasswordAsync.pending, (state, { payload }) => {
      state.forgot_reset_password_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      forgotResetPasswordAsync.fulfilled,
      (state, { payload }) => {
        state.forgot_reset_password_status = ASYNC_STATUS.SUCCEEDED;
        state.forgot_reset_password_data = payload;
        showSuccessToast(payload.message as string);
      },
    );
    builder.addCase(forgotResetPasswordAsync.rejected, (state, action) => {
      state.forgot_reset_password_status = ASYNC_STATUS.ERROR;
      state.forgot_reset_password_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> getEditHistoryAsync
    builder.addCase(getEditHistoryAsync.pending, state => {
      state.edit_history_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getEditHistoryAsync.fulfilled, (state, { payload }) => {
      state.edit_history_status = ASYNC_STATUS.SUCCEEDED;
      state.edit_history_data = payload;
    });
    builder.addCase(getEditHistoryAsync.rejected, (state, action) => {
      state.edit_history_status = ASYNC_STATUS.ERROR;
      state.edit_history_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> countriesAsync
    builder.addCase(countriesAsync.pending, (state, { payload }) => {
      state.countries_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(countriesAsync.fulfilled, (state, { payload }) => {
      state.countries_status = ASYNC_STATUS.SUCCEEDED;
      state.countries_data = payload?.countries;
    });
    builder.addCase(countriesAsync.rejected, (state, action) => {
      state.countries_status = ASYNC_STATUS.ERROR;
      state.countries_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // =========>>>>>>> statesAsync
    builder.addCase(statesAsync.pending, (state, { payload }) => {
      state.states_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(statesAsync.fulfilled, (state, { payload }) => {
      state.states_status = ASYNC_STATUS.SUCCEEDED;
      state.states_data = payload?.states;
    });
    builder.addCase(statesAsync.rejected, (state, action) => {
      state.states_status = ASYNC_STATUS.ERROR;
      state.states_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
    // =========>>>>>>> updateMeAsync
    builder.addCase(updateMeAsync.pending, (state, { payload }) => {
      state.update_me_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateMeAsync.fulfilled, (state, { payload }) => {
      state.update_me_status = ASYNC_STATUS.SUCCEEDED;
      state.update_me_data = payload;
      state.user_data = payload?.user;

      showSuccessToast(payload.message as string);
    });
    builder.addCase(updateMeAsync.rejected, (state, action) => {
      state.update_me_status = ASYNC_STATUS.ERROR;
      state.update_me_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> changePasswordAsync
    builder.addCase(changePasswordAsync.pending, (state, { payload }) => {
      state.change_password_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(changePasswordAsync.fulfilled, (state, { payload }) => {
      state.change_password_status = ASYNC_STATUS.SUCCEEDED;
      showSuccessToast(payload.message as string);
    });
    builder.addCase(changePasswordAsync.rejected, (state, action) => {
      state.change_password_status = ASYNC_STATUS.ERROR;
      state.change_password_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> submitPrivacyAppealAsync
    builder.addCase(submitPrivacyAppealAsync.pending, state => {
      state.submit_appeal_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      submitPrivacyAppealAsync.fulfilled,
      (state, { payload }) => {
        state.submit_appeal_status = ASYNC_STATUS.SUCCEEDED;
        state.submit_appeal_data = payload;
        showSuccessToast(payload?.message || 'Appeal submitted successfully');
      },
    );
    builder.addCase(submitPrivacyAppealAsync.rejected, (state, action) => {
      state.submit_appeal_status = ASYNC_STATUS.ERROR;
      state.submit_appeal_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> submitDataAccessRequestAsync
    builder.addCase(submitDataAccessRequestAsync.pending, state => {
      state.data_access_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      submitDataAccessRequestAsync.fulfilled,
      (state, { payload }) => {
        state.data_access_request_status = ASYNC_STATUS.SUCCEEDED;
        state.data_access_request_data = payload;
        showSuccessToast(
          payload?.message || 'Data access request submitted successfully',
        );
      },
    );
    builder.addCase(submitDataAccessRequestAsync.rejected, (state, action) => {
      state.data_access_request_status = ASYNC_STATUS.ERROR;
      state.data_access_request_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> submitDataDeletionRequestAsync
    builder.addCase(submitDataDeletionRequestAsync.pending, state => {
      state.data_deletion_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      submitDataDeletionRequestAsync.fulfilled,
      (state, { payload }) => {
        state.data_deletion_request_status = ASYNC_STATUS.SUCCEEDED;
        state.data_deletion_request_data = payload;
        showSuccessToast(
          payload?.message || 'Data deletion request submitted successfully',
        );
      },
    );
    builder.addCase(
      submitDataDeletionRequestAsync.rejected,
      (state, action) => {
        state.data_deletion_request_status = ASYNC_STATUS.ERROR;
        state.data_deletion_request_error = action.payload as string;
        showErrorToast(action.payload as string);
      },
    );

    // =========>>>>>>> getDropdownOptionsAsync
    builder.addCase(getDropdownOptionsAsync.pending, state => {
      state.get_dropdown_options_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getDropdownOptionsAsync.fulfilled, (state, { payload }) => {
      state.get_dropdown_options_status = ASYNC_STATUS.SUCCEEDED;
      const optionsArray = formatDropdoenOption(payload?.options || []);
      state.get_dropdown_options_data = optionsArray;
    });
    builder.addCase(getDropdownOptionsAsync.rejected, (state, action) => {
      state.get_dropdown_options_status = ASYNC_STATUS.ERROR;
      state.get_dropdown_options_error = action.payload as string;
    });

    // =========>>>>>>> getDriverLicenseClassOptionsAsync
    builder.addCase(getDriverLicenseClassOptionsAsync.pending, state => {
      state.get_driver_license_class_options_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getDriverLicenseClassOptionsAsync.fulfilled,
      (state, { payload }) => {
        state.get_driver_license_class_options_status = ASYNC_STATUS.SUCCEEDED;
        const optionsArray = formatDropdoenOption(payload?.options || []);
        state.get_driver_license_class_options_data = optionsArray;
      },
    );
    builder.addCase(
      getDriverLicenseClassOptionsAsync.rejected,
      (state, action) => {
        state.get_driver_license_class_options_status = ASYNC_STATUS.ERROR;
        state.get_driver_license_class_options_error = action.payload as string;
      },
    );

    // =========>>>>>>> getMedicationTypesAsync
    builder.addCase(getMedicationTypesAsync.pending, state => {
      state.get_medication_types_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getMedicationTypesAsync.fulfilled, (state, { payload }) => {
      state.get_medication_types_status = ASYNC_STATUS.SUCCEEDED;
      const optionsArray = formatDropdoenOption(payload?.options || []);
      state.get_medication_types_data = optionsArray;
    });
    builder.addCase(getMedicationTypesAsync.rejected, (state, action) => {
      state.get_medication_types_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> getVehicleAccidentsTypesAsync
    builder.addCase(getVehicleAccidentsTypesAsync.pending, state => {
      state.get_vehicle_accidents_types_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getVehicleAccidentsTypesAsync.fulfilled,
      (state, { payload }) => {
        state.get_vehicle_accidents_types_status = ASYNC_STATUS.SUCCEEDED;
        const optionsArray = formatDropdoenOption(payload?.options || []);
        state.get_vehicle_accidents_types_data = optionsArray;
      },
    );
    builder.addCase(getVehicleAccidentsTypesAsync.rejected, (state, action) => {
      state.get_vehicle_accidents_types_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> getVehicleRegistrationTypesAsync
    builder.addCase(getVehicleRegistrationTypesAsync.pending, state => {
      state.get_vehicle_registration_types_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getVehicleRegistrationTypesAsync.fulfilled,
      (state, { payload }) => {
        state.get_vehicle_registration_types_status = ASYNC_STATUS.SUCCEEDED;
        const optionsArray = formatDropdoenOption(payload?.options || []);
        state.get_vehicle_registration_types_data = optionsArray;
      },
    );
    builder.addCase(
      getVehicleRegistrationTypesAsync.rejected,
      (state, action) => {
        state.get_vehicle_registration_types_status = ASYNC_STATUS.ERROR;
      },
    );

    // =========>>>>>>> getBusinessContactTypesAsync
    builder.addCase(getBusinessContactTypesAsync.pending, state => {
      state.get_business_contact_types_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getBusinessContactTypesAsync.fulfilled,
      (state, { payload }) => {
        state.get_business_contact_types_status = ASYNC_STATUS.SUCCEEDED;
        const optionsArray = formatDropdoenOption(payload?.options || []);
        state.get_business_contact_types_data = optionsArray;
      },
    );
    builder.addCase(getBusinessContactTypesAsync.rejected, (state, action) => {
      state.get_business_contact_types_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> getComplianceTypeOptionsAsync
    builder.addCase(getComplianceTypeOptionsAsync.pending, state => {
      state.get_compliance_type_options_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getComplianceTypeOptionsAsync.fulfilled,
      (state, { payload }) => {
        state.get_compliance_type_options_status = ASYNC_STATUS.SUCCEEDED;
        const optionsArray = formatDropdoenOption(payload?.options || []);
        state.get_compliance_type_options_data = optionsArray;
      },
    );
    builder.addCase(getComplianceTypeOptionsAsync.rejected, (state, action) => {
      state.get_compliance_type_options_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> getSubscriptionTypeOptionsAsync
    builder.addCase(getSubscriptionTypeOptionsAsync.pending, state => {
      state.get_subscription_type_options_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getSubscriptionTypeOptionsAsync.fulfilled, (state, { payload }) => {
      state.get_subscription_type_options_status = ASYNC_STATUS.SUCCEEDED;
      state.get_subscription_type_options_data = formatDropdoenOption(payload?.options || []);
    });
    builder.addCase(getSubscriptionTypeOptionsAsync.rejected, state => {
      state.get_subscription_type_options_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> deleteUUserAccountAsync
    builder.addCase(deleteUUserAccountAsync.pending, state => {
      state.delete_account_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteUUserAccountAsync.fulfilled, (state, { payload }) => {
      state.delete_account_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_account_data = payload;
      // Mirror deletion info into user_data so it persists across reloads
      if (state.user_data) {
        state.user_data = {
          ...state.user_data,
          ispendingdeletion: true,
          scheduleddeletionat: payload?.scheduledDeletionAt ?? payload?.scheduleddeletionat ?? null,
        };
      }
      showSuccessToast(payload.message as string);
    });
    builder.addCase(deleteUUserAccountAsync.rejected, (state) => {
      state.delete_account_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> cancelAccountDeletionAsync
    builder.addCase(cancelAccountDeletionAsync.pending, state => {
      state.cancel_account_deletion_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(cancelAccountDeletionAsync.fulfilled, (state, { payload }) => {
      state.cancel_account_deletion_status = ASYNC_STATUS.SUCCEEDED;
      state.cancel_account_deletion_data = payload;
      state.delete_account_data = null;
      // Clear deletion info from user_data
      if (state.user_data) {
        state.user_data = {
          ...state.user_data,
          ispendingdeletion: false,
          scheduleddeletionat: null,
        };
      }
    });
    builder.addCase(cancelAccountDeletionAsync.rejected, (state) => {
      state.cancel_account_deletion_status = ASYNC_STATUS.ERROR;
    });

    // =========>>>>>>> changeEmailSendOtpAsync
    builder.addCase(changeEmailSendOtpAsync.pending, state => {
      state.change_email_send_otp_status = ASYNC_STATUS.LOADING;
      state.change_email_send_otp_error = null;
    });
    builder.addCase(changeEmailSendOtpAsync.fulfilled, state => {
      state.change_email_send_otp_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(changeEmailSendOtpAsync.rejected, (state, action) => {
      state.change_email_send_otp_status = ASYNC_STATUS.ERROR;
      state.change_email_send_otp_error = action.payload as string;
    });

    // =========>>>>>>> changeEmailVerifyOtpAsync
    builder.addCase(changeEmailVerifyOtpAsync.pending, state => {
      state.change_email_verify_otp_status = ASYNC_STATUS.LOADING;
      state.change_email_verify_otp_error = null;
    });
    builder.addCase(changeEmailVerifyOtpAsync.fulfilled, (state, { payload }) => {
      state.change_email_verify_otp_status = ASYNC_STATUS.SUCCEEDED;
      // Update user_data email on success
      if (state.user_data) {
        state.user_data = { ...state.user_data };
      }
    });
    builder.addCase(changeEmailVerifyOtpAsync.rejected, (state, action) => {
      state.change_email_verify_otp_status = ASYNC_STATUS.ERROR;
      state.change_email_verify_otp_error = action.payload as string;
    });

    // =========>>>>>>> changePhoneSendOtpAsync
    builder.addCase(changePhoneSendOtpAsync.pending, state => {
      state.change_phone_send_otp_status = ASYNC_STATUS.LOADING;
      state.change_phone_send_otp_error = null;
    });
    builder.addCase(changePhoneSendOtpAsync.fulfilled, state => {
      state.change_phone_send_otp_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(changePhoneSendOtpAsync.rejected, (state, action) => {
      state.change_phone_send_otp_status = ASYNC_STATUS.ERROR;
      state.change_phone_send_otp_error = action.payload as string;
    });

    // =========>>>>>>> changePhoneVerifyOtpAsync
    builder.addCase(changePhoneVerifyOtpAsync.pending, state => {
      state.change_phone_verify_otp_status = ASYNC_STATUS.LOADING;
      state.change_phone_verify_otp_error = null;
    });
    builder.addCase(changePhoneVerifyOtpAsync.fulfilled, state => {
      state.change_phone_verify_otp_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(changePhoneVerifyOtpAsync.rejected, (state, action) => {
      state.change_phone_verify_otp_status = ASYNC_STATUS.ERROR;
      state.change_phone_verify_otp_error = action.payload as string;
    });
  },
});

export const {
  setInitialAuth,
  setOfflineAuth,
  clearAuth,
  clearRequiresVerification,
  setLoginStatus,
  setSignupStatus,
  setUpdateMeStatus,
  setEditHistoryStatus,
  setChangePasswordStatus,
  resetSubmitAppealStatus,
  resetDataAccessRequestStatus,
  resetDataDeletionRequestStatus,
  resetGoogleSignInStatus,
  resetAppleSignInStatus,
  resetDeleteAccountStatus,
  resetCancelAccountDeletionStatus,
} = userAuthSlice.actions;
export default userAuthSlice.reducer;
