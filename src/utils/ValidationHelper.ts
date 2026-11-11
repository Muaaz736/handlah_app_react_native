import { VALIDATION } from '../constants/AppConstants';
import type {
  ValidateEmailFunction,
  ValidatePasswordFunction,
  ValidatePhoneFunction,
  ValidateAllFieldsFunction,
} from '../types/validation.types';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail: ValidateEmailFunction = (email) => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {boolean}
 */
export const validatePassword: ValidatePasswordFunction = (password) => {
  return Boolean(password && password.length >= VALIDATION.PASSWORD_MIN_LENGTH);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const validatePhone: ValidatePhoneFunction = (phone) => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

/**
 * Check if all fields are filled
 * @param {string[]} fields - Array of field values
 * @returns {boolean}
 */
export const validateAllFields: ValidateAllFieldsFunction = (fields) => {
  return fields.every((field: string) => field && field.trim().length > 0);
};
