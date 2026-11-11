import { WalletData } from '../../../../../../types/reduxTypes/essentialsSlice.types';

export interface Document {
  id: number;
  title: string;
  category: 'passport' | 'driverLicense' | 'licenseCertification' | 'property' | 'bankAccount' | 'subscription';
  licenseNumber?: string;
  passportNumber?: string;
  state?: string;
  statelabel?: string;
  countryName?: string;
  jurisdictionState?: string;
  jurisdictionCountry?: string;
  country?: string;
  expirationDate?: string;
  class?: string;
  type?: string;
  typelabel?: string;
  image?: any;
  // Property-specific
  modelSerial?: string;
  price?: number | string;
  purchaseDate?: string;
  dateSoldDiscarded?: string;
  soldAmount?: number | string;
  business?: {
    id: number;
    businessname: string;
    description?: string;
    ein?: string;
    stateofformation?: string;
    entitytype?: string;
    entitytypelabel?: string;
    principalbusinessaddress?: string;
  } | null;
  // Bank-specific
  accountName?: string;
  accountType?: string;
  last4digits?: string;
  balance?: number | string;
  apr?: number | string;
  dueDay?: number | string;
  minDue?: number | string;
  autoPay?: boolean;
  memo?: string;
  [key: string]: any;
}

export interface ShareData {
  [key: string]: any;
}

export interface WalletNavigationProp {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

export { WalletData };
