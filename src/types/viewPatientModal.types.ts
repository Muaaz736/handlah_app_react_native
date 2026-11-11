/**
 * ViewPatientModal Component Types
 */
export interface Patient {
  name?: string;
  dob?: string;
  [key: string]: any;
}

export interface ViewPatientModalProps {
  visible: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export interface PatientInfo {
  name: string;
  dob?: string;
}

export type PatientRelation = 'self' | 'child' | 'dependent' | 'other';
