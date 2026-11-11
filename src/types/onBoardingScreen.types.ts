import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './RootStackParamList.types';
import { ImageSourcePropType } from 'react-native';

export type OnBoardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnBoarding'
>;

export interface OnBoardingScreenProps {}

export interface OnBoardingImages {
  rtl: ImageSourcePropType;
  ltr: ImageSourcePropType;
}
