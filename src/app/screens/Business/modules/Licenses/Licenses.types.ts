import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type LicensesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Licenses'
>;

export interface LicenseCredentials {
  email: string;
  password: string;
}

export interface License {
  id: string;
  name: string;
  plan: string;
  renewalDate: string;
  seats: string;
  renewal: string;
  cost: string;
  notes: string;
  credentials: LicenseCredentials;
}

export interface ShareData {
  [key: string]: any;
}
