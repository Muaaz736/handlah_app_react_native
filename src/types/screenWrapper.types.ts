import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

/**
 * ScreenWrapper Component Types
 */
export interface ScreenWrapperProps {
  children: ReactNode;
  scrollable?: boolean;
  showShadow?: boolean;
  shadowHeight?: number;
  backgroundColor?: string;
  gradientColors?: string[];
  gradientLocations?: number[];
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarBackground?: string;
  borderRadius?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface ScrollEventData {
  scrollY: number;
  contentHeight: number;
  layoutHeight: number;
}

export interface ShadowConfig {
  minHeight: number;
  maxHeight: number;
  scrollThreshold: number;
}

export type ScreenMode = 'scrollable' | 'static';

export interface GradientConfig {
  colors: string[];
  locations: number[];
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}
