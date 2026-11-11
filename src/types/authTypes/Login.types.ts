import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export interface LoginFormData {
  email: string;
  password: string;
}

export type LoginFormField = keyof LoginFormData;

// types/user.types.ts

export interface Country {
  id: number;
  countryName: string;
}

export interface State {
  id: number;
  description: string;
  countryId: number;
  country: Country;
}

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  isactive: boolean;
  createdon: string;
  updatedon: string;
  twoauthenabled: boolean;
  isusersetupcomplete: boolean;
  countrycode: string;
  isadmin: boolean;
  issmsactive: boolean;
  isemailverified: boolean;
  isphoneverified: boolean;
  hassubscription: boolean;
  dateofbirth: string;
  fullname: string;
  profilepicture: string;
  address1: string;
  city: string;
  stateid: number;
  zipcode: string;
  pincode: string;
  state: State;
  healthdatacollection: boolean;
  healthdatasharing: boolean;
  analyticsandcrashreporting: boolean;
}
