export interface EditCaregiverFormData {
    name: string;
    relation: string;
    phone: string;
    email: string;
    username: string;
    startDate: string | Date | null;
    endDate: string | Date | null;
}

export interface EditCaregiverProps {
    onEditCaregiver?: (data: EditCaregiverFormData) => void;
}

export interface EditCaregiverRouteParams {
    caregiver?: {
        id?: number;
        childid?: number;
        name?: string;
        relation?: string;
        phonenumber?: string;
        emailaddress?: string;
        startdate?: string;
        enddate?: string;
        startDate?: string;
        endDate?: string;
        handlahusername?: string;
        handlahuserid?: number;
        handlahuser?: {
            id?: number;
            username?: string;
            firstname?: string;
            lastname?: string;
            fullname?: string;
            email?: string;
            phonenumber?: string;
        };
        // Legacy fields for backward compatibility
        phone?: string;
        email?: string;
        username?: string;
    };
}
