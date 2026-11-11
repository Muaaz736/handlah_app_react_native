export interface WarrantyFormData {
  itemName: string;
  warrantyProvider: string;
  expiration: string | null;
  startDate: string | null;
  notes: string;
  website: string;
  warrantyNumber: string;
  cost: string;
  billingFrequency?: string;
}

export interface WarrantyItem extends WarrantyFormData {
  id?: string;
  attachmentUrl?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface WarrantyPayload {
  itemName: string;
  warrantyProvider: string;
  warrantyNumber?: string;
  cost?: number;
  expiration: string | null;
  startDate: string;
  notes?: string;
  website?: string;
  uploadAttachments?: string | string[];
  vehicleId?: number | null;
  realEstateId?: number | null;
  propertyId?: number | null;
  personalPropertyId?: number | null;
  businessId?: string | number;
  ownerUserId?: number;
}

export interface AddWarrantiesBulkPayload {
  warranties: WarrantyPayload[];
}
