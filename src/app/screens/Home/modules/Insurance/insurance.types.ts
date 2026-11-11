import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../../../types/RootStackParamList.types";

// API response format (lowercase fields from backend)
export interface InsurancePolicy {
  id: number;
  itemname: string;
  insurancecarrier: string;
  policynumber: string;
  annualpremium: number;
  agentemail: string;
  startdate: string;
  renewaldate: string;
  enddate: string;
  dueday: number;
  agent: string;
  agentphone: string;
  uploadattachments: string;
  userid?: number;
  realestateid?: number | null;
  personalpropertyid?: number | null;
  property?: { id: number; name?: string; itemname?: string; [key: string]: any } | null;
  vehicle?: { id?: number; issold?: boolean; istransferred?: boolean; [key: string]: any } | null;
  businessid?: number | null;
  vehicleid?: number | null;
  // Legacy camelCase fields for backward compatibility
  itemName?: string;
  name?: string;
  policyNumber?: string;
  insuranceCarrier?: string;
  agentEmail?: string;
  agentPhone?: string;
  balance?: string;
  annualPremium?: string | number;
  startDate?: string;
  renewalDate?: string;
  endDate?: string;
  dueDay?: string | number;
  ispaidannually?: boolean;
  isPaidAnnually?: boolean;
  /** one-time, weekly, bi-weekly, monthly, quarterly or annually. */
  billingFrequency?: string;
}

export interface SharedConnection {
  userId: string;
  permission: 'view' | 'edit';
}

export interface UserConnection {
  label: string;
  value: string;
}

export interface InsuranceScreenState {
  shareModalVisible: boolean;
  deleteModalVisible: boolean;
  viewModalVisible: boolean;
  selectedInsurance: InsurancePolicy | null;
}

export interface InsuranceScreenProps {}

export interface AddInsurancePolicyScreenProps {
  route?: {
    params?: {
      insurance?: InsurancePolicy;
      isEdit?: boolean;
    };
  };
}

export interface TotalsData {
  totalMonthly: string;
  totalAnnual: string;
}

export type InsuranceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddInsurancePolicy'
>;