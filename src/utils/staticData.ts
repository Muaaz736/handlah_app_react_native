// Static data for Home Screen

import { ICONS } from './Images';
import {
  PropertyTypeOption,
} from '../app/screens/Home/modules/RealState/AddRealState/addRealstate.types';
import { AssignedPropertyOption, CategoryOption } from '../app/screens/Home/modules/PersonalProperty/PersonalProperty.types';

// Screen Types for better organization
export const SCREEN_TYPES = {
  PUBLIC: 'public', // No authentication required
  EMAIL_VERIFICATION: 'email_verification', // Requires signup but email not verified
  PHONE_VERIFICATION: 'phone_verification', // Requires signup but phone not verified
  // SUBSCRIPTION_PLANS: 'subscription_plans', // Email verified but business profile incomplete
  PROFILE_SETUP: 'profile_setup', // Business complete but profile not uploaded
  PRIVATE: 'private', // All setup complete
} as const;

export const USER_SUBSCRIPTION_PLANS: any = {
  FREE: 'free',
  PREMIUM: 'premium',
}


export const USER_ACCOUNT_TYPES = [
  { label: 'header.personal' },
  { label: 'header.business' },
];

export const ESSENTIALS_DATA = [
  {
    id: '1',
    titleKey: 'home.essentials.identity_hub.title',
    subtitleKey: 'home.essentials.identity_hub.subtitle',
    icon: ICONS.IDENTITY_HUB_ICON,
    screenRoute: 'IdentityHub',
  },
  {
    id: '2',
    titleKey: 'home.essentials.social_media.title',
    subtitleKey: 'home.essentials.social_media.subtitle',
    icon: ICONS.SOCIAL_MEDIA_ICON,
    screenRoute: 'SocialMedia',
  },
  {
    id: '3',
    titleKey: 'home.essentials.health_tracker.title',
    subtitleKey: 'home.essentials.health_tracker.subtitle',
    icon: ICONS.HEALTH_TRACKER_ICON,
    screenRoute: 'HealthTracker',
  },
  {
    id: '4',
    titleKey: 'home.essentials.bookmarks.title',
    subtitleKey: 'home.essentials.bookmarks.subtitle',
    icon: ICONS.BOOKMARK_ICON,
    screenRoute: 'Bookmarks',
  },
  {
    id: '5',
    titleKey: 'home.essentials.wallet.title',
    subtitleKey: 'home.essentials.wallet.subtitle',
    icon: ICONS.WALLET_ICON,
    screenRoute: 'Wallet',
  },
  {
    id: '6',
    titleKey: 'home.essentials.pets.title',
    subtitleKey: 'home.essentials.pets.subtitle',
    icon: ICONS.PETS_ICON,
    screenRoute: 'Pets',
  },
  {
    id: '7',
    titleKey: 'home.essentials.legal.title',
    subtitleKey: 'home.essentials.legal.subtitle',
    icon: ICONS.LEGAL_ICON,
    screenRoute: 'Legal',
  },
  {
    id: '8',
    titleKey: 'home.essentials.subscriptions.title',
    subtitleKey: 'home.essentials.subscriptions.subtitle',
    icon: ICONS.SUBSCRIPTION_ICON,
    screenRoute: 'Subscriptions',
  },
];

export const ASSETS_DATA = [
  {
    id: 'asset_1',
    titleKey: 'home.assets.personal_property.title',
    subtitleKey: 'home.assets.personal_property.subtitle',
    icon: ICONS.PERSONAL_BUILDING_ICON,
    screenRoute: 'PersonalProperty',
  },
  {
    id: 'asset_2',
    titleKey: 'home.assets.real_estate.title',
    subtitleKey: 'home.assets.real_estate.subtitle',
    icon: ICONS.REAL_ESTATE_ICON,
    screenRoute: 'RealEstate',
  },
  {
    id: 'asset_3',
    titleKey: 'home.assets.vehicles.title',
    subtitleKey: 'home.assets.vehicles.subtitle',
    icon: ICONS.VEHICLE_ICON,
    screenRoute: 'Vehicles',
  },
  {
    id: 'asset_4',
    titleKey: 'home.assets.banking.title',
    subtitleKey: 'home.assets.banking.subtitle',
    icon: ICONS.BANKING_FINANCE_ICON,
    screenRoute: 'BankingFinance',
  },
];

export const LIABILITIES_DATA = [
  {
    id: 'liability_1',
    titleKey: 'home.liabilities.loans.title',
    subtitleKey: 'home.liabilities.loans.subtitle',
    icon: ICONS.LOANS_PAYMENT_ICON,
    screenRoute: 'Loans',
  },
  {
    id: 'liability_2',
    titleKey: 'home.liabilities.utilities.title',
    subtitleKey: 'home.liabilities.utilities.subtitle',
    icon: ICONS.UTILITIES_ICON,
    screenRoute: 'Utilities',
  },
  {
    id: 'liability_3',
    titleKey: 'home.liabilities.insurance.title',
    subtitleKey: 'home.liabilities.insurance.subtitle',
    icon: ICONS.INSURANCE_ICON,
    screenRoute: 'Insurance',
  },
  {
    id: 'liability_4',
    titleKey: 'home.liabilities.warranties.title',
    subtitleKey: 'home.liabilities.warranties.subtitle',
    icon: ICONS.WARRENTIES_ICON,
    screenRoute: 'Warranties',
  },
];

// Dashboard groups (same as the web dashboard). Built from the items above so titles, icons and routes stay in one place.
const byRoute = (route: string) =>
  [...ESSENTIALS_DATA, ...ASSETS_DATA, ...LIABILITIES_DATA].find(item => item.screenRoute === route)!;

export const DASHBOARD_GROUPS = [
  {
    key: 'people_identity',
    titleKey: 'home.sections.people_identity',
    items: ['IdentityHub', 'HealthTracker', 'Pets', 'Legal'].map(byRoute),
  },
  {
    key: 'digital_everyday',
    titleKey: 'home.sections.digital_everyday',
    items: ['Wallet', 'Bookmarks', 'SocialMedia', 'Subscriptions'].map(byRoute),
  },
  {
    key: 'what_you_own',
    titleKey: 'home.sections.what_you_own',
    items: ['RealEstate', 'Vehicles', 'PersonalProperty'].map(byRoute),
  },
  {
    key: 'money_coverage',
    titleKey: 'home.sections.money_coverage',
    items: ['BankingFinance', 'Loans', 'Utilities', 'Insurance', 'Warranties'].map(byRoute),
  },
];

export const QUICK_ADD_TABS = [
  { label: 'Item', key: 'home.bottom_sheet.item' },
  { label: 'Connection', key: 'home.bottom_sheet.connection' },
  { label: 'Reminder', key: 'home.bottom_sheet.reminder' },
];

export const CATEGORY_OPTIONS = [
  // Essentials
  { label: 'Identity Hub', value: 'identity_hub' },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Health Tracker', value: 'health_tracker' },
  { label: 'Bookmarks', value: 'bookmarks' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'Pets', value: 'pets' },
  { label: 'Document', value: 'legal' },
  { label: 'Subscriptions', value: 'subscriptions' },
  // Assets
  { label: 'Personal Property', value: 'personal_property' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Vehicles', value: 'vehicles' },
  { label: 'Banking & Finance', value: 'banking' },
  // Liabilities
  { label: 'Loans', value: 'loans' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Warranties', value: 'warranties' },
];

export const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Savings', value: 'savings' },
  { label: 'Current', value: 'current' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Investment', value: 'investment' },
];

// Profile Pages data
export const PROFILE_PAGES = [
  {
    id: '1',
    titleKey: 'account.personal_information',
    route: 'PersonalInformation',
    type: 'link',
  },
  // {
  //   id: '2',
  //   titleKey: 'account.subscription_plan',
  //   route: 'SubscriptionPlan',
  //   type: 'link',
  // },
  {
    id: '3',
    titleKey: 'account.change_password',
    route: 'UpdatePassword',
    type: 'link',
  },
  {
    id: '3b',
    titleKey: 'account.storage_and_plan',
    route: 'StoragePlan',
    type: 'link',
  },
  {
    id: '4',
    titleKey: 'account.languages',
    route: 'Languages',
    type: 'link',
  },
  {
    id: '5',
    titleKey: 'account.privacy_policy',
    route: 'PrivacyPolicy',
    type: 'link',
  },
  {
    id: '6',
    titleKey: 'account.terms_conditions',
    route: 'TermsConditions',
    type: 'link',
  },
  {
    id: '7',
    titleKey: 'account.delete_account',
    route: 'DeleteAccount',
    type: 'link',
  },
  {
    id: '8',
    titleKey: 'account.color_preference',
    route: 'ChangeColorPreference',
    type: 'link',
  },
  {
    id: '9',
    titleKey: 'account.privacy_health_data',
    route: 'PrivacyHealthDataSettings',
    type: 'link',
  },
  {
    id: '10',
    titleKey: 'account.request_data_access',
    route: 'RequestAccessToData',
    type: 'link',
  },
  {
    id: '11',
    titleKey: 'account.request_data_deletion',
    route: 'RequestDeletionMyData',
    type: 'link',
  },
  {
    id: '12',
    titleKey: 'account.appeal_decision',
    route: 'AppealDecision',
    type: 'link',
  },
  {
    id: '14',
    titleKey: 'FAQ',
    route: 'FAQ',
    type: 'link',
  },
  {
    id: '15',
    titleKey: 'Help & Support',
    route: 'HelpSupport',
    type: 'link',
  },
  {
    id: '13',
    titleKey: 'account.sync_status',
    route: 'SyncStatus',
    type: 'link',
  },
  {
    id: '16',
    titleKey: 'account.user_guide',
    route: 'UserGuide',
    type: 'link',
  },
  // {
  //   id: '13',
  //   titleKey: 'account.dark_mode',
  //   type: 'toggle',
  //   key: 'darkMode',
  // },
];

// Mock data - replace with your actual data source
export const CONNECTIONS_DATA = [
  {
    id: '1',
    name: 'Daniel Kelvin',
    email: 'daniel@example.com',
    phone: '(641)-111 1111',
    category: 'family',
    categoryColor: '#90EE90',
    isSharedAccess: true,
    isEmergencyContact: false,
  },
  {
    id: '2',
    name: 'Daniel Kelvin',
    email: 'daniel@example.com',
    phone: '(641)-111 1111',
    category: 'family',
    categoryColor: '#90EE90',
    isSharedAccess: false,
    isEmergencyContact: true,
  },
  {
    id: '3',
    name: 'Daniel Kelvin',
    email: 'daniel@example.com',
    phone: '(641)-111 1111',
    category: 'friends',
    categoryColor: '#90EE90',
    isSharedAccess: false,
    isEmergencyContact: false,
  },
  {
    id: '4',
    name: 'Daniel Kelvin',
    email: 'daniel@example.com',
    phone: '(641)-111 1111',
    category: 'folleague',
    categoryColor: '#90EE90',
    isSharedAccess: false,
    isEmergencyContact: false,
  },
  {
    id: '5',
    name: 'Daniel Kelvin',
    email: 'daniel@example.com',
    phone: '(641)-111 1111',
    category: 'friends',
    categoryColor: '#90EE90',
    isSharedAccess: false,
    isEmergencyContact: true,
  },
];

// Separate data for better organization
export const CONNECTIONS_TABS_DATA = [
  { label: 'All', value: 'all' },
  { label: 'Family', value: 'family' },
  { label: 'Emergency Contact', value: 'emergency' },
  { label: 'Colleague', value: 'colleague' },
  { label: 'Friends', value: 'friends' },
];

export const CATEGORY_TABS = [
  { label: 'Personal', value: 'personal' },
  { label: 'Business', value: 'business' },
  { label: 'Personal & Business', value: 'personal_business' },
];

// Connection type options for Quick Add
export const CONNECTION_TYPE_OPTIONS = [
  { label: 'Personal', value: 'personal' },
  { label: 'Business', value: 'business' },
  { label: 'Personal & Business', value: 'personal_business' },
];

export const STATIC_REQUESTS = {
  received: [
    {
      id: 1,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'pending',
    },
    {
      id: 2,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'pending',
    },
    {
      id: 3,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'pending',
    },
  ],
  sent: [
    {
      id: 1,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'accepted',
    },
    {
      id: 2,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'declined',
    },
    {
      id: 3,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'pending',
    },
  ],
  emergency: [
    {
      id: 1,
      name: 'Daniel Kelvin',
      email: 'Daniel@example.com',
      phone: '(641)-111 1111',
      status: 'emergency',
      message:
        "They are requesting temporary, view-only access to your account if you don't respond within 8 hours, access will be granted automatically.",
    },
  ],
};

export const REQUEST_TABS = [
  { key: 'received', label: 'Received', count: 12 },
  { key: 'sent', label: 'Sent', count: 25 },
  { key: 'emergency', label: 'Emergency', count: 1 },
];

export const PERSONL_PROPERTIES = [
  {
    id: 1,
    name: 'LG Washer',
    category: 'Appliance',
    price: '$7,450',
    serialNumber: 'LG-H2234',
    purchaseDate: '23/10/2024',
    notes:
      'Borem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    warranty: {
      providerInformation: 'LG-H2234',
      coverage: '23/10/2024',
      date: '23/10/2024',
      notes:
        'Borem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    },
    insurance: {
      carrier: 'Alllife',
      policyNumber: '334422',
      date: '23/10/2024',
      premium: '23/10/2024',
      agentName: 'Henry',
      agentPhone: '(641)-111 1111',
    },
    loan: {
      lender: 'Alllife',
      balance: '334422',
      monthlyPayment: '23/10/2024',
      date: '23/10/2024',
      ratePercentage: '30%',
    },
  },
  {
    id: 2,
    name: 'LG Washer',
    category: 'Appliance',
    price: '$7,450',
    serialNumber: 'LG-H2235',
    purchaseDate: '23/10/2024',
    notes: 'Borem ipsum dolor sit amet, consectetur adipiscing elit.',
    warranty: {
      providerInformation: 'LG-H2235',
      coverage: '23/10/2024',
      date: '23/10/2024',
      notes: 'Borem ipsum dolor sit amet.',
    },
    insurance: {
      carrier: 'Alllife',
      policyNumber: '334423',
      date: '23/10/2024',
      premium: '23/10/2024',
      agentName: 'Henry',
      agentPhone: '(641)-111 1111',
    },
    loan: {
      lender: 'Alllife',
      balance: '334423',
      monthlyPayment: '23/10/2024',
      date: '23/10/2024',
      ratePercentage: '30%',
    },
  },
  {
    id: 3,
    name: 'LG Washer',
    category: 'Appliance',
    price: '$7,450',
    serialNumber: 'LG-H2236',
    purchaseDate: '23/10/2024',
    notes: 'Borem ipsum dolor sit amet.',
    warranty: {
      providerInformation: 'LG-H2236',
      coverage: '23/10/2024',
      date: '23/10/2024',
      notes: 'Borem ipsum dolor sit amet.',
    },
    insurance: {
      carrier: 'Alllife',
      policyNumber: '334424',
      date: '23/10/2024',
      premium: '23/10/2024',
      agentName: 'Henry',
      agentPhone: '(641)-111 1111',
    },
    loan: {
      lender: 'Alllife',
      balance: '334424',
      monthlyPayment: '23/10/2024',
      date: '23/10/2024',
      ratePercentage: '30%',
    },
  },
];

export const SAMPLE_POLICIES = [
  {
    id: 1,
    title: 'Home - State Farm',
    subtitle: 'Policy#',
    amount: '$2,180.00',
  },
  {
    id: 2,
    title: 'Vehicle - State Farm',
    subtitle: 'Policy#',
    amount: '$2,180.00',
  },
];

export const REMINDER_TABS_DATA = [
  { id: 0, label: 'Due Today', value: 'due_today' },
  { id: 1, label: 'Upcoming', value: 'upcoming' },
  { id: 2, label: 'Past Due', value: 'past_due' },
  { id: 3, label: 'Completed', value: 'completed' },
];

export const REMINDERS_DATA = [
  {
    id: '1',
    title: 'Call Martin',
    dueDate: 'Today at 5 PM',
    frequency: 'Only once',
    notes: 'Call about the invoice',
    status: 'due_today',
    date: '23/10/2025',
    madeByUser: true,
  },
  {
    id: '2',
    title: 'Passport Renewal',
    date: '23/10/2025',
    status: 'due_today',
    madeByUser: false,
  },
  {
    id: '3',
    title: 'Passport Renewal',
    date: '23/10/2025',
    status: 'due_today',
    madeByUser: false,
  },
  {
    id: '4',
    title: 'Passport Renewal',
    date: '23/10/2025',
    status: 'due_today',
    madeByUser: false,
  },
  {
    id: '5',
    title: 'Vehicle Insurance Renewal',
    date: '23/10/2025',
    daysInfo: 'Due in 5 days',
    status: 'upcoming',
    madeByUser: false,
  },
  {
    id: '6',
    title: 'Vehicle Insurance Renewal',
    date: '23/10/2025',
    daysInfo: 'Due in 5 days',
    status: 'upcoming',
    madeByUser: false,
  },
  {
    id: '7',
    title: 'Vehicle Insurance Renewal',
    date: '23/10/2025',
    daysInfo: 'Due in 5 days',
    status: 'upcoming',
    madeByUser: false,
  },
  {
    id: '8',
    title: 'Car Registration Renewal',
    date: '23/10/2025',
    daysInfo: 'Past due by 3 days',
    status: 'past_due',
    madeByUser: false,
  },
  {
    id: '9',
    title: 'Dental Checkup Appointment',
    completedDate: 'Completed Jan 4, 2026 at 2:14 PM',
    status: 'completed',
    madeByUser: false,
  },
  {
    id: '10',
    title: 'Dental Checkup Appointment',
    completedDate: 'Completed Jan 4, 2026 at 2:14 PM',
    status: 'completed',
    madeByUser: false,
  },
  {
    id: '11',
    title: 'Dental Checkup Appointment',
    completedDate: 'Completed Jan 4, 2026 at 2:14 PM',
    status: 'completed',
    madeByUser: false,
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 1,
    name: 'Netflix',
    renewalDate: '23/3/2025',
    cost: '$9.99/Month',
    email: 'Kevinjosh223',
    password: 'Happyholiday1',
  },
  {
    id: 2,
    name: 'ChatGPT Pro',
    renewalDate: '23/3/2025',
    cost: '$54.99/Month',
    email: 'Kevinjosh223',
    password: 'Happyholiday1',
  },
]


export const propertyTypes: PropertyTypeOption[] = [
  { label: 'Single Family', value: 'single_family' },
  { label: 'Multi Family', value: 'multi_family' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Land', value: 'land' },
  { label: 'Other', value: 'other' },
];

export const categoryOptions: CategoryOption[] = [
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Furniture', value: 'Furniture' },
  { label: 'Jewelry', value: 'Jewelry' },
  { label: 'Vehicles', value: 'Vehicles' },
  { label: 'Appliances', value: 'Appliances' },
  { label: 'Collectibles', value: 'Collectibles' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Sports Equipment', value: 'Sports Equipment' },
  { label: 'Musical Instruments', value: 'Musical Instruments' },
  { label: 'Tools', value: 'Tools' },
  { label: 'Artwork', value: 'Artwork' },
  { label: 'Antiques', value: 'Antiques' },
  { label: 'Books', value: 'Books' },
  { label: 'Camera & Photography', value: 'Camera & Photography' },
  { label: 'Computer & Accessories', value: 'Computer & Accessories' },
  { label: 'Gaming', value: 'Gaming' },
  { label: 'Garden & Outdoor', value: 'Garden & Outdoor' },
  { label: 'Home Décor', value: 'Home Décor' },
  { label: 'Kitchen & Dining', value: 'Kitchen & Dining' },
  { label: 'Luggage & Travel', value: 'Luggage & Travel' },
  { label: 'Office Equipment', value: 'Office Equipment' },
  { label: 'Pets & Supplies', value: 'Pets & Supplies' },
  { label: 'Toys', value: 'Toys' },
  { label: 'Watches', value: 'Watches' },
  { label: 'HVAC System', value: 'HVAC System' },
  { label: 'Plumbing', value: 'Plumbing' },
  { label: 'Electrical', value: 'Electrical' },
  { label: 'Roofing', value: 'Roofing' },
  { label: 'Flooring', value: 'Flooring' },
  { label: 'Windows & Doors', value: 'Windows & Doors' },
  { label: 'Lighting & Fixtures', value: 'Lighting & Fixtures' },
  { label: 'Security System', value: 'Security System' },
  { label: 'Water Heater', value: 'Water Heater' },
  { label: 'Garage & Storage', value: 'Garage & Storage' },
  { label: 'Fencing', value: 'Fencing' },
  { label: 'Landscaping', value: 'Landscaping' },
  { label: 'Pool & Spa', value: 'Pool & Spa' },
  { label: 'Solar Panels', value: 'Solar Panels' },
  { label: 'Washer & Dryer', value: 'Washer & Dryer' },
  { label: 'Refrigerator & Freezer', value: 'Refrigerator & Freezer' },
  { label: 'Dishwasher', value: 'Dishwasher' },
  { label: 'Oven & Stove', value: 'Oven & Stove' },
  { label: 'Paint & Walls', value: 'Paint & Walls' },
  { label: 'Bathroom Fixtures', value: 'Bathroom Fixtures' },
  { label: 'Other', value: 'Other' },
];

export const assignedPropertyOptions: AssignedPropertyOption[] = [
  { label: 'Unassigned', value: 'unassigned' },
  { label: 'Home', value: 'home' },
  { label: 'Office', value: 'office' },
  { label: 'Storage', value: 'storage' },
];
