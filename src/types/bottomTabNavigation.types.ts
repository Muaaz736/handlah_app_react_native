import type { ImageSourcePropType, TextStyle, ImageStyle } from 'react-native';

/**
 * Bottom Tab Navigation Types
 */

/**
 * Tab bar label props
 */
export interface TabBarLabelProps {
  focused: boolean;
  color: string;
  position: 'beside-icon' | 'below-icon';
}

/**
 * Tab bar icon props
 */
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

/**
 * Tab bar label style type
 */
export type TabBarLabelStyle = TextStyle;

/**
 * Tab bar icon style type
 */
export type TabBarIconStyle = ImageStyle;
