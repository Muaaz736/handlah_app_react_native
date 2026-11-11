import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * CustomOTPInput Component Types
 */
export interface CustomOTPInputProps {
  length?: number;
  onOTPComplete?: (otp: string) => void;
  onChangeOTP?: (otp: string) => void;
  defaultValue?: string;
  error?: string;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
  label?: string;
  required?: boolean;
}

export interface OTPInputState {
  otp: string[];
  focusedIndex: number | null;
}

export type OTPDigit = string;

export interface OTPInputConfig {
  length: number;
  autoFocus: boolean;
  secureTextEntry: boolean;
}
