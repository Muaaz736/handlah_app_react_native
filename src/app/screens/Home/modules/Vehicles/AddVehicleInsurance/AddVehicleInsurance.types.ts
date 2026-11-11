export interface InsuranceFormData {
  itemName: string;
  agentEmail: string;
  insuranceCarrier: string;
  policyNumber: string;
  annualPremium: string;
  startDate: string | null;
  renewalDate: string | null;
  endDate: string | null;
  dueDay: string;
  agent: string;
  agentPhone: string;
}

export interface InsuranceItem extends InsuranceFormData {
  id?: string;
  attachmentUrl?: string;
  insuranceCardUrl?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface InsurancePayload {
  itemName: string;
  insuranceCarrier: string;
  policyNumber: string;
  annualPremium?: number;
  agentEmail?: string;
  startDate: string;
  renewalDate: string;
  endDate?: string | null;
  dueDay?: number;
  agent?: string;
  agentPhone?: string;
  uploadAttachments?: string | string[];
  vehicleId?: number | null;
  realEstateId?: number | null;
  propertyId?: number | null;
  personalPropertyId?: number | null;
  businessId?: number | string;
  ownerUserId?: number;
  isPaidAnnually?: boolean;
  /** one-time, weekly, bi-weekly, monthly, quarterly or annually. */
  billingFrequency?: string;
}

export interface AddInsurancesBulkPayload {
  insurances: InsurancePayload[];
}
