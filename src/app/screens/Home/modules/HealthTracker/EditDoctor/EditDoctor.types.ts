export interface EditDoctorFormData {
    name: string;
    speciality: string;
    npiId: string;
    officeClinic: string;
    phone: string;
    website: string;
    email: string;
    address: string;
}

export interface EditDoctorProps {
    onEditDoctor?: (data: EditDoctorFormData) => void;
}

export interface EditDoctorRouteParams {
    childId: string;
    doctorId: number;
    doctor?: {
        name?: string;
        speciality?: string;
        npiId?: string;
        officeClinic?: string;
        phone?: string;
        website?: string;
        email?: string;
        address?: string;
    };
}
