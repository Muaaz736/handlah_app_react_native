import type { ImageSourcePropType, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ReactNode } from 'react';

/**
 * CustomListItemCard Component Types
 */
export interface ListItem {
  icon: ImageSourcePropType;
  titleKey: string;
  subtitleKey?: string;
  route?: string;
  count?: number;
  [key: string]: any;
}

export interface CustomListItemCardProps {
  item: ListItem;
  onPress?: (item: ListItem) => void;
  showRightIcon?: boolean;
  rightIcon?: ReactNode;
  rightIconName?: string;
  rightIconSize?: number;
  rightIconColor?: string;
  onRightIconPress?: ((item: ListItem) => void) | null;
  containerStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  isLast?: boolean;
  count?: number;
  accentColor?: string;
}

export interface ListItemBadge {
  text: string | number;
  color?: string;
  backgroundColor?: string;
}

export type ListItemVariant = 'default' | 'compact' | 'detailed';

export interface ListItemContent {
  title: string;
  subtitle?: string;
  description?: string;
}
