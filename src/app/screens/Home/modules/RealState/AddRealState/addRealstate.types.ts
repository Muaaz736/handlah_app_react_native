

export type RealStateFormValues = {
  nickname: string;
  type: string;
  streetAddress: string;
  aptSuite: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  purchaseDate: string | Date | null;
  purchasePrice: number|string;
  endSellDate: string | Date | null;
  estCurrentValue: number|string;
  attachmentUrl?: string | string[];
  documentUrl?: string | string[];
  notes?: string;
  businessId?: string | number;
};

export interface PropertyTypeOption {
  label: string;
  value: string;
}

export interface AddRealEstateScreenProps {
  route?: {
    params?: {
      property?: RealStateFormValues;
      isEdit?: boolean;
    };
  };
}

export interface EditRealEstateScreenProps {
  route?: {
    params?: {
      propertyId: number;
    };
  };
}
