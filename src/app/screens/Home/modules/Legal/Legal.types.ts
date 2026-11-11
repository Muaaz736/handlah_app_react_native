import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../../types/RootStackParamList.types';


export type LegalNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddLegalDocument'
>;

// Legal Document Interface
export interface LegalDocument {
  id: number | string;
  title: string;
  type: 'Contract' | 'Agreement' | 'License' | 'Certificate' | 'Will' | 'Deed';
  effectiveDate: string;
  expireDate: string;
  file: string;
  notes?: string;
}

export interface LegalDocumentFormData {
  title: string;
  type: DocumentType;
  effectiveDate: string;
  expireDate: string;
  notes: string;
  document: DocumentFile | null;
}


export interface LegalScreenState {
  documents: LegalDocument[];
  shareModalVisible: boolean;
  deleteModalVisible: boolean;
  selectedDocument: LegalDocument | null;
}

// Add Legal Document Screen Props
export interface AddLegalDocumentScreenProps {
  navigation: NativeStackNavigationProp<any, 'AddLegalDocument'>;
  route: RouteProp<any, 'AddLegalDocument'>;
}

export interface AddLegalDocumentScreenParams {
  document?: LegalDocument;
  isEdit?: boolean;
}

export interface AddLegalDocumentScreenState {
  title: string;
  type: 'Contract' | 'Agreement' | 'License' | 'Certificate' | 'Will' | 'Deed';
  effectiveDate: string;
  expireDate: string;
  notes: string;
  document: File | null;
}

export type DocumentType =
  | 'Contract'
  | 'Agreement'
  | 'License'
  | 'Certificate'
  | 'Will'
  | 'Deed';

export interface ShareData {
  method?: string;
  title?: string;
}

export interface DocumentFile {
  uri: string;
  name: string;
  type: string;
}
