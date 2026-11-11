import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export interface SignupFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type SignupFormField = keyof SignupFormData;

export interface CheckboxLabelPart {
  text: string;
  link: boolean;
  onPress?: () => void;
}

export interface SignupScreenProps {}
