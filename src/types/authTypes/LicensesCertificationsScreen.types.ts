import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type LicensesCertificationsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'LicensesCertifications'>;

export interface LicenseFormData {
  type?: string;
  typeOther?: string;
  licenseCertNumber?: string; //remove
  jurisdiction?: string;  //remove
  issuerAuthority?: string;  //remove
  expirationDate?: string | Date;
  remindBefore?: ReminderOption;
  id?:string,
  licenseNumber?:number,
  state?:string,
  country?: string,
  classType?:string,
  licenseImageId?:string,
  licenseImageIds?: string[];
  isAddedInWallet?:string,
  imageId?:string,
  imageIds?: string[];
}

export type LicenseFormField = keyof LicenseFormData;

export interface reminderOption {
  value: string;
  label: string;
}

export type ReminderOption = '90' | '60' | '30' | '14' | '7' | 'Day-of';

export type LicenseType =
  | 'License to Carry (LTC)'
  | 'Professional License'
  | 'Certification'
  | 'Trade License'
  | 'Medical License'
  | 'Teaching License'
  | 'Real Estate License'
  | 'Other';

export interface License {
  type: string;
  licenseCertNumber: string;
  jurisdiction: string;
  issuerAuthority: string;
  expirationDate: string | Date;
  remindBefore: ReminderOption;
  id: number;
  imageIds: string[]; // Multi-image support
}

export interface LicensesCertificationsScreenProps {}
