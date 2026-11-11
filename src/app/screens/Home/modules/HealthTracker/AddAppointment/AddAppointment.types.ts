import { DropdownOption } from "../../../../../../../types/common.types";

export interface AddAppointmentFormData {
  startDate: string | null;
  time: string | null;
  selectDoctor: string;
  location: string;
  reason: string;
  outcome: string;
  reminderEnabled: boolean;
  uploadedPhoto: any;
  task: string;
  dueDate: string | null;
}

export interface AddAppointmentProps {
  onAddAppointment?: (data: AddAppointmentFormData) => void;
}

export const DOCTOR_OPTIONS: DropdownOption[] = [
  { label: 'Doctor Hazelwood', value: 'Doctor Hazelwood' },
  { label: 'Doctor Freeman', value: 'Doctor Freeman' },
  { label: 'Doctor Smith', value: 'Doctor Smith' },
];

export interface AppointmentData {
  startDate: string | Date | null;
  time: string | Date | null;
  selectDoctor: string;
  location: string;
  reason: string;
  outcome: string;
  reminderEnabled: boolean;
  uploadedPhoto: string | null;
  task: string;
  dueDate: string | Date | null;
}
