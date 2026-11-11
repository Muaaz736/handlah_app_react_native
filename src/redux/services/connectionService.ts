import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';
import { apiHandle } from '../../config/apiHandle';
import { extractApiError } from '../../utils/helpers';

const buildSharingUsersUrl = (arg: any, mode: 'unshared' | 'shared') => {
  const queryParams: string[] = [];

  if (
    arg?.resourceId !== undefined &&
    arg?.resourceId !== null &&
    arg?.resourceId !== ''
  ) {
    queryParams.push(`resourceId=${arg.resourceId}`);
  }

  if (
    arg?.businessId !== undefined &&
    arg?.businessId !== null &&
    arg?.businessId !== ''
  ) {
    queryParams.push(`businessId=${arg.businessId}`);
  }

  const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const baseUrl = `${API_ENDPOINTS.SHARING.SHARING_SERVICE}/${arg.resourceType}`;

  if (mode === 'unshared') {
    return `${baseUrl}/unshared${query}`;
  }

  return `${baseUrl}${query}`;
};

export const getConnectionTypesAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CONNECTION_TYPES_ASYNC,
  'get',
  `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTION_TYPES}`,
  'Failed to fetch connection types. Please try again.',
);

export const getConnectionAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CONNECTIONS_ASYNC,
  'get',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTIONS}?targetAccountType=${arg.targetAccountType}`,
  'Failed to fetch connections. Please try again.',
);

export type RequestConnectionPayload = {
  toUserId: number;
  connectionTypeId: number;
  targetAccountType: string;
  isEmergency: boolean;
  businessIds?: number[];
  socialNetworkIds?: number[];
  /** Business id → the other person's role on it: 'standard' or 'owner_admin'. */
  businessRoles?: Record<number, 'standard' | 'owner_admin'>;
};

export const requestConnectionAsync = createApiThunk<
  any,
  RequestConnectionPayload
>(
  TYPE_CONSTANTS.CREATE_CONNECTION_REQUEST_ASYNC,
  'post',
  `${API_ENDPOINTS.CONNECTIONS.REQUEST}`,
  'Failed to send connection request. Please try again.',
  { skipOfflineQueue: true },
);

export type UpdateConnectionPayload = RequestConnectionPayload & {
  connectionId: string | number;
  notes?: string;
};

export const updateConnectionAsync = createApiThunk<
  any,
  UpdateConnectionPayload
>(
  TYPE_CONSTANTS.UPDATE_CONNECTION_ASYNC,
  'put',
  arg => `${API_ENDPOINTS.CONNECTIONS.UPDATE_CONNECTION}/${arg.connectionId}`,
  'Failed to update connection. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: arg => {
      const body: any = {
        toUserId: arg.toUserId,
        connectionTypeId: arg.connectionTypeId,
        targetAccountType: arg.targetAccountType,
        isEmergency: arg.isEmergency,
      };
      if (arg.businessIds && arg.businessIds.length > 0) {
        body.businessIds = arg.businessIds;
      }
      if (arg.socialNetworkIds && arg.socialNetworkIds.length > 0) {
        body.socialNetworkIds = arg.socialNetworkIds;
      }
      if (arg.businessRoles && Object.keys(arg.businessRoles).length > 0) {
        body.businessRoles = arg.businessRoles;
      }
      if (arg.notes !== undefined) {
        body.notes = arg.notes;
      }
      return body;
    },
  },
);

export const getHandlahUsersAsync = createAsyncThunk<
  any,
  { targetAccountType?: string; search: string; page: number; pageSize: number, includeAllUsers?: boolean }
>(
  TYPE_CONSTANTS.GET_HANDLAH_USERS_ASYNC,
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(
        API_ENDPOINTS.CONNECTIONS.GET_HANDLAH_USERS,
        { params },
      );
      return response?.data ?? response;
    } catch (error) {
      return rejectWithValue(
        extractApiError(
          error,
          'Failed to fetch NCHRG users. Please try again.',
        ),
      );
    }
  },
);

export const getConnectionRequestsSentAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CONNECTION_REQUESTS_SENT_ASYNC,
  'get',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.GET_REQUESTS_SENT}${arg.targetAccountType}`,
  'Failed to fetch sent connection requests. Please try again.',
);

export const getConnectionRequestsReceivedAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CONNECTION_REQUESTS_RECEIVED_ASYNC,
  'get',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.GET_REQUESTS_RECEIVED}${arg.targetAccountType}`,
  'Failed to fetch received connection requests. Please try again.',
);

export const getEmergencyconnectionsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_EMERGENCY_CONNECTIONS_ASYNC,
  'get',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.GET_EMERGENCY_CONNECTIONS}${arg.targetAccountType}`,
  'Failed to fetch emergency connection requests. Please try again.',
);

export const acceptConnectionRequestAsync = createApiThunk(
  TYPE_CONSTANTS.ACCEPT_CONNECTION_REQUEST_ASYNC,
  'post',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.REQUEST_ACTION}${arg.requestId}/accept`,
  'Failed to accept connection request. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: (arg: any) => {
      const body: any = {};
      if (arg.businessIds?.length) body.businessIds = arg.businessIds;
      if (arg.socialNetworkIds?.length) body.socialNetworkIds = arg.socialNetworkIds;
      if (arg.businessRoles && Object.keys(arg.businessRoles).length) body.businessRoles = arg.businessRoles;
      return body;
    },
  },
);

export const removeConnectionAsync = createApiThunk(
  TYPE_CONSTANTS.REMOVE_CONNECTION_ASYNC,
  'delete',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTIONS}/${arg.connectionId}`,
  'Failed to accept connection request. Please try again.',
  { skipOfflineQueue: true },
);

export const declineConnectionRequestAsync = createApiThunk(
  TYPE_CONSTANTS.DECLINE_CONNECTION_REQUEST_ASYNC,
  'post',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.REQUEST_ACTION}${arg.requestId}/decline`,
  'Failed to decline connection request. Please try again.',
  { skipOfflineQueue: true },
);

export const getConnectionbyIdAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CONNECTION_BY_ID_ASYNC,
  'get',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.CHECK_CONNECTION(arg.userId, arg.targetAccountType)}`,
  'Failed to get connection. Please try again.',
);

export const checkBothSideConnection = createApiThunk(
  TYPE_CONSTANTS.CHECK_BOTH_SIDES_CONNECTION_ASYNC,
  'get',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.CHECK_CONNECTION(arg.userId, arg.targetAccountType)}`,
  'Failed to get connection. Please try again.',
);

export const approveEmergencyRequestAsync = createApiThunk(
  TYPE_CONSTANTS.APPROVE_EMERGENCY_REQUEST_ASYNC,
  'post',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.EMERGENCY_ACCESS_REQUEST}${arg.requestId}/approve`,
  'Failed to approve emergency request. Please try again.',
  { skipOfflineQueue: true },
);

export const rejectEmergencyRequestAsync = createApiThunk(
  TYPE_CONSTANTS.REJECT_EMERGENCY_REQUEST_ASYNC,
  'post',
  (arg: any) =>
    `${API_ENDPOINTS.CONNECTIONS.EMERGENCY_ACCESS_REQUEST}${arg.requestId}/reject`,
  'Failed to reject emergency request. Please try again.',
  { skipOfflineQueue: true },
);

export const getConnectedUsersAsync = createApiThunk(
  TYPE_CONSTANTS.GET_CONNECTED_USERS_ASYNC,
  'get',
  `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTED_USERS}`,
  'Failed to fetch connected users. Please try again.',
);

export const getUnsharedConnectedUsersAsync = createApiThunk(
  TYPE_CONSTANTS.GET_UNSHARED_CONNECTED_USERS_ASYNC,
  'get',
  (arg: any) => buildSharingUsersUrl(arg, 'unshared'),
  'Failed to fetch connected users. Please try again.',
);

export const getSharedConnectedUsersAsync = createApiThunk(
  TYPE_CONSTANTS.GET_SHARED_CONNECTED_USERS_ASYNC,
  'get',
  (arg: any) => buildSharingUsersUrl(arg, 'shared'),
  'Failed to fetch shared users. Please try again.',
);

// GET /connections/check-request
// Returns the cross-side pending request (or null if none).
// Pass the sender's userId and the OPPOSITE targetAccountType.
export const checkConnectionRequestAsync = createAsyncThunk<
  any,
  { userId: number; targetAccountType: string }
>(
  TYPE_CONSTANTS.CHECK_CONNECTION_REQUEST_ASYNC,
  async ({ userId, targetAccountType }, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(
        API_ENDPOINTS.CONNECTIONS.CHECK_REQUEST(userId, targetAccountType),
      );
      return response?.data ?? null;
    } catch (error: any) {
      // 404 / no pending request → treat as null (not an error)
      if (error?.response?.status === 404) return null;
      return rejectWithValue(
        extractApiError(error, 'Failed to check connection request.'),
      );
    }
  },
);

export const getSocialNetworkConnectionsAsync = createApiThunk(
  TYPE_CONSTANTS.GET_SOCIAL_NETWORK_CONNECTIONS_ASYNC,
  'get',
  (arg: { targetAccountType: string; businessIds?: number[] }) => {
    const params = new URLSearchParams();
    params.append('targetAccountType', arg.targetAccountType);
    if (arg.businessIds) {
      arg.businessIds.forEach(id => params.append('businessIds', String(id)));
    }
    return `${API_ENDPOINTS.CONNECTIONS.SOCIAL_NETWORK_CONNECTIONS}?${params.toString()}`;
  },
  'Failed to fetch social network accounts. Please try again.',
);
