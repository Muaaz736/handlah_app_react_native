import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/RootStackParamList.types';

export type BusinessNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export interface BusinessTab {
  label: string;
  value: string;
}

export interface SubItem {
  id: string;
  titleKey: string;
  icon: any;
  route?: string;
  count?: string;
  amount?: string;
}

export interface BusinessItem {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  subtitle?: string;
  icon: any;
  category: string;
  expandable: boolean;
  subItems?: SubItem[];
  screenRoute?: string;
}

export interface BusinessSection {
  id: string;
  title: string;
  items: BusinessItem[];
}

export interface ExpandedItemsState {
  [key: string]: boolean;
}

export interface BusinessOption {
  label: string;
  value: string;
}
