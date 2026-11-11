import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export interface DoseUnit {
  label: string;
  value: 'Mg' | 'g' | 'ml' | 'mcg';
}

export interface ScheduleType {
  label: string;
  value: 'One Time' | 'Daily' | 'Weekly' | 'Monthly' | 'Every X Days' | 'As Needed' | 'With Meals';
}

export interface AddPetMedicationScreenParams {
  petData?: any;
  isEdit?: boolean;
  fromPetsScreen?: boolean;
}

export interface AddPetMedicationScreenProps
  extends NativeStackScreenProps<any, 'AddPetMedication'> {}

export type AddPetMedicationNavigationProp = NativeStackNavigationProp<
  any,
  'AddPetMedication'
>;
