
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import { AddPersonalPropertyPayload, UpdatePersonalPropertyParams } from '../../app/screens/Home/modules/PersonalProperty/PersonalProperty.types';
import { AddVehiclePayload, UpdateVehicleParams } from '../../app/screens/Home/modules/Vehicles/AddVehicle/AddVehicle.types';
import { UpdateServiceRecordParams, DeleteServiceRecordParams, ServiceRecordPayload } from '../../app/screens/Home/modules/Vehicles/AddServiceRecords/AddServiceRecords.types';
import { UpdateAccidentParams, DeleteAccidentParams, AccidentPayload } from '../../app/screens/Home/modules/Vehicles/AddAccidents/AddAccidents.types';

// Personal Property
export const addPersonalPropertyAsync = createApiThunk<any, AddPersonalPropertyPayload>(
  TYPE_CONSTANTS.ADD_PERSONAL_PROPERTY_ASYNC,
  'post',
  API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY,
  'Failed to add personal property. Please try again.',
);

export const getPersonalPropertyAsync = createApiThunk(
  TYPE_CONSTANTS.GET_PERSONAL_PROPERTY_ASYNC,
  'get',
  (arg?: { userId?: number; sharedWithUserId?: number; ownerId?: number; suppressErrorToast?: boolean }) => {
    let url;
    url = API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY;
    if (arg?.userId) {
      url = `${API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY}?userId=${arg.userId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to get personal properties. Please try again.',
);

export interface BusinessPropertyParams {
  businessId: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
  suppressErrorToast?: boolean;
}

export const getBusinessPropertyAsync = createApiThunk(
  TYPE_CONSTANTS.GET_BUSINESS_PROPERTY_ASYNC,
  'get',
  (arg: number | BusinessPropertyParams) => {
    let url;
    url = API_ENDPOINTS.ASSETS.BUSINESS_PROPERTY;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.ASSETS.BUSINESS_PROPERTY}${arg}`;
      return appendShareQueryParams(url, arg);
    }
    const { businessId, userId } = arg;
    url = `${API_ENDPOINTS.ASSETS.BUSINESS_PROPERTY}${businessId}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to get business properties. Please try again.',
);

export const getPersonalPropertyByIdAsync = createApiThunk<any, { id: number; ownerUserId?: number } | number>(
  TYPE_CONSTANTS.GET_PERSONAL_PROPERTY_BY_ID_ASYNC,
  'get',
  (arg) => {
    const id = typeof arg === 'number' ? arg : arg.id;
    const ownerUserId = typeof arg === 'number' ? undefined : arg.ownerUserId;
    const base = `${API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY}/${id}`;
    return ownerUserId ? `${base}?ownerUserId=${ownerUserId}` : base;
  },
  'Failed to get personal property. Please try again.',
);

export const updatePersonalPropertyAsync = createApiThunk<any, UpdatePersonalPropertyParams>(
  TYPE_CONSTANTS.UPDATE_PERSONAL_PROPERTY_ASYNC,
  'put',
  (arg) => {
    const base = `${API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY}/${arg.id}`;
    return arg.ownerUserId ? `${base}?ownerUserId=${arg.ownerUserId}` : base;
  },
  'Failed to update personal property. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deletePersonalPropertyAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_PERSONAL_PROPERTY_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY}/${id}`,
  'Failed to delete personal property. Please try again.',
);

export const movePersonalPropertyAsync = createApiThunk<any, { realEstateId: number; propertyId: number }>(
  TYPE_CONSTANTS.MOVE_PERSONAL_PROPERTY_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.ASSETS.MOVE_PERSONAL_PROPERTY}/${arg.realEstateId}/properties/${arg.propertyId}`,
  'Failed to move property. Please try again.',
);

// Bank Account
export const addBankAccountAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_BANK_ACCOUNT_ASYNC,
  'post',
  API_ENDPOINTS.ASSETS.ADD_BANK_ACCOUNT,
  'Failed to add bank account. Please try again.',
);

export const getBankAccountAsync = createApiThunk(
  TYPE_CONSTANTS.GET_BANK_ACCOUNT_ASYNC,
  'get',
  (arg?: { userId?: number; businessId?: number; sharedWithUserId?: number; ownerId?: number }) => {
    let url: any = API_ENDPOINTS.ASSETS.GET_BANK_ACCOUNT;
    const params: string[] = [];
    if (arg?.userId) { params.push(`userId=${arg.userId}`); }
    if (arg?.businessId) { params.push(`businessId=${arg.businessId}`); }
    if (params.length) { url = `${url}?${params.join('&')}`; }
    return appendShareQueryParams(url, arg);
  },
  'Failed to get bank account. Please try again.',
);

export const updateBankAccountAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_BANK_ACCOUNT_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.ASSETS.GET_BANK_ACCOUNT}/${arg.id}`,
  'Failed to update bank account. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteBankAccountAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_BANK_ACCOUNT_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.ASSETS.GET_BANK_ACCOUNT}/${id}`,
  'Failed to delete bank account. Please try again.',
);

// Real State Overview
export const addRealStateOverviewAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_OVERVIEW_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW,
  'Failed to add real state overview. Please try again.',
);

export const getRealStateOverviewAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_OVERVIEW_ASYNC,
  'get',
  (arg?: { userId?: number; sharedWithUserId?: number; ownerId?: number; activeOnly?: boolean; suppressErrorToast?: boolean }) => {
    let url = API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW;
    const params: string[] = [];
    if (arg?.userId) params.push(`userId=${arg.userId}`);
    if (arg?.activeOnly) params.push('activeOnly=true');
    if (params.length) url += `?${params.join('&')}`;
    return appendShareQueryParams(url, arg);
  },
  'Failed to get real state overview. Please try again.',
);

export const getBusinessRealStateOverviewAsync = createApiThunk(
  TYPE_CONSTANTS.GET_BUSINESS_REAL_STATE_OVERVIEW_ASYNC,
  'get',
  (arg: number | { businessId: number; userId?: number; sharedWithUserId?: number; ownerId?: number; activeOnly?: boolean; suppressErrorToast?: boolean }) => {
    let url;
    url = API_ENDPOINTS.REAL_STATE.BUSINESS_REAL_STATE_OVERVIEW;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.REAL_STATE.BUSINESS_REAL_STATE_OVERVIEW}${arg}`;
      return appendShareQueryParams(url, arg);
    }
    const { businessId, userId, activeOnly } = arg;
    url = `${API_ENDPOINTS.REAL_STATE.BUSINESS_REAL_STATE_OVERVIEW}${businessId}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    if (activeOnly) {
      url += `&activeOnly=true`;
    }
    return appendShareQueryParams(url, arg);
  },
  'Failed to get business real state overview. Please try again.',
);

export const getRealStateOverviewByIdAsync = createApiThunk<any, number | { id: number; userId?: number; businessId?: number; sharedWithUserId?: number; ownerId?: number }>(
  TYPE_CONSTANTS.GET_REAL_STATE_OVERVIEW_BY_ID_ASYNC,
  'get',
  (arg: number | { id: number; userId?: number; businessId?: number }) => {
    if (typeof arg === 'number') {
      return `${API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW}/${arg}`;
    }

    const { id, userId, businessId } = arg;
    let url = `${API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW}/${id}`;

    const params: string[] = [];
    if (businessId) {
      params.push(`businessId=${businessId}`);
    }
    if (userId) {
      params.push(`userId=${userId}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to get real state overview. Please try again.',
);

export const updateRealStateOverviewAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_OVERVIEW_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW}/${arg.id}`,
  'Failed to update real state overview. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStateOverviewAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_OVERVIEW_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW}/${id}`,
  'Failed to delete real state overview. Please try again.',
);

// Real State Loan Mortgage
export const addRealStateLoanMortgageAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_LOAN_MORTGAGE_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_ADD_LOAN_MORTGAGE,
  'Failed to add real state loan mortgage. Please try again.',
);

export const getRealStateLoanMortgageAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_LOAN_MORTGAGE_ASYNC,
  'get',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_LOAN_MORTGAGE,
  'Failed to get real state loan mortgage. Please try again.',
);

export const getRealStateLoanMortgageByIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_LOAN_MORTGAGE_BY_ID_ASYNC,
  'get',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_LOAN_MORTGAGE}/${id}`,
  'Failed to get real state loan mortgage. Please try again.',
);

export const updateRealStateLoanMortgageAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_LOAN_MORTGAGE_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_LOAN_MORTGAGE}/${arg.id}`,
  'Failed to update real state loan mortgage. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStateLoanMortgageAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_LOAN_MORTGAGE_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_LOAN_MORTGAGE}/${id}`,
  'Failed to delete real state loan mortgage. Please try again.',
);

// Real State Utilities
export const addRealStateUtilitiesAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_UTILITIES_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_ADD_UTILITIES,
  'Failed to add real state utilities. Please try again.',
);

export const getRealStateUtilitiesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_UTILITIES_ASYNC,
  'get',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_UTILITIES,
  'Failed to get real state utilities. Please try again.',
);

export const getRealStateUtilitiesByIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_UTILITIES_BY_ID_ASYNC,
  'get',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_UTILITIES}/${id}`,
  'Failed to get real state utility. Please try again.',
);

export const updateRealStateUtilitiesAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_UTILITIES_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_UTILITIES}/${arg.id}`,
  'Failed to update real state utilities. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStateUtilitiesAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_UTILITIES_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_UTILITIES}/${id}`,
  'Failed to delete real state utilities. Please try again.',
);

// Real State Insurance
export const addRealStateInsuranceAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_INSURANCE_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_ADD_INSURANCE,
  'Failed to add real state insurance. Please try again.',
);

export const getRealStateInsuranceAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_INSURANCE_ASYNC,
  'get',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_INSURANCE,
  'Failed to get real state insurance. Please try again.',
);

export const getRealStateInsuranceByIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_INSURANCE_BY_ID_ASYNC,
  'get',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_INSURANCE}/${id}`,
  'Failed to get real state insurance. Please try again.',
);

export const updateRealStateInsuranceAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_INSURANCE_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_INSURANCE}/${arg.id}`,
  'Failed to update real state insurance. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStateInsuranceAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_INSURANCE_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_INSURANCE}/${id}`,
  'Failed to delete real state insurance. Please try again.',
);

// Real State Warranties
export const addRealStateWarrantiesAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_WARRANTIES_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_ADD_WARRANTIES,
  'Failed to add real state warranties. Please try again.',
);

export const getRealStateWarrantiesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_WARRANTIES_ASYNC,
  'get',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_WARRANTIES,
  'Failed to get real state warranties. Please try again.',
);

export const getRealStateWarrantiesByIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_WARRANTIES_BY_ID_ASYNC,
  'get',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_WARRANTIES}/${id}`,
  'Failed to get real state warranty. Please try again.',
);

export const updateRealStateWarrantiesAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_WARRANTIES_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_WARRANTIES}/${arg.id}`,
  'Failed to update real state warranties. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStateWarrantiesAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_WARRANTIES_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_WARRANTIES}/${id}`,
  'Failed to delete real state warranties. Please try again.',
);

// Real State Personal Property
export const addRealStatePersonalPropertyAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_PERSONAL_PROPERTY_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_ADD_PERSONAL_PROPERTY,
  'Failed to add real state personal property. Please try again.',
);

export const getRealStatePersonalPropertyAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_PERSONAL_PROPERTY_ASYNC,
  'get',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_PERSONAL_PROPERTY,
  'Failed to get real state personal property. Please try again.',
);

export const getRealStatePersonalPropertyByIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_PERSONAL_PROPERTY_BY_ID_ASYNC,
  'get',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_PERSONAL_PROPERTY}/${id}`,
  'Failed to get real state personal property. Please try again.',
);

export const updateRealStatePersonalPropertyAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_PERSONAL_PROPERTY_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_PERSONAL_PROPERTY}/${arg.id}`,
  'Failed to update real state personal property. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStatePersonalPropertyAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_PERSONAL_PROPERTY_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_PERSONAL_PROPERTY}/${id}`,
  'Failed to delete real state personal property. Please try again.',
);

// Real State Service Work History
export const addRealStateServiceWorkHistoryAsync = createApiThunk(
  TYPE_CONSTANTS.ADD_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC,
  'post',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_ADD_SERVICE_WORK_HISTORY,
  'Failed to add real state service work history. Please try again.',
);

export const getRealStateServiceWorkHistoryAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC,
  'get',
  API_ENDPOINTS.REAL_STATE.REAL_STATE_SERVICE_WORK_HISTORY,
  'Failed to get real state service work history. Please try again.',
);

export const getRealStateServiceWorkHistoryByIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_REAL_STATE_SERVICE_WORK_HISTORY_BY_ID_ASYNC,
  'get',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_SERVICE_WORK_HISTORY}/${id}`,
  'Failed to get real state service work history. Please try again.',
);

export const updateRealStateServiceWorkHistoryAsync = createApiThunk(
  TYPE_CONSTANTS.UPDATE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC,
  'put',
  (arg: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_SERVICE_WORK_HISTORY}/${arg.id}`,
  'Failed to update real state service work history. Please try again.',
  { getBody: (arg: any) => arg.data },
);

export const deleteRealStateServiceWorkHistoryAsync = createApiThunk(
  TYPE_CONSTANTS.DELETE_REAL_STATE_SERVICE_WORK_HISTORY_ASYNC,
  'delete',
  (id: any) => `${API_ENDPOINTS.REAL_STATE.REAL_STATE_SERVICE_WORK_HISTORY}/${id}`,
  'Failed to delete real state service work history. Please try again.',
);

// Vehicles
export interface VehiclesParams {
  userId?: number;
  businessId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

export const addVehicleAsync = createApiThunk<any, AddVehiclePayload>(
  TYPE_CONSTANTS.ADD_VEHICLE_ASYNC,
  'post',
  API_ENDPOINTS.ASSETS.VEHICLES,
  'Failed to add vehicle. Please try again.',
);

export const getVehiclesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_VEHICLES_ASYNC,
  'get',
  (arg?: VehiclesParams | any) => {
    let url;
    url = API_ENDPOINTS.ASSETS.VEHICLES;
    if (arg?.businessId) {
      if (arg?.userId) {
        url = `${API_ENDPOINTS.ASSETS.VEHICLES}?businessId=${arg.businessId}&userId=${arg.userId}`;
        return appendShareQueryParams(url, arg);
      } else {
        url = `${API_ENDPOINTS.ASSETS.VEHICLES}?businessId=${arg.businessId}`;
        return appendShareQueryParams(url, arg);
      }
    }

    if (arg?.userId) {
      url = `${API_ENDPOINTS.ASSETS.VEHICLES}?userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to get vehicles. Please try again.',
);

export const getBusinessVehiclesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_BUSINESS_VEHICLES_ASYNC,
  'get',
  (businessId: any) => `${API_ENDPOINTS.ASSETS.BUSINESS_VEHICLES}${businessId}`,
  'Failed to get business vehicles. Please try again.',
);

export const getVehicleByIdAsync = createApiThunk<any, any>(
  TYPE_CONSTANTS.GET_VEHICLE_BY_ID_ASYNC,
  'get',
  (arg: any) => {
    let url = `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.id}`;
    if (arg?.businessId) {
      if (arg?.userId) {
        url = `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.id}?businessId=${arg.businessId}&userId=${arg.userId}`;
        return appendShareQueryParams(url, arg);
      } else {
        url = `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.id}?businessId=${arg.businessId}`;
        return appendShareQueryParams(url, arg);
      }
    }

    if (arg?.userId) {
      url = `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.id}?userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    return appendShareQueryParams(url, arg);
  },
  'Failed to get vehicle. Please try again.',
);

export const updateVehicleAsync = createApiThunk<any, UpdateVehicleParams>(
  TYPE_CONSTANTS.UPDATE_VEHICLE_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.id}`,
  'Failed to update vehicle. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteVehicleAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_VEHICLE_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${id}`,
  'Failed to delete vehicle. Please try again.',
);

export interface MarkVehicleAsSoldPayload {
  vehicleId: number;
  saleDate: string;
  buyerName: string;
  buyerHandlahUsername: string;
  salePrice: number;
  notes: string;
  uploadAttachments?: string[];
}

export const markVehicleAsSoldAsync = createApiThunk<any, MarkVehicleAsSoldPayload>(
  TYPE_CONSTANTS.MARK_VEHICLE_AS_SOLD_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_TRANSFERS_MARK_AS_SOLD}`,
  'Failed to mark vehicle as sold. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: (arg) => ({
      saleDate: arg.saleDate,
      buyerName: arg.buyerName,
      buyerHandlahUsername: arg.buyerHandlahUsername,
      salePrice: arg.salePrice,
      notes: arg.notes,
      ...(arg.uploadAttachments && { uploadAttachments: arg.uploadAttachments }),
    }),
  },
);

export const vehicleSaleTransferAsync = createApiThunk<any, { vehicleId?: number; toUserIdentifier?: string; ownershipDocumentUrl?: string | string[]; notes?: string; salePrice?: number; transferDate?: string; buyerName?: string; saveAsDraft?: boolean; additionalComments?: string; toBusinessId?: string | number; fromBusinessId?: string | number }>(
  TYPE_CONSTANTS.VEHICLE_SALE_TRANSFER_ASYNC,
  'post',
  (arg) => API_ENDPOINTS.ASSETS.VEHICLE_SALE_TRANSFER,
  'Failed to transfer vehicle. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: (arg) => ({
      vehicleId: arg.vehicleId,
      toUserIdentifier: arg.toUserIdentifier,
      ...(arg.ownershipDocumentUrl !== undefined && { ownershipDocumentUrl: arg.ownershipDocumentUrl }),
      ...(arg.notes !== undefined && { notes: arg.notes }),
      ...(arg.transferDate !== undefined && { transferDate: arg.transferDate }),
      ...(arg.buyerName !== undefined && { buyerName: arg.buyerName }),
      ...(arg.salePrice !== undefined && { salePrice: arg.salePrice }),
      ...(arg.saveAsDraft !== undefined && { saveAsDraft: arg.saveAsDraft }),
      ...(arg.additionalComments !== undefined && { additionalComments: arg.additionalComments }),
      ...(arg.toBusinessId !== undefined && { toBusinessId: arg.toBusinessId }),
      ...(arg.fromBusinessId !== undefined && { fromBusinessId: arg.fromBusinessId }),
    }),
  },
);


export interface ShareVehiclePayload {
  vehicleId: number;
  toUserIdentifier: string;
  toBusinessId?: number;
  ownershipDocumentUrl: string | string[];
  ownershipImageUrl?: string | string[];
}

export const shareVehicleAsync = createApiThunk<any, ShareVehiclePayload>(
  TYPE_CONSTANTS.SHARE_VEHICLE_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_TRANSFERS_SHARE}`,
  'Failed to share vehicle. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: (arg) => ({
      toUserIdentifier: arg.toUserIdentifier,
      ...(arg.toBusinessId !== undefined && { toBusinessId: arg.toBusinessId }),
      ownershipDocumentUrl: arg.ownershipDocumentUrl,
      ...(arg.ownershipImageUrl !== undefined && { ownershipImageUrl: arg.ownershipImageUrl }),
    }),
  },
);

export interface UpdateVehicleSaleTransferPayload {
  transferId: number;
  ownershipDocumentUrl?: string | string[];
  additionalComments?: string;
  toUserIdentifier?: string;
  transferDate?: string;
  buyerName?: string;
  salePrice?: number;
  notes?: string;
  isDraft?: boolean;
  toBusinessId?: number;
  /** What the buyer receives (see BuyerItemsPicker); left out, the buyer gets the usual set. */
  transferItems?: import('../../components/vehicles/BuyerItemsPicker').VehicleTransferItems;
}

export const updateVehicleSaleTransferAsync = createApiThunk<any, UpdateVehicleSaleTransferPayload>(
  TYPE_CONSTANTS.UPDATE_VEHICLE_SALE_TRANSFER_ASYNC,
  'patch',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLE_SALE_TRANSFER}/${arg.transferId}`,
  'Failed to update vehicle transfer. Please try again.',
  {
    getBody: (arg) => ({
      ...(arg.ownershipDocumentUrl !== undefined && { ownershipDocumentUrl: arg.ownershipDocumentUrl }),
      ...(arg.additionalComments !== undefined && { additionalComments: arg.additionalComments }),
      ...(arg.isDraft !== undefined && { isDraft: arg.isDraft }),
      ...(arg.toUserIdentifier !== undefined && { toUserIdentifier: arg.toUserIdentifier }),
      ...(arg.transferDate !== undefined && { transferDate: arg.transferDate }),
      ...(arg.buyerName !== undefined && { buyerName: arg.buyerName }),
      ...(arg.salePrice !== undefined && { salePrice: arg.salePrice }),
      ...(arg.notes !== undefined && { notes: arg.notes }),
      ...(arg.toBusinessId !== undefined && { toBusinessId: arg.toBusinessId }),
      ...(arg.transferItems !== undefined && { transferItems: arg.transferItems }),
    }),
  },
);

export const getBusinessesByUsernameAsync = createApiThunk<any, string>(
  TYPE_CONSTANTS.GET_BUSINESSES_BY_USERNAME_ASYNC,
  'get',
  (username) => `${API_ENDPOINTS.BUSINESS.BUSINESSES_BY_USERNAME}/${username}`,
  'Failed to fetch businesses. Please try again.',
);

export interface GetIncomingVehicleTransfersPayload {
  businessId?: number;
}

export const getIncomingVehicleTransfersAsync = createApiThunk<any, GetIncomingVehicleTransfersPayload | undefined>(
  TYPE_CONSTANTS.GET_INCOMING_VEHICLE_TRANSFERS_ASYNC,
  'get',
  (arg) =>
    arg?.businessId
      ? `${API_ENDPOINTS.VEHICLE_TRANSFERS.INCOMING}?businessId=${arg.businessId}`
      : API_ENDPOINTS.VEHICLE_TRANSFERS.INCOMING,
  'Failed to fetch incoming vehicle transfers. Please try again.',
);

export const acceptVehicleTransferAsync = createApiThunk<any, { transferId: number }>(
  TYPE_CONSTANTS.ACCEPT_VEHICLE_TRANSFER_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.VEHICLE_TRANSFERS.ACCEPT}/${arg.transferId}/accept`,
  'Failed to accept vehicle transfer. Please try again.',
  { skipOfflineQueue: true, getBody: () => ({}) },
);

export const rejectVehicleTransferAsync = createApiThunk<any, { transferId: number }>(
  TYPE_CONSTANTS.REJECT_VEHICLE_TRANSFER_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.VEHICLE_TRANSFERS.REJECT}/${arg.transferId}/reject`,
  'Failed to reject vehicle transfer. Please try again.',
  { skipOfflineQueue: true, getBody: () => ({}) },
);

export const addVehicleServiceRecordsBulkAsync = createApiThunk<any, { vehicleId: number | string; data: ServiceRecordPayload }>(
  TYPE_CONSTANTS.ADD_VEHICLE_SERVICE_RECORDS_BULK_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_SERVICE_RECORDS_BULK}`,
  'Failed to add service records. Please try again.',
  { getBody: (arg) => arg.data },
);

export const getVehicleServiceRecordsAsync = createApiThunk<any, number | string>(
  TYPE_CONSTANTS.GET_VEHICLE_SERVICE_RECORDS_ASYNC,
  'get',
  (vehicleId) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_SERVICE_RECORDS}`,
  'Failed to get service records. Please try again.',
);

export const updateVehicleServiceRecordAsync = createApiThunk<any, UpdateServiceRecordParams>(
  TYPE_CONSTANTS.UPDATE_VEHICLE_SERVICE_RECORD_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_SERVICE_RECORDS}/${arg.recordId}`,
  'Failed to update service record. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteVehicleServiceRecordAsync = createApiThunk<any, DeleteServiceRecordParams>(
  TYPE_CONSTANTS.DELETE_VEHICLE_SERVICE_RECORD_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_SERVICE_RECORDS}/${arg.recordId}`,
  'Failed to delete service record. Please try again.',
);

// Vehicle Accidents
export const addVehicleAccidentAsync = createApiThunk<any, { vehicleId: number | string; data: AccidentPayload }>(
  TYPE_CONSTANTS.ADD_VEHICLE_ACCIDENTS_ASYNC,
  'post',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_ACCIDENTS}`,
  'Failed to add accidents. Please try again.',
  { getBody: (arg) => arg.data },
);

export const getVehicleAccidentsAsync = createApiThunk<any, number | string>(
  TYPE_CONSTANTS.GET_VEHICLE_ACCIDENTS_ASYNC,
  'get',
  (vehicleId) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_ACCIDENTS}`,
  'Failed to get accidents. Please try again.',
);

export const updateVehicleAccidentAsync = createApiThunk<any, UpdateAccidentParams>(
  TYPE_CONSTANTS.UPDATE_VEHICLE_ACCIDENT_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_ACCIDENTS}/${arg.accidentId}`,
  'Failed to update accident. Please try again.',
  { getBody: (arg) => arg.data },
);

export const deleteVehicleAccidentAsync = createApiThunk<any, DeleteAccidentParams>(
  TYPE_CONSTANTS.DELETE_VEHICLE_ACCIDENT_ASYNC,
  'delete',
  (arg) => `${API_ENDPOINTS.ASSETS.VEHICLES}/${arg.vehicleId}/${API_ENDPOINTS.ASSETS.VEHICLE_ACCIDENTS}/${arg.accidentId}`,
  'Failed to delete accident. Please try again.',
);

export const getPersonalPropertySharedWithMeAsync = createApiThunk(
  'GET_PERSONAL_PROPERTY_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.ASSETS.PERSONAL_PROPERTY}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared personal property. Please try again.',
);

export const getRealStateSharedWithMeAsync = createApiThunk(
  'GET_REAL_STATE_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.REAL_STATE.REAL_STATE_OVERVIEW}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared real estate. Please try again.',
);

export const getVehiclesSharedWithMeAsync = createApiThunk(
  'GET_VEHICLES_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.ASSETS.VEHICLES}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared vehicles. Please try again.',
);

export const getBankAccountSharedWithMeAsync = createApiThunk(
  'GET_BANK_ACCOUNT_SHARED_WITH_ME_ASYNC',
  'get',
  `${API_ENDPOINTS.ASSETS.GET_BANK_ACCOUNT}?allSharedWithMe=true&groupByOwner=true`,
  'Failed to fetch shared bank accounts. Please try again.',
);
