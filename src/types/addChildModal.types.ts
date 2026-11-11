/**
 * AddChildModal Component Types
 */
export interface ChildData {
  name: string;
  dob: Date | string | null;
  endDate?: Date | string | null;
}

export interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd?: (child: ChildData) => void;
  isMyself?: boolean;
}

export interface ChildFormState {
  childName: string;
  dob: Date | string | null;
}
