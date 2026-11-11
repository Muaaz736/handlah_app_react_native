import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/RootStackParamList.types';

export type AccountNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export interface ProfileItem {
  id: string | number;
  titleKey: string;
  route?: string;
  type?: 'toggle' | 'navigation';
}

export interface RenderItemProps {
  item: ProfileItem;
}

export interface NavigationParams {
  Login: undefined;
  EditProfile: undefined;
  DeleteAccount: undefined;
  [key: string]: undefined | object;
}
