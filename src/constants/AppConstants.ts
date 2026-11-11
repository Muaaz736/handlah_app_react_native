import type { AppConfig, ErrorMessages, SuccessMessages } from '../types/appConstants.types';
import type { ValidationConfig } from '../types/validation.types';

// App Configuration Constants
export const APP_CONFIG: AppConfig = {
  APP_NAME: 'Handlah',
  VERSION: '1.0.0',
};

// Validation Regex
export const VALIDATION: ValidationConfig = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10,15}$/,
  PASSWORD_MIN_LENGTH: 6,
};

// Error Messages
export const ERROR_MESSAGES: ErrorMessages = {
  EMPTY_FIELDS: 'Please fill all fields',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_EMAIL: 'Please enter a valid email',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_OTP: 'Invalid OTP code',
};

// Success Messages
export const SUCCESS_MESSAGES: SuccessMessages = {
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
};
