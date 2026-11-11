/**
 * CustomConnectionCard Component Types
 */
export interface CustomConnectionCardProps {
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  avatar?: string;
  isSharedAccess?: boolean;
  isEmergencyContact?: boolean;
  /** Emergency access state for the badge ("Emergency Contact – Pending"); shown even when isEmergencyContact is false. */
  emergencyLabel?: string;
  onPress?: () => void;
  onConnectionPress?: () => void;
  onNotesPress?: () => void;
}

export interface ConnectionStatusBadge {
  isSharedAccess: boolean;
  isEmergencyContact: boolean;
}

export type ConnectionCategory = string;

export interface ConnectionUser {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  category?: ConnectionCategory;
}
