import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';

export interface GlobalSearchParams {
  search: string;
  businessId?: number;
}

export const globalSearchAsync = createApiThunk(
  TYPE_CONSTANTS.GLOBAL_SEARCH_ASYNC,
  'get',
  (arg: GlobalSearchParams) => {
    const { search, businessId } = arg;
    let url = `${API_ENDPOINTS.SEARCH.GLOBAL_SEARCH}?search=${encodeURIComponent(search)}`;
    if (businessId !== undefined && businessId !== null) {
      url += `&businessId=${businessId}`;
    }
    return url;
  },
  'Failed to search. Please try again.',
);
