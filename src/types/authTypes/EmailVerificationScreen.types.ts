/**
 * EmailVerificationScreen Component Types
 */
export interface EmailVerificationFormData {
    otp: string;
  }
  
  export interface EmailVerificationScreenRouteParams {
    username?: string;
    email?: string;
    fromSignup?: boolean;
    method?: 'email' | 'phone';
  }
  