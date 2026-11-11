import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../RootStackParamList.types';

export type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OtpVerification'
>;

export type OTPVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'OtpVerification'
>;

export interface OTPVerificationScreenProps {}

export interface OTPVerificationState {
  otp: string;
  countdown: number;
  canResend: boolean;
  loading: boolean;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}
