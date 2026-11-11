export interface LoanFormValues {
  lenderProvider: string;
  lenderLocation: string;
  lenderPhoneNumber: string;
  lenderEmail: string;
  accountNumber: string;
  balance: number | string;
  estBalance: number | string;
  monthlyPayment: number | string;
  startDate: Date | null;
  endDate: Date | null;
  dueDay: number | null;
  ratePercent: number | string;
  bestName: string;
  uploadAttachments: string;
  realEstateId?: number | null;
  vehicleId?: number;
}

export interface Loan extends LoanFormValues {
  id?: number;
  attachmentData?: any; // Store local document data for display
}

export interface AddLoanRouteParams {
  loan?: any;
  isEdit?: boolean;
  fromRealEstate?: boolean;
  addNew?: boolean;
  realEstateId?: number;
}

export interface AddLoanProps {
  route?: {
    params?: AddLoanRouteParams;
  };
}

export interface EditLoanRouteParams {
  loanId?: number;
  realEstateId?: number;
}

export interface EditLoanProps {
  route?: {
    params?: EditLoanRouteParams;
  };
}
