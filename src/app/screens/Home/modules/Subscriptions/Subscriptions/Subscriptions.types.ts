import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

/** A subscription, membership or pass as the API sends it (keys are lowercase). */
export interface SubscriptionItem {
  id: number;
  subscriptionname: string;
  username: string;
  password: string;
  cost: number;
  billingfrequency: string;
  nextrenewaldate: string;
  paymentmethod: string;
  paymentmethodlabel: string;
  notes: string;
  userid: number;
  createdat: string;
  updatedat: string;
  startdate?: string | null;
  enddate?: string | null;
  // Memberships & passes
  type?: string | null;
  typelabel?: string | null;
  typeother?: string | null;
  provider?: string | null;
  membername?: string | null;
  membershipnumber?: string | null;
  plantier?: string | null;
  status?: string | null;
  websiteurl?: string | null;
  location?: string | null;
  cardfronturl?: string | null;
  cardbackurl?: string | null;
  cardpdfurl?: string | null;
  barcodevalue?: string | null;
  barcodeimageurl?: string | null;
  issuerapplink?: string | null;
  noexpiration?: boolean;
  autorenew?: boolean | null;
  nextpaymentdate?: string | null;
  currency?: string | null;
  cancellationnotice?: string | null;
  cancellationinstructions?: string | null;
  benefits?: string | null;
  restrictions?: string | null;
  addtowallet?: boolean;
  uploadattachments?: string[] | null;
  businessid?: number | null;
}

export interface ShareData {
  [key: string]: any;
}

export type SubscriptionsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Subscriptions'
>;
