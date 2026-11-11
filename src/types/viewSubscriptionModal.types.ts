/**
 * ViewSubscriptionModal Component Types
 */
export interface Subscription {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

export interface ViewSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  socialNetworks?: Array<{
    id: number | string;
    networktype: string;
    stype: string;
    [key: string]: any;
  }>;
  paymentMethodOptions?: Array<{ label: string; value: string; [key: string]: any }>;
}

export interface SubscriptionCredentials {
  email: string;
  password: string;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';
