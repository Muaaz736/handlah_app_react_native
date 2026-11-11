import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type ProjectsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Projects'
>;

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  notes: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
}

export interface ShareData {
  [key: string]: any;
}
