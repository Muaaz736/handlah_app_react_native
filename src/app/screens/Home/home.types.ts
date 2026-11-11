import { NavigationProp } from '@react-navigation/native';
import { ImageSourcePropType, View } from 'react-native';
import { RoleTheme } from '../../../types/roleManager.types';

export interface IHomeNavigationItem {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  icon?: ImageSourcePropType;
  screenRoute: string;
  count?: number;
}

export interface IFavoritesSectionProps {
  data: IHomeNavigationItem[];
  onManagePress: () => void;
  title: string;
  onFavoritePress?: (item: IHomeNavigationItem) => void;
  /** Shown over the background photo: white heading and Manage button. */
  onPhoto?: boolean;
}

export interface IListSectionProps {
  title: string;
  data: IHomeNavigationItem[];
  onItemPress: (item: IHomeNavigationItem) => void;
  // Optional ref attached to the first list item's container, used for tutorial measurement.
  firstItemRef?: React.RefObject<View | null>;
  theme: RoleTheme;
}

export interface IFlatListRenderItemProps {
  item: IHomeNavigationItem;
  index: number;
}

export interface IHomeScreenProps {
  navigation?: NavigationProp<any>;
}

export interface IHomeScreenState {
  searchValue: string;
}

export interface IThemeColors {
  primary: string;
  secondary: string;
  text: string;
  [key: string]: string;
}

export interface IUserRoleHookReturn {
  themeColors: IThemeColors;
  userRole?: string;
}
