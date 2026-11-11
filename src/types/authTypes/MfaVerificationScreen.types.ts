import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../RootStackParamList.types';

export type MfaVerificationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MfaVerification'
>;

export type MfaVerificationRouteProp = RouteProp<
  RootStackParamList,
  'MfaVerification'
>;
