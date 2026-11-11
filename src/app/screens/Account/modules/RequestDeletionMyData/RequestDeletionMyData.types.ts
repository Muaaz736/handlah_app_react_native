import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type RequestDeletionMyDataNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RequestDeletionMyData'
>;

export type RequestDeletionMyDataRecieveNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RequestDeletionMyDataRecieve'
>;

export type DeletionScopeType = 'DeleteAll' | 'DeleteSpecific' | '';
