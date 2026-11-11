import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type RequestAccessToDataNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RequestAccessToData'
>;

export type RequestAccessToDataRecieveNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RequestAccessToDataRecieve'
>;

export type RequestType = 'AccessCopy' | 'ConfirmCollection' | 'Both' | '';
export type ScopeType = 'All' | 'HealthInfo' | 'FinancialInfo' | 'Other' | '';
export type DeliveryMethodType = 'InApp' | 'Email' | 'Other' | '';
