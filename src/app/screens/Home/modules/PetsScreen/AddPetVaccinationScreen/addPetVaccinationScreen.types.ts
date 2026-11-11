import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export interface AddPetVaccinationScreenParams {
  petData?: any;
  petId?: number;
  vaccine?: any;
  isEdit?: boolean;
  fromPetsScreen?: boolean;
}

export interface AddPetVaccinationScreenProps
  extends NativeStackScreenProps<any, 'AddPetVaccination'> {}

export type AddPetVaccinationNavigationProp = NativeStackNavigationProp<
  any,
  'AddPetVaccination'
>;
