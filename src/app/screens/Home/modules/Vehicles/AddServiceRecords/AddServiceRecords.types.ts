export interface ServiceRecordFormData {
  date: string | null;
  type: string[];
  vendorShop: string;
  odometer: string;
  cost: string;
  attachments: any;
  notes: string;
}

export interface ServiceRecord extends ServiceRecordFormData {
  id?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface ServiceRecordPayload {
  date: string;
  type: string[];
  vendor: string;
  odometer: number;
  cost: number;
  notes?: string;
  attachment?: string | string[];
}

export interface UpdateServiceRecordParams {
  vehicleId: string | number;
  recordId: string | number;
  data: ServiceRecordPayload;
}

export interface DeleteServiceRecordParams {
  vehicleId: string | number;
  recordId: string | number;
}
