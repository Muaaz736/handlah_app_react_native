/**
 * ViewPersonalPropertyModal Component Types
 * Updated to match API response structure
 */
export interface PropertyWarranty {
  id?: number;
  itemname?: string;
  warrantyprovider?: string;
  expiration?: string;
  startdate?: string;
  notes?: string;
  website?: string;
  uploadattachments?: string | string[];
  userid?: number;
  createdat?: string;
  updatedat?: string;
  realestateid?: number | null;
  vehicleid?: number | null;
  businessid?: number | null;
}

export interface PropertyInsurance {
  id?: number;
  itemname?: string;
  agentemail?: string;
  insurancecarrier?: string;
  policynumber?: string;
  annualpremium?: number;
  startdate?: string;
  renewaldate?: string;
  enddate?: string;
  dueday?: number;
  agent?: string;
  agentphone?: string;
  uploadattachments?: string | string[];
  userid?: number;
  realestateid?: number | null;
  vehicleid?: number | null;
  businessid?: number | null;
}

export interface PropertyLoan {
  id?: number;
  lenderprovider?: string;
  lenderlocation?: string;
  lenderphonenumber?: string;
  lenderemail?: string;
  accountnumber?: string;
  balance?: number;
  estbalance?: number;
  monthlypayment?: number;
  startdate?: string;
  enddate?: string;
  dueday?: number;
  ratepercent?: number;
  bestname?: string;
  uploadattachments?: string | string[];
  userid?: number;
  realestateid?: number | null;
  vehicleid?: number | null;
  businessid?: number | null;
}

export interface PersonalProperty {
  id?: number;
  name?: string;
  category?: string;
  attachment?: string | string[];
  modelserial?: string;
  purchasedate?: string;
  price?: number;
  datesolddiscarded?: string;
  isassigned?: boolean;
  isaddedtowallet?: boolean;
  userid?: number;
  createdat?: string;
  updatedat?: string;
  realestateid?: number | null;
  businessid?: number | null;
  warranty?: PropertyWarranty | null;
  insurance?: PropertyInsurance | null;
  loan?: PropertyLoan | null;
  [key: string]: any;
}

export interface ViewPersonalPropertyModalProps {
  visible: boolean;
  onClose: () => void;
  property: PersonalProperty | null;
  isLoading?: boolean;
  actionable?: boolean;
  ownerUserId?: number;
  onEditProperty?: (item: any) => void;
  onEditLoan?: (item: any) => void;
  onEditInsurance?: (item: any) => void;
  onEditWarranty?: (item: any) => void;
  onDeleteLoan?: (item: any) => void;
  onDeleteInsurance?: (item: any) => void;
  onDeleteWarranty?: (item: any) => void;
}

export type PropertyCategory = 'appliance' | 'electronics' | 'furniture' | 'vehicle' | 'other';
