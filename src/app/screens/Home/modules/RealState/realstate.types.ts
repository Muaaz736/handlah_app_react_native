import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

/**
 * Real Estate Property Interface
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
  accesslevel?: 'read' | 'write' | 'owner';
  [key: string]: any;
}

/**
 * Associated Items with Properties
 */
export interface Loan {
  id: number;
  propertyId: number;
  lenderName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate?: string;
}

export interface Utility {
  id: number;
  propertyId: number;
  type: 'electricity' | 'water' | 'gas' | 'internet' | 'other';
  provider: string;
  accountNumber?: string;
  monthlyAmount?: number;
}

export interface Insurance {
  id: number;
  propertyId: number;
  itemName: string;
  insuranceCarrier: string;
  policyNumber: string;
  annualPremium?: number;
  startDate: string;
  endDate?: string;
}

export interface Rental {
  id: number;
  propertyId: number;
  tenantName: string;
  monthlyRent: number;
  leaseStart: string;
  leaseEnd: string;
  depositAmount?: number;
}

export interface Warranty {
  id: number;
  propertyId: number;
  itemName: string;
  provider: string;
  startDate: string;
  endDate: string;
  coverageDetails?: string;
}

export interface PropertyItem {
  id: number;
  propertyId: number;
  name: string;
  category: string;
  value?: number;
  purchaseDate?: string;
}

export interface Service {
  id: number;
  propertyId: number;
  serviceName: string;
  provider: string;
  lastServiceDate: string;
  nextServiceDate?: string;
  cost?: number;
}

/**
 * Delete Item Types
 */
export type DeleteItemType =
  | 'property'
  | 'loan'
  | 'utility'
  | 'rental'
  | 'warranty'
  | 'property_item'
  | 'service';

/**
 * Navigation Types
 */
export type RealEstateStackParamList = {
  RealEstate: undefined;
  AddRealEstate: {
    property?: RealEstateProperty;
    isEdit?: boolean;
  };
  AddLoanMortgage: {
    // loan may be passed directly from API and therefore is untyped
    loan?: any;
    isEdit?: boolean;
    fromRealEstate?: boolean;
    addNew?: boolean;
  };
  AddUtilities: {
    utility?: Utility;
    isEdit?: boolean;
    fromRealEstate?: boolean;
    addNew?: boolean;
  };
  AddWarranties: {
    warranty?: Warranty;
    isEdit?: boolean;
    fromRealEstate?: boolean;
    addNew?: boolean;
  };
  AddInsurance: {
    insurance?: Insurance;
    isEdit?: boolean;
    fromRealEstate?: boolean;
    addNew?: boolean;
  };
  AddPersonalPropertyAtAddress: {
    property?: PropertyItem;
    isEdit?: boolean;
    fromRealEstate?: boolean;
    addNew?: boolean;
  };
  AddServicesWorkHistory: {
    service?: Service;
    isEdit?: boolean;
    fromRealEstate?: boolean;
    addNew?: boolean;
  };
  Dashboard: {
    screen: string;
  };
};

export type RealEstateScreenNavigationProp = NativeStackNavigationProp<
  RealEstateStackParamList,
  'RealEstate'
>;

export type RealEstateScreenRouteProp = RouteProp<
  RealEstateStackParamList,
  'RealEstate'
>;

/**
 * Screen Props
 */
export interface RealEstateScreenProps {
  navigation: RealEstateScreenNavigationProp;
  route: RealEstateScreenRouteProp;
}

/**
 * Share Data
 */
export interface ShareData {
  title?: string;
  message?: string;
  method?: 'email' | 'sms' | 'whatsapp' | 'other';
  url?: string;
}

/**
 * Modal Props
 */
export interface ViewRealEstateModalProps {
  visible: boolean;
  onClose: () => void;
  property: RealEstateProperty | null;
  onEditLoan?: (loan: Loan) => void;
  onEditUtility?: (utility: Utility) => void;
  onEditRental?: (rental: Rental) => void;
  onEditWarranty?: (warranty: Warranty) => void;
  onEditProperty?: (property: PropertyItem) => void;
  onEditService?: (service: Service) => void;
  onDeleteLoan?: (loan: Loan) => void;
  onDeleteUtility?: (utility: Utility) => void;
  onDeleteRental?: (rental: Rental) => void;
  onDeleteWarranty?: (warranty: Warranty) => void;
  onDeleteProperty?: (property: PropertyItem) => void;
  onDeleteService?: (service: Service) => void;
}

export interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (data: ShareData) => void;
  title?: string;
}

export interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}