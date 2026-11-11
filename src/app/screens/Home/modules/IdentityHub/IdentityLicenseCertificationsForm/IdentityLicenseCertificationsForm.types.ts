import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';
import { ImagePickerOptions, LICENSE_TYPE_OPTIONS, REMINDER_OPTIONS, ReminderOption } from '../identityHub.types';
import { DropdownOption } from '../../../../../../types/common.types';

export type IdentityLicenseCertificationsFormNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'IdentityLicenseCertificationsForm'
  >;

// ========== License Types ==========
type LicenseType =
  | 'License To Carry'
  | 'Professional License'
  | 'Business License'
  | 'Medical License'
  | 'Other';

// ========== Form State ==========
export interface LicenseCertificationFormData {
  id: number;
  dbId?: LicenseType;
  type?: LicenseType;
  licenseNumber?: string;
  jurisdiction?: string;
  issuerAuthority?: string;
  expirationDate?: string | Date | null;
  addToWallet?: boolean;
  remindBefore?: string;
  photo?: string | null;
  uploadedImageId?: string;
  imageIds?: string[];
}



export type LicenseCertificationFormField = Exclude<
  keyof LicenseCertificationFormData,
  'id'
>;

export interface IdentityLicenseCertificationsFormState {
  licenses: LicenseCertificationFormData[];
}

// ========== Screen Props ==========
export interface IdentityLicenseCertificationsFormProps { }

// ========== Form Factory ==========
export const createNewLicense = (
  index: number,
): LicenseCertificationFormData => ({
  id: index + 1,
  type: 'License To Carry',
  licenseNumber: '',
  jurisdiction: '',
  issuerAuthority: '',
  expirationDate: null,
  addToWallet: true,
  remindBefore: '90d',
  photo: null,
});

// ========== Type Guards ==========
export const isValidLicenseFormData = (
  data: any,
): data is LicenseCertificationFormData => {
  return (
    typeof data.id === 'number' &&
    typeof data.type === 'string' &&
    typeof data.licenseNumber === 'string' &&
    typeof data.jurisdiction === 'string' &&
    typeof data.issuerAuthority === 'string' &&
    (data.expirationDate === null || typeof data.expirationDate === 'string') &&
    typeof data.addToWallet === 'boolean' &&
    REMINDER_OPTIONS.includes(data.remindBefore) &&
    (data.photo === null || typeof data.photo === 'string')
  );
};

// ========== Constants ==========
export const JURISDICTION_OPTIONS: DropdownOption[] = [
  { label: 'Federal', value: 'Federal' },
  { label: 'State', value: 'State' },
  { label: 'Local', value: 'Local' },
  { label: 'International', value: 'International' },
];

// ========== Re-export common types and constants ==========
export type { ReminderOption, DropdownOption, ImagePickerOptions, LicenseType };
export { REMINDER_OPTIONS, LICENSE_TYPE_OPTIONS };
