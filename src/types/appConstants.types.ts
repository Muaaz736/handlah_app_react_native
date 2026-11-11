/**
 * App Configuration interface
 */
export interface AppConfig {
  APP_NAME: string;
  VERSION: string;
}

/**
 * Error Messages interface
 */
export interface ErrorMessages {
  EMPTY_FIELDS: string;
  PASSWORD_MISMATCH: string;
  INVALID_EMAIL: string;
  INVALID_PASSWORD: string;
  INVALID_OTP: string;
}

/**
 * Success Messages interface
 */
export interface SuccessMessages {
  LOGIN_SUCCESS: string;
  SIGNUP_SUCCESS: string;
  LOGOUT_SUCCESS: string;
}
