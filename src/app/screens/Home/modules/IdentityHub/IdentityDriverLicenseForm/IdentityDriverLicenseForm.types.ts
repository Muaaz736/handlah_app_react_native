import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';
import { ReminderOption } from '../identityHub.types';

export type IdentityDriverLicenseFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'IdentityDriverLicenseForm'
>;

// ========== Form State ==========
export interface DriverLicenseFormData {
  licenseNumber: string;
  state: string;
  expirationDate: string | Date | null;
  classType: string;
  addToWallet?:boolean,
  remindBefore?:string
}

export type DriverLicenseFormField = keyof DriverLicenseFormData;

export interface IdentityDriverLicenseFormState extends DriverLicenseFormData {
  id?: number;
  addToWallet: boolean;
  remindBefore: ReminderOption;
  isAddedInWallet?: boolean;
  licenseImageId?: string;
  licenseImageIds?: string[];
  country?: string;
}

// New: route params type for AddIdentityHubForm
export interface IdentityDriverLicenseRouteParams {
  mode?: 'edit' | 'create' | string;
  licenseData?: IdentityDriverLicenseFormState;
  entityId?: number;
  fromDashboard?: boolean;
  dashboardParams?: { spaceType?: string; businessId?: number | null };
}

// ========== Screen Props ==========
export interface IdentityDriverLicenseFormProps { }

// ========== Type Guards ==========
export const isValidDriverLicenseFormData = (
  data: any,
): data is DriverLicenseFormData => {
  return (
    typeof data.licenseNumber === 'string' &&
    typeof data.state === 'string' &&
    (data.expirationDate === null || typeof data.expirationDate === 'string') &&
    typeof data.class === 'string' &&
    (data.licensePhoto === null || typeof data.licensePhoto === 'string')
  );
};
