import type { ImageSourcePropType } from 'react-native';

/**
 * CustomSocialLinksModal Component Types
 */
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Connection {
  socialLinks?: SocialLinks;
  [key: string]: any;
}

export interface CustomSocialLinksModalProps {
  visible: boolean;
  onClose: () => void;
  connection?: Connection;
}

export interface SocialLinkItem {
  name: string;
  icon: ImageSourcePropType;
  color: string;
  url: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'twitter';
