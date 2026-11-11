
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import { LoanPayload } from '../../app/screens/Home/modules/Vehicles/AddPurchaseFinancing/AddPurchaseFinancing.types';
import { AddInsurancesBulkPayload, InsurancePayload } from '../../app/screens/Home/modules/Vehicles/AddVehicleInsurance/AddVehicleInsurance.types';
import { AddWarrantiesBulkPayload, WarrantyPayload } from '../../app/screens/Home/modules/Vehicles/AddVehicleWarranty/AddVehicleWarranty.types';

// Shared param types for liabilities
export interface LiabilityQueryParams {
  businessId?: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

// Loan CRUD
export const getLoanAsync = createApiThunk(
  TYPE_CONSTANTS.GET_LOAN_ASYNC,
  'get',
  (arg?: number | LiabilityQueryParams) => {
    let url;
    url = API_ENDPOINTS.LIABILITIES.GET_LOAN;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.LIABILITIES.GET_LOAN}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.businessId && arg?.userId) {
      url = `${API_ENDPOINTS.LIABILITIES.GET_LOAN}?businessId=${arg.businessId}&userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.businessId) {
      url = `${API_ENDPOINTS.LIABILITIES.GET_LOAN}?businessId=${arg.businessId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg?.userId) {
      url = `${API_ENDPOINTS.LIABILITIES.GET_LOAN}?userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch loan. Please try again.',
);


export const addLoanAsync = createApiThunk<any, LoanPayload>(
  TYPE_CONSTANTS.ADD_LOAN_ASYNC,
  'post',
  API_ENDPOINTS.LIABILITIES.ADD_LOAN,
  'Failed to add loans. Please try again.',
);

export const updateLoanAsync = createApiThunk<any, { id: number; data: any }>(
  TYPE_CONSTANTS.UPDATE_LOAN_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.UPDATE_LOAN}/${arg.id}`,
  'Failed to update loan. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteLoanAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_LOAN_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.LIABILITIES.DELETE_LOAN}/${id}`,
  'Failed to delete loan. Please try again.',
  { transformResponse: (data, id) => data || { success: true, id } },
);

export const linkLoanAsync = createApiThunk<any, { id: number; realEstateId?: number; vehicleId?: number }>(
  TYPE_CONSTANTS.LINK_LOAN_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.LINK_LOAN}/${arg.id}/link`,
  'Failed to link loan. Please try again.',
  { getBody: (arg) => {
      const body: Record<string, number> = {};
      if (arg.realEstateId !== undefined) body.realEstateId = arg.realEstateId;
      if (arg.vehicleId !== undefined) body.vehicleId = arg.vehicleId;
      return body;
  }},
);

// Utilities CRUD
interface UtilityData {
  utilityType: string;
  vendor: string;
  averageMonthlyAmount: number;
  endDate: string;
  accountNumber: string;
  dueDay: number;
  phoneNumber: string;
  website: string;
  uploadAttachments: string;
  realEstateId?: number | null;
  businessId?: number;
}

export const getUtilitiesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_UTILITIES_ASYNC,
  'get',
  (arg?: number | LiabilityQueryParams) => {
    let url;
    url = API_ENDPOINTS.LIABILITIES.GET_UTILITIES;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.LIABILITIES.GET_UTILITIES}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg && (typeof arg.businessId === 'number' || typeof arg.userId === 'number')) {
      const params: string[] = [];
      if (typeof arg.businessId === 'number') {
        params.push(`businessId=${arg.businessId}`);
      }
      if (typeof arg.userId === 'number') {
        params.push(`userId=${arg.userId}`);
      }
      url = `${API_ENDPOINTS.LIABILITIES.GET_UTILITIES}?${params.join('&')}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch utilities. Please try again.',
);

export const addUtilityAsync = createApiThunk<any, UtilityData>(
  TYPE_CONSTANTS.ADD_UTILITY_ASYNC,
  'post',
  API_ENDPOINTS.LIABILITIES.ADD_UTILITY,
  'Failed to add utility. Please try again.',
);

export const updateUtilityAsync = createApiThunk<any, { id: number; data: UtilityData }>(
  TYPE_CONSTANTS.UPDATE_UTILITY_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.UPDATE_UTILITY}/${arg.id}`,
  'Failed to update utility. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteUtilityAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_UTILITY_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.LIABILITIES.DELETE_UTILITY}/${id}`,
  'Failed to delete utility. Please try again.',
  { transformResponse: (data, id) => data || { success: true, id } },
);

export const linkUtilityAsync = createApiThunk<any, { id: number; realEstateId?: number; vehicleId?: number }>(
  TYPE_CONSTANTS.LINK_UTILITY_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.LINK_UTILITY}/${arg.id}/link`,
  'Failed to link utility. Please try again.',
  { getBody: (arg) => {
      const body: Record<string, number> = {};
      if (arg.realEstateId !== undefined) body.realEstateId = arg.realEstateId;
      if (arg.vehicleId !== undefined) body.vehicleId = arg.vehicleId;
      return body;
  }},
);

// Insurance CRUD
interface InsuranceData {
  itemName: string;
  insuranceCarrier: string;
  policyNumber: string;
  annualPremium: number;
  agentEmail: string;
  startDate: string;
  renewalDate: string;
  endDate: string;
  dueDay: number;
  agent: string;
  agentPhone: string;
  uploadAttachments: string;
}

export const getInsurancesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_INSURANCES_ASYNC,
  'get',
  (arg?: number | LiabilityQueryParams) => {
    let url;
    url = API_ENDPOINTS.LIABILITIES.GET_INSURANCES;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.LIABILITIES.GET_INSURANCES}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg && (typeof arg.businessId === 'number' || typeof arg.userId === 'number')) {
      const params: string[] = [];
      if (typeof arg.businessId === 'number') {
        params.push(`businessId=${arg.businessId}`);
      }
      if (typeof arg.userId === 'number') {
        params.push(`userId=${arg.userId}`);
      }
      url = `${API_ENDPOINTS.LIABILITIES.GET_INSURANCES}?${params.join('&')}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch insurances. Please try again.',
);

export const addInsuranceAsync = createApiThunk<any, InsurancePayload>(
  TYPE_CONSTANTS.ADD_INSURANCE_ASYNC,
  'post',
  API_ENDPOINTS.LIABILITIES.ADD_INSURANCE,
  'Failed to add insurance. Please try again.',
);

export const addInsurancesBulkAsync = createApiThunk<any, AddInsurancesBulkPayload>(
  TYPE_CONSTANTS.ADD_INSURANCES_BULK_ASYNC,
  'post',
  API_ENDPOINTS.LIABILITIES.ADD_INSURANCES_BULK,
  'Failed to add insurances. Please try again.',
);

export const updateInsuranceAsync = createApiThunk<any, { id: number; data: InsurancePayload }>(
  TYPE_CONSTANTS.UPDATE_INSURANCE_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.UPDATE_INSURANCE}/${arg.id}`,
  'Failed to update insurance. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteInsuranceAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_INSURANCE_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.LIABILITIES.DELETE_INSURANCE}/${id}`,
  'Failed to delete insurance. Please try again.',
  { transformResponse: (data, id) => data || { success: true, id } },
);

export const linkInsuranceAsync = createApiThunk<any, { id: number; realEstateId?: number; vehicleId?: number }>(
  TYPE_CONSTANTS.LINK_INSURANCE_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.LINK_INSURANCE}/${arg.id}/link`,
  'Failed to link insurance. Please try again.',
  { getBody: (arg) => {
      const body: Record<string, number> = {};
      if (arg.realEstateId !== undefined) body.realEstateId = arg.realEstateId;
      if (arg.vehicleId !== undefined) body.vehicleId = arg.vehicleId;
      return body;
  }},
);

// Warranties CRUD
interface WarrantyData {
  itemName: string;
  warrantyProvider: string;
  expiration: string;
  startDate: string;
  notes: string;
  website: string;
  uploadAttachments: string;
}

export const getWarrantiesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_WARRANTIES_ASYNC,
  'get',
  (arg?: number | LiabilityQueryParams) => {
    let url;
    url = API_ENDPOINTS.LIABILITIES.GET_WARRANTIES;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.LIABILITIES.GET_WARRANTIES}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg && (typeof arg.businessId === 'number' || typeof arg.userId === 'number')) {
      const params: string[] = [];
      if (typeof arg.businessId === 'number') {
        params.push(`businessId=${arg.businessId}`);
      }
      if (typeof arg.userId === 'number') {
        params.push(`userId=${arg.userId}`);
      }
      url = `${API_ENDPOINTS.LIABILITIES.GET_WARRANTIES}?${params.join('&')}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch warranties. Please try again.',
);

export const addWarrantyAsync = createApiThunk<any, WarrantyPayload>(
  TYPE_CONSTANTS.ADD_WARRANTY_ASYNC,
  'post',
  API_ENDPOINTS.LIABILITIES.ADD_WARRANTY,
  'Failed to add warranty. Please try again.',
);

export const addWarrantiesBulkAsync = createApiThunk<any, AddWarrantiesBulkPayload>(
  TYPE_CONSTANTS.ADD_WARRANTIES_BULK_ASYNC,
  'post',
  API_ENDPOINTS.LIABILITIES.ADD_WARRANTIES_BULK,
  'Failed to add warranties. Please try again.',
);

export const updateWarrantyAsync = createApiThunk<any, { id: number; data: WarrantyPayload }>(
  TYPE_CONSTANTS.UPDATE_WARRANTY_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.UPDATE_WARRANTY}/${arg.id}`,
  'Failed to update warranty. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteWarrantyAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_WARRANTY_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.LIABILITIES.DELETE_WARRANTY}/${id}`,
  'Failed to delete warranty. Please try again.',
  { transformResponse: (data, id) => data || { success: true, id } },
);

export const linkWarrantyAsync = createApiThunk<any, { id: number; realEstateId?: number; vehicleId?: number }>(
  TYPE_CONSTANTS.LINK_WARRANTY_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.LIABILITIES.LINK_WARRANTY}/${arg.id}/link`,
  'Failed to link warranty. Please try again.',
  { getBody: (arg) => {
      const body: Record<string, number> = {};
      if (arg.realEstateId !== undefined) body.realEstateId = arg.realEstateId;
      if (arg.vehicleId !== undefined) body.vehicleId = arg.vehicleId;
      return body;
  }},
);

// Shared-With-Me grouped thunks
export const getLoansSharedWithMeAsync = createApiThunk(
  'GET_LOANS_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.LIABILITIES.GET_LOAN}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared loans. Please try again.',
);

export const getInsurancesSharedWithMeAsync = createApiThunk(
  'GET_INSURANCES_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.LIABILITIES.GET_INSURANCES}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared insurances. Please try again.',
);

export const getWarrantiesSharedWithMeAsync = createApiThunk(
  'GET_WARRANTIES_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.LIABILITIES.GET_WARRANTIES}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared warranties. Please try again.',
);

export const getUtilitiesSharedWithMeAsync = createApiThunk(
  'GET_UTILITIES_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.LIABILITIES.GET_UTILITIES}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared utilities. Please try again.',
);

