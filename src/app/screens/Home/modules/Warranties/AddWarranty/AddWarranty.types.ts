import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';
import { Warranty } from '../Warranties/Warranties.types';

export type AddWarrantyNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddWarranty'
>;

export interface FormData {
  itemName: string;
  warrantyProvider: string;
  expiration: string | null;
  startDate: string | null;
  notes: string;
  website: string;
  uploadAttachments: string | string[];
  warrantyNumber?: string;
  cost?: string;
}

export interface RouteParams {
  warranty?: Warranty;
  isEdit?: boolean;
}

export type { Warranty };
