import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';

export interface ModuleCountItem {
  modulename: string;
  title: string;
  routekey: string;
  icon: string;
  category: string;
  count: number;
}

export interface ModuleCountsResponse {
  userid: number;
  businessid: number | null;
  modules: ModuleCountItem[];
}

export interface GetModuleCountsParams {
  businessId?: number;
}

export const getModuleCountsAsync = createApiThunk<
  ModuleCountsResponse,
  GetModuleCountsParams | undefined
>(
  TYPE_CONSTANTS.GET_MODULE_COUNTS_ASYNC,
  'get',
  (arg) => {
    const url = API_ENDPOINTS.HOME.MODULE_COUNTS;
    if (arg?.businessId) {
      return `${url}?businessId=${arg.businessId}`;
    }
    return url;
  },
  'Failed to fetch module counts. Please try again.',
);
