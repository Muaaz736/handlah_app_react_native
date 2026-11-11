import { LicenseFormData } from './authTypes/LicensesCertificationsScreen.types';
import { Asset } from 'react-native-image-picker';
import { Connection } from '../app/screens/Connections/Connections.types';
import { Warranty } from '../app/screens/Home/modules/Warranties/Warranties/Warranties.types';
import { UtilityData } from '../app/screens/Home/modules/Utilities/AddUtility/AddUtility.types';
import { SubscriptionItem } from '../app/screens/Home/modules/Subscriptions/Subscriptions/Subscriptions.types';
import { PersonalInfo } from '../app/screens/Home/modules/IdentityHub/identityHub.types';
import { PassportFormData } from './authTypes/PassportScreen.types';
import { AddSocialMediaParams } from '../app/screens/Home/modules/SocialMedia/SocialMedia.types';
import { IBookmark } from '../app/screens/Home/modules/BookMark/bookmarks.types';
import { LegalDocument } from '../app/screens/Home/modules/Legal/Legal.types';
import { BusinessDetailsParams } from '../app/screens/Business/modules/AddBusinessDetails/AddBusinessDetails.types';

// Define the parameter list for each screen
export type RootStackParamList = {
  // Onboarding
  OnBoarding: undefined;
  NewOnboarding: undefined;
  BusinessOnboarding: undefined;
  PreviewDashboards: undefined;
  AIDashboard: { spaceType?: 'Personal' | 'Business'; businessId?: number | null } | undefined;

  // Auth Screens
  Login: undefined;
  Register: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  EmailVerification: { username: string; method?: 'email' | 'phone' };
  ResetPassword: { username: string; code: string };
  NewPassword: undefined;
  OtpVerification: { verificationToken?: string; email?: string };
  MfaVerification: { mfaToken?: string } | undefined;
  VerifyPhoneNumber: { phoneNumber?: string } | undefined;
  UpdateEmail: undefined;
  IdentityForm: undefined;
  DriversLicense: { uploadedImage?: Asset } | undefined;
  IdentityHubSuccess: undefined;
  LicensesCertifications: undefined;
  Passport: undefined;
  PrivacyHealthData: undefined;
  SetupIdentityHub: undefined;
  PrivacyPolicy: undefined;
  UpdatePhoneScreen: undefined;
  UpdatePhoneNumber: undefined;
  ChoosePlan: undefined;

  // Main Screens
  IdentityLicenseCertificationsForm: { mode: string, licenseData: LicenseFormData };
  IdentityDriverLicenseForm: { mode: string, licenseData: LicenseFormData };
  IdentityPassportForm: { mode: string, passportData: PassportFormData };
  AddIdentityHubForm: {
    mode: string,
    personalData: PersonalInfo,
  };
  AddInsurancePolicy: any;
  Dashboard: { screen?: string } | undefined;
  Home: undefined;
  Account: undefined;
  Loans: { openEntityId?: number } | undefined;
  AddLoan: { loan?: any; isEdit?: boolean } | undefined;
  AddPersonalProperty: undefined;
  EditPersonalProperty: { propertyId: number; ownerUserId?: number };
  AddRealState: undefined;
  EditBookmark: { bookmark: IBookmark, isEdit: boolean } | undefined;

  // Account Screens
  AppealDecision: undefined;
  AppealDecisionRecieve: undefined;
  ChangeColorPreference: undefined;
  Languages: undefined;
  PersonalInformation: undefined;
  UpdatePersonalInformation: {
    userData?: { name: string; email: string; phone: string };
  };
  RequestAccessToData: undefined;
  RequestAccessToDataRecieve: undefined;
  RequestDeletionMyData: undefined;
  RequestDeletionMyDataRecieve: undefined;
  SubscriptionPlan: undefined;
  ChooseSubscriptionPlan: undefined;
  PrivacyHealthDataSettings: undefined;
  TermsConditions: undefined;
  FAQ: undefined;
  HelpSupport: undefined;
  SubmitTicket: undefined;
  TicketDetail: { ticketId: number };
  UpdatePassword: undefined;
  StoragePlan: undefined;
  AiAssistant: { prefillPrompt?: string; prefillMediaId?: string; prefillMediaUri?: string; prefillMediaType?: 'image' | 'document'; prefillFileName?: string } | undefined;
  AiChatbot: { prefillPrompt?: string; prefillMediaId?: string; prefillMediaUri?: string; prefillMediaType?: 'image' | 'document'; prefillFileName?: string } | undefined;
  AddBusinessContact: undefined;
  Projects: { openEntityId?: number } | undefined;
  Licenses: { openEntityId?: number } | undefined;
  BusinessTeam: { businessId: number };
  BusinessContact: { openEntityId?: number } | undefined;
  ComplianceVault: { openEntityId?: number } | undefined;
  ComplianceDetail: undefined;
  BusinessDetailsPage: { openEntityId?: number } | undefined;
  Vehicles: { openTransferId?: number; openEntityId?: number } | undefined;
  SocialMedia: { openEntityId?: number } | undefined;
  BankingFinance: { openEntityId?: number } | undefined;
  Legal: { openEntityId?: number } | undefined;
  Bookmarks: { openEntityId?: number } | undefined;
  PersonalProperty: { openEntityId?: number } | undefined;
  Pets: { openEntityId?: number } | undefined;
  Wallet: { openEntityId?: number } | undefined;
  RealEstate: { openEntityId?: number } | undefined;
  IdentityHub: { openEntityId?: number } | undefined;
  HealthTracker: { openEntityId?: number } | undefined;
  AddBusinessDetails: BusinessDetailsParams | undefined;
  Reminders: { openReminderId?: number; openReminderEntityType?: string } | undefined;
  Calendar: undefined;
  ConnectionUserDetails: { connection: Connection };
  Warranties: { openEntityId?: number } | undefined;
  AddWarranty: { warranty?: Warranty; isEdit?: boolean } | undefined;
  VehicleSoldConfirmation: undefined;
  Utilities: { utility?: UtilityData; isEdit?: boolean; openEntityId?: number } | undefined;
  AddUtility: { utility?: UtilityData; isEdit?: boolean } | undefined;
  AddSubscription:
  | { subscription: SubscriptionItem; isEdit?: boolean }
  | undefined;
  Subscriptions: { openEntityId?: number } | undefined;
  LifeEvents: undefined;
  LifeEventDetail: { id: number };
  MoneyFinder: undefined;
  AddSocialMedia: AddSocialMediaParams | undefined;
  AddLegalDocument: { document?: LegalDocument, isEdit?: boolean } | undefined;

  // User Guide Screen
  UserGuide: undefined;
  GuideDetail: { routeKey: string; title?: string };
  // Edit History Screens (generic for all modules)
  EditHistoryList: {
    entityType: string;
    entityId: number;
    title: string;
  };
  EditHistoryDetail: {
    historyEntry: any;
  };

  // Offline Sync
  SyncStatus: undefined;

  // Add other screens as needed
};
