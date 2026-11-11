export interface EditMedicationFormData {
    medicationName: string;
    typeForm: string;
    dose: string;
    doseUnit: string;
    scheduleType: string;
    times: string;
    intervalFrequency: string;
    intervalDate: string;
    startDate: string | null;
    endDate: string | null;
    rxNumber: string;
    refillDate: string | null;
    prescriber: string;
    prescriberOffice: string;
    pharmacyName: string;
    pharmacyPhone: string;
    pharmacyAddress: string;
    sideEffects: string;
    reminderEnabled: boolean;
    uploadedPhoto: any;
}

export interface EditMedicationProps {
    onEditMedication?: (data: EditMedicationFormData) => void;
}

export interface EditMedicationRouteParams {
    childId?: string;
    medication?: {
        id?: number;
        childid?: number;
        medicationname?: string;
        medicationtype?: string;
        dosage?: string;
        doseunit?: string;
        instructions?: string;
        frequency?: string;
        scheduletype?: string;
        specifictimes?: string;
        intervals?: string;
        intervalfrequency?: string;
        intervaldate?: string;
        startdate?: string;
        enddate?: string;
        prescriptionnumber?: string;
        refilldate?: string;
        prescribedby?: string;
        prescriberoffice?: string;
        pharmacyname?: string;
        pharmacyphone?: string;
        pharmacyaddress?: string;
        notes?: string;
        sideeffects?: string;
        prescribedbydoctorid?: string;
        hasreminders?: boolean;
        photourl?: string;
        // Legacy field names for compatibility
        name?: string;
        typeForm?: string;
        dose?: string;
        doseUnit?: string;
        scheduleType?: string;
        times?: string;
        intervalFrequency?: string;
        intervalDate?: string;
        startDate?: string;
        endDate?: string;
        rxNumber?: string;
        refillDate?: string;
        prescriber?: string;
        prescriberOffice?: string;
        pharmacyName?: string;
        pharmacyPhone?: string;
        pharmacyAddress?: string;
        sideEffects?: string;
        reminderEnabled?: boolean;
        uploadedPhoto?: any;
    };
}
