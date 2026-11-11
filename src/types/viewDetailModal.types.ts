export interface DetailRow {
  label: string;
  value: string;

  // When true, the value is masked (like a password) with an eye toggle to reveal it.
  secret?: boolean;
}

export interface DetailRowPair {
  left: DetailRow;
  right?: DetailRow;
}

export interface DetailSection {
  title: string;

  content?: string;

  rows?: DetailRow[];
}

export interface DetailModalData {
  title: string;

  /** The record shown, for the Details / Linked records tabs ("utility", 12…). */
  linkRecord?: { moduleKey: string; id: number } | null;

  subtitle?: string;

  badge?: string;

  imageId?: string | string[];
  imageIds?: string[];

  rows: DetailRowPair[];

  sections?: DetailSection[];

  url?: string;

  documentId?: string | string[];

  documentName?: string;

  additionalAttachments?: string[];
}

export interface ViewDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: DetailModalData | null;
  isLoading?: boolean;
  onViewCredentials?: () => void;
  onRemoveFromWallet?: () => void;
  removeFromWalletLoading?: boolean;
}
