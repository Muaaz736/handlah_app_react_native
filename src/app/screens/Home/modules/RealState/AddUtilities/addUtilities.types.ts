export interface UtilityFormData {
  utilityType: string;
    vendor: string;
    averageMonthlyAmount: string;
    billingFrequency: string;
    startDate: string | Date | null;
    endDate:string| Date | null;
    accountNumber: string;
    dueDay: string;
    phoneNumber: string;
    website: string;
    notes: string;
    uploadAttachments: string;
    realEstateId: number | null;
}


export interface Utility extends UtilityFormData {
  id?: number;
}

export interface UtilityType {
  label: string;
  value: string;
}

export interface AddUtilitiesRouteParams {
  utility?: any; // item from API may have lowercase keys
  isEdit?: boolean;
  fromRealEstate?: boolean;
  realEstateId?: number;
  addNew?: boolean;
}

export interface AddUtilitiesScreenProps {
  route?: {
    params?: AddUtilitiesRouteParams;
  };
  navigation: any;
}

export interface EditUtilitiesRouteParams {
  utilityId: number;
}

export interface EditUtilitiesProps {
  route?: {
    params?: EditUtilitiesRouteParams;
  };
  navigation: any;
}

export interface AddUtilitiesState {
  utilities: Utility[];
  [key: string]: any;
}