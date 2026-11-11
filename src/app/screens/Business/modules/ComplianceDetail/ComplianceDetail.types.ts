import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type ComplianceDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ComplianceDetail'
>;

export interface Folder {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  notes: string;
  status: 'Active' | 'Expired' | 'Pending';
  image: any;
}

export interface ShareData {
  [key: string]: any;
}

export type ComplianceDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ComplianceDetail'
>;
