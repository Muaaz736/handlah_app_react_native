export interface LoanFormData {
  lenderProvider: string;
  lenderLocation: string;
  lenderPhoneNumber: string;
  lenderEmail: string;
  accountNumber: string;
  balance: string;
  estBalance: string;
  monthlyPayment: string;
  startDate: string | null;
  endDate: string | null;
  dueDay: string;
  ratePercent: string;
  bestName: string;
}

export interface LoanItem extends LoanFormData {
  id?: string;
  attachmentUrl?: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface LoanPayload {
  lenderProvider: string;
  lenderLocation?: string;
  lenderPhoneNumber?: string;
  lenderEmail?: string;
  accountNumber?: string;
  balance: number;
  estBalance: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string | null;
  dueDay: number;
  ratePercent: number;
  bestName?: string;
  uploadAttachments?: string | string[];
  vehicleId: number;
  businessId?: string | number;
}
