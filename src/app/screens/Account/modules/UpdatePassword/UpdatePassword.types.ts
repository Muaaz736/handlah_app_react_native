import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type UpdatePasswordNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UpdatePassword'
>;

export interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}
