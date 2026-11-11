import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';
import { PassportType } from '../identityHub.types';

export type AddIdentityHubFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddIdentityHubForm'
>;

// ========== Form State ==========
export interface PersonalFormData {
  fullName: string;
  dateOfBirth: string | null;
  phoneNo: string;
  email: string;
  address: string;
  state: string;
  zip: string;
  country: string;
}

export interface PassportFormData {
  passportNumber: string;
  passportCountry: string;
  expirationDate: string | null;
  passportType: PassportType;
  passportPhoto: string | null;
}

export interface AddIdentityHubFormState
  extends PersonalFormData,
    PassportFormData {}

export type FormField = keyof AddIdentityHubFormState;

// ========== Photo Upload ==========
export interface PhotoUploadResponse {
  uri: string;
  success: boolean;
  error?: string;
}

// ========== Screen Props ==========
export interface AddIdentityHubFormProps {}

// ========== Type Guards ==========
export const isValidPersonalFormData = (
  data: any,
): data is PersonalFormData => {
  return (
    typeof data.fullName === 'string' &&
    (data.dateOfBirth === null || typeof data.dateOfBirth === 'string') &&
    typeof data.phoneNo === 'string' &&
    typeof data.email === 'string' &&
    typeof data.address === 'string' &&
    typeof data.state === 'string' &&
    typeof data.zip === 'string' &&
    typeof data.country === 'string'
  );
};

export const isValidPassportFormData = (
  data: any,
): data is PassportFormData => {
  return (
    typeof data.passportNumber === 'string' &&
    typeof data.passportCountry === 'string' &&
    (data.expirationDate === null || typeof data.expirationDate === 'string') &&
    typeof data.passportType === 'string' &&
    (data.passportPhoto === null || typeof data.passportPhoto === 'string')
  );
};
