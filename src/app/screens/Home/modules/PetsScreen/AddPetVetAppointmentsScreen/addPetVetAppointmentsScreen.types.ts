import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export interface AddPetVetAppointmentsScreenParams {
  petData?: any;
  isEdit?: boolean;
  fromPetsScreen?: boolean;
}

export interface AddPetVetAppointmentsScreenProps
  extends NativeStackScreenProps<any, 'AddPetVetAppointments'> {}

export type AddPetVetAppointmentsNavigationProp = NativeStackNavigationProp<
  any,
  'AddPetVetAppointments'
>;
