

export type AccountType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PlannedPayment {
  dueDate: Date | null;
  amount: string;
  description?: string;
}

export interface BankAccount {
  id?: number;
  institution: string;
  accountName: string;
  type: AccountType | '';
  lastFourDigits: string;
  currentBalance: string;
  aprPercentage: string;
  dueDay: string;
  minDue: string;
  memo?: string;
  notes?: string;
  autopay: boolean;
  addToWallet: boolean;
  plannedPayments: PlannedPayment[];
}

export interface BankingAccountCard {
  id: number;
  name: string;
  nickname: string;
  type: string;
  lastFour: string;
  balance: string;
  accountname?: string;
}
// Props for BankingFinance component
export interface IBankingFinanceScreenProps {
  navigation?: any;
}

// Props for AddBankAccount component
export interface IAddBankAccountProps {
  route: any;
}

// Theme colors object
export interface IThemeColors {
  primary: string;
  secondary: string;
  lightCGreen: string;
  gradient: string[];
  [key: string]: any;
}

// User role hook return type
export interface IUserRoleHookReturn {
  themeColors: IThemeColors;
  userRole?: string;
}

// User role hook return type
export interface IUserRoleHookReturn {
  themeColors: IThemeColors;
  userRole?: string;
}