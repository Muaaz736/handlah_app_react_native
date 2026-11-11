/**
 * ViewMedicationModal Component Types
 */
export interface Medication {
  name?: string;
  typeForm?: string;
  dose?: string;
  doseUnit?: string;
  scheduleType?: string;
  times?: string;
  intervals?: string;
  rxNumber?: string;
  startDate?: string;
  endDate?: string;
  refillDate?: string;
  prescriber?: string;
  prescriberOffice?: string;
  pharmacyName?: string;
  pharmacyPhone?: string;
  pharmacyAddress?: string;
  pharmacyWebsite?: string;
  sideEffects?: string;
  [key: string]: any;
}

export interface ViewMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  medication: Medication | null;
  doctors?: { id?: number | string; name?: string; [key: string]: any }[];
}

export interface MedicationSchedule {
  scheduleType?: string;
  times?: string;
  intervals?: string;
}

export interface PharmacyInfo {
  name?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export type MedicationFormType = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical';
