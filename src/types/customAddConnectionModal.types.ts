import { DropdownOption } from './common.types';

/**
 * CustomAddConnectionModal Component Types
 */
export interface ConnectionFormData {
  toUserId: number | string;
  connectionTypeId: number | string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  isEmergencyContact: boolean;
}

export interface ConnectionFormDataWithType extends ConnectionFormData {
  connectionType: string;
}

export interface CustomAddConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  categoryList: DropdownOption[];
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

export type ConnectionType = 'personal' | 'business' | 'family' | 'other';
