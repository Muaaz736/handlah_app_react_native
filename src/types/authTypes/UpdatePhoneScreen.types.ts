import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type UpdatePhoneScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UpdatePhoneScreen'
>;

export interface UpdatePhoneScreenFormData {
  phoneNumber: string;
}

export type UpdatePhoneScreenFormField = keyof UpdatePhoneScreenFormData;

export interface UpdatePhoneScreenProps {}
