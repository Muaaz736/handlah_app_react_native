import UserGuideScreen from '../app/screens/Account/UserGuideScreen';
import GuideDetailScreen from '../app/screens/Account/GuideDetailScreen';

import OnBoardingScreen from '../app/OnBoarding/OnBoardingScreen';
import NewOnboardingContainer from '../app/OnBoarding/NewOnboarding/NewOnboardingContainer/NewOnboardingContainer';
import BusinessOnboardingContainer from '../app/OnBoarding/NewOnboarding/BusinessOnboardingContainer/BusinessOnboardingContainer';
import PreviewDashboards from '../app/OnBoarding/NewOnboarding/PreviewDashboards/PreviewDashboards';
import AIDashboard from '../app/OnBoarding/NewOnboarding/AIDashboard/AIDashboard';
import Login from '../app/auth/Login/Login';
import Signup from '../app/auth/Signup/Signup';
import OTPVerificationScreen from '../app/auth/OtpVerification/OtpVerification';
import MfaVerificationScreen from '../app/auth/MfaVerification/MfaVerification';
import UpdateEmailScreen from '../app/auth/UpdateEmailScreen/UpdateEmailScreen';
import VerifyPhoneScreen from '../app/auth/VerifyPhoneScreen/VerifyPhoneScreen';
import UpdatePhoneScreen from '../app/auth/UpdatePhoneScreen/UpdatePhoneScreen';
import ChoosePlanScreen from '../app/auth/ChoosePlanScreen/ChoosePlanScreen';
import PrivacyHealthDataScreen from '../app/auth/PrivacyHealthDataScreen/PrivacyHealthDataScreen';
import SetupIdentityHubScreen from '../app/auth/SetupIdentityHubScreen/SetupIdentityHubScreen';
import BottomTabNavigation from '../navigation/BottomNavigation/BottomTabNavigation';
import Home from '../app/screens/Home/Home';
import AiChatbot from '../app/screens/AiAssistant/modules/AiChatbot/AiChatbot';
import Account from '../app/screens/Account/Account';
import { ICONS } from './Images';
import IdentityFormScreen from '../app/auth/IdentityFormScreen/IdentityFormScreen';
import DriversLicenseScreen from '../app/auth/DriversLicenseScreen/DriversLicenseScreen';
import PassportScreen from '../app/auth/PassportScreen/PassportScreen';
import LicensesCertificationsScreen from '../app/auth/LicensesCertificationsScreen/LicensesCertificationsScreen';
import IdentityHubSuccessScreen from '../app/auth/IdentityHubSuccessScreen/IdentityHubSuccessScreen';
import ForgotPasswordScreen from '../app/auth/ForgotPasswordScreen/ForgotPasswordScreen';
import EmailVerificationScreen from '../app/auth/EmailVerificationScreen/EmailVerificationScreen';
import NewPasswordScreen from '../app/auth/NewPasswordScreen/NewPasswordScreen';
import Languages from '../app/screens/Account/modules/Languages/Languages';
import Wallet from '../app/screens/Home/modules/Wallet/Wallet/Wallet';
import AddWalletDocument from '../app/screens/Home/modules/Wallet/AddWalletDocument/AddWalletDocument';
import Connections from '../app/screens/Connections/Connections';
import Subscriptions from '../app/screens/Home/modules/Subscriptions/Subscriptions/Subscriptions';
import AddSubscription from '../app/screens/Home/modules/Subscriptions/AddSubscription/AddSubscription';
import SocialMedia from '../app/screens/Home/modules/SocialMedia/SocialMedia';
import AddSocialMedia from '../app/screens/Home/modules/SocialMedia/AddSocialMedia/AddSocialMedia';
import Vehicles from '../app/screens/Home/modules/Vehicles/Vehicles';
import AddVehicle from '../app/screens/Home/modules/Vehicles/AddVehicle/AddVehicle';
import AddServiceRecords from '../app/screens/Home/modules/Vehicles/AddServiceRecords/AddServiceRecords';
import AddAccidents from '../app/screens/Home/modules/Vehicles/AddAccidents/AddAccidents';
import AddPurchaseFinancing from '../app/screens/Home/modules/Vehicles/AddPurchaseFinancing/AddPurchaseFinancing';
import AddVehicleInsurance from '../app/screens/Home/modules/Vehicles/AddVehicleInsurance/AddVehicleInsurance';
import AddVehicleWarranty from '../app/screens/Home/modules/Vehicles/AddVehicleWarranty/AddVehicleWarranty';
import SellTransferVehicle from '../app/screens/Home/modules/Vehicles/SellTransferVehicle/SellTransferVehicle';
import VehicleSoldConfirmation from '../app/screens/Home/modules/Vehicles/VehicleSoldConfirmation/VehicleSoldConfirmation';
import ReceiveVehicle from '../app/screens/Home/modules/Vehicles/ReceiveVehicle/ReceiveVehicle';
import ConnectionsRequest from '../app/screens/Connections/modules/ConnectionsRequest/ConnectionsRequest';
import ConnectionUserDetails from '../app/screens/Connections/modules/ConnectionUserDetails/ConnectionUserDetails';
import AddAdHocReminder from '../app/screens/Reminders/modules/AddAdHocReminder/AddAdHocReminder';
import PersonalInformation from '../app/screens/Account/modules/PersonalInformation/PersonalInformation';
import UpdatePersonalInformation from '../app/screens/Account/modules/PersonalInformation/UpdatePersonalInformation';
import SubscriptionPlan from '../app/screens/Account/modules/SubscriptionPlan/SubscriptionPlan';
import ChooseSubscriptionPlan from '../app/screens/Account/modules/SubscriptionPlan/ChooseSubscriptionPlan';
import UpdatePassword from '../app/screens/Account/modules/UpdatePassword/UpdatePassword';
import PrivacyPolicy from '../app/screens/Account/modules/PrivacyPolicy/PrivacyPolicy';
import StoragePlan from '../app/screens/Account/modules/StoragePlan/StoragePlan';
import PrivacyHealthDataSettings from '../app/screens/Account/modules/PrivacyHealthData/PrivacyHealthData';
import TermsConditions from '../app/screens/Account/modules/TermsConditions/TermsConditions';
import FAQ from '../app/screens/Account/modules/FAQ/FAQ';
import HelpSupport from '../app/screens/Account/modules/HelpSupport/HelpSupport';
import SubmitTicket from '../app/screens/Account/modules/HelpSupport/SubmitTicket/SubmitTicket';
import TicketDetail from '../app/screens/Account/modules/HelpSupport/TicketDetail/TicketDetail';
import ChangeColorPreference from '../app/screens/Account/modules/ChangeColorPreference/ChangeColorPreference';
import RequestAccessToData from '../app/screens/Account/modules/RequestAccessToData/RequestAccessToData';
import RequestAccessToDataRecieve from '../app/screens/Account/modules/RequestAccessToData/RequestAccessToDataRecieve';
import RequestDeletionMyData from '../app/screens/Account/modules/RequestDeletionMyData/RequestDeletionMyData';
import RequestDeletionMyDataRecieve from '../app/screens/Account/modules/RequestDeletionMyData/RequestDeletionMyDataRecieve';
import AppealDecision from '../app/screens/Account/modules/AppealDecision/AppealDecision';
import AppealDecisionRecieve from '../app/screens/Account/modules/AppealDecision/AppealDecisionRecieve';
import SyncStatusScreen from '../app/screens/Account/modules/SyncStatus/SyncStatusScreen';
import BankingFinance from '../app/screens/Home/modules/BankingOrFinance/BankingFinance';
import AddBankAccount from '../app/screens/Home/modules/BankingOrFinance/AddBankAccount';
import Loans from '../app/screens/Home/modules/Loans/Loans';
import AddLoan from '../app/screens/Home/modules/Loans/AddLoan';
import Insurance from '../app/screens/Home/modules/Insurance/Insurance';
import AddInsurancePolicy from '../app/screens/Home/modules/Insurance/AddInsurancePolicy';
import Warranties from '../app/screens/Home/modules/Warranties/Warranties/Warranties';
import AddWarranty from '../app/screens/Home/modules/Warranties/AddWarranty/AddWarranty';
import Utilities from '../app/screens/Home/modules/Utilities/Utilities/Utilities';
import AddUtility from '../app/screens/Home/modules/Utilities/AddUtility/AddUtility';
import BookMarks from '../app/screens/Home/modules/BookMark/BookMarks';
import AddBookMark from '../app/screens/Home/modules/BookMark/AddBookMark';
import EditBookMark from '../app/screens/Home/modules/BookMark/EditBookMark';
import Legal from '../app/screens/Home/modules/Legal/Legal';
import AddLegalDocument from '../app/screens/Home/modules/Legal/AddLegalDocument';
import PetsScreen from '../app/screens/Home/modules/PetsScreen/PetsScreen';
import AddPetScreen from '../app/screens/Home/modules/PetsScreen/AddPetScreen/AddPetScreen';
import AddPetVaccinationScreen from '../app/screens/Home/modules/PetsScreen/AddPetVaccinationScreen/AddPetVaccinationScreen';
import AddPetMedicationScreen from '../app/screens/Home/modules/PetsScreen/AddPetMedicationScreen/AddPetMedicationScreen';
import AddPetVetAppointmentsScreen from '../app/screens/Home/modules/PetsScreen/AddPetVetAppointmentsScreen/AddPetVetAppointmentsScreen';
import AddPetIllnessScreen from '../app/screens/Home/modules/PetsScreen/AddPetIllnessScreen/AddPetIllnessScreen';
import FavoritesManagement from '../app/screens/Home/modules/FavoritesManagement/FavoritesManagement';
import HealthTracker from '../app/screens/Home/modules/HealthTracker/HealthTracker';
import EditOverView from '../app/screens/Home/modules/HealthTracker/EditOverview/EditOverview';
import AddOverView from '../app/screens/Home/modules/HealthTracker/AddOverview/AddOverview';
import AddCaregiver from '../app/screens/Home/modules/HealthTracker/AddCaregiver/AddCaregiver';
import EditCaregiver from '../app/screens/Home/modules/HealthTracker/EditCaregiver/EditCaregiver';
import AddMedication from '../app/screens/Home/modules/HealthTracker/AddMedication/AddMedication';
import EditMedication from '../app/screens/Home/modules/HealthTracker/EditMedication/EditMedication';
import AddDoctor from '../app/screens/Home/modules/HealthTracker/AddDoctor/AddDoctor';
import EditDoctor from '../app/screens/Home/modules/HealthTracker/EditDoctor/EditDoctor';
import AddAppointment from '../app/screens/Home/modules/HealthTracker/AddAppointment/AddAppointment';
import EditAppointment from '../app/screens/Home/modules/HealthTracker/EditAppointment/EditAppointment';
import AddIllness from '../app/screens/Home/modules/HealthTracker/AddIllness/AddIllness';
import AddSurgery from '../app/screens/Home/modules/HealthTracker/AddSurgery/AddSurgery';
import AddPersonalProperty from '../app/screens/Home/modules/PersonalProperty/AddPersonalProperty';
import EditPersonalProperty from '../app/screens/Home/modules/PersonalProperty/EditPersonalProperty';
import RealEstate from '../app/screens/Home/modules/RealState/RealState';
import AddRealEstate from '../app/screens/Home/modules/RealState/AddRealState/AddRealState';
import EditRealState from '../app/screens/Home/modules/RealState/AddRealState/EditRealState';
import AddLoanMortgage from '../app/screens/Home/modules/RealState/AddLoanMortgage/AddLoanMortgage';
import AddUtilities from '../app/screens/Home/modules/RealState/AddUtilities/AddUtilities';
import AddInsurance from '../app/screens/Home/modules/RealState/AddInsurance/AddInsurance';
import AddWarranties from '../app/screens/Home/modules/RealState/AddWarranties/AddWarranties';
import AddPersonalPropertyAtAddress from '../app/screens/Home/modules/RealState/AddPersonalPropertyAtAddress/AddPersonalPropertyAtAddress';
import AddServicesWorkHistory from '../app/screens/Home/modules/RealState/AddServicesWorkHistory/AddServicesWorkHistory';
import Business from '../app/screens/Business/Business';
import BusinessContact from '../app/screens/Business/modules/BusinessContact/BusinessContact';
import AddBusinessContact from '../app/screens/Business/modules/AddBusinessContact/AddBusinessContact';
import Projects from '../app/screens/Business/modules/Projects/Projects';
import AddProject from '../app/screens/Business/modules/AddProject/AddProject';
import ComplianceVault from '../app/screens/Business/modules/ComplianceVault/ComplianceVault';
import ComplianceDetail from '../app/screens/Business/modules/ComplianceDetail/ComplianceDetail';
import AddComplianceRecord from '../app/screens/Business/modules/AddComplianceRecord/AddComplianceRecord';
import Licenses from '../app/screens/Business/modules/Licenses/Licenses';
import BusinessTeam from '../app/screens/Business/modules/BusinessTeam/BusinessTeam';
import AddLicense from '../app/screens/Business/modules/AddLicense/AddLicense';
import BusinessDetailsPage from '../app/screens/Business/modules/BusinessDetailsPage/BusinessDetailsPage';
import AddBusinessDetails from '../app/screens/Business/modules/AddBusinessDetails/AddBusinessDetails';
import IdentityHub from '../app/screens/Home/modules/IdentityHub/IdentityHub';
import IdentityPassportForm from '../app/screens/Home/modules/IdentityHub/IdentityPassportForm/IdentityPassportForm';
import IdentityDriverLicenseForm from '../app/screens/Home/modules/IdentityHub/IdentityDriverLicenseForm/IdentityDriverLicenseForm';
import IdentityLicenseCertificationsForm from '../app/screens/Home/modules/IdentityHub/IdentityLicenseCertificationsForm/IdentityLicenseCertificationsForm';

import type {
  BottomTabScreen,
  RouteNames,
  ScreenType,
  StackScreen,
} from '../types/routes.types';
import PersonalProperty from '../app/screens/Home/modules/PersonalProperty/PersonalProperty';
import AddIdentityHubForm from '../app/screens/Home/modules/IdentityHub/AddIdentityHubForm/AddIdentityHubForm';
import { SCREEN_TYPES } from './staticData';
import { User } from '../types/authTypes/Login.types';
import EditLoanMortgage from '../app/screens/Home/modules/RealState/AddLoanMortgage/EditLoanMortgage';
import EditUtilities from '../app/screens/Home/modules/RealState/AddUtilities/EditUtilities';
import EditInsurance from '../app/screens/Home/modules/RealState/AddInsurance/EditInsurance';
import EditWarranties from '../app/screens/Home/modules/RealState/AddWarranties/EditWarranties';
import EditPersonalPropertyAtAddress from '../app/screens/Home/modules/RealState/AddPersonalPropertyAtAddress/EditPersonalPropertyAtAddress';
import EditServicesWorkHistory from '../app/screens/Home/modules/RealState/AddServicesWorkHistory/EditServicesWorkHistory';
import EditHistoryList from '../app/screens/EditHistory/EditHistoryList';
import EditHistoryDetail from '../app/screens/EditHistory/EditHistoryDetail';
import SearchResultsScreen from '../app/screens/Search/SearchResultsScreen';
import CalendarScreen from '../app/screens/Calendar/Calendar';
import CalendarHub from '../app/screens/Calendar/CalendarHub';
import CalendarSyncScreen from '../app/screens/Calendar/CalendarSync';
import SharedWithMe from '../components/SharedWithMe/SharedWithMe';
import Notifications from '../app/screens/Notifications/Notifications';
import LifeEventsScreen from '../app/screens/Tools/LifeEvents/LifeEventsScreen';
import LifeEventDetailScreen from '../app/screens/Tools/LifeEvents/LifeEventDetailScreen';
import MoneyFinderScreen from '../app/screens/Tools/MoneyFinder/MoneyFinderScreen';

export const BOTTOM_TAB_SCREENS: BottomTabScreen[] = [
  {
    name: 'Home',
    component: Home,
    icon: ICONS.HOME_ICON,
    label: 'bottom_nav.home',
  },
  {
    name: 'Connections',
    component: Connections,
    icon: ICONS.CONNECTIONS_ICON,
    label: 'bottom_nav.connections',
  },
  {
    name: 'AiAssistant',
    component: AiChatbot,
    icon: ICONS.AI_ASSISTANT_ICON,
    label: 'bottom_nav.ai_assistant',
  },
  {
    name: 'Reminders',
    component: CalendarHub,
    icon: ICONS.CALENDER_ICON,
    label: 'bottom_nav.calendar',
  },
  {
    name: 'Account',
    component: Account,
    icon: ICONS.ACCOUNT_ICON,
    label: 'bottom_nav.account',
  },
];

// Business Bottom Tab Screens
export const BUSINESS_BOTTOM_TAB_SCREENS: BottomTabScreen[] = [
  {
    name: 'Home',
    component: Business,
    icon: ICONS.HOME_ICON,
    label: 'bottom_nav.home',
  },
  {
    name: 'Connections',
    component: Connections,
    icon: ICONS.CONNECTIONS_ICON,
    label: 'bottom_nav.connections',
  },
  {
    name: 'AiAssistant',
    component: AiChatbot,
    icon: ICONS.AI_ASSISTANT_ICON,
    label: 'bottom_nav.ai_assistant',
  },
  {
    name: 'Reminders',
    component: CalendarHub,
    icon: ICONS.CALENDER_ICON,
    label: 'bottom_nav.calendar',
  },
  {
    name: 'Account',
    component: Account,
    icon: ICONS.ACCOUNT_ICON,
    label: 'bottom_nav.account',
  },
];

export const STACK_SCREENS: StackScreen[] = [
  {
    name: 'OnBoarding',
    component: OnBoardingScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'NewOnboarding',
    component: NewOnboardingContainer,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'BusinessOnboarding',
    component: BusinessOnboardingContainer,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'PreviewDashboards',
    component: PreviewDashboards,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'AIDashboard',
    component: AIDashboard,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Login',
    component: Login,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'Signup',
    component: Signup,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'MfaVerification',
    component: MfaVerificationScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'ForgotPassword',
    component: ForgotPasswordScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'EmailVerification',
    component: EmailVerificationScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'NewPassword',
    component: NewPasswordScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PUBLIC,
  },
  {
    name: 'OtpVerification',
    component: OTPVerificationScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.EMAIL_VERIFICATION,
  },
  {
    name: 'UpdateEmail',
    component: UpdateEmailScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.EMAIL_VERIFICATION,
  },
  {
    name: 'VerifyPhoneNumber',
    component: VerifyPhoneScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PHONE_VERIFICATION,
  },
  {
    name: 'UpdatePhoneNumber',
    component: UpdatePhoneScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PHONE_VERIFICATION,
  },
  {
    name: 'ChoosePlan',
    component: ChoosePlanScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'PrivacyHealthData',
    component: PrivacyHealthDataScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'SetupIdentityHub',
    component: SetupIdentityHubScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },

  {
    name: 'IdentityForm',
    component: IdentityFormScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'DriversLicense',
    component: DriversLicenseScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'Passport',
    component: PassportScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'LicensesCertifications',
    component: LicensesCertificationsScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'IdentityHubSuccess',
    component: IdentityHubSuccessScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PROFILE_SETUP,
  },
  {
    name: 'Dashboard',
    component: BottomTabNavigation,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Subscriptions',
    component: Subscriptions,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'LifeEvents',
    component: LifeEventsScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'LifeEventDetail',
    component: LifeEventDetailScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'MoneyFinder',
    component: MoneyFinderScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddSubscription',
    component: AddSubscription,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Legal',
    component: Legal,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddLegalDocument',
    component: AddLegalDocument,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Pets',
    component: PetsScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPet',
    component: AddPetScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPetVaccination',
    component: AddPetVaccinationScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPetMedication',
    component: AddPetMedicationScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPetVetAppointments',
    component: AddPetVetAppointmentsScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPetIllness',
    component: AddPetIllnessScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Wallet',
    component: Wallet,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddWalletDocument',
    component: AddWalletDocument,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Bookmarks',
    component: BookMarks,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddBookmark',
    component: AddBookMark,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditBookmark',
    component: EditBookMark,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Languages',
    component: Languages,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'FavoritesManagement',
    component: FavoritesManagement,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'IdentityHub',
    component: IdentityHub,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'IdentityPassportForm',
    component: IdentityPassportForm,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'IdentityDriverLicenseForm',
    component: IdentityDriverLicenseForm,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'IdentityLicenseCertificationsForm',
    component: IdentityLicenseCertificationsForm,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddIdentityHubForm',
    component: AddIdentityHubForm,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },

  {
    name: 'SocialMedia',
    component: SocialMedia,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddSocialMedia',
    component: AddSocialMedia,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'HealthTracker',
    component: HealthTracker,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditOverView',
    component: EditOverView,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddOverView',
    component: AddOverView,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AiChatbot',
    component: AiChatbot,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditCaregiver',
    component: EditCaregiver,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddCaregiver',
    component: AddCaregiver,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddMedication',
    component: AddMedication,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditMedication',
    component: EditMedication,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddDoctor',
    component: AddDoctor,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditDoctor',
    component: EditDoctor,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddAppointment',
    component: AddAppointment,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditAppointment',
    component: EditAppointment,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddIllness',
    component: AddIllness,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddSurgery',
    component: AddSurgery,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'PersonalProperty',
    component: PersonalProperty,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPersonalProperty',
    component: AddPersonalProperty,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditPersonalProperty',
    component: EditPersonalProperty,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'RealEstate',
    component: RealEstate,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Vehicles',
    component: Vehicles,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddVehicle',
    component: AddVehicle,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddServiceRecords',
    component: AddServiceRecords,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddAccidents',
    component: AddAccidents,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPurchaseFinancing',
    component: AddPurchaseFinancing,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddVehicleWarranty',
    component: AddVehicleWarranty,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'SellTransferVehicle',
    component: SellTransferVehicle,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'VehicleSoldConfirmation',
    component: VehicleSoldConfirmation,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ReceiveVehicle',
    component: ReceiveVehicle,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'BankingFinance',
    component: BankingFinance,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddBankAccount',
    component: AddBankAccount,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Loans',
    component: Loans,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddLoan',
    component: AddLoan,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Insurance',
    component: Insurance,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddInsurancePolicy',
    component: AddInsurancePolicy,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Warranties',
    component: Warranties,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddWarranty',
    component: AddWarranty,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Utilities',
    component: Utilities,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddUtility',
    component: AddUtility,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddRealEstate',
    component: AddRealEstate,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditRealState',
    component: EditRealState,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddLoanMortgage',
    component: AddLoanMortgage,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditLoanMortgage',
    component: EditLoanMortgage,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddUtilities',
    component: AddUtilities,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditUtilities',
    component: EditUtilities,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddInsurance',
    component: AddInsurance,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditInsurance',
    component: EditInsurance,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddWarranties',
    component: AddWarranties,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditWarranties',
    component: EditWarranties,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddPersonalPropertyAtAddress',
    component: AddPersonalPropertyAtAddress,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditPersonalPropertyAtAddress',
    component: EditPersonalPropertyAtAddress,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddServicesWorkHistory',
    component: AddServicesWorkHistory,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditServicesWorkHistory',
    component: EditServicesWorkHistory,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddVehicleInsurance',
    component: AddVehicleInsurance,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ConnectionsRequest',
    component: ConnectionsRequest,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ConnectionUserDetails',
    component: ConnectionUserDetails,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddAdHocReminder',
    component: AddAdHocReminder,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'PersonalInformation',
    component: PersonalInformation,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'UpdatePersonalInformation',
    component: UpdatePersonalInformation,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'SubscriptionPlan',
    component: SubscriptionPlan,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ChooseSubscriptionPlan',
    component: ChooseSubscriptionPlan,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'UpdatePassword',
    component: UpdatePassword,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'PrivacyHealthDataSettings',
    component: PrivacyHealthDataSettings,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'TermsConditions',
    component: TermsConditions,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'FAQ',
    component: FAQ,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'HelpSupport',
    component: HelpSupport,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'SubmitTicket',
    component: SubmitTicket,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'TicketDetail',
    component: TicketDetail,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'StoragePlan',
    component: StoragePlan,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ChangeColorPreference',
    component: ChangeColorPreference,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'RequestAccessToData',
    component: RequestAccessToData,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'RequestAccessToDataRecieve',
    component: RequestAccessToDataRecieve,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'RequestDeletionMyData',
    component: RequestDeletionMyData,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'RequestDeletionMyDataRecieve',
    component: RequestDeletionMyDataRecieve,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AppealDecision',
    component: AppealDecision,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AppealDecisionRecieve',
    component: AppealDecisionRecieve,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'SyncStatus',
    component: SyncStatusScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'BusinessContact',
    component: BusinessContact,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddBusinessContact',
    component: AddBusinessContact,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Projects',
    component: Projects,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddProject',
    component: AddProject,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ComplianceVault',
    component: ComplianceVault,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'ComplianceDetail',
    component: ComplianceDetail,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddComplianceRecord',
    component: AddComplianceRecord,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Licenses',
    component: Licenses,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'BusinessTeam',
    component: BusinessTeam,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddLicense',
    component: AddLicense,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'BusinessDetailsPage',
    component: BusinessDetailsPage,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'AddBusinessDetails',
    component: AddBusinessDetails,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditHistoryList',
    component: EditHistoryList,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'EditHistoryDetail',
    component: EditHistoryDetail,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'SearchResults',
    component: SearchResultsScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Calendar',
    component: CalendarScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'CalendarSync',
    component: CalendarSyncScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'SharedWithMe',
    component: SharedWithMe,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'Notifications',
    component: Notifications,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'UserGuide',
    component: UserGuideScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
  {
    name: 'GuideDetail',
    component: GuideDetailScreen,
    header_shown: false,
    screen_types: SCREEN_TYPES.PRIVATE,
  },
];

// Function to get user's current completion status
export const getUserCompletionStatus = (userData: User | any): ScreenType => {
  if (!userData) return SCREEN_TYPES.PUBLIC;

  const { isemailverified, isphoneverified, isusersetupcomplete } = userData;

  if (!isemailverified) {
    return SCREEN_TYPES.EMAIL_VERIFICATION;
  }

  if (!isphoneverified) {
    return SCREEN_TYPES.PHONE_VERIFICATION;
  }
  if (!isusersetupcomplete) {
    return SCREEN_TYPES.PROFILE_SETUP;
  }

  return SCREEN_TYPES.PRIVATE;
};

// Shared post-auth navigation: used by both the standard login success path
// and the MFA verify success path, since they land the user in the same place.
export const navigateAfterAuth = (
  navigation: any,
  userData: User | null | undefined,
): void => {
  if (!userData) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    return;
  }

  const completionStatus = getUserCompletionStatus(userData);

  switch (completionStatus) {
    case SCREEN_TYPES.EMAIL_VERIFICATION:
      navigation.reset({
        index: 0,
        routes: [{ name: 'OtpVerification' }],
      });
      break;
    case SCREEN_TYPES.PHONE_VERIFICATION:
      navigation.reset({
        index: 0,
        routes: [{ name: 'VerifyPhoneNumber' }],
      });
      break;
    case SCREEN_TYPES.PROFILE_SETUP:
      navigation.reset({
        index: 0,
        routes: [{ name: 'IdentityForm' }],
      });
      break;
    default:
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
      break;
  }
};

// Function to get appropriate screens based on user status
export const getAvailableScreens = (
  userCompletionStatus: ScreenType,
): StackScreen[] => {
  return STACK_SCREENS.filter(screen => {
    switch (userCompletionStatus) {
      case SCREEN_TYPES.PUBLIC:
        return screen.screen_types === SCREEN_TYPES.PUBLIC;

      case SCREEN_TYPES.EMAIL_VERIFICATION:
        return (
          [SCREEN_TYPES.PUBLIC, SCREEN_TYPES.EMAIL_VERIFICATION] as ScreenType[]
        ).includes(screen.screen_types);

      case SCREEN_TYPES.PHONE_VERIFICATION:
        return (
          [
            SCREEN_TYPES.PUBLIC,
            SCREEN_TYPES.EMAIL_VERIFICATION,
            SCREEN_TYPES.PHONE_VERIFICATION,
            // SCREEN_TYPES.PROFILE_SETUP, // Allow ProfileUpload from BusinessPlanSelection
          ] as ScreenType[]
        ).includes(screen.screen_types);

      case SCREEN_TYPES.PROFILE_SETUP:
        return ([
          SCREEN_TYPES.PUBLIC,
          SCREEN_TYPES.EMAIL_VERIFICATION,
          SCREEN_TYPES.PHONE_VERIFICATION,
          SCREEN_TYPES.PROFILE_SETUP,
        ] as ScreenType[]).includes(screen.screen_types);

      case SCREEN_TYPES.PRIVATE:
        return true; // All screens available

      default:
        return screen.screen_types === SCREEN_TYPES.PUBLIC;
    }
  });
};

// Function to get the initial route based on user status
export const getInitialRoute = (
  userData: User | null,
  hasToken: boolean,
): RouteNames => {
  if (!hasToken) {
    return 'OnBoarding';
  }

  if (!userData) {
    return 'Login';
  }

  const completionStatus = getUserCompletionStatus(userData);

  switch (completionStatus) {
    case SCREEN_TYPES.EMAIL_VERIFICATION:
      return 'OtpVerification';

    case SCREEN_TYPES.PHONE_VERIFICATION:
      return 'VerifyPhoneNumber';

    case SCREEN_TYPES.PROFILE_SETUP:
      return 'NewOnboarding';

    case SCREEN_TYPES.PRIVATE:
      return 'Dashboard';

    default:
      return 'Login';
  }
};
