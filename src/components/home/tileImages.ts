/* Tile photos (the same ones as the web dashboard) and the backgrounds behind the tiles. */

export const HOME_TILE_IMAGES = {
  RealEstate: require('../../assets/images/home-tiles/real_estate.jpg'),
  Vehicles: require('../../assets/images/home-tiles/vehicles.jpg'),
  IdentityHub: require('../../assets/images/home-tiles/identity_hub.jpg'),
  HealthTracker: require('../../assets/images/home-tiles/health.jpg'),
  Wallet: require('../../assets/images/home-tiles/wallet.jpg'),
  Pets: require('../../assets/images/home-tiles/pets.jpg'),
  SocialMedia: require('../../assets/images/home-tiles/social_media.jpg'),
  Bookmarks: require('../../assets/images/home-tiles/bookmarks.jpg'),
  Legal: require('../../assets/images/home-tiles/documents.jpg'),
  Subscriptions: require('../../assets/images/home-tiles/subscriptions.jpg'),
  BankingFinance: require('../../assets/images/home-tiles/finance.jpg'),
  PersonalProperty: require('../../assets/images/home-tiles/personal_property.jpg'),
  Loans: require('../../assets/images/home-tiles/loans.jpg'),
  Utilities: require('../../assets/images/home-tiles/utilities.jpg'),
  Insurance: require('../../assets/images/home-tiles/insurance.jpg'),
  Warranties: require('../../assets/images/home-tiles/warranties.jpg'),
} as const;

export const BUSINESS_TILE_IMAGES: Record<string, any> = {
  BusinessDetailsPage: require('../../assets/images/business-tiles/business_profile.jpg'),
  SocialMedia: require('../../assets/images/business-tiles/business_social_media.jpg'),
  Bookmarks: require('../../assets/images/business-tiles/business_bookmarks.jpg'),
  BusinessContact: require('../../assets/images/business-tiles/business_contacts.jpg'),
  Projects: require('../../assets/images/business-tiles/business_projects.jpg'),
  Vehicles: require('../../assets/images/business-tiles/business_vehicles.jpg'),
  RealEstate: require('../../assets/images/business-tiles/business_real_estate.jpg'),
  PersonalProperty: require('../../assets/images/business-tiles/business_property.jpg'),
  BankingFinance: require('../../assets/images/business-tiles/business_banking.jpg'),
  Wallet: require('../../assets/images/business-tiles/business_wallet.jpg'),
  Loans: require('../../assets/images/business-tiles/business_loans.jpg'),
  Utilities: require('../../assets/images/business-tiles/business_utilities.jpg'),
  Insurance: require('../../assets/images/business-tiles/business_insurance.jpg'),
  Warranties: require('../../assets/images/business-tiles/business_warranties.jpg'),
  Subscriptions: require('../../assets/images/business-tiles/subscription_icon.jpg'),
  Licenses: require('../../assets/images/business-tiles/business_license.jpg'),
  ComplianceVault: require('../../assets/images/business-tiles/business_document.jpg'),
  Legal: require('../../assets/images/business-tiles/business_document.jpg'),
};

export const HOME_BACKGROUND = require('../../assets/images/home_background.jpg');
export const BUSINESS_HOME_BACKGROUND = require('../../assets/images/business_home_background.jpg');

/**
 * Icon on each tile's badge (MaterialCommunityIcons, bundled on iOS and Android), by screen.
 * Chosen to match the designs: building, car, ID card, heart pulse, wallet, paw, chat, bookmark, document…
 */
export const TILE_ICONS: Record<string, string> = {
  RealEstate: 'office-building-outline',
  Vehicles: 'car-outline',
  IdentityHub: 'card-account-details-outline',
  HealthTracker: 'heart-pulse',
  Wallet: 'wallet-outline',
  Pets: 'paw-outline',
  SocialMedia: 'chat-processing-outline',
  Bookmarks: 'bookmark-outline',
  Legal: 'file-document-outline',
  Subscriptions: 'credit-card-outline',
  BankingFinance: 'chart-bar',
  PersonalProperty: 'sofa-outline',
  Loans: 'cash-multiple',
  Utilities: 'receipt',
  Insurance: 'shield-check-outline',
  Warranties: 'certificate-outline',
  BusinessDetailsPage: 'account-outline',
  BusinessContact: 'account-group-outline',
  Projects: 'file-cog-outline',
  Licenses: 'license',
  ComplianceVault: 'folder-lock-outline',
};
