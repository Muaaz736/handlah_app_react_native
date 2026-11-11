import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type AddBusinessContactNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddBusinessContact'
>;

export type StatusType = 'active' | 'inactive' | '';
export type PrimaryType = 'yes' | 'no' | '';
export type ContactTypeValue = 'client' | 'vendor' | 'partner' | 'employee' | '';

export interface FormData {
  fullName: string;
  role: string;
  companyTeam: string;
  status: StatusType;
  emailAddress: string;
  phoneNumber: string;
  manager: string;
  location: string;
  tags: string;
  primary: PrimaryType;
  contactType: string | number;
  reference: boolean;
}

export interface ContactParams {
  contact?: Partial<FormData> & { id?: number };
  isEdit?: boolean;
}
