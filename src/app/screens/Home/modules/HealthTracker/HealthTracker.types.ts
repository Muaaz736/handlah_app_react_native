export interface OverviewData {
    age: string;
    dob: string;
    bloodType: string;
    currentMedication: string;
    keyDiagnosis: string;
    allergies: string;
    recentSurgeries: string;
}

export interface OverviewTag {
    label: string;
}

// Caregiver Types
export interface Caregiver {
    id: number;
    name: string;
    relation: string;
    username: string;
    phone: string;
    email: string;
}

// Medication Types
export interface Medication {
    id: number;
    medicationname: string;
    typeForm: string;
    dose: string;
    doseUnit: string;
    scheduleType: string;
    times: string;
    intervals: string;
    rxNumber: string;
    startDate: string;
    endDate: string;
    refillDate: string;
    prescriber: string;
    prescriberOffice: string;
    pharmacyName: string;
    pharmacyPhone: string;
    pharmacyAddress: string;
    pharmacyWebsite: string;
    sideEffects: string;
}

// Doctor Types
export interface Doctor {
    id: number;
    name: string;
    speciality: string;
    phone: string;
    email: string;
    website: string;
    officeClinic: string;
    address: string;
}

// Appointment Types
export interface Appointment {
    id: number;
    title?: string;
    description?: string;
    startDate?: string;
    appointmentdate?: string;
    appointmentdatetime?: string;
    appointmenttime?: string;
    time?: string;
    doctor?: {
        name: string;
        id?: number;
    };
    doctorid?: number;
    doctorname?: string;
    location?: string;
    reason?: string;
    outcome?: string;
    notes?: string;
    nextsteps?: string;
    tasks?: string;
    taskduedate?: string;
    photourl?: string[];
    hasreminder?: boolean;
    iscompleted?: boolean;
    [key: string]: any;
}

// Illness Types
export interface Illness {
    id: number;
    conditionName?: string;
    name?: string;
    diagnosis?: string;
    severity?: string;
    status?: string;
    diagnosisDate?: string;
    onsetDate?: string;
    notes?: string;
}

// Surgery Types
export interface Surgery {
    id: number;
    procedurename?: string;
    name?: string;
    reason?: string;
    status?: string;
    scheduledDate?: string;
    performedDate?: string;
    notes?: string;
}

// Patient Types
export interface Patient {
    name: string;
    dob: string;
}

// Modal State Types
export interface HealthTrackerModalStates {
    shareModalVisible: boolean;
    deleteModalVisible: boolean;
    viewModalVisible: boolean;
    addChildModalVisible: boolean;
    viewCaregiverModalVisible: boolean;
    viewPatientModalVisible: boolean;
    viewDoctorModalVisible: boolean;
    viewMedicationModalVisible: boolean;
    viewAppointmentModalVisible: boolean;
}

// Collapsible Section States
export interface HealthTrackerCollapsibleStates {
    overviewExpanded: boolean;
    caregiversExpanded: boolean;
    medicationsExpanded: boolean;
    doctorsExpanded: boolean;
    appointmentsExpanded: boolean;
}
