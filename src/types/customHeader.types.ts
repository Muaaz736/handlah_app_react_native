/**
 * CustomHeader Component Types
 */
export interface CustomHeaderProps {
  onSearchChange?: (text: string) => void;
  searchValue?: string;
  handleAccountChange?: (index: number) => void;
  isShowSearchedInput?: boolean;
  headerText?: string;
  /** 'overPhoto': transparent, with a white logo, glass Personal / Business switch and white bell (personal home). */
  variant?: 'default' | 'overPhoto';
  showNotificationIcon?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
}

export interface AccountType {
  id: number;
  label: string;
  value: string;
}

export type HeaderMode = 'search' | 'normal';
