import { ASYNC_STATUS } from '../../config/constants';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

// API Request Payload for adding/updating business license
export interface BusinessLicensePayload {
  businessId: number;
  vendorProvider: string;
  product: string;
  plan: string;
  seats: number;
  renewalDate: string;
  autoRenew: boolean;
  cost: number;
  period: string;
  licenseKey: string;
  notes: string;
  username: string;
  password: string;
  // Licenses and permits (not software)
  licenseKind?: string;
  licenseNumber?: string;
  state?: string;
  jurisdiction?: string;
  holderName?: string;
  status?: string;
  issueDate?: string;
  location?: string;
}

// Business License Item from API (API returns lowercase fields)
export interface BusinessLicenseItemAPI {
  id: number;
  businessid: number;
  vendorprovider: string;
  product: string;
  plan: string;
  seats: number;
  renewaldate: string;
  autorenew: boolean;
  cost: number;
  period: string;
  licensekey: string;
  notes: string;
  username: string;
  password: string;
  createdat?: string;
  updatedat?: string | null;
  licensekind?: string | null;
  licensenumber?: string | null;
  state?: string | null;
  jurisdiction?: string | null;
  holdername?: string | null;
  status?: string | null;
  issuedate?: string | null;
  location?: string | null;
}

// Business License Item for App (normalized camelCase)
export interface BusinessLicenseItem {
  id: number;
  businessId: number;
  vendorProvider: string;
  product: string;
  plan: string;
  seats: number;
  renewalDate: string;
  autoRenew: boolean;
  cost: number;
  period: string;
  licenseKey: string;
  notes: string;
  username: string;
  password: string;
  createdAt?: string;
  updatedAt?: string | null;
  /** "software", or the kind of license/permit (liquor, building, contractor…). */
  licenseKind: string;
  licenseNumber?: string | null;
  state?: string | null;
  jurisdiction?: string | null;
  holderName?: string | null;
  status?: string | null;
  issueDate?: string | null;
  location?: string | null;
}

// API Response for single business license (add/update/get by id)
export interface BusinessLicenseResponse {
  success: boolean;
  message: string;
  data: BusinessLicenseItem;
}

// API Response for getting all business licenses
export type GetBusinessLicensesResponse = BusinessLicenseItemAPI[];

// Update params for partial updates
export interface UpdateBusinessLicenseParams {
  id: number;
  payload: BusinessLicensePayload;
}

// Delete response
export interface DeleteBusinessLicenseResponse {
  success: boolean;
  message: string;
  deletedId?: number;
}

// ===== COMPLIANCE FOLDERS TYPES =====

// API Request Payload for adding/updating compliance folder
export interface ComplianceFolderPayload {
  businessId: number;
  folderName: string;
}

// Compliance Folder Item from API (API returns lowercase fields)
export interface ComplianceFolderItemAPI {
  id: number;
  businessid: number;
  foldername: string;
  description: string;
  color: string;
  sortorder: number;
  createdat?: string;
  updatedat?: string | null;
  compliancerecords?: ComplianceRecordItemAPI[];
  accesslevel?: string;
  ismoduleaccess?: boolean;
}

// Compliance Folder Item for App (normalized camelCase)
export interface ComplianceFolderItem {
  id: number;
  businessId: number;
  folderName: string;
  description: string;
  color: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string | null;
  complianceRecords?: ComplianceRecordItem[];
  accesslevel?: string;
  ismoduleaccess?: boolean;
}

// API Response for single compliance folder (add/update/get by id)
export interface ComplianceFolderResponse {
  success: boolean;
  message: string;
  data: ComplianceFolderItem;
}

// API Response for getting all compliance folders
export type GetComplianceFoldersResponse = ComplianceFolderItemAPI[];

// Update params for compliance folder partial updates
export interface UpdateComplianceFolderParams {
  id: number;
  payload: ComplianceFolderPayload;
}

// Delete response for compliance folder
export interface DeleteComplianceFolderResponse {
  success: boolean;
  message: string;
  deletedId?: number;
}

// ===== COMPLIANCE RECORDS TYPES =====

export enum ComplianceRecordType {
  BusinessLicense = 1,
  TaxCompliance = 2,
  Permit = 3,
  Certification = 4,
  Insurance = 5,
  Safety = 6,
  Environmental = 7,
  FinancialReporting = 8,
  DataProtection = 9,
  Employment = 10,
  Other = 11,
}

export enum ComplianceRecordStatus {
  Valid = 1,
  Due = 2,
  Expired = 3,
  Pending = 4,
  UnderReview = 5,
  Rejected = 6,
  Cancelled = 7,
}

// API Request Payload for adding compliance record
export interface ComplianceRecordPayload {
  businessId: number;
  complianceFolderId: number;
  title: string;
  type: number;
  status: number;
  dueDate: string;
  notes: string;
  documentUrl: string | string[];
}
export interface UpdateComplianceRecordPayload {
  title: string;
  type: number;
  status: number;
  dueDate: string;
  notes: string;
  documentUrl: string | string[];
}

// Compliance Record from API (raw lowercase fields)
export interface ComplianceRecordItemAPI {
  id: number;
  businessid: number;
  compliancefolderid: number;
  title: string;
  type: number;
  status: number;
  duedate: string;
  notes: string;
  documentUrl: string | string[];
  createdat?: string;
  updatedat?: string | null;
  accesslevel?: string;
  ismoduleaccess?: boolean;
}

// Compliance Record for App (normalized camelCase)
export interface ComplianceRecordItem {
  id: number;
  businessId: number;
  complianceFolderId: number;
  title: string;
  type: number;
  status: number;
  dueDate: string;
  notes: string;
  documentUrl: string | string[];
  createdAt?: string;
  updatedAt?: string | null;
  accesslevel?: string;
  ismoduleaccess?: boolean;
}

// API Response for single compliance record
export interface ComplianceRecordResponse {
  success: boolean;
  message: string;
  data: ComplianceRecordItem;
}

// API Response for getting all compliance records
export type GetComplianceRecordsResponse = ComplianceRecordItemAPI[];

// Update params
export interface UpdateComplianceRecordParams {
  id: number;
  payload: UpdateComplianceRecordPayload;
  businessId?: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

// Delete response for compliance record
export interface DeleteComplianceRecordResponse {
  success: boolean;
  message: string;
  deletedId?: number;
}

// Redux State
export interface BusinessLicensesState {
  // Get business licenses (list)
  get_business_licenses_status: AsyncStatusType;
  get_business_licenses_data: BusinessLicenseItem[] | null;
  get_business_licenses_error: string | null;

  // Get business license by ID
  get_business_license_status: AsyncStatusType;
  get_business_license_data: BusinessLicenseItem | null;
  get_business_license_error: string | null;

  // Add business license
  add_business_license_status: AsyncStatusType;
  add_business_license_data: BusinessLicenseItem | null;
  add_business_license_error: string | null;

  // Update business license
  update_business_license_status: AsyncStatusType;
  update_business_license_data: BusinessLicenseItem | null;
  update_business_license_error: string | null;

  // Delete business license
  delete_business_license_status: AsyncStatusType;
  delete_business_license_data: DeleteBusinessLicenseResponse | null;
  delete_business_license_error: string | null;

  // Get compliance folders (list)
  get_compliance_folders_status: AsyncStatusType;
  get_compliance_folders_data: ComplianceFolderItem[] | null;
  get_compliance_folders_error: string | null;

  // Get compliance folder by ID
  get_compliance_folder_status: AsyncStatusType;
  get_compliance_folder_data: ComplianceFolderItem | null;
  get_compliance_folder_error: string | null;

  // Add compliance folder
  add_compliance_folder_status: AsyncStatusType;
  add_compliance_folder_data: ComplianceFolderItem | null;
  add_compliance_folder_error: string | null;

  // Update compliance folder
  update_compliance_folder_status: AsyncStatusType;
  update_compliance_folder_data: ComplianceFolderItem | null;
  update_compliance_folder_error: string | null;

  // Delete compliance folder
  delete_compliance_folder_status: AsyncStatusType;
  delete_compliance_folder_data: DeleteComplianceFolderResponse | null;
  delete_compliance_folder_error: string | null;

  // Get compliance records (list)
  get_compliance_records_status: AsyncStatusType;
  get_compliance_records_data: ComplianceRecordItem[] | null;
  get_compliance_records_error: string | null;

  // Get compliance record by ID
  get_compliance_record_status: AsyncStatusType;
  get_compliance_record_data: ComplianceRecordItem | null;
  get_compliance_record_error: string | null;

  // Add compliance record
  add_compliance_record_status: AsyncStatusType;
  add_compliance_record_data: ComplianceRecordItem | null;
  add_compliance_record_error: string | null;

  // Update compliance record
  update_compliance_record_status: AsyncStatusType;
  update_compliance_record_data: ComplianceRecordItem | null;
  update_compliance_record_error: string | null;

  // Delete compliance record
  delete_compliance_record_status: AsyncStatusType;
  delete_compliance_record_data: DeleteComplianceRecordResponse | null;
  delete_compliance_record_error: string | null;
}
