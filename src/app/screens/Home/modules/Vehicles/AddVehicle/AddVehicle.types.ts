export interface FormData {
  year: string;
  make: string;
  model: string;
  nickname: string;
  vin: string;
  color: string;
  plate: string;
  buyCondition: 'New' | 'Used' | 'Certified';
  attachmentPhoto: any;
  carfaxRecord: any;
}

export interface Vehicle extends FormData {
  id?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface RouteParams {
  vehicle?: Vehicle;
  isEdit?: boolean;
}

export interface AddVehiclePayload {
  year: number;
  make: string;
  model: string;
  nickname?: string;
  vin?: string;
  color?: string;
  plate?: string;
  vehicleType?: string;
  vehicleTypeOther?: string;
  condition: string;
  purchasedDate?: string;
  soldDate?: string;
  attachmentUrl?: string | string[];
  carFaxRecordUrl?: string | string[];
  businessId?: string | number;
  registrationType?: string;
  registrationTypeOther?: string;
  registeredAddress?: string;
  registrationDate?: string;
  purchasedPrice?: number;
  registrationExpiry?: string;
  notes?: string;
  additionalAttachments?: string[];
}

export interface UpdateVehicleParams {
  id: string | number;
  data: AddVehiclePayload;
}
