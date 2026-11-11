/**
 * CustomRequestCard Component Types
 */
export type RequestStatus = 'Pending' | 'accepted' | 'declined' | 'emergency' | 'sent';

export interface CustomRequestCardProps {
  name: string;
  email: string;
  phone: string;
  status?: RequestStatus;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  message?: string;
  acceptLoading?: boolean;
  declineLoading?: boolean;
  reason?: string;
  /** The id of the person's profile picture, if they have one. */
  profilePicture?: string | null;
}

export interface RequestUser {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface RequestAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}
