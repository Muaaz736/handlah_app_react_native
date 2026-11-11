import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';

export type PersonalInformationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PersonalInformation'
>;

export type UpdatePersonalInformationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UpdatePersonalInformation'
>;

export type UpdatePersonalInformationRouteProp = RouteProp<
  RootStackParamList,
  'UpdatePersonalInformation'
>;

export interface UserData {
  fullname: string;
  email: string;
  phonenumber: string;
  username?: string;
  profilepicture?: string;
}

export interface FormErrors {
  fullname?: string;
  email?: string;
  phonenumber?: string;
  [key: string]: string | undefined;
}
