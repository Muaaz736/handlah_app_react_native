export interface FormData {
  documentType: string;
  licenseNumber: string;
  state: string;
  expirationDate: string;
  documentClass: string;
  passportNumber: string;
  country: string;
  type: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface RouteParams {
  isEdit?: boolean;
  document?: Partial<FormData>;
}

export interface DocumentData extends FormData {
  id?: string;
}
