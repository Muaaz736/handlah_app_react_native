import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import {
  BusinessDetailsPayload,
  BusinessDetailsResponse,
  GetBusinessResponse,
  UpdateBusinessParams,
  DeleteBusinessResponse,
} from '../../types/reduxTypes/businessSlice.types';

export interface GetBusinessesParams {
  userId?: number;
  businessId?: number;
}

export const getBusinessesAsync = createApiThunk<
  GetBusinessResponse,
  void | GetBusinessesParams
>(
  TYPE_CONSTANTS.GET_BUSINESSES_ASYNC,
  'get',
  (arg) => {
    const params = (arg || {}) as GetBusinessesParams;
    const query: string[] = [];

    if (params.userId) {
      query.push(`userId=${params.userId}`);
    }

    if (params.businessId) {
      query.push(`businessId=${params.businessId}`);
    }

    if (query.length > 0) {
      return `${API_ENDPOINTS.BUSINESS.GET_BUSINESSES}?${query.join('&')}`;
    }

    return API_ENDPOINTS.BUSINESS.GET_BUSINESSES;
  },
  'Failed to fetch businesses. Please try again.',
);


export const getBusinessByIdAsync = createApiThunk<
  BusinessDetailsResponse,
  any
>(
  TYPE_CONSTANTS.GET_BUSINESS_BY_ID_ASYNC,
  'get',
  (arg: any) => `${API_ENDPOINTS.BUSINESS.GET_BUSINESSES}/${arg.id}?userId=${arg.userId}`,
  'Failed to fetch business details. Please try again.',
);

/**
 * Create a new business
 */
export const createBusinessAsync = createApiThunk<BusinessDetailsResponse, BusinessDetailsPayload>(
  TYPE_CONSTANTS.CREATE_BUSINESS_ASYNC,
  'post',
  API_ENDPOINTS.BUSINESS.CREATE_BUSINESS,
  'Failed to create business. Please try again.',
);

/**
 * Update an existing business
 */
export const updateBusinessAsync = createApiThunk<BusinessDetailsResponse, UpdateBusinessParams>(
  TYPE_CONSTANTS.UPDATE_BUSINESS_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.BUSINESS.UPDATE_BUSINESS}/${arg.id}`,
  'Failed to update business. Please try again.',
  { getBody: (arg) => arg.data },
);

/**
 * Delete a business
 */
export const deleteBusinessAsync = createApiThunk<DeleteBusinessResponse, number | string>(
  TYPE_CONSTANTS.DELETE_BUSINESS_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.BUSINESS.DELETE_BUSINESS}/${id}`,
  'Failed to delete business. Please try again.',
  { transformResponse: (data, id) => ({ ...data, deletedId: id }) },
);
