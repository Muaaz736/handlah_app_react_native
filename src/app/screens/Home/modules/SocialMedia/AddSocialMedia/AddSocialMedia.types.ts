import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

// Form Account (local state structure)
export interface SocialMediaFormAccount {
  id: number;
  socialNetworkTypeId: string | number;
  accountName: string;
  socialNetworkUrl: string;
  username: string;
  password: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

// Account Type Option for dropdown
export interface AccountTypeOption {
  label: string;
  value: string | number;
  networktype?: string;
}

// Navigation Route Params
export interface AddSocialMediaRouteParams {
  isEdit?: boolean;
  accountId?: number | string;
  account?: {
    socialNetworkTypeId: string | number;
    accountName: string;
    socialNetworkUrl: string;
    username: string;
    password: string;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
  };
  platform?: string;
  email?: string;
}

// Navigation Prop
export type AddSocialMediaNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddSocialMedia'
>;

// Route Prop
export type AddSocialMediaRouteProp = RouteProp<
  RootStackParamList,
  'AddSocialMedia'
>;

// Redux State Type for useSelector
export interface AddSocialMediaReduxState {
  social_media_slice: {
    social_network_types_data: {
      socialnetworktypes?: Array<{
        id: number | string;
        networktype: string;
        [key: string]: any;
      }>;
    } | null;
    social_network_setup_status: string;
  };
}
