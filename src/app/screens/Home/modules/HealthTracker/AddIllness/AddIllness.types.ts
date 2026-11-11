interface DropdownOption {
  label: string;
  value: string;
}

export interface AddIllnessFormData {
  conditionName: string;
  alternateName: string;
  category: string;
  severity: string;
  status: string;
  chronic: string;
  onsetDate: string | Date | null;
  diagnosisDate: string | Date | null;
  resolvedDate: string | Date | null;
  lastFlareUp: string | Date | null;
  nextReviewDate: string | Date | null;
  diagnosingProvider: string;
  facility: string;
  icd10Code: string;
  snomedCode: string;
  symptoms: string;
  triggerFactors: string;
  familyHistory: string;
  linkedMedication: string;
  linkedDoctor: string;
  linkedAllergies: string;
  treatmentPlan: string;
  monitoringFrequency: string;
  notes: string;
  photoUrls: string[];
}

export const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'Acute', value: 'Acute' },
  { label: 'Chronic', value: 'Chronic' },
  { label: 'Recurring', value: 'Recurring' },
  { label: 'Resolved', value: 'Resolved' },
];

export const SEVERITY_OPTIONS: DropdownOption[] = [
  { label: 'Mild', value: 'Mild' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Severe', value: 'Severe' },
  { label: 'Critical', value: 'Critical' },
];

export const STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Monitoring', value: 'Monitoring' },
  { label: 'Resolved', value: 'Resolved' },
];

export const CHRONIC_OPTIONS: DropdownOption[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const PROVIDER_OPTIONS: DropdownOption[] = [
  { label: 'Doctor Hazelwood', value: 'Doctor Hazelwood' },
  { label: 'Doctor Freeman', value: 'Doctor Freeman' },
  { label: 'Doctor Smith', value: 'Doctor Smith' },
];

export const MONITORING_FREQUENCY_OPTIONS: DropdownOption[] = [
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Bi-Weekly', value: 'Bi-Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Yearly', value: 'Yearly' },
];
