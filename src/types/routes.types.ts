import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { SCREEN_TYPES } from '../utils/staticData';

// Type for Screen Types
export type ScreenType = (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];

/**
 * Bottom Tab Screen Configuration
 */
export interface BottomTabScreen {
  name: string;
  component: ComponentType<any>;
  icon: ImageSourcePropType;
  label: string;
}

/**
 * Stack Screen Configuration
 */
export interface StackScreen {
  name: string;
  component: ComponentType<any>;
  header_shown: boolean;
  screen_types: ScreenType;
}

/**
 * Screen configuration arrays
 */
export type BottomTabScreens = BottomTabScreen[];
export type StackScreens = StackScreen[];

// Type for Route Names
export type RouteNames =
  | 'OnBoarding'
  | 'NewOnboarding'
  | 'Login'
  | 'OtpVerification'
  | 'MfaVerification'
  | 'VerifyPhoneNumber'
  | 'SetupIdentityHub'
  | 'Dashboard';
