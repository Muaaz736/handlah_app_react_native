/**
 * ViewDoctorModal Component Types
 */
export interface Doctor {
  name?: string;
  speciality?: string;
  npiId?: string;
  phone?: string;
  email?: string;
  website?: string;
  officeClinic?: string;
  address?: string;
  [key: string]: any;
}

export interface ViewDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

export interface DoctorContact {
  phone?: string;
  email?: string;
  website?: string;
}

export type DoctorSpeciality = string;
