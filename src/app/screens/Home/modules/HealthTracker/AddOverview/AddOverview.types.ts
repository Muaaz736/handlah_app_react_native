import { DropdownOption } from "../../../../../../../types/common.types";

export interface AddOverviewFormData {
    bloodType: string;
    keyDiagnosis: string;
    allergies: string;
    recentSurgeries: string;
}

export interface AddOverviewProps {
    onAddOverview?: (data: AddOverviewFormData) => void;
}

export const BLOOD_TYPE_OPTIONS: DropdownOption[] = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
];
