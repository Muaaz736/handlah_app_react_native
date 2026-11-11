export interface EditAppointmentFormData {
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

export interface EditAppointmentProps {
    onEditAppointment?: (data: EditAppointmentFormData) => void;
}

// Raw API appointment object returned from the server
export interface AppointmentItem {
    id: number;
    childid: number;
    childId?: number;
    appointmentdate?: string;
    appointmentDate?: string;
    appointmenttime?: string;
    appointmentTime?: string;
    location?: string;
    reason?: string;
    outcome?: string;
    nextsteps?: string;
    nextSteps?: string;
    taskduedate?: string;
    taskDueDate?: string;
    doctorid?: number;
    doctorId?: number;
    doctorname?: string;
    doctorName?: string;
    hasreminder?: boolean;
    hasReminder?: boolean;
    photourl?: string;
    photoUrl?: string;
    [key: string]: any;
}

export interface EditAppointmentRouteParams {
    appointment?: AppointmentItem;
}
