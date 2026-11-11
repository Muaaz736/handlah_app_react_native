
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_HISTORY_KEY = '@handlah_sync_history';
const MAX_HISTORY_ENTRIES = 200; // Cap so storage doesn't grow unbounded

export type SyncStatus = 'pending' | 'success' | 'failed';

export interface SyncHistoryEntry {
  id: string;
  label: string;
  thunkTypePrefix: string;
  queuedAt: string;
  syncedAt: string | null;
  status: SyncStatus;
  retryCount: number;
  errorMessage?: string;
}

const LABEL_MAP: Record<string, string> = {
  // Auth
  DRIVER_LICENSE_ASYNC: 'Driver License',
  PASSPORT_ASYNC: 'Passport',
  LICENSES_ASYNC: 'License / Certification',
  UPDATE_DRIVER_LICENSE_ASYNC: 'Update Driver License',
  UPDATE_PASSPORT_ASYNC: 'Update Passport',
  UPDATE_LICENSE_ASYNC: 'Update License',
  UPDATE_ME_ASYNC: 'Update Profile',

  // Bookmarks
  CREATE_BOOKMARK_ASYNC: 'Add Bookmark',
  UPDATE_BOOKMARK_ASYNC: 'Update Bookmark',
  DELETE_BOOKMARK_ASYNC: 'Delete Bookmark',

  // Social Media
  SOCIAL_NETWORK_SETUP_ASYNC: 'Add Social Media',
  UPDATE_SOCIAL_NETWORK_SETUP_ASYNC: 'Update Social Media',
  DELETE_SOCIAL_NETWORK_SETUP_ASYNC: 'Delete Social Media',

  // Legal Documents
  CREATE_LEGAL_DOCUMENT_ASYNC: 'Add Document',
  UPDATE_LEGAL_DOCUMENT_ASYNC: 'Update Document',
  DELETE_LEGAL_DOCUMENT_ASYNC: 'Delete Document',

  // Pets
  ADD_PET_ASYNC: 'Add Pet',
  EDIT_PET_ASYNC: 'Update Pet',
  DELETE_PET_ASYNC: 'Delete Pet',
  ADD_PET_VACCINATION_ASYNC: 'Add Pet Vaccination',
  EDIT_PET_VACCINATION_ASYNC: 'Update Pet Vaccination',
  DELETE_PET_VACCINATION_ASYNC: 'Delete Pet Vaccination',
  ADD_PET_MEDICATION_ASYNC: 'Add Pet Medication',
  EDIT_PET_MEDICATION_ASYNC: 'Update Pet Medication',
  DELETE_PET_MEDICATION_ASYNC: 'Delete Pet Medication',
  ADD_PET_VET_APPOINTMENT_ASYNC: 'Add Pet Vet Appointment',
  EDIT_PET_VET_APPOINTMENT_ASYNC: 'Update Pet Vet Appointment',
  DELETE_PET_VET_APPOINTMENT_ASYNC: 'Delete Pet Vet Appointment',
  ADD_PET_ILLNESS_ASYNC: 'Add Pet Illness',
  EDIT_PET_ILLNESS_ASYNC: 'Update Pet Illness',
  DELETE_PET_ILLNESS_ASYNC: 'Delete Pet Illness',

  // Subscriptions
  CREATE_SUBSCRIPTION_ASYNC: 'Add Subscription',
  UPDATE_SUBSCRIPTION_ASYNC: 'Update Subscription',
  DELETE_SUBSCRIPTION_ASYNC: 'Delete Subscription',

  // Children / Health Tracker
  ADD_CHILD_ASYNC: 'Add Child',
  UPDATE_CHILD_ASYNC: 'Update Child',
  DELETE_CHILD_ASYNC: 'Delete Child',
  ADD_CHILD_MEDICATION_ASYNC: 'Add Child Medication',
  UPDATE_CHILD_MEDICATION_ASYNC: 'Update Child Medication',
  DELETE_CHILD_MEDICATION_ASYNC: 'Delete Child Medication',
  ADD_CHILD_DOCTOR_ASYNC: 'Add Child Doctor',
  UPDATE_CHILD_DOCTOR_ASYNC: 'Update Child Doctor',
  DELETE_CHILD_DOCTOR_ASYNC: 'Delete Child Doctor',
  ADD_CHILD_CAREGIVER_ASYNC: 'Add Child Caregiver',
  UPDATE_CHILD_CAREGIVER_ASYNC: 'Update Child Caregiver',
  DELETE_CHILD_CAREGIVER_ASYNC: 'Delete Child Caregiver',
  ADD_CHILD_APPOINTMENT_ASYNC: 'Add Child Appointment',
  UPDATE_CHILD_APPOINTMENT_ASYNC: 'Update Child Appointment',
  DELETE_CHILD_APPOINTMENT_ASYNC: 'Delete Child Appointment',

  // Wallet
  WALLET_ASYNC: 'Add Wallet Item',

  // Loans
  ADD_LOAN_ASYNC: 'Add Loan',
  UPDATE_LOAN_ASYNC: 'Update Loan',
  DELETE_LOAN_ASYNC: 'Delete Loan',

  // Utilities
  ADD_UTILITY_ASYNC: 'Add Utility',
  UPDATE_UTILITY_ASYNC: 'Update Utility',
  DELETE_UTILITY_ASYNC: 'Delete Utility',

  // Insurance
  ADD_INSURANCE_ASYNC: 'Add Insurance Policy',
  ADD_INSURANCES_BULK_ASYNC: 'Add Insurance Policies',
  UPDATE_INSURANCE_ASYNC: 'Update Insurance Policy',
  DELETE_INSURANCE_ASYNC: 'Delete Insurance Policy',

  // Warranties
  ADD_WARRANTY_ASYNC: 'Add Warranty',
  ADD_WARRANTIES_BULK_ASYNC: 'Add Warranties',
  UPDATE_WARRANTY_ASYNC: 'Update Warranty',
  DELETE_WARRANTY_ASYNC: 'Delete Warranty',

  // Bank Account
  ADD_BANK_ACCOUNT_ASYNC: 'Add Bank Account',
  UPDATE_BANK_ACCOUNT_ASYNC: 'Update Bank Account',
  DELETE_BANK_ACCOUNT_ASYNC: 'Delete Bank Account',

  // Personal Property
  ADD_PERSONAL_PROPERTY_ASYNC: 'Add Personal Property',
  UPDATE_PERSONAL_PROPERTY_ASYNC: 'Update Personal Property',
  DELETE_PERSONAL_PROPERTY_ASYNC: 'Delete Personal Property',
  MOVE_PERSONAL_PROPERTY_ASYNC: 'Move Personal Property',

  // Real Estate
  ADD_REAL_STATE_OVERVIEW_ASYNC: 'Add Real Estate',
  UPDATE_REAL_STATE_OVERVIEW_ASYNC: 'Update Real Estate',
  DELETE_REAL_STATE_OVERVIEW_ASYNC: 'Delete Real Estate',
  ADD_REAL_STATE_LOAN_MORTGAGE_ASYNC: 'Add Loan / Mortgage',
  UPDATE_REAL_STATE_LOAN_MORTGAGE_ASYNC: 'Update Loan / Mortgage',
  DELETE_REAL_STATE_LOAN_MORTGAGE_ASYNC: 'Delete Loan / Mortgage',
  ADD_REAL_STATE_UTILITIES_ASYNC: 'Add Real Estate Utility',
  UPDATE_REAL_STATE_UTILITIES_ASYNC: 'Update Real Estate Utility',
  DELETE_REAL_STATE_UTILITIES_ASYNC: 'Delete Real Estate Utility',
  ADD_REAL_STATE_INSURANCE_ASYNC: 'Add Real Estate Insurance',
  UPDATE_REAL_STATE_INSURANCE_ASYNC: 'Update Real Estate Insurance',
  DELETE_REAL_STATE_INSURANCE_ASYNC: 'Delete Real Estate Insurance',
  ADD_REAL_STATE_WARRANTIES_ASYNC: 'Add Real Estate Warranty',
  UPDATE_REAL_STATE_WARRANTIES_ASYNC: 'Update Real Estate Warranty',
  DELETE_REAL_STATE_WARRANTIES_ASYNC: 'Delete Real Estate Warranty',
  ADD_REAL_STATE_PERSONAL_PROPERTY_ASYNC: 'Add Property at Address',
  UPDATE_REAL_STATE_PERSONAL_PROPERTY_ASYNC: 'Update Property at Address',
  DELETE_REAL_STATE_PERSONAL_PROPERTY_ASYNC: 'Delete Property at Address',
  ADD_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC: 'Add Service / Work History',
  UPDATE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC: 'Update Service / Work History',
  DELETE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC: 'Delete Service / Work History',

  // Vehicles
  ADD_VEHICLE_ASYNC: 'Add Vehicle',
  UPDATE_VEHICLE_ASYNC: 'Update Vehicle',
  DELETE_VEHICLE_ASYNC: 'Delete Vehicle',
  ADD_VEHICLE_SERVICE_RECORDS_BULK_ASYNC: 'Add Service Records',
  UPDATE_VEHICLE_SERVICE_RECORD_ASYNC: 'Update Service Record',
  DELETE_VEHICLE_SERVICE_RECORD_ASYNC: 'Delete Service Record',
  ADD_VEHICLE_ACCIDENTS_ASYNC: 'Add Accident Record',
  UPDATE_VEHICLE_ACCIDENT_ASYNC: 'Update Accident Record',
  DELETE_VEHICLE_ACCIDENT_ASYNC: 'Delete Accident Record',

  // Favorites
  ADD_FAVORITE_TAB_ASYNC: 'Add Favorite',
  DELETE_FAVORITE_TAB_ASYNC: 'Remove Favorite',

  // Business
  CREATE_BUSINESS_ASYNC: 'Add Business',
  UPDATE_BUSINESS_ASYNC: 'Update Business',
  DELETE_BUSINESS_ASYNC: 'Delete Business',
  ADD_BUSINESS_CONTACT_ASYNC: 'Add Business Contact',
  UPDATE_BUSINESS_CONTACT_ASYNC: 'Update Business Contact',
  DELETE_BUSINESS_CONTACT_ASYNC: 'Delete Business Contact',
  ADD_BUSINESS_LICENSE_ASYNC: 'Add Business License',
  UPDATE_BUSINESS_LICENSE_ASYNC: 'Update Business License',
  DELETE_BUSINESS_LICENSE_ASYNC: 'Delete Business License',
  ADD_BUSINESS_PROJECT_ASYNC: 'Add Business Project',
  UPDATE_BUSINESS_PROJECT_ASYNC: 'Update Business Project',
  DELETE_BUSINESS_PROJECT_ASYNC: 'Delete Business Project',

  // Compliance
  ADD_COMPLIANCE_FOLDER_ASYNC: 'Add Compliance Folder',
  UPDATE_COMPLIANCE_FOLDER_ASYNC: 'Update Compliance Folder',
  DELETE_COMPLIANCE_FOLDER_ASYNC: 'Delete Compliance Folder',
  ADD_COMPLIANCE_RECORD_ASYNC: 'Add Compliance Record',
  UPDATE_COMPLIANCE_RECORD_ASYNC: 'Update Compliance Record',
  DELETE_COMPLIANCE_RECORD_ASYNC: 'Delete Compliance Record',

  // Reminders
  ADD_AD_HOC_REMINDER_ASYNC: 'Add Reminder',
  MARK_COMPLETED_REMINDER_ASYNC: 'Complete Reminder',
};

// ─── Navigation route mapping for "Discard & Redo" ───────────────────────────
// Maps TYPE_CONSTANTS → the screen the user should navigate to in order to
// re-enter the form. Only ADD/CREATE operations are mapped (not update/delete
// since those need an existing entity to edit).
export const REDO_ROUTE_MAP: Record<string, string> = {
  ADD_PET_ASYNC: 'AddPet',
  ADD_PET_VACCINATION_ASYNC: 'AddPetVaccination',
  ADD_PET_MEDICATION_ASYNC: 'AddPetMedication',
  ADD_PET_VET_APPOINTMENT_ASYNC: 'AddPetVetAppointment',
  ADD_PET_ILLNESS_ASYNC: 'AddPetIllness',
  ADD_CHILD_ASYNC: 'AddChild',
  ADD_VEHICLE_ASYNC: 'AddVehicle',
  ADD_REAL_STATE_OVERVIEW_ASYNC: 'AddRealState',
  ADD_LOAN_ASYNC: 'AddLoan',
  ADD_UTILITY_ASYNC: 'AddUtility',
  ADD_INSURANCE_ASYNC: 'AddInsurancePolicy',
  ADD_WARRANTY_ASYNC: 'AddWarranty',
  ADD_BANK_ACCOUNT_ASYNC: 'AddBankAccount',
  ADD_PERSONAL_PROPERTY_ASYNC: 'AddPersonalProperty',
  CREATE_BOOKMARK_ASYNC: 'AddBookmark',
  CREATE_SUBSCRIPTION_ASYNC: 'AddSubscription',
  CREATE_LEGAL_DOCUMENT_ASYNC: 'AddLegalDocument',
  ADD_BUSINESS_CONTACT_ASYNC: 'AddBusinessContact',
  ADD_BUSINESS_LICENSE_ASYNC: 'AddBusinessLicense',
  ADD_BUSINESS_PROJECT_ASYNC: 'AddBusinessProject',
  SOCIAL_NETWORK_SETUP_ASYNC: 'AddSocialMedia',
  CREATE_BUSINESS_ASYNC: 'AddBusinessDetails',
  ADD_AD_HOC_REMINDER_ASYNC: 'AddAdHocReminder',
  DRIVER_LICENSE_ASYNC: 'DriversLicense',
  PASSPORT_ASYNC: 'Passport',
  LICENSES_ASYNC: 'LicensesCertifications',
};

export const getLabel = (thunkTypePrefix: string): string => {
  if (LABEL_MAP[thunkTypePrefix]) return LABEL_MAP[thunkTypePrefix];

  return thunkTypePrefix
    .replace(/_ASYNC$/, '')          
    .split('_')                   
    .map((word, i) =>             
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase(),
    )
    .join(' ');
};

// ─── Storage helpers ─────────────────────────────────────────────────────────

const getHistory = async (): Promise<SyncHistoryEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHistory = async (history: SyncHistoryEntry[]): Promise<void> => {
  const trimmed = history.slice(-MAX_HISTORY_ENTRIES);
  await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(trimmed));
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const addPendingEntry = async (
  id: string,
  thunkTypePrefix: string,
  queuedAt: string,
): Promise<void> => {
  const history = await getHistory();
  history.push({
    id,
    label: getLabel(thunkTypePrefix),
    thunkTypePrefix,
    queuedAt,
    syncedAt: null,
    status: 'pending',
    retryCount: 0,
  });
  await saveHistory(history);
};

export const markSuccess = async (id: string): Promise<void> => {
  const history = await getHistory();
  const idx = history.findIndex((e) => e.id === id);
  if (idx !== -1) {
    history[idx].status = 'success';
    history[idx].syncedAt = new Date().toISOString();
  }
  await saveHistory(history);
};

export const markFailed = async (
  id: string,
  retryCount: number,
  errorMessage?: string,
): Promise<void> => {
  const history = await getHistory();
  const idx = history.findIndex((e) => e.id === id);
  if (idx !== -1) {
    history[idx].status = 'failed';
    history[idx].retryCount = retryCount;
    history[idx].syncedAt = new Date().toISOString();
    if (errorMessage) history[idx].errorMessage = errorMessage;
  }
  await saveHistory(history);
};


export const getSyncHistory = async (): Promise<SyncHistoryEntry[]> => {
  const history = await getHistory();
  return history.sort(
    (a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime(),
  );
};

export const removeHistoryEntry = async (id: string): Promise<void> => {
  const history = await getHistory();
  await saveHistory(history.filter((e) => e.id !== id));
};

export const clearSyncHistory = async (): Promise<void> => {
  await AsyncStorage.removeItem(SYNC_HISTORY_KEY);
};


export const getSyncCounts = async (): Promise<{
  pending: number;
  success: number;
  failed: number;
}> => {
  const history = await getHistory();
  return {
    pending: history.filter((e) => e.status === 'pending').length,
    success: history.filter((e) => e.status === 'success').length,
    failed: history.filter((e) => e.status === 'failed').length,
  };
};
