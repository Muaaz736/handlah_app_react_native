
// ─── Auth Service ────────────────────────────────────────────────────────────
import {
  driverLicenseAsync,
  passportAsync,
  licensesAsync,
  updateDriverLicenseAsync,
  updatePassportAsync,
  updateLicenseAsync,
  updateMeAsync,
} from '../../redux/services/authService';

// ─── Essentials Service ──────────────────────────────────────────────────────
import {
  createBookmarkAsync,
  updateBookmarkAsync,
  deleteBookmarkAsync,
  socialNetworkSetupAsync,
  updateSocialNetworkSetupAsync,
  deleteSocialNetworkSetupAsync,
  createLegalDocumentAsync,
  updateLegalDocumentAsync,
  deleteLegalDocumentAsync,
  addPetAsync,
  editPetAsync,
  deletePetAsync,
  addPetVaccinationAsync,
  editPetVaccinationAsync,
  deletePetVaccinationAsync,
  addPetMedicationAsync,
  editPetMedicationAsync,
  deletePetMedicationAsync,
  addPetVetAppointmentAsync,
  editPetVetAppointmentAsync,
  deletePetVetAppointmentAsync,
  addPetIllnessAsync,
  editPetIllnessAsync,
  deletePetIllnessAsync,
  createSubscriptionAsync,
  updateSubscriptionAsync,
  deleteSubscriptionAsync,
  addChildAsync,
  updateChildAsync,
  deleteChildAsync,
  addChildMedicationAsync,
  updateChildMedicationAsync,
  deleteChildMedicationAsync,
  addChildDoctorAsync,
  updateChildDoctorAsync,
  deleteChildDoctorAsync,
  addChildCaregiverAsync,
  updateChildCaregiverAsync,
  deleteChildCaregiverAsync,
  addChildAppointmentAsync,
  updateChildAppointmentAsync,
  deleteChildAppointmentAsync,
  addChildIllnessAsync,
  updateChildIllnessAsync,
  deleteChildIllnessAsync,
  addChildSurgeryAsync,
  updateChildSurgeryAsync,
  deleteChildSurgeryAsync,
  addFavoriteTabAsync,
  deleteFavoriteTabAsync,
} from '../../redux/services/essentialsService';

// ─── Liabilities Service ─────────────────────────────────────────────────────
import {
  addLoanAsync,
  updateLoanAsync,
  deleteLoanAsync,
  addUtilityAsync,
  updateUtilityAsync,
  deleteUtilityAsync,
  addInsuranceAsync,
  addInsurancesBulkAsync,
  updateInsuranceAsync,
  deleteInsuranceAsync,
  addWarrantyAsync,
  addWarrantiesBulkAsync,
  updateWarrantyAsync,
  deleteWarrantyAsync,
} from '../../redux/services/liabilitiesService';

// ─── Assets Service ──────────────────────────────────────────────────────────
import {
  addPersonalPropertyAsync,
  updatePersonalPropertyAsync,
  deletePersonalPropertyAsync,
  movePersonalPropertyAsync,
  addBankAccountAsync,
  updateBankAccountAsync,
  deleteBankAccountAsync,
  addRealStateOverviewAsync,
  updateRealStateOverviewAsync,
  deleteRealStateOverviewAsync,
  addRealStateLoanMortgageAsync,
  updateRealStateLoanMortgageAsync,
  deleteRealStateLoanMortgageAsync,
  addRealStateUtilitiesAsync,
  updateRealStateUtilitiesAsync,
  deleteRealStateUtilitiesAsync,
  addRealStateInsuranceAsync,
  updateRealStateInsuranceAsync,
  deleteRealStateInsuranceAsync,
  addRealStateWarrantiesAsync,
  updateRealStateWarrantiesAsync,
  deleteRealStateWarrantiesAsync,
  addRealStatePersonalPropertyAsync,
  updateRealStatePersonalPropertyAsync,
  deleteRealStatePersonalPropertyAsync,
  addRealStateServiceWorkHistoryAsync,
  updateRealStateServiceWorkHistoryAsync,
  deleteRealStateServiceWorkHistoryAsync,
  addVehicleAsync,
  updateVehicleAsync,
  deleteVehicleAsync,
  addVehicleServiceRecordsBulkAsync,
  updateVehicleServiceRecordAsync,
  deleteVehicleServiceRecordAsync,
  addVehicleAccidentAsync,
  updateVehicleAccidentAsync,
  deleteVehicleAccidentAsync,
} from '../../redux/services/assetsService';

// ─── Business Service ────────────────────────────────────────────────────────
import {
  createBusinessAsync,
  updateBusinessAsync,
  deleteBusinessAsync,
} from '../../redux/services/businessService';

// ─── Business Contacts Service ───────────────────────────────────────────────
import {
  addBusinessContactAsync,
  updateBusinessContactAsync,
  deleteBusinessContactAsync,
} from '../../redux/services/businessContactsService';

// ─── Business Licenses Service ───────────────────────────────────────────────
import {
  addBusinessLicenseAsync,
  updateBusinessLicenseAsync,
  deleteBusinessLicenseAsync,
  addComplianceFolderAsync,
  updateComplianceFolderAsync,
  deleteComplianceFolderAsync,
  addComplianceRecordAsync,
  updateComplianceRecordAsync,
  deleteComplianceRecordAsync,
} from '../../redux/services/businessLicensesService';

// ─── Business Projects Service ───────────────────────────────────────────────
import {
  addBusinessProjectAsync,
  updateBusinessProjectAsync,
  deleteBusinessProjectAsync,
} from '../../redux/services/businessProjectsService';

import { TYPE_CONSTANTS } from '../../config/constants';

/**
 * Registry: TYPE_CONSTANT → thunk function
 *
 * Only includes thunks that WRITE data (POST/PUT/DELETE/PATCH).
 * GET-only thunks are not queued offline.
 */
export const thunkRegistry: Record<string, any> = {
  // Auth — Identity Hub & Profile (these DO support offline queueing)
  [TYPE_CONSTANTS.UPDATE_ME_ASYNC]: updateMeAsync,
  [TYPE_CONSTANTS.DRIVER_LICENSE_ASYNC]: driverLicenseAsync,
  [TYPE_CONSTANTS.PASSPORT_ASYNC]: passportAsync,
  [TYPE_CONSTANTS.LICENSES_ASYNC]: licensesAsync,
  [TYPE_CONSTANTS.UPDATE_DRIVER_LICENSE_ASYNC]: updateDriverLicenseAsync,
  [TYPE_CONSTANTS.UPDATE_PASSPORT_ASYNC]: updatePassportAsync,
  [TYPE_CONSTANTS.UPDATE_LICENSE_ASYNC]: updateLicenseAsync,

  // Bookmarks
  [TYPE_CONSTANTS.CREATE_BOOKMARK_ASYNC]: createBookmarkAsync,
  [TYPE_CONSTANTS.UPDATE_BOOKMARK_ASYNC]: updateBookmarkAsync,
  [TYPE_CONSTANTS.DELETE_BOOKMARK_ASYNC]: deleteBookmarkAsync,

  // Social Networks
  [TYPE_CONSTANTS.SOCIAL_NETWORK_SETUP_ASYNC]: socialNetworkSetupAsync,
  [TYPE_CONSTANTS.UPDATE_SOCIAL_NETWORK_SETUP_ASYNC]: updateSocialNetworkSetupAsync,
  [TYPE_CONSTANTS.DELETE_SOCIAL_NETWORK_SETUP_ASYNC]: deleteSocialNetworkSetupAsync,

  // Subscriptions
  [TYPE_CONSTANTS.CREATE_SUBSCRIPTION_ASYNC]: createSubscriptionAsync,
  [TYPE_CONSTANTS.UPDATE_SUBSCRIPTION_ASYNC]: updateSubscriptionAsync,
  [TYPE_CONSTANTS.DELETE_SUBSCRIPTION_ASYNC]: deleteSubscriptionAsync,

  // Legal Documents
  [TYPE_CONSTANTS.CREATE_LEGAL_DOCUMENT_ASYNC]: createLegalDocumentAsync,
  [TYPE_CONSTANTS.UPDATE_LEGAL_DOCUMENT_ASYNC]: updateLegalDocumentAsync,
  [TYPE_CONSTANTS.DELETE_LEGAL_DOCUMENT_ASYNC]: deleteLegalDocumentAsync,

  // Pets
  [TYPE_CONSTANTS.ADD_PET_ASYNC]: addPetAsync,
  [TYPE_CONSTANTS.EDIT_PET_ASYNC]: editPetAsync,
  [TYPE_CONSTANTS.DELETE_PET_ASYNC]: deletePetAsync,
  [TYPE_CONSTANTS.ADD_PET_VACCINATION_ASYNC]: addPetVaccinationAsync,
  [TYPE_CONSTANTS.EDIT_PET_VACCINATION_ASYNC]: editPetVaccinationAsync,
  [TYPE_CONSTANTS.DELETE_PET_VACCINATION_ASYNC]: deletePetVaccinationAsync,
  [TYPE_CONSTANTS.ADD_PET_MEDICATION_ASYNC]: addPetMedicationAsync,
  [TYPE_CONSTANTS.EDIT_PET_MEDICATION_ASYNC]: editPetMedicationAsync,
  [TYPE_CONSTANTS.DELETE_PET_MEDICATION_ASYNC]: deletePetMedicationAsync,
  [TYPE_CONSTANTS.ADD_PET_VET_APPOINTMENT_ASYNC]: addPetVetAppointmentAsync,
  [TYPE_CONSTANTS.EDIT_PET_VET_APPOINTMENT_ASYNC]: editPetVetAppointmentAsync,
  [TYPE_CONSTANTS.DELETE_PET_VET_APPOINTMENT_ASYNC]: deletePetVetAppointmentAsync,
  [TYPE_CONSTANTS.ADD_PET_ILLNESS_ASYNC]: addPetIllnessAsync,
  [TYPE_CONSTANTS.EDIT_PET_ILLNESS_ASYNC]: editPetIllnessAsync,
  [TYPE_CONSTANTS.DELETE_PET_ILLNESS_ASYNC]: deletePetIllnessAsync,

  // Health Tracker — Children
  [TYPE_CONSTANTS.ADD_CHILD_ASYNC]: addChildAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_ASYNC]: updateChildAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_ASYNC]: deleteChildAsync,
  [TYPE_CONSTANTS.ADD_CHILD_MEDICATION_ASYNC]: addChildMedicationAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_MEDICATION_ASYNC]: updateChildMedicationAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_MEDICATION_ASYNC]: deleteChildMedicationAsync,
  [TYPE_CONSTANTS.ADD_CHILD_DOCTOR_ASYNC]: addChildDoctorAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_DOCTOR_ASYNC]: updateChildDoctorAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_DOCTOR_ASYNC]: deleteChildDoctorAsync,
  [TYPE_CONSTANTS.ADD_CHILD_CAREGIVER_ASYNC]: addChildCaregiverAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_CAREGIVER_ASYNC]: updateChildCaregiverAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_CAREGIVER_ASYNC]: deleteChildCaregiverAsync,
  [TYPE_CONSTANTS.ADD_CHILD_APPOINTMENT_ASYNC]: addChildAppointmentAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_APPOINTMENT_ASYNC]: updateChildAppointmentAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_APPOINTMENT_ASYNC]: deleteChildAppointmentAsync,
  [TYPE_CONSTANTS.ADD_CHILD_ILLNESS_ASYNC]: addChildIllnessAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_ILLNESS_ASYNC]: updateChildIllnessAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_ILLNESS_ASYNC]: deleteChildIllnessAsync,
  [TYPE_CONSTANTS.ADD_CHILD_SURGERY_ASYNC]: addChildSurgeryAsync,
  [TYPE_CONSTANTS.UPDATE_CHILD_SURGERY_ASYNC]: updateChildSurgeryAsync,
  [TYPE_CONSTANTS.DELETE_CHILD_SURGERY_ASYNC]: deleteChildSurgeryAsync,

  // Favorites
  [TYPE_CONSTANTS.ADD_FAVORITE_TAB_ASYNC]: addFavoriteTabAsync,
  [TYPE_CONSTANTS.DELETE_FAVORITE_TAB_ASYNC]: deleteFavoriteTabAsync,

  // Loans
  [TYPE_CONSTANTS.ADD_LOAN_ASYNC]: addLoanAsync,
  [TYPE_CONSTANTS.UPDATE_LOAN_ASYNC]: updateLoanAsync,
  [TYPE_CONSTANTS.DELETE_LOAN_ASYNC]: deleteLoanAsync,

  // Utilities
  [TYPE_CONSTANTS.ADD_UTILITY_ASYNC]: addUtilityAsync,
  [TYPE_CONSTANTS.UPDATE_UTILITY_ASYNC]: updateUtilityAsync,
  [TYPE_CONSTANTS.DELETE_UTILITY_ASYNC]: deleteUtilityAsync,

  // Insurance
  [TYPE_CONSTANTS.ADD_INSURANCE_ASYNC]: addInsuranceAsync,
  [TYPE_CONSTANTS.ADD_INSURANCES_BULK_ASYNC]: addInsurancesBulkAsync,
  [TYPE_CONSTANTS.UPDATE_INSURANCE_ASYNC]: updateInsuranceAsync,
  [TYPE_CONSTANTS.DELETE_INSURANCE_ASYNC]: deleteInsuranceAsync,

  // Warranties
  [TYPE_CONSTANTS.ADD_WARRANTY_ASYNC]: addWarrantyAsync,
  [TYPE_CONSTANTS.ADD_WARRANTIES_BULK_ASYNC]: addWarrantiesBulkAsync,
  [TYPE_CONSTANTS.UPDATE_WARRANTY_ASYNC]: updateWarrantyAsync,
  [TYPE_CONSTANTS.DELETE_WARRANTY_ASYNC]: deleteWarrantyAsync,

  // Personal Property
  [TYPE_CONSTANTS.ADD_PERSONAL_PROPERTY_ASYNC]: addPersonalPropertyAsync,
  [TYPE_CONSTANTS.UPDATE_PERSONAL_PROPERTY_ASYNC]: updatePersonalPropertyAsync,
  [TYPE_CONSTANTS.DELETE_PERSONAL_PROPERTY_ASYNC]: deletePersonalPropertyAsync,
  [TYPE_CONSTANTS.MOVE_PERSONAL_PROPERTY_ASYNC]: movePersonalPropertyAsync,

  // Bank Account
  [TYPE_CONSTANTS.ADD_BANK_ACCOUNT_ASYNC]: addBankAccountAsync,
  [TYPE_CONSTANTS.UPDATE_BANK_ACCOUNT_ASYNC]: updateBankAccountAsync,
  [TYPE_CONSTANTS.DELETE_BANK_ACCOUNT_ASYNC]: deleteBankAccountAsync,

  // Real Estate
  [TYPE_CONSTANTS.ADD_REAL_STATE_OVERVIEW_ASYNC]: addRealStateOverviewAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_OVERVIEW_ASYNC]: updateRealStateOverviewAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_OVERVIEW_ASYNC]: deleteRealStateOverviewAsync,
  [TYPE_CONSTANTS.ADD_REAL_STATE_LOAN_MORTGAGE_ASYNC]: addRealStateLoanMortgageAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_LOAN_MORTGAGE_ASYNC]: updateRealStateLoanMortgageAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_LOAN_MORTGAGE_ASYNC]: deleteRealStateLoanMortgageAsync,
  [TYPE_CONSTANTS.ADD_REAL_STATE_UTILITIES_ASYNC]: addRealStateUtilitiesAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_UTILITIES_ASYNC]: updateRealStateUtilitiesAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_UTILITIES_ASYNC]: deleteRealStateUtilitiesAsync,
  [TYPE_CONSTANTS.ADD_REAL_STATE_INSURANCE_ASYNC]: addRealStateInsuranceAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_INSURANCE_ASYNC]: updateRealStateInsuranceAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_INSURANCE_ASYNC]: deleteRealStateInsuranceAsync,
  [TYPE_CONSTANTS.ADD_REAL_STATE_WARRANTIES_ASYNC]: addRealStateWarrantiesAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_WARRANTIES_ASYNC]: updateRealStateWarrantiesAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_WARRANTIES_ASYNC]: deleteRealStateWarrantiesAsync,
  [TYPE_CONSTANTS.ADD_REAL_STATE_PERSONAL_PROPERTY_ASYNC]: addRealStatePersonalPropertyAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_PERSONAL_PROPERTY_ASYNC]: updateRealStatePersonalPropertyAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_PERSONAL_PROPERTY_ASYNC]: deleteRealStatePersonalPropertyAsync,
  [TYPE_CONSTANTS.ADD_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC]: addRealStateServiceWorkHistoryAsync,
  [TYPE_CONSTANTS.UPDATE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC]: updateRealStateServiceWorkHistoryAsync,
  [TYPE_CONSTANTS.DELETE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC]: deleteRealStateServiceWorkHistoryAsync,

  // Vehicles
  [TYPE_CONSTANTS.ADD_VEHICLE_ASYNC]: addVehicleAsync,
  [TYPE_CONSTANTS.UPDATE_VEHICLE_ASYNC]: updateVehicleAsync,
  [TYPE_CONSTANTS.DELETE_VEHICLE_ASYNC]: deleteVehicleAsync,
  [TYPE_CONSTANTS.ADD_VEHICLE_SERVICE_RECORDS_BULK_ASYNC]: addVehicleServiceRecordsBulkAsync,
  [TYPE_CONSTANTS.UPDATE_VEHICLE_SERVICE_RECORD_ASYNC]: updateVehicleServiceRecordAsync,
  [TYPE_CONSTANTS.DELETE_VEHICLE_SERVICE_RECORD_ASYNC]: deleteVehicleServiceRecordAsync,
  [TYPE_CONSTANTS.ADD_VEHICLE_ACCIDENTS_ASYNC]: addVehicleAccidentAsync,
  [TYPE_CONSTANTS.UPDATE_VEHICLE_ACCIDENT_ASYNC]: updateVehicleAccidentAsync,
  [TYPE_CONSTANTS.DELETE_VEHICLE_ACCIDENT_ASYNC]: deleteVehicleAccidentAsync,

  // Business
  [TYPE_CONSTANTS.CREATE_BUSINESS_ASYNC]: createBusinessAsync,
  [TYPE_CONSTANTS.UPDATE_BUSINESS_ASYNC]: updateBusinessAsync,
  [TYPE_CONSTANTS.DELETE_BUSINESS_ASYNC]: deleteBusinessAsync,

  // Business Contacts
  [TYPE_CONSTANTS.ADD_BUSINESS_CONTACT_ASYNC]: addBusinessContactAsync,
  [TYPE_CONSTANTS.UPDATE_BUSINESS_CONTACT_ASYNC]: updateBusinessContactAsync,
  [TYPE_CONSTANTS.DELETE_BUSINESS_CONTACT_ASYNC]: deleteBusinessContactAsync,

  // Business Licenses
  [TYPE_CONSTANTS.ADD_BUSINESS_LICENSE_ASYNC]: addBusinessLicenseAsync,
  [TYPE_CONSTANTS.UPDATE_BUSINESS_LICENSE_ASYNC]: updateBusinessLicenseAsync,
  [TYPE_CONSTANTS.DELETE_BUSINESS_LICENSE_ASYNC]: deleteBusinessLicenseAsync,

  // Compliance Folders
  [TYPE_CONSTANTS.ADD_COMPLIANCE_FOLDER_ASYNC]: addComplianceFolderAsync,
  [TYPE_CONSTANTS.UPDATE_COMPLIANCE_FOLDER_ASYNC]: updateComplianceFolderAsync,
  [TYPE_CONSTANTS.DELETE_COMPLIANCE_FOLDER_ASYNC]: deleteComplianceFolderAsync,

  // Compliance Records
  [TYPE_CONSTANTS.ADD_COMPLIANCE_RECORD_ASYNC]: addComplianceRecordAsync,
  [TYPE_CONSTANTS.UPDATE_COMPLIANCE_RECORD_ASYNC]: updateComplianceRecordAsync,
  [TYPE_CONSTANTS.DELETE_COMPLIANCE_RECORD_ASYNC]: deleteComplianceRecordAsync,

  // Business Projects
  [TYPE_CONSTANTS.ADD_BUSINESS_PROJECT_ASYNC]: addBusinessProjectAsync,
  [TYPE_CONSTANTS.UPDATE_BUSINESS_PROJECT_ASYNC]: updateBusinessProjectAsync,
  [TYPE_CONSTANTS.DELETE_BUSINESS_PROJECT_ASYNC]: deleteBusinessProjectAsync,
};
