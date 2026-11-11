import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * CustomIdentityHubBottomSheet Component Types
 */
export interface CustomIdentityHubBottomSheetProps {
  ref: React.RefObject<any>;
}

export interface ItemFormData {
  selectedCategory: string;
  itemName: string;
}

export interface ConnectionFormData {
  connectionType: string;
  username: string;
}

export interface ReminderFormData {
  description: string;
  selectedDate: string;
}

export type TabContentType = 'item' | 'connection' | 'reminder';

/**
 * Tab Content Props
 */
export interface ItemTabContentProps {
  onSave?: (data: ItemFormData) => void;
  onCancel?: () => void;
}

export interface ConnectionsTabContentProps {
  onSendRequest?: (data: ConnectionFormData) => void;
  onCancel?: () => void;
}

export interface ReminderTabContentProps {
  onAddReminder?: (data: ReminderFormData) => void;
  onCancel?: () => void;
}
