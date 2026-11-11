export interface AddDoctorFormData {
    name: string;
    speciality: string;
    npiId: string;
    officeClinic: string;
    phone: string;
    website: string;
    email: string;
    address: string;
}

export interface AddDoctorProps {
    onAddDoctor?: (data: AddDoctorFormData) => void;
}
