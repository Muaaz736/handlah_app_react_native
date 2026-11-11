import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type IdentityFormScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'IdentityForm'
>;

export interface IdentityFormData {
  fullName: string;
  dateOfBirth: string |  Date;
  phoneNumber: string;
  address: string;
  city: string;
  zip: string;
  stateId?: string;
  countryId?: string;
  countryName?: string;
}

export type IdentityFormField = keyof IdentityFormData;

export interface IdentityFormScreenProps {}
