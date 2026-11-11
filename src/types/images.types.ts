import { ImageSourcePropType } from 'react-native';

/**
 * Image asset types
 */
export interface ImageAssets {
  PLACEHOLDER_LICENSE: ImageSourcePropType;
  PLACEHOLDER_PASSPORT: ImageSourcePropType;
  APP_LOGO: ImageSourcePropType;
  LIGHT_LOGO: ImageSourcePropType
}

/**
 * Screen image assets (currently empty, expandable)
 */
export interface ScreenImageAssets {}

/**
 * Video assets (currently empty, expandable)
 */
export interface VideoAssets {}

/**
 * Icon asset types
 */
export interface IconAssets {
  // Bottom Tabs Icons
  HOME_ICON: ImageSourcePropType;
  CONNECTIONS_ICON: ImageSourcePropType;
  AI_ASSISTANT_ICON: ImageSourcePropType;
  REMINDERS_ICON: ImageSourcePropType;
  ACCOUNT_ICON: ImageSourcePropType;
  APP_ICON: ImageSourcePropType;

  // Navigation Icons
  BACK_ICON: ImageSourcePropType;
  USER_ICON: ImageSourcePropType;
  EMAIL_ICON: ImageSourcePropType;
  PHONE_ICON: ImageSourcePropType;
  LOCK_ICON: ImageSourcePropType;
  BACK_ICON_WHITE: ImageSourcePropType;

  // Feature Icons
  IDENTITY_HUB_ICON: ImageSourcePropType;
  SOCIAL_MEDIA_ICON: ImageSourcePropType;
  HEALTH_TRACKER_ICON: ImageSourcePropType;
  BOOKMARK_ICON: ImageSourcePropType;
  WALLET_ICON: ImageSourcePropType;
  PETS_ICON: ImageSourcePropType;
  LEGAL_ICON: ImageSourcePropType;
  SUBSCRIPTION_ICON: ImageSourcePropType;
  PERSONAL_BUILDING_ICON: ImageSourcePropType;
  REAL_ESTATE_ICON: ImageSourcePropType;
  VEHICLE_ICON: ImageSourcePropType;
  BANKING_FINANCE_ICON: ImageSourcePropType;
  LOANS_PAYMENT_ICON: ImageSourcePropType;
  UTILITIES_ICON: ImageSourcePropType;
  INSURANCE_ICON: ImageSourcePropType;
  WARRENTIES_ICON: ImageSourcePropType;
  IDENTITY_HUB_SUCCESS_ICON: ImageSourcePropType;

  // Action Icons
  SEARCH_ICON: ImageSourcePropType;
  VOICE_ICON: ImageSourcePropType;
  EDIT_PENCIL_ICON: ImageSourcePropType;
  SUBSCRIPTION_WHITE_ICON: ImageSourcePropType;
  SHARE_PRIMARY_ICON: ImageSourcePropType;
  EYE_ICON: ImageSourcePropType;
  SHARE_ICON: ImageSourcePropType;
  DELETE_ICON: ImageSourcePropType;
  EDIT_ICON: ImageSourcePropType;
  LEGAL_SCREEN_ICON: ImageSourcePropType;
  PET_WHITE_ICON: ImageSourcePropType;
  WALLET_SCREEN_ICON: ImageSourcePropType;
  SHARE_ICON_2: ImageSourcePropType;
  BOOKMARK_SCREEN_ICON: ImageSourcePropType;

  // Health Icons
  VIRUS_ICON: ImageSourcePropType;
  CALENDER_ICON: ImageSourcePropType;
  VACCINATION_ICON: ImageSourcePropType;
  MEDICINE_ICON: ImageSourcePropType;

  // Screen Specific Icons
  VEHICLE_SCREEN_ICON: ImageSourcePropType;
  USER_CONNECTION_ICON: ImageSourcePropType;
  NOTES_ICONS: ImageSourcePropType;

  // Social Media Icons
  FACEBOOK_ICON: ImageSourcePropType;
  INSTAGRAM_ICON: ImageSourcePropType;
  LINKEDIN_ICON: ImageSourcePropType;
  TWITTER_ICON: ImageSourcePropType;

  // Auth Icons
  GOOGLE_ICON: ImageSourcePropType;

  // Financial Icons
  BANK_ICON: ImageSourcePropType;
  LOAN_SCREEN_ICON: ImageSourcePropType;
  INSURANCE_SCREEN_ICON: ImageSourcePropType;
  WARRANTIES_SCREEN_ICON: ImageSourcePropType;
  UTILITIES_SCREEN_ICON: ImageSourcePropType;

  // Business Icons
  BUSINESS_CONTACT_ICON: ImageSourcePropType;
  PROJECTS_ICON: ImageSourcePropType;
  COMPLIANCE_VAULT_ICON: ImageSourcePropType;
  FOLDER_ICON: ImageSourcePropType;
  DOWNLOAD_ICON: ImageSourcePropType;
  BUSINESS_PROPERTY_ICON: ImageSourcePropType;
  BUSINESS_CONTACT_ICON1: ImageSourcePropType;
  BUSINESS_PROJECT_ICON1: ImageSourcePropType;
  BUSINESS_DOCUMENT_ICON: ImageSourcePropType;
  
}

/**
 * All assets combined
 */
export interface AllAssets {
  IMAGES: ImageAssets;
  SCREEN_IMAGES: ScreenImageAssets;
  ICONS: IconAssets;
  VIDEOS?: VideoAssets;
}
