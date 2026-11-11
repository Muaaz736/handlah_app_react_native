/**
 * ViewRealEstateModal Component Types
 */
export interface RealEstateProperty {
  id: number;
  name: string;
  address: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  propertyType?: 'residential' | 'commercial' | 'land' | 'other';
  notes?: string;
  image?: string;
  [key: string]: any;
}

export interface ViewRealEstateModalProps {
  visible: boolean;
  onClose: () => void;
  property: RealEstateProperty | null;
  isLoading?: boolean;
  actionable?: boolean;
  ownerUserId?: number;
  onEditLoan?: (item: any) => void;
  onEditUtility?: (item: any) => void;
  onEditInsurance?: (item: any) => void;
  onEditWarranty?: (item: any) => void;
  onEditProperty?: (item: any) => void;
  onEditService?: (item: any) => void;
  onDeleteLoan?: (item: any) => void;
  onDeleteUtility?: (item: any) => void;
  onDeleteInsurance?: (item: any) => void;
  onDeleteWarranty?: (item: any) => void;
  onDeleteProperty?: (item: any) => void;
  onDeleteService?: (item: any) => void;
  canDelete?: boolean;
}

export interface PropertyLoan {
  lenderProvider?: string;
  lenderLocation?: string;
  phone?: string;
  email?: string;
  accountNumber?: string;
  balance?: string;
  estimatedBalance?: string;
  startDate?: string;
  endDate?: string;
  dueDay?: string;
  ratePercentage?: string;
  amount?: string;
}

export interface PropertyUtility {
  vendor?: string;
  serviceType?: string;
  endDate?: string;
  accountNumber?: string;
  phone?: string;
  dueDay?: string;
  website?: string;
  attachment?: string;
  amount?: string;
}

export interface PropertyRental {
  renter?: string;
  insuranceCarrier?: string;
  phone?: string;
  email?: string;
  policyNumber?: string;
  balance?: string;
  estimatedBalance?: string;
  startDate?: string;
  endDate?: string;
  dueDay?: string;
  renewalDate?: string;
  amount?: string;
}

export interface PropertyWarranty {
  itemName?: string;
  warrantyProvider?: string;
  expiryDate?: string;
  endDate?: string;
  notes?: string;
  website?: string;
  document?: string;
  date?: string;
}

export interface PersonalPropertyItem {
  itemName?: string;
  category?: string;
  modelSerial?: string;
  purchaseDate?: string;
  price?: string;
  endDate?: string;
  document?: string;
}

export interface ServiceWorkHistory {
  vendorContractor?: string;
  tags?: string;
  date?: string;
  paymentMethod?: string;
  description?: string;
  amount?: string;
}

export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial';
