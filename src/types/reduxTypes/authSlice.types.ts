import { ASYNC_STATUS } from '../../config/constants';
import { User } from '../authTypes/Login.types';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

// Common API Response Type
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

// Complete AuthState interface
export interface AuthState {
  // Auth Initial State
  check_auth_status: AsyncStatusType;
  check_auth_error: string | null | undefined;

  user_data: any;
  user_auth: boolean;
  auth_token: string | null;
  user_id: string | null;

  signup_status: AsyncStatusType;

  verify_phone_status: AsyncStatusType;
  verify_phone_error: string | null | undefined;

  resend_email_otp_status: AsyncStatusType;
  resend_email_otp_data: any;
  resend_email_otp_error: string | null | undefined;

  countries_status: AsyncStatusType;
  countries_data: any;
  countries_error: string | null | undefined;

  states_status: AsyncStatusType;
  states_data: any;
  states_error: string | null | undefined;

  update_me_status: AsyncStatusType;
  update_me_data: any;
  update_me_error: string | null | undefined;

  verify_forgot_status: AsyncStatusType;
  verify_forgot_data: any;
  verify_forgot_error: string | null | undefined;

  forgot_reset_password_status: AsyncStatusType;
  forgot_reset_password_data: any;
  forgot_reset_password_error: string | null | undefined;

  forgot_password_status: AsyncStatusType;
  forgot_password_data: any;
  forgot_password_error: string | null | undefined;

  subscribe_plan_status: AsyncStatusType;
  subscribe_plan_data: any;
  subscribe_plan_error: string | null | undefined;

  driver_license_status: AsyncStatusType;
  driver_license_data: any;
  driver_license_error: string | null | undefined;

  image_upload_status: AsyncStatusType;
  image_upload_data: any;
  image_upload_error: string | null | undefined;

  get_image_status: AsyncStatusType;
  get_image_data: any;
  get_image_error: string | null | undefined;

  passport_status: AsyncStatusType;
  passport_data: any;
  passport_error: string | null | undefined;

  licenses_status: AsyncStatusType;
  licenses_data: any;
  licenses_error: string | null | undefined;

  identity_hub_status: AsyncStatusType;
  identity_hub_data: any;
  identity_hub_error: string | null | undefined;

  edit_history_status: AsyncStatusType;
  edit_history_data: any;
  edit_history_error: string | null | undefined;

  login_status: AsyncStatusType;
  login_error: string | null | undefined;
  login_data: any;

  mfa_settings_status: AsyncStatusType;
  mfa_settings_error: string | null | undefined;

  mfa_send_otp_status: AsyncStatusType;
  mfa_send_otp_error: string | null | undefined;

  mfa_verify_status: AsyncStatusType;
  mfa_verify_error: string | null | undefined;

  register_biometric_device_status: AsyncStatusType;
  register_biometric_device_error: string | null | undefined;

  update_timezone_status: AsyncStatusType;
  update_timezone_error: string | null | undefined;

  change_password_status: AsyncStatusType;
  change_password_error: string | null | undefined;

  change_email_send_otp_status: AsyncStatusType;
  change_email_send_otp_error: string | null | undefined;
  change_email_verify_otp_status: AsyncStatusType;
  change_email_verify_otp_error: string | null | undefined;

  change_phone_send_otp_status: AsyncStatusType;
  change_phone_send_otp_error: string | null | undefined;
  change_phone_verify_otp_status: AsyncStatusType;
  change_phone_verify_otp_error: string | null | undefined;

  submit_appeal_status: AsyncStatusType;
  submit_appeal_data: any;
  submit_appeal_error: string | null | undefined;

  data_access_request_status: AsyncStatusType;
  data_access_request_data: any;
  data_access_request_error: string | null | undefined;

  data_deletion_request_status: AsyncStatusType;
  data_deletion_request_data: any;
  data_deletion_request_error: string | null | undefined;

  google_signin_status: AsyncStatusType;
  google_signin_data: any;
  google_signin_error: string | null | undefined;

  apple_signin_status: AsyncStatusType;
  apple_signin_data: any;
  apple_signin_error: string | null | undefined;

  get_dropdown_options_status: AsyncStatusType;
  get_dropdown_options_data: any;
  get_dropdown_options_error: string | null | undefined;

  get_driver_license_class_options_status: AsyncStatusType;
  get_driver_license_class_options_data: any;
  get_driver_license_class_options_error: string | null | undefined;

  get_medication_types_status: AsyncStatusType;
  get_medication_types_data: any;

  get_vehicle_accidents_types_status: AsyncStatusType;
  get_vehicle_accidents_types_data: any;

  get_vehicle_registration_types_status: AsyncStatusType;
  get_vehicle_registration_types_data: any;

  get_business_contact_types_status: AsyncStatusType;
  get_business_contact_types_data: any;

  get_compliance_type_options_status: AsyncStatusType;
  get_compliance_type_options_data: any;
  get_subscription_type_options_status: AsyncStatusType;
  get_subscription_type_options_data: any;

  delete_account_status: AsyncStatusType;
  delete_account_data: { isSuccess: boolean; message: string; scheduleddeletionat: string } | null;

  cancel_account_deletion_status: AsyncStatusType;
  cancel_account_deletion_data: { isSuccess: boolean; message: string } | null;

  requires_verification: boolean;
}

// // Signup Types
export interface SignupData {
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  country: string;
  [key: string]: any;
}

export interface SignupResponse {
  issuccess: boolean;
  message: string;
  ismobileverification: boolean;
  verificationtoken?: string;
  token?: string;
  verificationToken?: string;
  user: User;
}

// // Login Types
export interface LoginData {
  userName: string;
  password: string;
}

export interface LoginResponse {
  issuccess: boolean;
  requires2fa: boolean;
  // Only present when requires2fa is true — needed for the send-otp/verify MFA calls.
  mfaToken?: string;
  authid: string;
  user: User;
  userid: string;
  token: string;
  refreshtoken: string;
  message?: string;
}

export interface country {
  id: number;
  countryname: string;
}

// // Countries & States Types
export interface CountriesResponse {
  countries: country[];
}

export interface State {
  id: number;
  description: string;
  countryid: number;
  countries: country;
}

export interface StatesResponse {
  states: State[];
}

export interface StateData {
  countryId: number;
}
