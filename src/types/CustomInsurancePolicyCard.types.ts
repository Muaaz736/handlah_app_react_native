export interface Policy {
  id: string | number;
  title: string;
  subtitle: string;
  amount: string;
  [key: string]: any;
}

export interface ThemeColors {
  darkGreen: string;
  secondary: string;
  [key: string]: string;
}

export interface CustomInsurancePolicyCardProps {
  property: Policy;
  onShare: (property: Policy) => void;
  onEdit: (property: Policy) => void;
  onDelete: (property: Policy) => void;
  onPress: () => void;
}
