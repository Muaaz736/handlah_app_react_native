/**
 * ViewIllnessModal Component Types
 */
export interface IllnessRecord {
  conditionName?: string;
  alternateName?: string;
  category?: string;
  severity?: string;
  status?: string;
  chronic?: string;
  onsetDate?: string | Date | null;
  diagnosisDate?: string | Date | null;
  resolvedDate?: string | Date | null;
  lastFlareUp?: string | Date | null;
  nextReviewDate?: string | Date | null;
  diagnosingProvider?: string;
  facility?: string;
  icd10Code?: string;
  snomedCode?: string;
  symptoms?: string;
  triggerFactors?: string;
  familyHistory?: string;
  linkedMedication?: string | number;
  linkedDoctor?: string | number;
  linkedAllergies?: string;
  treatmentPlan?: string;
  monitoringFrequency?: string;
  notes?: string;
  photoUrls?: string[];
  photourls?: string[];
  [key: string]: any;
}

export interface ViewIllnessModalProps {
  visible: boolean;
  onClose: () => void;
  illness: IllnessRecord | null;
}
