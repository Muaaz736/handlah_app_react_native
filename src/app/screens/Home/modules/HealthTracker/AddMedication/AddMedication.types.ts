import { DropdownOption } from "../../../../../../../types/common.types";

export interface AddMedicationFormData {
    medicationName: string;
    typeForm: string;
    dose: string;
    doseUnit: string;
    scheduleType: string;
    times: string;
    interval1: string;
    interval2: string;
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

export interface AddMedicationProps {
    onAddMedication?: (data: AddMedicationFormData) => void;
}

export const TYPE_FORM_OPTIONS: DropdownOption[] = [
    { label: 'Tablet', value: 'Tablet' },
    { label: 'Capsule', value: 'Capsule' },
    { label: 'Liquid', value: 'Liquid' },
    { label: 'Injection', value: 'Injection' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Inhaler', value: 'Inhaler' },
];

export const DOSE_UNIT_OPTIONS: DropdownOption[] = [
    { label: 'Mg', value: 'Mg' },
    { label: 'ML', value: 'ML' },
    { label: 'G', value: 'G' },
    { label: 'Units', value: 'Units' },
];

export const SCHEDULE_TYPE_OPTIONS: DropdownOption[] = [
    { label: 'One Time', value: 'One Time' },
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Every X Days', value: 'Every X Days' },
    { label: 'As Needed', value: 'As Needed' },
    { label: 'With Meals', value: 'With Meals' },
];

export const PRESCRIBER_OPTIONS: DropdownOption[] = [
    { label: 'Doctor Hazelwood', value: 'Doctor Hazelwood' },
    { label: 'Doctor Freeman', value: 'Doctor Freeman' },
    { label: 'Doctor Smith', value: 'Doctor Smith' },
];
