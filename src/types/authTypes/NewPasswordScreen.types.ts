import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type NewPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NewPassword'
>;

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export type NewPasswordFormField = keyof NewPasswordFormData;

export interface NewPasswordScreenProps {}
