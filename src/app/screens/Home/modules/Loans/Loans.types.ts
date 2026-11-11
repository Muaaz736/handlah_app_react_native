import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

// Loan Interface - matches API response
export interface Loan {
  id: number;
  lenderprovider: string;
  lenderlocation?: string;
  lenderphonenumber?: string;
  lenderemail?: string;
  accountnumber?: string;
  balance: number;
  estbalance?: number;
  monthlypayment: number;
  startdate?: string;
  enddate?: string;
  dueday?: number;
  ratepercent?: number;
  bestname?: string;
  uploadattachments?: string;
  userid?: number;
  vehicleid?: number | null;
  realestateid?: number | null;
  property?: { id: number; name?: string; itemname?: string; [key: string]: any } | null;
  vehicle?: { id?: number; issold?: boolean; istransferred?: boolean; [key: string]: any } | null;
}

export interface LoanFormData {
  lenderProvider: string;
  lenderLocation: string;
  lenderPhoneNumber: string;
  lenderEmail: string;
  accountNumber: string;
  balance: number;
  estBalance: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string | null;
  dueDay: number;
  ratePercent: number;
  bestName: string;
  uploadAttachments: string | string[];
  realEstateId?: number | null;
  vehicleId?: number | null;
  propertyId?: number | null;
  additionalAttachments?: string[] | null;
}

// Loans Screen Props
export type LoansMainNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Loans'
>;

export interface LoansScreenState {
  loans: Loan[];
  shareModalVisible: boolean;
  deleteModalVisible: boolean;
  selectedLoan: Loan | null;
  totalMonthly: string;
  totalAnnual: string;
}

// Add Loan Screen Props
export interface AddLoanScreenProps {
  navigation: NativeStackNavigationProp<any, 'AddLoan'>;
  route: RouteProp<any, 'AddLoan'>;
}

export interface AddLoanScreenParams {
  loan?: Loan;
  isEdit?: boolean;
}

export interface AddLoanScreenState extends LoanFormData {}

export interface ShareData {
  method?: string;
  title?: string;
}

export interface LoanCardProps {
  loan: Loan;
  onShare: (loan: Loan) => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  themeColors: any;
}
