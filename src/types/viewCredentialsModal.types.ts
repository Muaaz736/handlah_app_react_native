/**
 * ViewCredentialsModal Component Types
 */
export interface Credentials {
  email?: string;
  password?: string;
  [key: string]: any;
}

export interface ViewCredentialsModalProps {
  visible: boolean;
  onClose: () => void;
  credentials?: Credentials | null;
}

export interface CredentialsDisplay {
  email: string;
  password: string;
}
