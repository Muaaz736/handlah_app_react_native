import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Navigation types for AddBusinessDetails screen
export type AddBusinessDetailsNavigationProp = NativeStackNavigationProp<any>;

// Form data interface
export interface BusinessDetailsFormData {
  businessName: string;
  description: string;
  ein: string;
  country: string;
  stateOfFormation: string;
  entityType: string;
  registeredAgentName: string;
  registeredAgentAddress: string;
  registeredAgentPhone: string;
  principalBusinessAddress: string;
}

// Route params interface
export interface BusinessDetailsParams {
  businessDetails?: BusinessDetailsFormData;
  isEdit?: boolean;
}

// Entity type options
export type EntityType =
  | 'llc'
  | 'corporation'
  | 'partnership'
  | 'sole_proprietorship'
  | 'nonprofit';

// State options for US states
export type StateOption = {
  label: string;
  value: string;
};
