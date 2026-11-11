/**
 * Validation configuration interface
 */
export interface ValidationConfig {
  EMAIL_REGEX: RegExp;
  PHONE_REGEX: RegExp;
  PASSWORD_MIN_LENGTH: number;
}

/**
 * Validation function types
 */
export type ValidateEmailFunction = (email: string) => boolean;
export type ValidatePasswordFunction = (password: string) => boolean;
export type ValidatePhoneFunction = (phone: string) => boolean;
export type ValidateAllFieldsFunction = (fields: string[]) => boolean;
