import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Appointment,
  Illness,
  Medication,
  Pet,
  Vaccination,
} from '../petsScreen.types';

// Navigation Param List
export type RootStackParamList = {
  Pets: undefined;
  AddPet: { pet?: Pet; isEdit?: boolean } | undefined;
  AddPetIllnessScreen:
    | { petData?: Pet; petId?: number; illness?: Illness; isEdit?: boolean; fromPetsScreen?: boolean }
    | undefined;
  AddPetVaccination: {
    petId: number;
    vaccine?: Vaccination;
    isEdit?: boolean;
    fromPetsScreen?: boolean;
  };
  AddPetMedication: {
    petId: number;
    medication?: Medication;
    isEdit?: boolean;
    fromPetsScreen?: boolean;
  };
  AddPetAppointment: {
    petId: number;
    appointment?: Appointment;
    isEdit?: boolean;
    fromPetsScreen?: boolean;
  };
  AddPetIllness: {
    petId: number;
    illness?: Illness;
    isEdit?: boolean;
    fromPetsScreen?: boolean;
  };
};

// Props Helpers
export type PetsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Pets'
>;
export type AddPetIllnessProps = NativeStackScreenProps<
  RootStackParamList,
  'AddPetIllnessScreen'
>;
