import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

export interface UtilityData {
  id?: number;
  property?: string;
  realEstateId?: number;
  realestateid?: number; // API response format
  utilityType?: string;
  utilitytype?: string; // API response format
  vendor?: string;
  averageMonthlyAmount?: string | number;
  averagemonthlyamount?: number; // API response format
  endDate?: Date | string | null;
  enddate?: string; // API response format
  accountNumber?: string;
  accountnumber?: string; // API response format
  dueDay?: string | number;
  dueday?: number; // API response format
  phone?: string;
  phonenumber?: string; // API response format
  website?: string;
  uploadAttachments?: string;
  uploadattachments?: string; // API response format
  utilityTypeOther?: string;
  utilitytypeother?: string; // API response format
  billingFrequency?: string;
  billingfrequency?: string; // API response format
}

export interface RouteParams {
  utility?: UtilityData;
  isEdit?: boolean;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export type AddUtilityNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddUtility'
>;
