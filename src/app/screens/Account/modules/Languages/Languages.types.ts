import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type LanguagesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Languages'
>;

export interface LanguageOption {
  label: string;
  value: string;
}
