/** Linkable modules. Keys match the API's RecordLinkModules (and the web app) and must never change. */
export const RECORD_LINK_MODULE = {
  Expense: 'utility',
  RealEstate: 'realestate',
  Vehicle: 'vehicle',
  Property: 'property',
  BankAccount: 'bankaccount',
  Loan: 'loan',
  Insurance: 'insurance',
  Warranty: 'warranty',
  Subscription: 'subscription',
  LegalDocument: 'legaldocument',
  SocialMedia: 'socialmedia',
  Bookmark: 'bookmark',
  Passport: 'passport',
  DriverLicense: 'driverlicense',
  LicenseCertification: 'licensecertification',
  Pet: 'pet',
  BusinessContact: 'businesscontact',
  BusinessProject: 'businessproject',
  BusinessLicense: 'businesslicense',
  ComplianceFolder: 'compliancefolder',
  HealthMember: 'healthmember',
  Caregiver: 'caregiver',
  Doctor: 'doctor',
  HealthAppointment: 'healthappointment',
  Illness: 'illness',
  Medication: 'medication',
  Surgery: 'surgery',
  PetVaccination: 'petvaccination',
  PetMedication: 'petmedication',
  PetVetAppointment: 'petvetappointment',
  PetIllness: 'petillness',
  VehicleService: 'vehicleservice',
  VehicleAccident: 'vehicleaccident',
  RealEstateService: 'realestateservice',
  ComplianceDocument: 'compliancedocument',
} as const;

export interface RecordLinkScreen {
  /** The module's screen. It opens the record's detail pop-up from `openEntityId`. */
  screen: string;
  /** The screen opens the record's edit form from `openEntityIdForEdit` (through its own security check). */
  canEdit?: boolean;
  /** The record lives inside its parent (a vehicle's service, a pet's vaccination…): open the parent. */
  useParent?: boolean;
}

const M = RECORD_LINK_MODULE;

/** Where each kind of linked record opens in the app (same screens on the personal and business side). */
const SCREENS: Record<string, RecordLinkScreen> = {
  [M.Expense]: { screen: 'Utilities', canEdit: true },
  [M.RealEstate]: { screen: 'RealEstate', canEdit: true },
  [M.Vehicle]: { screen: 'Vehicles', canEdit: true },
  [M.Property]: { screen: 'PersonalProperty', canEdit: true },
  [M.BankAccount]: { screen: 'BankingFinance', canEdit: true },
  [M.Loan]: { screen: 'Loans', canEdit: true },
  [M.Insurance]: { screen: 'Insurance', canEdit: true },
  [M.Warranty]: { screen: 'Warranties', canEdit: true },
  [M.Subscription]: { screen: 'Subscriptions', canEdit: true },
  [M.LegalDocument]: { screen: 'Legal', canEdit: true },
  [M.SocialMedia]: { screen: 'SocialMedia', canEdit: true },
  [M.Bookmark]: { screen: 'Bookmarks', canEdit: true },
  [M.Passport]: { screen: 'IdentityHub' },
  [M.DriverLicense]: { screen: 'IdentityHub' },
  [M.LicenseCertification]: { screen: 'IdentityHub' },
  [M.Pet]: { screen: 'Pets' },
  [M.BusinessContact]: { screen: 'BusinessContact' },
  [M.BusinessProject]: { screen: 'Projects', canEdit: true },
  [M.BusinessLicense]: { screen: 'Licenses' },
  [M.ComplianceFolder]: { screen: 'ComplianceVault' },
  [M.ComplianceDocument]: { screen: 'ComplianceVault', useParent: true },
  [M.HealthMember]: { screen: 'HealthTracker' },
  [M.Caregiver]: { screen: 'HealthTracker', useParent: true },
  [M.Doctor]: { screen: 'HealthTracker', useParent: true },
  [M.HealthAppointment]: { screen: 'HealthTracker', useParent: true },
  [M.Illness]: { screen: 'HealthTracker', useParent: true },
  [M.Medication]: { screen: 'HealthTracker', useParent: true },
  [M.Surgery]: { screen: 'HealthTracker', useParent: true },
  [M.PetVaccination]: { screen: 'Pets', useParent: true },
  [M.PetMedication]: { screen: 'Pets', useParent: true },
  [M.PetVetAppointment]: { screen: 'Pets', useParent: true },
  [M.PetIllness]: { screen: 'Pets', useParent: true },
  [M.VehicleService]: { screen: 'Vehicles', useParent: true },
  [M.VehicleAccident]: { screen: 'Vehicles', useParent: true },
  [M.RealEstateService]: { screen: 'RealEstate', useParent: true },
};

export const recordLinkScreen = (moduleKey: string): RecordLinkScreen | undefined => SCREENS[moduleKey];
