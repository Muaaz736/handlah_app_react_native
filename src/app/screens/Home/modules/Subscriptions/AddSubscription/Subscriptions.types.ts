import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

export interface SubscriptionData {
  subscriptionName: string;
  username: string;
  password: string;
  cost: string;
  billingFrequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Annually';
  nextRenewalDate: string | Date | null;
  paymentMethod: string;
  notes: string;
}

export interface BillingOption {
  label: string;
  value: 'One-time' | 'Monthly' | 'Quarterly' | 'Annually';
}

export interface StatusOption {
  label: string;
  value: 'Active' | 'Upcoming' | 'Paused' | 'Expired' | 'Canceled';
}

export interface PaymentMethod {
  label: string;
  value: string;
}

export interface RouteParams {
  subscription?: SubscriptionData;
  isEdit?: boolean;
}
