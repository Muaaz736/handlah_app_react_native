import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

// ========== Shared Types ==========
export type ReminderOption = '90d' | '60d' | '30d' | '14d' | '7d' | 'Day-of';
export type PassportType = 'Book' | 'Card';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface ImagePickerResponse {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

export interface SharedConnection {
  userId: string;
  permission: 'view' | 'edit';
}

export interface UserConnection {
  label: string;
  value: string;
}

// ========== Data Models ==========
export interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  phoneNo: string;
  emailAddress: string;
  address: string;
  state: string;
  zip: string;
  country: string;
}

export interface PassportInfo {
  passportNumber: string;
  country: string;
  expirationDate: string;
  type: PassportType;
  photo: string | null;
}

export interface DriverLicenseInfo {
  licenseNumber: string;
  state: string;
  expirationDate: string;
  class: string;
  photo: string | null;
}

export interface License {
  id: number;
  type: string;
  number: string;
  jurisdiction: string;
  issuer: string;
  expirationDate: string;
}

// ========== Image Picker Options ==========
export interface ImagePickerOptions {
  mediaType: 'photo' | 'video' | 'mixed';
  maxWidth: number;
  maxHeight: number;
  quality: number;
  includeBase64: boolean;
}

// ========== Alert Actions ==========
export interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

// ========== Common Constants ==========
export const REMINDER_OPTIONS: ReminderOption[] = [
  '90d',
  '60d',
  '30d',
  '14d',
  '7d',
  'Day-of',
];

export const COUNTRY_OPTIONS: DropdownOption[] = [
  { label: 'United States', value: 'United States' },
  { label: 'Canada', value: 'Canada' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Australia', value: 'Australia' },
];

export const STATE_OPTIONS: DropdownOption[] = [
  { label: 'Texas', value: 'Texas' },
  { label: 'California', value: 'California' },
  { label: 'New York', value: 'New York' },
  { label: 'Florida', value: 'Florida' },
];

export const PASSPORT_TYPE_OPTIONS: DropdownOption[] = [
  { label: 'Book', value: 'Book' },
  { label: 'Card', value: 'Card' },
];

export const LICENSE_TYPE_OPTIONS: DropdownOption[] = [
  { label: 'License To Carry', value: 'License To Carry' },
  { label: 'Professional License', value: 'Professional License' },
  { label: 'Business License', value: 'Business License' },
  { label: 'Medical License', value: 'Medical License' },
  { label: 'Other', value: 'Other' },
];

export const IMAGE_PICKER_OPTIONS: ImagePickerOptions = {
  mediaType: 'photo',
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  includeBase64: false,
};

export type IdentityHubMainNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'IdentityHub'
>;

// New: route params type for AddIdentityHubForm
export interface AddIdentityHubRouteParams {
  mode?: 'edit' | 'create' | string;
  personalData?: {
    fullname?: string;
    dateofbirth?: string; // ISO date string expected
    phonenumber?: string;
    email?: string;
    address1?: string;
    stateid?: number | string | null;
    zipcode?: string;
    countryid?: number | string | null;
    city?: string;
    profilepicture?: string;
    // Nested state/country from API response
    state?: {
      id?: number;
      description?: string;
      countryid?: number;
      country?: {
        id?: number;
        countryname?: string;
      };
    } | null;
    // include any other fields the form may read from personalData
  } | null;
}

// ========== Screen State ==========
export interface IdentityHubScreenState {
  shareModalVisible: boolean;
  currentLicenseIndex: number;
}

// ========== Screen Data ==========
export interface IdentityHubData {
  personalInfo: PersonalInfo;
  passportInfo: PassportInfo;
  driverLicenseInfo: DriverLicenseInfo;
  licensesData: License[];
}

// ========== Component Props ==========
export interface IdentityHubScreenProps {}

export interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (shareData: SharedConnection) => void;
  title: string;
  alreadySharedWith: SharedConnection[];
  userOptions: UserConnection[];
}

export interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  isFullWidth?: boolean;
}

export interface HalfInfoRowProps {
  label1: string;
  value1: string | null | undefined;
  label2: string;
  value2: string | null | undefined;
}

// ========== Navigation Callbacks ==========
export interface NavigationActions {
  onAddPress: () => void;
  onSharePress: () => void;
  onEditPersonal: () => void;
  onEditPassport: () => void;
  onEditDriverLicense: () => void;
  onEditLicenses: () => void;
  onLicensePrevious: () => void;
  onLicenseNext: () => void;
}
