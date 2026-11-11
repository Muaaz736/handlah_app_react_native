import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/RootStackParamList.types";

type ConnectionsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConnectionUserDetails'
>;

export interface Connection {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  categoryColor?: string;
  isSharedAccess?: boolean;
  isEmergencyContact?: boolean;
  [key: string]: any;
}

export interface ConnectionTab {
  label: string;
  value: string;
  icon?: string;
}

export interface ConnectionsNavigationProps {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}
