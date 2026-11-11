/**
 * AddCredentialsModal Component Types
 */
export interface CredentialsData {
  username: string;
  password: string;
}

export interface AddCredentialsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (credentials: CredentialsData) => void;
  initialUsername?: string;
  initialPassword?: string;
  /** When true (editing existing credentials), the username field is masked like password. */
  isEditMode?: boolean;
}

export interface CredentialsFormState {
  username: string;
  password: string;
}
