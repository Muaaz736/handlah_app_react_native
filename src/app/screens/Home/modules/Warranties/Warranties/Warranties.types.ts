import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

export type WarrantiesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Warranties'
>;

// API response format (lowercase fields from backend)
export interface Warranty {
  id: number;
  // Lowercase API response fields
  itemname?: string;
  warrantyprovider?: string;
  expiration?: string;
  startdate?: string;
  notes?: string;
  website?: string;
  uploadattachments?: string;
  userid?: number;
  realestateid?: number | null;
  businessid?: number | null;
  vehicleid?: number | null;
  property?: { id: number; name?: string; itemname?: string; [key: string]: any } | null;
  vehicle?: { id?: number; issold?: boolean; istransferred?: boolean; [key: string]: any } | null;
  createdat?: string;
  updatedat?: string;
  // CamelCase fields for backward compatibility
  itemName?: string;
  name?: string;
  warrantyProvider?: string;
  provider?: string;
  expiryDate?: string;
  startDate?: string;
  uploadAttachments?: string | string[];
}

export interface ShareData {
  [key: string]: any;
}

export interface DeleteConfirmData {
  title: string;
  message: string;
}

export interface WarrantiesScreenState {
  shareModalVisible: boolean;
  deleteModalVisible: boolean;
  selectedWarranty: Warranty | null;
}
