import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../RootStackParamList.types';

export type VerifyPhoneScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VerifyPhoneNumber'
>;

export type VerifyPhoneScreenRouteProp = RouteProp<
  RootStackParamList,
  'VerifyPhoneNumber'
>;

export interface VerifyPhoneScreenProps {}

export interface VerifyPhoneScreenState {
  otp: string;
  countdown: number;
  canResend: boolean;
  loading: boolean;
}
