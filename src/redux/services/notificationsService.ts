import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import { extractApiError } from '../../utils/helpers';

export interface GetNotificationsParams {
  page: number;
  pageSize?: number;
}

export interface ApiNotification {
  id: number;
  title: string;
  description: string;
  type: string;
  isseen: boolean;
  url: string;
  data: Record<string, any>;
  createdon: string;
  isdeleted: boolean;
}

export interface GetNotificationsResponse {
  notifications: ApiNotification[];
  totalcount: number;
  unseencount: number;
  page: number;
  pagesize: number;
}

// GET /notifications?page=&pageSize=
export const getNotificationsAsync = createAsyncThunk<
  GetNotificationsResponse,
  GetNotificationsParams
>(
  TYPE_CONSTANTS.GET_NOTIFICATIONS_ASYNC,
  async ({ page, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const url = `${API_ENDPOINTS.NOTIFICATIONS.GET_NOTIFICATIONS}?page=${page}&pageSize=${pageSize}`;
      const response = await apiHandle.get(url);
      return response.data as GetNotificationsResponse;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to fetch notifications.'));
    }
  },
);

// PATCH /notifications/{id}/seen
export const markSingleNotificationSeenAsync = createAsyncThunk<
  GetNotificationsResponse,
  number
>(
  TYPE_CONSTANTS.MARK_SINGLE_NOTIFICATION_SEEN_ASYNC,
  async (notificationId, { rejectWithValue }) => {
    try {
      const url = `${API_ENDPOINTS.NOTIFICATIONS.MARK_SINGLE_SEEN}/${notificationId}/seen`;
      const response = await (apiHandle as any).patch(url);
      return response.data as GetNotificationsResponse;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to mark notification as seen.'));
    }
  },
);

// PATCH /notifications/seen-all
export const markAllNotificationsSeenAsync = createAsyncThunk<void, void>(
  TYPE_CONSTANTS.MARK_ALL_NOTIFICATIONS_SEEN_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      await (apiHandle as any).patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_SEEN);
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to mark all notifications as seen.'));
    }
  },
);

export interface NotificationPreferences {
  reminderEmail: boolean;
  reminderSms: boolean;
  reminderPush: boolean;
}

// The API returns/accepts lowercased keys (reminderemail/remindersms/reminderpush).
// Normalize to our camelCase shape, tolerating either casing.
const normalizePreferences = (data: any): NotificationPreferences => ({
  reminderEmail: data?.reminderEmail ?? data?.reminderemail ?? false,
  reminderSms: data?.reminderSms ?? data?.remindersms ?? false,
  reminderPush: data?.reminderPush ?? data?.reminderpush ?? false,
});

// GET /user/notification-preferences
export const getNotificationPreferencesAsync = createAsyncThunk<NotificationPreferences, void>(
  TYPE_CONSTANTS.GET_NOTIFICATION_PREFERENCES_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.USER.NOTIFICATION_PREFERENCES);
      return normalizePreferences(response.data);
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load notification preferences.'));
    }
  },
);

// PUT /user/notification-preferences — all three flags are required
export const updateNotificationPreferencesAsync = createAsyncThunk<
  NotificationPreferences,
  NotificationPreferences
>(
  TYPE_CONSTANTS.UPDATE_NOTIFICATION_PREFERENCES_ASYNC,
  async (preferences, { rejectWithValue }) => {
    try {
      await apiHandle.put(API_ENDPOINTS.USER.NOTIFICATION_PREFERENCES, preferences);
      // Echo back exactly what we sent so state stays consistent regardless of
      // the response body shape.
      return preferences;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to update notification preferences.'));
    }
  },
);

// DELETE /notifications — permanently deletes all notifications for the user
export const deleteAllNotificationsAsync = createAsyncThunk<void, void>(
  TYPE_CONSTANTS.DELETE_ALL_NOTIFICATIONS_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      await apiHandle.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to clear notifications.'));
    }
  },
);

// DELETE /fcm-tokens/{deviceId}
export const deleteFcmTokenByDeviceId = async (deviceId: string): Promise<void> => {
  await apiHandle.delete(`${API_ENDPOINTS.NOTIFICATIONS.FCM_TOKENS}/${deviceId}`);
};
