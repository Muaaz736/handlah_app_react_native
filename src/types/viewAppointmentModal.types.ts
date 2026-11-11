/**
 * ViewAppointmentModal Component Types
 */
export interface Appointment {
  id?: number;
  title?: string;
  description?: string;
  doctorName?: string;
  doctorname?: string;
  doctor?: { name?: string; [key: string]: any };
  date?: string;
  appointmentdate?: string;
  appointmenttime?: string;
  time?: string;
  location?: string;
  reason?: string;
  outcome?: string;
  notes?: string;
  nextsteps?: string;
  tasks?: string;
  taskduedate?: string;
  photourl?: string[];
  [key: string]: any;
}

export interface ViewAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export interface AppointmentDetails {
  doctorName?: string;
  date?: string;
  time?: string;
  location?: string;
  address?: string;
  reason?: string;
  outcome?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
