import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';

export const getConnectionSharingsummary = createApiThunk(
    TYPE_CONSTANTS.GET_CONNECTIONS_SHARING_SUMMARY,
    'get',
    (arg: any) => {
        if (arg.businessId) {
            return `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTIONS}/${arg.userId}/${API_ENDPOINTS.SHARING.GET_SHARING_SUMMARY}?businessId=${arg.businessId}`;
        }
        return `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTIONS}/${arg.userId}/${API_ENDPOINTS.SHARING.GET_SHARING_SUMMARY}`;
    },
    'Failed to fetch sharing summary. Please try again.',
);

export const getConnectionEmergencySummary = createApiThunk(
    TYPE_CONSTANTS.GET_CONNECTIONS_EMERGENCY_SUMMARY,
    'get',
    (arg: any) =>
        `${API_ENDPOINTS.CONNECTIONS.GET_CONNECTIONS}/${arg.id}/emergency-access`,
    'Failed to fetch emergency summary. Please try again.',
);

export const sendEmergencyRequest = createApiThunk(
    TYPE_CONSTANTS.REQUEST_EMERGENCY_ACCESS,
    'post',
    (arg: any) => `${API_ENDPOINTS.SHARING.SEND_EMERGENCY_CONNECTION_REQUEST}`,
    'Failed to send emergency request. Please try again.',
    { skipOfflineQueue: true },
);

export const sharingSyncService = createApiThunk(
    TYPE_CONSTANTS.SHARING_SYNC_ASYNC,
    'put',
    (arg: any) => `${API_ENDPOINTS.SHARING.SHARING_SYNC}`,
    'Failed to perform sharing action. Please try again.',
);

export const getSharedByUsers = createApiThunk(
    TYPE_CONSTANTS.SHARED_BY_USERS_ASYNC,
    'get',
    (arg: any) => `${API_ENDPOINTS.SHARING.SHARED_BY_USERS(arg)}`,
    'Failed to perform sharing action. Please try again.',
);
