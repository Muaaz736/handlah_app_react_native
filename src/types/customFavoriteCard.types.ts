import type { ImageSourcePropType, StyleProp, ViewStyle, TextStyle } from 'react-native';

/**
 * CustomFavoriteCard Component Types
 */
export interface FavoriteItem {
  id: string;
  titleKey: string;
  icon: ImageSourcePropType;
  route?: string;
  [key: string]: any;
}

export interface CustomFavoriteCardProps {
  item: FavoriteItem;
  onPress?: (item: FavoriteItem) => void;
  containerStyle?: StyleProp<ViewStyle>;
  isDragCard?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  showCloseBtn?: boolean;
  onClosePress?: (item: FavoriteItem) => void;
  count?: number;
  accentColor?: string;
}

export type FavoriteCardSize = 'small' | 'medium' | 'large';

export interface FavoriteCardDimensions {
  width: number;
  height: number;
  iconSize: number;
  fontSize: number;
}
