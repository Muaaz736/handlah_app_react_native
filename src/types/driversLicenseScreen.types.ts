import type { ImageAsset } from './common.types';


export interface DriversLicenseFormData {
  licenseNumber: string;
  state: string;
  expirationDate: string | Date;
  classType: string;
  remindBefore: string;
  licenseImageIds: string[];
  isAddedInWallet: boolean;
}

export interface ReminderOption {
  label: string;
  value: string;
}

export interface ClassTypeOption {
  label: string;
  value: string;
}

export type LicenseClassType = 'A' | 'B' | 'C' | 'D' | 'E' | 'M';

export interface DriversLicenseData {
  licenseNumber: string;
  state: string;
  expirationDate: string | Date;
  classType: LicenseClassType;
  remindBefore: string;
  licenseImage?: string;
}
