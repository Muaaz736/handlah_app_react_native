/**
 * CustomAddNotesModal Component Types
 */
export interface ConnectionInfo {
  id?: string;
  name?: string;
  [key: string]: any;
  senderuserid?: number;
  receivernotes?: string;
  sendernotes?: string;
  receiveruserid?: number;
}

export interface CustomAddNotesModalProps {
  visible: boolean;
  onClose: () => void;
  connection?: ConnectionInfo;
  onSave: (message: string) => void;
}

export interface NotesFormState {
  message: string;
}
