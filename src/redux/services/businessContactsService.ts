import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import {
  BusinessContactPayload,
  BusinessContactResponse,
  GetBusinessContactsResponse,
  UpdateBusinessContactParams,
  DeleteBusinessContactResponse,
} from '../../types/reduxTypes/businessContactsSlice.types';

export interface BusinessContactsParams {
  businessId: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

export const getBusinessContactsAsync = createApiThunk<
  GetBusinessContactsResponse,
  number | BusinessContactsParams
>(
  TYPE_CONSTANTS.GET_BUSINESS_CONTACTS_ASYNC,
  'get',
  (arg) => {
    let url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_CONTACTS}`;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_CONTACTS}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg.userId) {
      url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_CONTACTS}?businessId=${arg.businessId}&userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg.ownerId) {
      return `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_CONTACTS}?businessId=${arg.businessId}&ownerUserId=${arg.ownerId}`;
    }
    return `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_CONTACTS}?businessId=${arg.businessId}`;
  },
  'Failed to fetch business contacts. Please try again.',
);


export const addBusinessContactAsync = createApiThunk<BusinessContactResponse, BusinessContactPayload>(
  TYPE_CONSTANTS.ADD_BUSINESS_CONTACT_ASYNC,
  'post',
  API_ENDPOINTS.BUSINESS.ADD_BUSINESS_CONTACT,
  'Failed to add business contact. Please try again.',
);


export const updateBusinessContactAsync = createApiThunk<BusinessContactResponse, UpdateBusinessContactParams>(
  TYPE_CONSTANTS.UPDATE_BUSINESS_CONTACT_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.BUSINESS.UPDATE_BUSINESS_CONTACT}/${arg.id}`,
  'Failed to update business contact. Please try again.',
  { getBody: (arg) => arg.data },
);


export const deleteBusinessContactAsync = createApiThunk<DeleteBusinessContactResponse, number>(
  TYPE_CONSTANTS.DELETE_BUSINESS_CONTACT_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.BUSINESS.DELETE_BUSINESS_CONTACT}/${id}`,
  'Failed to delete business contact. Please try again.',
  { transformResponse: (data, id) => ({ ...data, deletedId: id }) },
);
