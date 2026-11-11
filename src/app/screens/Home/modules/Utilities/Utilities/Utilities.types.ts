import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

export type UtilitiesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Utilities'
>;

export interface Utility {
  id: number;
  accountnumber: string;
  averagemonthlyamount: number;
  billingfrequency: string;
  businessid: number | null;
  dueday: number;
  enddate: string;
  startdate: string | null;
  phonenumber: string;
  realestateid: number | null;
  uploadattachments: string;
  userid: number;
  utilitytype: string;
  utilitytypelabel?: string;
  utilitytypeother?: string | null;
  vendor: string;
  website: string;
}

export interface ShareData {
  [key: string]: any;
}

export type FilterType = 'All' | 'By Property' | 'By Type';
