import type {
  ColorPalette,
  HexToRgbaFunction,
  GetColorWithOpacityFunction,
} from '../types/colors.types';

/**
 * Color Constants
 * Centralized color palette for the application
 */

const colors: ColorPalette = {
  // Primary Colors
  primary: '#16A34A',
  secondary: '#0F610D',

  // Grayscale
  white: '#ffffff',
  black: '#000000',
  gray: '#999999',
  lightGray: '#f5f5f5',
  darkGray: '#666666',

  // UI Colors
  background: '#ffffff',
  border: '#E8E8E8',
  placeholder: '#B8B8B8',
  text: '#1a1a1a',
  textSecondary: '#666',
  description: '#737373',

  // Status Colors
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Additional Colors
  link: '#4CAF50',
  transparent: 'transparent',

  // Green Shades
  green: '#4CAF50',
  lightGreen: '#a5d6a7',
  lightCGreen: '#D8F0BD',
  darkGreen: '#76B52E',

  // Blue Shades
  blue: '#2196F3',
  lightBlue: '#e3f2fd',
  darkBlue: '#1976D2',

  // Business Role Colors
  businessPrimary: '#266cb1',
  businessSecondary: '#0D2F61',
  businessDarkGreen: '#2E5FB5',
  businessLightCGreen: '#BDD8F0',
  businessText: '#ffff',

  // Purple Shades
  purple: '#9C27B0',
  lightPurple: '#f3e5f5',

  // Orange/Amber
  orange: '#FF9800',
  amber: '#FFC107',

  // Backgrounds
  backgroundLight: '#F1F1F1',
  backgroundDark: '#f0f0f0',

  // Shadows
  shadow: '#000000',
};

// Color utility functions
export const hexToRgba: HexToRgbaFunction = (hex, alpha = 1) => {
  // Remove # if present
  let cleanHex = hex.replace('#', '');

  // Handle 3-character hex codes
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char: string) => char + char)
      .join('');
  }

  const r: number = parseInt(cleanHex.substr(0, 2), 16);
  const g: number = parseInt(cleanHex.substr(2, 2), 16);
  const b: number = parseInt(cleanHex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getColorWithOpacity: GetColorWithOpacityFunction = (color, opacity = 1) => {
  if (typeof color !== 'string') return color;

  // If it's already rgba, return as is
  if (color.startsWith('rgba')) return color;

  // If it's hex, convert to rgba
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity);
  }

  // If it's a color key, try to get from colors
  const colorValue: string = color;
  return colorValue.startsWith('#')
    ? hexToRgba(colorValue, opacity)
    : colorValue;
};

export default colors;
