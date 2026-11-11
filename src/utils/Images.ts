import type {
  ImageAssets,
  ScreenImageAssets,
  VideoAssets,
  IconAssets,
  AllAssets,
} from '../types/images.types';

/**
 * Image Assets
 * Central repository for all image assets in the application
 */
const images: ImageAssets = {
  // Placeholders
  PLACEHOLDER_LICENSE: require('../assets/images/screenImages/placeholderLicense.png'),
  PLACEHOLDER_PASSPORT: require('../assets/images/screenImages/placeholderPassport.png'),
  APP_LOGO: require('../assets/images/logo/AppLogo.png'),
  LIGHT_LOGO: require('../assets/images/logo/LightLogo.png'),
};

// Screen Images
const screenImages: ScreenImageAssets = {};

// Videos
const videos: VideoAssets = {};

// Icon Assets
const icons: IconAssets = {
  // BOTTOM TABS ICONS
  HOME_ICON: require('../assets/images/icons/home_icon.png'),
  CONNECTIONS_ICON: require('../assets/images/icons/connections_icon.png'),
  AI_ASSISTANT_ICON: require('../assets/images/icons/bottomHalo.png'),
  REMINDERS_ICON: require('../assets/images/icons/reminders_icon.png'),
  ACCOUNT_ICON: require('../assets/images/icons/account_icon.png'),
  APP_ICON: require('../assets/images/icons/appIcon.png'),

  // Navigation icons
  BACK_ICON: require('../assets/images/icons/backBtn.png'),
  USER_ICON: require('../assets/images/icons/user.png'),
  EMAIL_ICON: require('../assets/images/icons/mail-01.png'),
  PHONE_ICON: require('../assets/images/icons/phone.png'),
  LOCK_ICON: require('../assets/images/icons/passwordlock.png'),
  BACK_ICON_WHITE: require('../assets/images/icons/backBtnLight.png'),
  IDENTITY_HUB_ICON: require('../assets/images/icons/idenitity_hub.png'),
  SOCIAL_MEDIA_ICON: require('../assets/images/icons/social_media.png'),
  HEALTH_TRACKER_ICON: require('../assets/images/icons/health_tracker.png'),
  BOOKMARK_ICON: require('../assets/images/icons/bookmark.png'),
  WALLET_ICON: require('../assets/images/icons/wallet.png'),
  PETS_ICON: require('../assets/images/icons/pets.png'),
  LEGAL_ICON: require('../assets/images/icons/legal.png'),
  SUBSCRIPTION_ICON: require('../assets/images/icons/subscription.png'),
  PERSONAL_BUILDING_ICON: require('../assets/images/icons/personal_building.png'),
  REAL_ESTATE_ICON: require('../assets/images/icons/real-estate.png'),
  VEHICLE_ICON: require('../assets/images/icons/vehicle.png'),
  BANKING_FINANCE_ICON: require('../assets/images/icons/banking_finance.png'),
  LOANS_PAYMENT_ICON: require('../assets/images/icons/loans_payment.png'),
  UTILITIES_ICON: require('../assets/images/icons/utilities.png'),
  INSURANCE_ICON: require('../assets/images/icons/insurance.png'),
  WARRENTIES_ICON: require('../assets/images/icons/warrenties.png'),
  IDENTITY_HUB_SUCCESS_ICON: require('../assets/images/icons/identityHubSuccess.png'),

  SEARCH_ICON: require('../assets/images/icons/search_icon.png'),
  VOICE_ICON: require('../assets/images/icons/voice_icon.png'),
  EDIT_PENCIL_ICON: require('../assets/images/icons/edit_pencil.png'),

  SUBSCRIPTION_WHITE_ICON: require('../assets/images/icons/subscriptionIcon.png'),
  SHARE_PRIMARY_ICON: require('../assets/images/icons/sharePrimaryIcon.png'),
  EYE_ICON: require('../assets/images/icons/eyeIcon.png'),
  SHARE_ICON: require('../assets/images/icons/shareIcon.png'),
  DELETE_ICON: require('../assets/images/icons/deleteIcon.png'),
  EDIT_ICON: require('../assets/images/icons/editIcon.png'),
  LEGAL_SCREEN_ICON: require('../assets/images/icons/legalIcon.png'),

  PET_WHITE_ICON: require('../assets/images/icons/petIconWhite.png'),

  WALLET_SCREEN_ICON: require('../assets/images/icons/walletScreenIcon.png'),
  SHARE_ICON_2: require('../assets/images/icons/shareIcon2.png'),

  BOOKMARK_SCREEN_ICON: require('../assets/images/icons/bookmarkScreenIcon.png'),

  VIRUS_ICON: require('../assets/images/icons/virusIcon.png'),
  CALENDER_ICON: require('../assets/images/icons/calenderIcon.png'),
  VACCINATION_ICON: require('../assets/images/icons/vaccinationIcon.png'),
  MEDICINE_ICON: require('../assets/images/icons/medicineIcon.png'),

  VEHICLE_SCREEN_ICON: require('../assets/images/icons/vehicleScreenIcon.png'),
  USER_CONNECTION_ICON: require('../assets/images/icons/user_connection_icon.png'),
  NOTES_ICONS: require('../assets/images/icons/notes_icons.png'),

  FACEBOOK_ICON: require('../assets/images/icons/facebook_icon.png'),
  INSTAGRAM_ICON: require('../assets/images/icons/instagram_icon.png'),
  LINKEDIN_ICON: require('../assets/images/icons/linkedin_icon.png'),
  TWITTER_ICON: require('../assets/images/icons/twitter_icon.png'),
  BANK_ICON: require('../assets/images/icons/bankScreenIcon.png'),

  LOAN_SCREEN_ICON: require('../assets/images/icons/loanScreenIcon.png'),

  INSURANCE_SCREEN_ICON: require('../assets/images/icons/insuranceScreenIcon.png'),

  WARRANTIES_SCREEN_ICON: require('../assets/images/icons/warrantiesScreenIcon.png'),

  UTILITIES_SCREEN_ICON: require('../assets/images/icons/utilitiesScreenIcon.png'),
  BUSINESS_CONTACT_ICON: require('../assets/images/icons/business_contact.png'),
  PROJECTS_ICON: require('../assets/images/icons/projects_icon.png'),
  COMPLIANCE_VAULT_ICON: require('../assets/images/icons/compliance_vault.png'),
  FOLDER_ICON: require('../assets/images/icons/folder_icon.png'),
  DOWNLOAD_ICON: require('../assets/images/icons/download_icon.png'),
  
  BUSINESS_PROPERTY_ICON: require('../assets/images/icons/BusinessProperty.png'),
  BUSINESS_CONTACT_ICON1: require('../assets/images/icons/businessContact.png'),
  BUSINESS_PROJECT_ICON1: require('../assets/images/icons/business_project.png'),
  BUSINESS_DOCUMENT_ICON: require('../assets/images/icons/business_document.png'),

  // Auth Icons
  GOOGLE_ICON: require('../assets/images/icons/google.png'),
};

// Export assets
export const IMAGES: ImageAssets = images;
export const VIDEOS: VideoAssets = videos;
export const SCREEN_IMAGES: ScreenImageAssets = screenImages;
export const ICONS: IconAssets = icons;

export const iconWithRespectToModuleName = {
  identityhub: icons.IDENTITY_HUB_ICON,
  usersocialnetwork: icons.SOCIAL_MEDIA_ICON,
  bookmark: icons.BOOKMARK_ICON,
  wallet: icons.WALLET_ICON,
  loan: icons.LOAN_SCREEN_ICON,
  utility: icons.UTILITIES_SCREEN_ICON,
  warranty: icons.WARRANTIES_SCREEN_ICON,
  insurance: icons.INSURANCE_SCREEN_ICON,
  vehicle: icons.VEHICLE_SCREEN_ICON,
  realestate: icons.REAL_ESTATE_ICON,
  property: icons.PERSONAL_BUILDING_ICON,
  bankaccount: icons.BANK_ICON,
  healthtracker: icons.HEALTH_TRACKER_ICON,
  pet: icons.PETS_ICON,
  businesslicense: icons.COMPLIANCE_VAULT_ICON,
  subscription: icons.SUBSCRIPTION_ICON,
  legaldocument: icons.LEGAL_ICON,
  compliancefolder: icons.FOLDER_ICON,
  businesscontact: icons.BUSINESS_CONTACT_ICON,
  businessproject: icons.PROJECTS_ICON,
};

const allAssets: AllAssets = {
  IMAGES,
  SCREEN_IMAGES,
  ICONS,
};

export default allAssets;
