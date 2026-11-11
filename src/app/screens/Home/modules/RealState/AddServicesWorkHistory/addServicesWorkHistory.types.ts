export interface ServiceFormData {
  date: string | Date | null;
  vendorContractor: string;
  cost: string;
  tags: string;
  description: string;
  /** Cash, Credit Card, Debit Card, Check, Bank Transfer or Other (stored in English, as on the website). */
  paymentMethod?: string;
  attachment: string | string[];
  realEstateId: number | null;
  attachmentData?: any; // Store local document data for display

}



export interface Service extends ServiceFormData {
  id?: number;
  attachmentData?: any; // Store local document data for display

}

export interface AddServicesRouteParams {
  service?: Service;
  isEdit?: boolean;
  fromRealEstate?: boolean;
  addNew?: boolean;
  realEstateId?: number;
}

export interface AddServicesScreenProps {
  route?: {
    params?: AddServicesRouteParams;
  };
  navigation: any;
}

export interface AddServicesState {
  services: Service[];
  [key: string]: any;
}

export interface EditServicesWorkHistoryRouteParams {
  serviceId: number;
}

export interface EditServicesWorkHistoryProps {
  route: {
    params: EditServicesWorkHistoryRouteParams;
  };
  navigation: any;
}