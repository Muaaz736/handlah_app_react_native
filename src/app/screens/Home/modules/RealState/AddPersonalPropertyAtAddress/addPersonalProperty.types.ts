export interface PersonalPropertyFormData {
  name: string;
  category: string;
  attachment: string;
  modelSerial: string;
  purchaseDate: string | Date | null;
  price: string;
  dateSoldDiscarded: string | Date | null;
  realEstateId: number | null;
}


export interface PersonalProperty extends PersonalPropertyFormData {
  id?: number;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface AddPersonalPropertyRouteParams {
  property?: PersonalProperty;
  isEdit?: boolean;
  fromRealEstate?: boolean;
  addNew?: boolean;
  realEstateId?: number;
}

export interface AddPersonalPropertyProps {
  route?: {
    params?: AddPersonalPropertyRouteParams;
  };
}

export interface EditPersonalPropertyAtAddressRouteParams {
  propertyId: number;
}

export interface EditPersonalPropertyAtAddressProps {
  route: {
    params: EditPersonalPropertyAtAddressRouteParams;
  };
  navigation: any;
}
