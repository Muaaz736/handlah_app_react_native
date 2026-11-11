import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { appendShareQueryParams } from '../../utils/shareQuery';
import {
  AddBusinessProjectPayload,
  UpdateBusinessProjectPayload,
  BusinessProjectItemAPI,
} from '../../types/reduxTypes/businessProjectsSlice.types';

export interface BusinessProjectsParams {
  businessId: number;
  userId?: number;
  sharedWithUserId?: number;
  ownerId?: number;
}

/**
 * Get all business projects for a specific business
 * @param businessId - The ID of the business to fetch projects for
 */
export const getBusinessProjectsAsync = createApiThunk<
  BusinessProjectItemAPI[],
  number | BusinessProjectsParams
>(
  TYPE_CONSTANTS.GET_BUSINESS_PROJECTS_ASYNC,
  'get',
  (arg) => {
    let url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_PROJECTS}`;
    if (typeof arg === 'number') {
      url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_PROJECTS}?businessId=${arg}`;
      return appendShareQueryParams(url, arg);
    }

    if (arg.userId) {
      url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_PROJECTS}?businessId=${arg.businessId}&userId=${arg.userId}`;
      return appendShareQueryParams(url, arg);
    }

    url = `${API_ENDPOINTS.BUSINESS.GET_BUSINESS_PROJECTS}?businessId=${arg.businessId}`;
    return appendShareQueryParams(url, arg);
  },
  'Failed to fetch business projects. Please try again.',
);

/**
 * Add a new business project
 */
export const addBusinessProjectAsync = createApiThunk<BusinessProjectItemAPI, AddBusinessProjectPayload>(
  TYPE_CONSTANTS.ADD_BUSINESS_PROJECT_ASYNC,
  'post',
  API_ENDPOINTS.BUSINESS.ADD_BUSINESS_PROJECT,
  'Failed to add business project. Please try again.',
);

/**
 * Update an existing business project
 */
export const updateBusinessProjectAsync = createApiThunk<BusinessProjectItemAPI, UpdateBusinessProjectPayload>(
  TYPE_CONSTANTS.UPDATE_BUSINESS_PROJECT_ASYNC,
  'put',
  (arg) => `${API_ENDPOINTS.BUSINESS.UPDATE_BUSINESS_PROJECT}/${arg.id}`,
  'Failed to update business project. Please try again.',
  { getBody: (arg) => arg.data },
);

/**
 * Delete a business project
 */
export const deleteBusinessProjectAsync = createApiThunk<void, number>(
  TYPE_CONSTANTS.DELETE_BUSINESS_PROJECT_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.BUSINESS.DELETE_BUSINESS_PROJECT}/${id}`,
  'Failed to delete business project. Please try again.',
);
