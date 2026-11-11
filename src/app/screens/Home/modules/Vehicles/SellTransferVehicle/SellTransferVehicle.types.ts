import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../types/RootStackParamList.types';

export type SellTransferVehicleNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VehicleSoldConfirmation'
>;

export interface FormData {
  soldToName: string;
  soldToUsername: string;
  salePrice: string;
  date: string | null;
}

export interface NavigationParams {
  vehicleId?: number;
  soldToUsername?: string;
  date?: string;
  saleRecord?: any;
}
