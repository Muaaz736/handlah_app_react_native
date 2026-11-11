import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';



export type BookMarkNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditBookmark'
>;

// Bookmark type options
export type BookmarkType = 'Link' | 'Document' | 'Notes' | 'Other';


// Represents a single bookmark
export interface IBookmark {
  id: number;
  title: string;
  type: BookmarkType;
  url?: string;
  document?: string;
  notes?: string;
  hasCredentials: boolean;
}


// Props for BookmarksScreen component
export interface IBookmarksScreenProps {
  navigation: NavigationProp<any>;
}

// Props for AddBookmarkScreen component
export interface IAddBookmarkScreenProps {

}

// Props for EditBookmarkScreen component
export interface IEditBookmarkScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<{ EditBookmark: { bookmark: IBookmark; isEdit: boolean } }, 'EditBookmark'>;
}

// Route params for AddBookmarkScreen
export interface IAddBookmarkScreenRouteParams {
  bookmark?: IBookmark;
  isEdit?: boolean;
}


// Route params for EditBookmarkScreen
export interface IEditBookmarkScreenRouteParams {
  bookmark: IBookmark;
  isEdit: boolean;
}

// Bookmark form data
export interface IBookmarkFormData {
  title: string;
  type: BookmarkType;
  url?: string;
  document?: string;
  notes?: string;
  hasCredentials: boolean;
  username?: string;
  password?: string;
}


// Credentials for a bookmark
export interface IBookmarkCredentials {
  username: string;
  password: string;
}

// Theme colors object
export interface IThemeColors {
  primary: string;
  secondary: string;
  lightCGreen: string;
  gradient: string[];
  [key: string]: any;
}

// User role hook return type
export interface IUserRoleHookReturn {
  themeColors: IThemeColors;
  userRole?: string;
}

// Share modal callback type
export type ShareCallback = (shareData: any) => void;

// Delete confirm callback type
export type DeleteCallback = () => void;


// Bookmark type option
export interface ITypeOption {
  label: string;
  value: string |number;
}
