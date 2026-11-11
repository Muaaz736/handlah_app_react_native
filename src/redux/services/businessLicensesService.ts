import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import {
  BusinessLicensePayload,
  BusinessLicenseResponse,
  GetBusinessLicensesResponse,
  UpdateBusinessLicenseParams,
  DeleteBusinessLicenseResponse,
  ComplianceFolderPayload,
  ComplianceFolderResponse,
  GetComplianceFoldersResponse,
  UpdateComplianceFolderParams,
  DeleteComplianceFolderResponse,
  ComplianceRecordPayload,
  ComplianceRecordResponse,
  GetComplianceRecordsResponse,
  UpdateComplianceRecordParams,
  DeleteComplianceRecordResponse,
} from '../../types/reduxTypes/businessLicensesSlice.types';


/**
 * Get all business licenses for a specific business
 * @param arg - Either the businessId or an object with businessId and optional userId (for emergency access)
 */
export const getBusinessLicensesAsync = createApiThunk<
  GetBusinessLicensesResponse,
  number | { businessId: number; userId?: number; sharedWithUserId?: number; ownerId?: number }
>(
  TYPE_CONSTANTS.GET_BUSINESS_LICENSES_ASYNC,
  'get',
  (arg) => {
    let url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_LICENSES}`;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_LICENSES}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    const { businessId, userId } = arg;
    url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_LICENSES}?businessId=${businessId}`;

    if (userId) {
      url += `&userId=${userId}`;
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch business licenses. Please try again.',
);

/**
 * Get a single business license by ID
 * @param licenseId - The ID of the license to fetch
 */
export const getBusinessLicenseByIdAsync = createApiThunk<BusinessLicenseResponse, number>(
  TYPE_CONSTANTS.GET_BUSINESS_LICENSE_ASYNC,
  'get',
  (licenseId) => `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_LICENSE}/${licenseId}`,
  'Failed to fetch business license. Please try again.',
);

/**
 * Add a new business license
 */
export const addBusinessLicenseAsync = createApiThunk<BusinessLicenseResponse, BusinessLicensePayload>(
  TYPE_CONSTANTS.ADD_BUSINESS_LICENSE_ASYNC,
  'post',
  API_ENDPOINTS.BUSINESS.ADD_BUSINESS_LICENSE,
  'Failed to add business license. Please try again.',
);

/**
 * Update an existing business license
 */
export const updateBusinessLicenseAsync = createApiThunk<BusinessLicenseResponse, UpdateBusinessLicenseParams>(
  TYPE_CONSTANTS.UPDATE_BUSINESS_LICENSE_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.BUSINESS.UPDATE_BUSINESS_LICENSE}/${arg.id}`,
  'Failed to update business license. Please try again.',
  { getBody: (arg) => arg.payload },
);

/**
 * Delete a business license
 */
export const deleteBusinessLicenseAsync = createApiThunk<DeleteBusinessLicenseResponse, number>(
  TYPE_CONSTANTS.DELETE_BUSINESS_LICENSE_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.BUSINESS.DELETE_BUSINESS_LICENSE}/${id}`,
  'Failed to delete business license. Please try again.',
  { transformResponse: (data, id) => ({ ...data, deletedId: id }) },
);

// ============================================================================
// ======================== COMPLIANCE FOLDERS =============================
// ============================================================================

/**
 * Get all compliance folders for a specific business
 * @param arg - Either the businessId or an object with businessId and optional userId (for emergency access)
 */
export const getComplianceFoldersAsync = createApiThunk<
  GetComplianceFoldersResponse,
  number | { businessId: number; userId?: number; sharedWithUserId?: number; ownerId?: number }
>(
  TYPE_CONSTANTS.GET_COMPLIANCE_FOLDERS_ASYNC,
  'get',
  (arg) => {
    let url = `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_FOLDERS}`;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_FOLDERS}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    const { businessId, userId } = arg;
    url = `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_FOLDERS}?businessId=${businessId}`;

    if (userId) {
      url += `&userId=${userId}`;
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch compliance folders. Please try again.',
);

/**
 * Get a single compliance folder by ID
 * @param arg - Either the folderId or an object with id, businessId and optional userId (for emergency access)
 */
export const getComplianceFolderByIdAsync = createApiThunk<
  ComplianceFolderResponse,
  number | { id: number; businessId?: number; userId?: number; sharedWithUserId?: number; ownerId?: number }
>(
  TYPE_CONSTANTS.GET_COMPLIANCE_FOLDER_ASYNC,
  'get',
  (arg) => {
    if (typeof arg === 'number') {
      return `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_FOLDER}/${arg}`;
    }

    const { id, businessId, userId } = arg;
    let url = `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_FOLDER}/${id}`;

    const params: string[] = [];
    if (typeof businessId === 'number') {
      params.push(`businessId=${businessId}`);
    }
    if (typeof userId === 'number') {
      params.push(`userId=${userId}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch compliance folder. Please try again.',
);

/**
 * Add a new compliance folder
 */
export const addComplianceFolderAsync = createApiThunk<ComplianceFolderResponse, ComplianceFolderPayload>(
  TYPE_CONSTANTS.ADD_COMPLIANCE_FOLDER_ASYNC,
  'post',
  API_ENDPOINTS.BUSINESS.ADD_COMPLIANCE_FOLDER,
  'Failed to add compliance folder. Please try again.',
);

/**
 * Update an existing compliance folder
 */
export const updateComplianceFolderAsync = createApiThunk<ComplianceFolderResponse, UpdateComplianceFolderParams>(
  TYPE_CONSTANTS.UPDATE_COMPLIANCE_FOLDER_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.BUSINESS.UPDATE_COMPLIANCE_FOLDER}/${arg.id}`,
  'Failed to update compliance folder. Please try again.',
  { getBody: (arg) => arg.payload },
);

/**
 * Delete a compliance folder
 */
export const deleteComplianceFolderAsync = createApiThunk<DeleteComplianceFolderResponse, number>(
  TYPE_CONSTANTS.DELETE_COMPLIANCE_FOLDER_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.BUSINESS.DELETE_COMPLIANCE_FOLDER}/${id}`,
  'Failed to delete compliance folder. Please try again.',
  { transformResponse: (data, id) => ({ ...data, deletedId: id }) },
);

// ============================================================================
// ======================== COMPLIANCE RECORDS =================================
// ============================================================================

/**
 * Get all compliance records for a specific folder
 * @param folderId - The ID of the compliance folder
 */
export const getComplianceRecordsAsync = createApiThunk<GetComplianceRecordsResponse, number>(
  TYPE_CONSTANTS.GET_COMPLIANCE_RECORDS_ASYNC,
  'get',
  (folderId) => `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_RECORDS}?complianceFolderId=${folderId}`,
  'Failed to fetch compliance records. Please try again.',
);

/**
 * Get a single compliance record by ID
 * @param recordId - The ID of the compliance record to fetch
 */
export const getComplianceRecordByIdAsync = createApiThunk<
  ComplianceRecordResponse,
  number | { id: number; businessId?: number; userId?: number; sharedWithUserId?: number; ownerId?: number }
>(
  TYPE_CONSTANTS.GET_COMPLIANCE_RECORD_ASYNC,
  'get',
  (arg) => {
    if (typeof arg === 'number') {
      return `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_RECORD}/${arg}`;
    }

    const { id, businessId, userId } = arg;
    let url = `${API_ENDPOINTS.BUSINESS.GET_COMPLIANCE_RECORD}/${id}`;

    const params: string[] = [];
    if (typeof businessId === 'number') {
      params.push(`businessId=${businessId}`);
    }
    if (typeof userId === 'number') {
      params.push(`userId=${userId}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch compliance record. Please try again.',
);

/**
 * Add a new compliance record
 */
export const addComplianceRecordAsync = createApiThunk<ComplianceRecordResponse, ComplianceRecordPayload>(
  TYPE_CONSTANTS.ADD_COMPLIANCE_RECORD_ASYNC,
  'post',
  API_ENDPOINTS.BUSINESS.ADD_COMPLIANCE_RECORD,
  'Failed to add compliance record. Please try again.',
);

/**
 * Update an existing compliance record
 */
export const updateComplianceRecordAsync = createApiThunk<ComplianceRecordResponse, UpdateComplianceRecordParams>(
  TYPE_CONSTANTS.UPDATE_COMPLIANCE_RECORD_ASYNC,
  'put',
  (arg) => {
    let url = `${API_ENDPOINTS.BUSINESS.UPDATE_COMPLIANCE_RECORD}/${arg.id}`;

    const params: string[] = [];
    if (typeof arg.businessId === 'number') {
      params.push(`businessId=${arg.businessId}`);
    }
    if (typeof arg.userId === 'number') {
      params.push(`userId=${arg.userId}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to update compliance record. Please try again.',
  { getBody: (arg) => arg.payload },
);

/**
 * Delete a compliance record
 */
export const deleteComplianceRecordAsync = createApiThunk<DeleteComplianceRecordResponse, number>(
  TYPE_CONSTANTS.DELETE_COMPLIANCE_RECORD_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.BUSINESS.DELETE_COMPLIANCE_RECORD}/${id}`,
  'Failed to delete compliance record. Please try again.',
  { transformResponse: (data, id) => ({ ...data, deletedId: id }) },
);
