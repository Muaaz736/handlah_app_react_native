export interface AccidentFormData {
  date: string | null;
  claimNumber: string;
  insuranceType: string;
  damage: string;
  repairDateStart: string | null;
  repairDateEnd: string | null;
  shop: string;
  totalRepairCost: string;
  beforePhoto: any;
  afterPhoto: any;
  policeReport: any;
}

export interface AccidentItem extends AccidentFormData {
  id?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface AccidentPayload {
  date: string;
  claimNumber: string;
  insuranceType: string;
  damage: string;
  repairDateFrom?: string;
  repairDateTo?: string;
  shop: string;
  totalRepairCost: number;
  attachmentBefore?: string | string[];
  attachmentAfter?: string | string[];
  policeReportUrl?: string | string[];
}

export interface UpdateAccidentParams {
  vehicleId: string | number;
  accidentId: string | number;
  data: AccidentPayload;
}

export interface DeleteAccidentParams {
  vehicleId: string | number;
  accidentId: string | number;
}
