import type { ReactNode, ComponentType } from 'react';
import type {
  ViewStyle,
  TextStyle,
  ImageStyle,
  ImageSourcePropType,
  StyleProp,
  TextInputProps,
} from 'react-native';

/**
 * AuthHeader Component Types
 */
export interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  backButtonIconStyle?: StyleProp<ImageStyle>;
}

/**
 * PrimaryButton Component Types
 */
export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'transparent';
  icon?: ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * CustomInput Component Types
 */
export interface CustomInputProps
  extends Omit<TextInputProps, 'onChange' | 'onChangeText'> {
  ref?: React.Ref<any>;
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: ImageSourcePropType;
  endIcon?: ReactNode;
  onEndIconPress?: () => void;
  password?: boolean;
  error?: string | boolean;
  inputStyle?: StyleProp<TextStyle>;
  startIconStyle?: StyleProp<ImageStyle>;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  multiline?: boolean;
}

/**
 * CustomCheckbox Component Types
 */
export interface LabelPart {
  text: string;
  link?: boolean;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
}

export interface CustomCheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  labelParts?: LabelPart[];
  labelStyle?: StyleProp<TextStyle>;
  labelContainerStyle?: StyleProp<ViewStyle>;
  linkStyle?: StyleProp<TextStyle>;
  activeBgColorStyle?: StyleProp<ViewStyle>;
}

/**
 * SocialButton Component Types
 */
export type SocialIconType = 'google' | 'apple';

export interface SocialButtonProps {
  title: string;
  icon: SocialIconType;
  iconSource?: ImageSourcePropType;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
}

/**
 * TextLink Component Types
 */
export interface TextLinkProps {
  text?: string;
  linkText?: string;
  onPress: () => void;
  disabled?: boolean;
  textStyle?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
}

/**
 * CustomDropDown Component Types
 */
export interface DropdownOption<T = string> {
  label: string;
  value: T;
  isNew?: boolean;
  originalText?: string;
  /** Group heading the option is listed under (single-select only); search matches it too. */
  group?: string;
  /** A group heading row (made by CustomDropDown, not selectable). */
  isHeader?: boolean;
}

export interface CustomDropDownProps<T = string> {
  options: DropdownOption<T>[];
  onSelect: (value: T | T[] | null) => void;
  value?: T | T[] | null;
  leftIcon?: boolean | ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  style?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  selectedTextProps?: import('react-native').TextProps;
  inputSearchStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  showArrow?: boolean;
  handleFocus?: () => void;
  handleBlur?: () => void;
  error?: boolean;
  search?: boolean;
  maxHeight?: number;
  renderItem?: (item: DropdownOption<T>) => ReactNode;
  allowAddNew?: boolean;
  onAddNew?: (text: string) => void;
  addNewText?: string;
  multiSelect?: boolean;
  selectedItems?: T[];
  dropdownPosition?: 'auto' | 'top' | 'bottom';
}

/**
 * ImageUploader Component Types
 */
export interface ImageAsset {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  base64?: string;
}

export interface ImageUploaderProps {
  imageUri?: string;
  onImageSelect: (image: ImageAsset) => void;
  onImageUploaded?: (response: any) => void;
  label?: string;
  placeholder?: string;
  uploadType?: 'box' | 'placeholder' | 'button';
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  imageQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
  iconType?: 'fontawesome' | 'ionicons' | 'material';
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
  showFileName?: boolean;
  loading?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  alertTitle?: string;
  alertMessage?: string;
  cameraButtonText?: string;
  galleryButtonText?: string;
  autoUpload?: boolean;
  imageIds?: string[];
  multiple?: boolean;
  maxImages?: number;
  /** Single image only: the id of an image already uploaded, shown until a new one is chosen. */
  imageId?: string;
  /** 'circle' draws the empty state and the chosen picture as a circle (used for profile pictures). */
  shape?: 'default' | 'circle';
  /** Diameter of the circle when shape is 'circle'. */
  circleSize?: number;
}

/**
 * ShareModal Component Types
 */
export interface SharePermission {
  userId: string;
  permission: 'view' | 'edit';
}

export interface AlreadySharedItem {
  userId: string;
  permission?: 'view' | 'edit';
}

export interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (shareData: any) => void;
  title?: string;
  alreadySharedWith?: AlreadySharedItem[];
  userOptions?: DropdownOption[];
  loading?: boolean;
  resourceType?: string;
  resourceId?: string | number | null;
  businessId?: string | number | null;
}

/**
 * DeleteConfirmModal Component Types
 */
export interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

/**
 * SelectBusinessModal Component Types
 */
export interface SelectBusinessOption {
  label: string;
  value: string | number;
}

export interface SelectBusinessModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (businessId: number) => void;
  businesses: SelectBusinessOption[];
  title?: string;
  message?: string;
}

/**
 * ViewVehicleModal Component Types
 */
export interface Vehicle {
  image?: string;
  [key: string]: any;
}

export interface ViewVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  vehicle?: any;
  isLoading?: boolean;
  actionable?: boolean;
  accessLevel?: string;
  ownerUserId?: number;
  shareParams?: any;
  canDelete?: boolean;
}

/**
 * ViewBankAccountModal Component Types
 */
export interface BankAccount {
  [key: string]: any;
}

export interface ViewBankAccountModalProps {
  visible: boolean;
  onClose: () => void;
  account?: any;
}

/**
 * CustomDateTimePicker Component Types
 */
export interface CustomDateTimePickerProps {
  placeholder?: string;
  value?: Date | string | null;
  onChange?: (date: Date | string | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  is24Hour?: boolean;
  disabled?: boolean;
  confirmText?: string;
  cancelText?: string;
  returnISO?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  displayFormat?: string;
  clearable?: boolean;
}

export interface CustomDateTimePickerRef {
  getDate: () => Date | null;
  getISOString: () => string | null;
  getFormattedDate: (format?: string) => string | null;
  setDate: (date: Date | string) => void;
  clearDate: () => void;
  openPicker: () => void;
}

/**
 * CustomTabs Component Types
 */
export interface TabItem {
  label: string;
  icon?: ReactNode | ImageSourcePropType;
}

export interface CustomTabsProps {
  tabs: TabItem[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  activeIconStyle?: StyleProp<ImageStyle>;
  showIcons?: boolean;
  iconSize?: number;
}

/**
 * CustomScrollableTabs Component Types
 */
export interface CustomScrollableTabsProps {
  tabs: TabItem[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  onViewAllPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  innerTabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  viewAllLabel?: string;
  showViewAll?: boolean;
}

/**
 * CustomFloatingActionButton Component Types
 */
export interface CustomFloatingActionButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  shadow?: boolean;
  animated?: boolean;
  customIcon?: () => ReactNode;
  rightAligned?: boolean;
}

/**
 * CustomBottomSheet Component Types
 */
export interface CustomBottomSheetProps {
  snapPoints?: string[];
  children: ReactNode;
  onSheetChanges?: (index: number) => void;
  enablePanDownToClose?: boolean;
  backgroundStyle?: StyleProp<ViewStyle>;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  index?: number;
  enableBackdrop?: boolean;
  backdropOpacity?: number;
  backdropPressBehavior?: 'none' | 'close' | 'collapse';
  enableDynamicSizing?: boolean;
  keyboardBehavior?: 'interactive' | 'fillParent' | 'extend';
  keyboardBlurBehavior?: 'none' | 'restore';
  android_keyboardInputMode?: 'adjustResize' | 'adjustPan';
}

export interface CustomBottomSheetRef {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  forceClose: () => void;
}

/**
 * AddFolderModal Component Types
 */
export interface EditFolder {
  id?: number;
  name?: string;
  folderName?: string;
  [key: string]: any;
}

export interface ComplianceFolderFormData {
  folderName: string;
}

export interface AddFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (folderData: ComplianceFolderFormData) => void;
  editFolder?: EditFolder | null;
  isLoading?: boolean;
}

/**
 * CustomToast Component Types
 */
export interface CustomToastContentProps {
  text1: string;
  text2?: string;
  iconName: string;
  iconBgColor: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'reminder';

/**
 * CustomSeparator Component Types
 */
export interface CustomSeparatorProps {
  style?: StyleProp<ViewStyle>;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  length?: number | string;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}
