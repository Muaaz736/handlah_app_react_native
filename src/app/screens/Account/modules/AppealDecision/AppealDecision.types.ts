import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type AppealDecisionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AppealDecision'
>;

export type AppealDecisionRecieveNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AppealDecisionRecieve'
>;

export type AppealType = 'AccessDecision' | 'DeletionDecision' | 'Other' | '';
