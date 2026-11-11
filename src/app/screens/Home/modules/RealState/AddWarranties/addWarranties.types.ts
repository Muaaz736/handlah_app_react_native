import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

/**
 * Attachment/Document Interface
 */
export interface WarrantyAttachment {
  id?: string;
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/**
 * Warranty Form Data Interface
 */
export interface WarrantyFormData {
  itemName: string;
    warrantyProvider: string;
    expiration: Date | null;
    startDate: Date | null;
    notes: string;
    website: string;
    warrantyNumber: string;
    cost: string;
    billingFrequency?: string;
    uploadAttachments: string;
    realEstateId: number | null;
}

/**
 * Warranty Interface (with ID for saved warranties)
 */
export interface Warranty extends WarrantyFormData {
  id: number;
  propertyId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Navigation Stack Param List
 */
export interface EditWarrantiesRouteParams {
  warrantyId: number;
}

export interface EditWarrantiesProps {
  route?: {
    params?: EditWarrantiesRouteParams;
  };
  navigation: any;
}

export interface AddWarrantiesRouteParams {
  warranty?: Warranty;
  isEdit?: boolean;
  fromRealEstate?: boolean;
  propertyId?: number;
  addNew?: boolean;
  realEstateId?: number;
}

export type WarrantyStackParamList = {
  AddWarranties: AddWarrantiesRouteParams;
  RealEstate: undefined;
  AddPersonalPropertyAtAddress: {
    propertyId?: number;
  };
};

/**
 * Navigation Props
 */
export type AddWarrantiesNavigationProp = NativeStackNavigationProp<
  WarrantyStackParamList,
  'AddWarranties'
>;

export type AddWarrantiesRouteProp = RouteProp<
  WarrantyStackParamList,
  'AddWarranties'
>;

/**
 * Screen Props
 */
export interface AddWarrantiesScreenProps {
  navigation: AddWarrantiesNavigationProp;
  route: AddWarrantiesRouteProp;
}

/**
 * Form Validation Errors
 */
export interface WarrantyFormErrors {
  itemName?: string;
  warrantyProvider?: string;
  expiration?: string;
  startDate?: string;
  notes?: string;
  website?: string;
  attachments?: string;
}

/**
 * Component State
 */
export interface AddWarrantiesState {
  warranties: Warranty[];
  formData: WarrantyFormData;
  errors: WarrantyFormErrors;
  isSubmitting: boolean;
  editingIndex: number | null;
}

/**
 * API Response Types
 */
export interface WarrantyAPIResponse {
  data: Warranty;
  message?: string;
  success: boolean;
}

export interface WarrantiesListAPIResponse {
  data: Warranty[];
  message?: string;
  success: boolean;
}