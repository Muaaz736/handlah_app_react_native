import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type UpdateEmailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UpdateEmail'
>;

export interface UpdateEmailScreenFormData {
  email: string;
}

export type UpdateEmailScreenFormField = keyof UpdateEmailScreenFormData;

export interface UpdateEmailScreenProps {}
