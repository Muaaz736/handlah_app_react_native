interface DropdownOption {
  label: string;
  value: string;
}

export interface AddSurgeryFormData {
  procedureName: string;
  reason: string;
  bodySite: string;
  status: string;

  scheduledDate: string | Date | null;
  performedDate: string | Date | null;
  admissionType: string;
  patientType: string;
  dischargeDate: string | Date | null;
  followUpDate: string | Date | null;

  surgeonProvider: string;
  assistingProviders: string;
  facility: string;
  department: string;

  cptCode: string;
  hcpcsCode: string;
  icd10pcsCode: string;
  outcomeStatus: string;
  linkedDiagnosis: string;
  complications: string;
  pathologySummary: string;
  linkedMedication: string;
  linkedDoctor: string;
  recoveryNotes: string;
  restrictions: string;
  rehabRequired: string;
  followUpProvider: string;
  notes: string;
  photoUrls: string[];
}

export const SURGERY_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Pending', value: 'Pending' },
];

export const ADMISSION_TYPE_OPTIONS: DropdownOption[] = [
  { label: 'Emergency', value: 'Emergency' },
  { label: 'Elective', value: 'Elective' },
  { label: 'Urgent', value: 'Urgent' },
  { label: 'Planned', value: 'Planned' },
];

export const PATIENT_TYPE_OPTIONS: DropdownOption[] = [
  { label: 'Inpatient', value: 'Inpatient' },
  { label: 'Outpatient', value: 'Outpatient' },
  { label: 'Day Surgery', value: 'Day Surgery' },
];

export const OUTCOME_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Recovered', value: 'Recovered' },
  { label: 'Improving', value: 'Improving' },
  { label: 'Stable', value: 'Stable' },
  { label: 'Complicated', value: 'Complicated' },
];

export const REHAB_REQUIRED_OPTIONS: DropdownOption[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const SURGEON_OPTIONS: DropdownOption[] = [
  { label: 'Dr. Adam Lawe', value: 'Dr. Adam Lawe' },
  { label: 'Doctor Hazelwood', value: 'Doctor Hazelwood' },
  { label: 'Doctor Freeman', value: 'Doctor Freeman' },
  { label: 'Doctor Smith', value: 'Doctor Smith' },
];
