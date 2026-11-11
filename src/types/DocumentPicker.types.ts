import { ViewStyle, TextStyle } from 'react-native';
import { DocumentPickerResponse } from '@react-native-documents/picker';

export interface DocumentData {
  uri: string;
  name: string;
  type: string;
  size?: number|null;
}

export interface UploadedDocumentResult {
  id: string | number;
  url: string;
}

export type UploadType = 'box' | 'placeholder' | 'button';
export type IconType = 'fontawesome' | 'ionicons' | 'material';

export interface DocumentPickerProps {
  documentData?: DocumentData | null;
  onDocumentSelect?: (document: DocumentData) => void;
  onDocumentUploaded?: (result: UploadedDocumentResult) => void;
  label?: string;
  placeholder?: string;
  uploadType?: UploadType;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  allowedTypes?: string[];
  iconType?: IconType;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
  showFileName?: boolean;
  showFileSize?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  alertTitle?: string;
  alertMessage?: string;
  autoUpload?: boolean;
  allowMultiple?: boolean;
  multiple?: boolean;
  maxDocuments?: number;
  documentIds?: string[];
  onDocumentIdsChange?: (ids: string[]) => void;
}
