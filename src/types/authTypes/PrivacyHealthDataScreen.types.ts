import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';

export type PrivacyHealthDataScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PrivacyHealthData'
>;

export interface PrivacyHealthDataScreenProps {}

export interface PrivacySettings {
  healthDataCollection: boolean;
  healthDataSharing: boolean;
  analyticsReporting: boolean;
}

export type PrivacySettingType = 
  | 'healthDataCollection' 
  | 'healthDataSharing' 
  | 'analyticsReporting';

export interface ModalContent {
  title: string;
  description: string;
}

export interface PrivacyHealthDataState {
  healthDataCollection: boolean;
  healthDataSharing: boolean;
  analyticsReporting: boolean;
  loading: boolean;
  modalVisible: boolean;
  modalContent: ModalContent;
  modalType: PrivacySettingType | '';
  consentChecked: boolean;
  isDisableModal: boolean;
}
