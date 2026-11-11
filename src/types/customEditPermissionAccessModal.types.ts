export interface PermissionData {
  view: boolean;
  edit: boolean;
}

export interface CustomEditPermissionAccessModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (permissions: PermissionData) => void;
  itemTitle?: string;
  accessLevel?: 'read' | 'write';
  loading?: boolean;
  accessType?: 'Module' | 'Entity';
}

export type PermissionType = 'view' | 'edit';

export interface PermissionState {
  view: boolean;
  edit: boolean;
}
