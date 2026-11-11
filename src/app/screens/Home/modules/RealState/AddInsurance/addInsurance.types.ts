export interface InsuranceFormData {
    itemName: string;
    insuranceCarrier: string;
    policyNumber: string;
    annualPremium: string;
    agentEmail: string;
    startDate: Date | null;
    renewalDate: Date | null;
    endDate: Date | null;
    dueDay: string;
    agent: string;
    agentPhone: string;
    uploadAttachments: string;
    realEstateId?: number | null;
    isPaidAnnually?: boolean;
    /** one-time, weekly, bi-weekly, monthly, quarterly or annually. */
    billingFrequency?: string;
}



export interface Insurance extends InsuranceFormData {
  id?: number;
}

export interface AddInsuranceRouteParams {
  insurance?: Insurance;
  isEdit?: boolean;
  fromRealEstate?: boolean;
  addNew?: boolean;
  realEstateId?: number;
}

export interface AddInsuranceProps {
  route?: {
    params?: AddInsuranceRouteParams;
  };
}

export interface EditInsuranceRouteParams {
  insuranceId: number;
}

export interface EditInsuranceProps {
  route?: {
    params?: EditInsuranceRouteParams;
  };
  navigation: any;
}
