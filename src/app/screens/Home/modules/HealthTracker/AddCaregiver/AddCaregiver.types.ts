export interface AddCaregiverFormData {
    name: string;
    relation: string;
    phone: string;
    email: string;
    username: string;
    startDate: string | Date | null;
    endDate: string | Date | null;
}

export interface AddCaregiverProps {
    onAddCaregiver?: (data: AddCaregiverFormData) => void;
}
