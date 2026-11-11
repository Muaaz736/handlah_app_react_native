import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type ComplianceVaultNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ComplianceVault'
>;

export interface Folder {
  id: string;
  name: string;
}

export interface ShareData {
  [key: string]: any;
}
