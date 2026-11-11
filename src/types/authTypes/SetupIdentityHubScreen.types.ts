import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../RootStackParamList.types';
import { Asset } from 'react-native-image-picker';

export type SetupIdentityHubScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SetupIdentityHub'
>;

export interface SetupIdentityHubScreenProps {}

export interface CameraResponse {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: Asset[];
}

export interface CameraOptions {
  mediaType: 'photo' | 'video' | 'mixed';
  quality: number;
  saveToPhotos: boolean;
}
