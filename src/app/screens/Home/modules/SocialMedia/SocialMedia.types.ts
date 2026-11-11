import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

// API Response Types
export interface SocialMediaAccount {
  id?: number;
  platform?: string;
  username?: string;
  email?: string;
  password?: string;
  // API fields (lowercase from backend)
  accountname?: string;
  socialnetworktypeid?: string | number;
  socialnetworktypename?: string;
  startdate?: string | Date | null;
  enddate?: string | Date | null;
  url?: string;
}

export interface SelectedAccountView {
  id?: number;
  name: string;
  email?: string;
  username?: string;
  password: string;
  accountname?: string;
  url?: string;
  socialAccountId?: number | string;
  socialNetworkTypeName?: number | string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  socialNetworkIcon?: string;
}

export interface UserConnection {
  label: string;
  value: string;
}

export interface SharedConnection {
  userId: string;
  permission: string;
}

export interface ShareData {
  selectedUsers: string[];
  permission: string;
  [key: string]: any;
}

export type SocialMediaNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

// Redux State Type for useSelector
export interface SocialMediaState {
  social_media_slice: {
    social_network_types_data: any;
    user_social_networks_data: {
      usersocialnetworksetups?: SocialMediaAccount[];
    } | null;
    user_social_networks_status: string;
    social_network_setup_status: string;
  };
}

// Navigation Params
export interface AddSocialMediaParams {
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
