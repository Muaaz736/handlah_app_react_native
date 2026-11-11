import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Pet } from '../petsScreen.types';

export interface AddPetScreenParams {
  isEdit?: boolean;
  pet?: Pet | null;
}
export interface PetTypeOption {
  label: string;
  value: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Fish' | 'Other';
}

export interface SexOption {
  label: string;
  value: 'Male' | 'Female';
}

export interface AddPetScreenProps
  extends NativeStackScreenProps<any, 'AddPetScreen'> {}

export type AddPetNavigationProp = NativeStackNavigationProp<
  any,
  'AddPetScreen'
>;
