import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type PassportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Passport'
>;

export interface PassportFormData {
  id?: number;
  /** The passport's own name ("Dad's US passport"). */
  name?: string;
  passportNumber: string;
  countryId: string;
  countryName: string;
  expirationDate: string | Date;
  passportType: string;
  remindBefore: ReminderOption;
  passportImageId?: string;
  passportImageIds?: string[];
  isAddedInWallet: boolean;
  passportImageUri?: string;
}

export type PassportFormField = keyof PassportFormData;

export interface reminderOptions {
  label: string;
  value: ReminderOption;
}

export type ReminderOption = '90' | '60' | '30' | '14' | '7' | 'Day-of';

export interface PassportScreenProps { }
