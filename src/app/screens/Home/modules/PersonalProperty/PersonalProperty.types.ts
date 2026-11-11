import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

/**
 * Personal Property Interface - matches API response
 */
export interface PersonalPropertyType {
  id: number;
  name: string;
  category: string;
  attachment?: string | string[];
  modelserial?: string;
  purchasedate?: string;
  price?: number;
  datesolddiscarded?: string;
  isassigned?: boolean;
  assignedproperty?: string;
  isaddedtowallet?: boolean;
  userid?: number;
  createdat?: string;
  updatedat?: string;
  realestateid?: number | null;
  businessid?: number | null;
  warranty?: WarrantyInfo | null;
  insurance?: InsuranceInfo | null;
  loan?: LoanInfo | null;
  accessLevel?: string;
  accesslevel?: string;
}

/**
 * Warranty Information - matches API response
 */
export interface WarrantyInfo {
  id?: number;
  itemname?: string;
  warrantyprovider?: string;
  expiration?: string;
  startdate?: string;
  notes?: string;
  website?: string;
  warrantynumber?: string;
  cost?: number;
  uploadattachments?: string | string[];
  userid?: number;
  createdat?: string;
  updatedat?: string;
  realestateid?: number | null;
  vehicleid?: number | null;
  businessid?: number | null;
}

/**
 * Insurance Information - matches API response
 */
export interface InsuranceInfo {
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

/**
 * Loan Information - matches API response
 */
export interface LoanInfo {
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

/**
 * Complete Property Data with all related info
 */
export interface CompletePropertyData extends PersonalPropertyType {
  warranty?: WarrantyInfo;
  insurance?: InsuranceInfo;
  loan?: LoanInfo;
  addToWallet?: boolean;
}

/**
 * Personal Property Screen Props
 */
export interface PersonalPropertyScreenProps {
  navigation: NativeStackNavigationProp<any, 'PersonalProperty'>;
}

export interface PersonalPropertyScreenState {
  properties: PersonalPropertyType[];
  shareModalVisible: boolean;
  deleteModalVisible: boolean;
  viewModalVisible: boolean;
  moveModalVisible: boolean;
  selectedProperty: PersonalPropertyType | null;
}

/**
 * Add Personal Property Screen Props
 */
export type AddPersonalPropertyMainNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddPersonalProperty'
>;
export type AddPersonalPropertyRouteProp = RouteProp<
  RootStackParamList,
  'AddPersonalProperty'
>;

export interface AddPersonalPropertyScreenParams {
  property?: PersonalPropertyType;
  isEdit?: boolean;
}

export interface AddPersonalPropertyScreenState
  extends PersonalPropertyFormData {}

/**
 * Edit Personal Property Screen Props
 */
export type EditPersonalPropertyMainNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditPersonalProperty'
>;
export type EditPersonalPropertyRouteProp = {
  propertyId: number;
  ownerUserId?: number;
  property?: PersonalPropertyType;
  // Business-side owner scoping and display for the Assign To (real estate)
  // linkage rules — see useAssignmentFields.
  ownerBusinessId?: number;
  ownerName?: string;
  isFromEmergencyAccess?: boolean;
};

export interface EditPersonalPropertyProps {
  navigation: EditPersonalPropertyMainNavigationProp;
  route: RouteProp<RootStackParamList, 'EditPersonalProperty'>;
}

/**
 * Formik Form Data for Personal Property
 */
export interface PersonalPropertyFormData {
  // Personal Property
  name: string;
  category: string;
  attachment: string;
  modelSerial: string;
  purchaseDate: Date | string | null;
  price: string;
  dateSoldDiscarded: Date | string | null;
  isAssigned: boolean;
  assignedProperty: string;
  isAddedToWallet: boolean;
  soldAmount?: string;
  // Warranty
  warrantyItemName: string;
  warrantyProvider: string;
  warrantyExpiration: Date | string | null;
  warrantyStartDate: Date | string | null;
  warrantyNotes: string;
  warrantyWebsite: string;
  warrantyNumber: string;
  warrantyCost: string;
  warrantyUploadAttachments: string;
  // Insurance
  insuranceItemName: string;
  agentEmail: string;
  insuranceCarrier: string;
  policyNumber: string;
  annualPremium: string;
  insuranceStartDate: Date | string | null;
  insuranceRenewalDate: Date | string | null;
  insuranceEndDate: Date | string | null;
  insuranceDueDay: string;
  insuranceAgent: string;
  insuranceAgentPhone: string;
  insuranceUploadAttachments: string;
  // Loan
  lenderProvider: string;
  lenderLocation: string;
  lenderPhoneNumber: string;
  lenderEmail: string;
  accountNumber: string;
  balance: string;
  estBalance: string;
  monthlyPayment: string;
  loanStartDate: Date | string | null;
  loanEndDate: Date | string | null;
  loanDueDay: string;
  ratePercentage: string;
  loanItemName: string;
  loanUploadAttachments: string;
  insuranceIsPaidAnnually?: boolean;
}

/**
 * Property Card Props
 */
export interface PropertyCardProps {
  property: PersonalPropertyType;
  onShare: (property: PersonalPropertyType) => void;
  onMove: (property: PersonalPropertyType) => void;
  onView: (property: PersonalPropertyType) => void;
  onEdit: (property: PersonalPropertyType) => void;
  onDelete: (property: PersonalPropertyType) => void;
  themeColors: any;
}

export interface ShareData {
  method?: string;
  title?: string;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface AssignedPropertyOption {
  label: string;
  value: string;
}

/**
 * API Payload Types for /api/properties endpoint
 */

export interface WarrantyPayload {
  itemName: string;
  warrantyProvider: string;
  expiration: string | null;
  startDate: string | null;
  notes: string;
  website: string;
  warrantyNumber?: string;
  cost?: number;
  uploadAttachments: string | string[];
}

export interface InsurancePayload {
  itemName: string;
  insuranceCarrier: string;
  policyNumber: string;
  annualPremium: number;
  agentEmail: string;
  startDate: string | null;
  renewalDate: string | null;
  endDate: string | null;
  dueDay: number;
  agent: string;
  agentPhone: string;
  uploadAttachments: string | string[];
}

export interface LoanPayload {
  lenderProvider: string;
  lenderLocation: string;
  lenderPhoneNumber: string;
  lenderEmail: string;
  accountNumber: string;
  balance: number;
  estBalance: number;
  monthlyPayment: number;
  startDate: string | null;
  endDate: string | null;
  dueDay: number;
  ratePercent: number;
  bestName: string;
  uploadAttachments: string | string[];
}

export interface AddPersonalPropertyPayload {
  name: string;
  category: string;
  attachment: string | string[];
  modelSerial: string;
  purchaseDate: string | null;
  price: number;
  dateSoldDiscarded: string | null;
  isAssigned: boolean;
  isAddedToWallet: boolean;
  realEstateId: number;
  businessId: number;
  warranty: WarrantyPayload;
  insurance: InsurancePayload;
  loan: LoanPayload;
}

export interface UpdatePersonalPropertyParams {
  id: number;
  data: AddPersonalPropertyPayload;
  ownerUserId?: number;
}
