import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type SubscriptionPlanNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SubscriptionPlan'
>;

export type ChooseSubscriptionPlanNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChooseSubscriptionPlan'
>;

export type PlanType = 'free' | 'premium';
