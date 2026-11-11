/**
 * MovePropertyModal Component Types
 */
export interface MovePropertyModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (realEstateId: string) => void;
  propertyOptions?: PropertyOption[];
}

export interface PropertyOption {
  label: string;
  value: string;
}

export type PropertyType = 'house' | 'apartment' | 'office' | 'storage' | 'unassigned';
