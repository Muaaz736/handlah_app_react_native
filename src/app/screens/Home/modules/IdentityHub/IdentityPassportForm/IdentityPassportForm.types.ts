import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../../types/RootStackParamList.types';
import { PassportType, REMINDER_OPTIONS, ReminderOption } from '../../identityHub.types';

export type IdentityPassportFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'IdentityPassportForm'
>;

// ========== Form State ==========
export interface PassportFormState {
  passportNumber: string;
  country: string;
  expirationDate: string | null;
  type: PassportType;
  addToWallet: boolean;
  remindBefore: ReminderOption;
}

export type PassportFormField = keyof PassportFormState;

// ========== Photo Upload ==========
export interface PassportUploadState {
  passportPhoto: string | null;
}

// ========== Route Params ==========
export interface IdentityPassportRouteParams {
  mode?: string;
  passportData?: any;
  entityId?: number;
  fromDashboard?: boolean;
  dashboardParams?: { spaceType?: string; businessId?: number | null };
}

// ========== Screen Props ==========
export interface IdentityPassportFormProps {}

// ========== Type Guards ==========
export const isValidPassportFormState = (
  data: any,
): data is PassportFormState => {
  return (
    typeof data.passportNumber === 'string' &&
    typeof data.country === 'string' &&
    (data.expirationDate === null || typeof data.expirationDate === 'string') &&
    typeof data.type === 'string' &&
    typeof data.addToWallet === 'boolean' &&
    REMINDER_OPTIONS.includes(data.remindBefore)
  );
};