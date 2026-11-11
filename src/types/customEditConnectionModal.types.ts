/**
 * CustomEditPermissionAccessModal Component Types
 */
export interface EditConnectionFormData {
  username: string;
  category: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  isEmergencyContact: boolean;
}

export interface EditConnectionFormDataWithType extends EditConnectionFormData {
  connectionType: string;
}

export interface CustomEditPermissionAccessModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  existingData?: Partial<EditConnectionFormData> & {
    connectionId?: string | number;
    toUserId?: number;
    connectionTypeId?: number | string;
    targetAccountType?: string;
    senderbusinessids?: number[] | null;
    /** Business id → the other person's current role on it. */
    businessroles?: Record<string, 'standard' | 'owner_admin'> | null;
    socialnetworkids?: number[] | null;
  };
  categoryList?: Array<{ label: string; value: string }>;
}

export interface EditSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

export type EditConnectionType = 'personal' | 'business' | 'family' | 'other';
