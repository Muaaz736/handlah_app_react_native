import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PetType = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Fish' | 'Other';
export type PetSex = 'Male' | 'Female';

export interface Vaccination {
  id: number;
  name: string;
  dateGiven: string;
  nextDate: string;
  photo?: string | null;
}

export interface Medication {
  id: number;
  name: string;
  dose?: string;
  doseUnit?: string;
  schedule?: string;
  sideEffects?: string;
  photo?: string | null;
  times?: string;
  startDate?: string;
  endDate?: string;
}

export interface Appointment {
  id: number;
  clinic: string;
  date: string;
  time?: string;
  reason: string;
  outcome?: string;
  nextSteps?: string;
  notes?: string;
  photo?: string | null;
}

export interface Illness {
  id: number;
  name?: string;
  date: string;
  diagnosis: string;
  treatment?: string;
  treatments?: string;
  notes?: string;
  photourl?: string;
  photo?: string | null;
}

export interface Pet {
  id: number;
  name: string;
  type: PetType | null;
  breed: string;
  sex: PetSex | null;
  birthday: string;
  adoptionDate: string;
  food?: string;
  allergies?: string;
  microchipped?: boolean;
  registeredOn?: string;
  renewalDate?: string;
  issuingAuthority?: string;
  photo: string | null;
  vaccinations?: Vaccination[];
  medications?: Medication[];
  appointments?: Appointment[];
  illnesses?: Illness[];
  chipNumber?: string;
  homeAgain?: string;
  registrationId?: string;
}

export interface PetsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}
