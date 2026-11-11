/**
 * ViewCaregiverModal Component Types
 */
export interface Caregiver {
  name?: string;
  username?: string;
  relation?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

export interface ViewCaregiverModalProps {
  visible: boolean;
  onClose: () => void;
  caregiver: Caregiver | null;
}

export interface CaregiverContact {
  phone?: string;
  email?: string;
}

export type CaregiverRelation = 'family' | 'professional' | 'friend' | 'other';
