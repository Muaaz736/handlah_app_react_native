import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type BusinessContactNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BusinessContact'
>;

export interface BusinessContactItem {
  id: string;
  name: string;
  role: string;
  email: string;
  type: string;
}

export interface ShareData {
  [key: string]: any;
}
