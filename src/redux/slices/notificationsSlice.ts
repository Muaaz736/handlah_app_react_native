import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import {
  getNotificationsAsync,
  markSingleNotificationSeenAsync,
  markAllNotificationsSeenAsync,
  deleteAllNotificationsAsync,
  getNotificationPreferencesAsync,
  updateNotificationPreferencesAsync,
  ApiNotification,
} from '../services/notificationsService';
import { showErrorToast } from '../../components/common';

export interface NotificationsState {
  notifications: ApiNotification[];
  total_count: number;
  unseen_count: number;
  current_page: number;
  page_size: number;
  has_more: boolean;

  get_notifications_status: string;
  get_notifications_error: string | null;

  load_more_status: string;

  mark_single_seen_status: string;
  mark_all_seen_status: string;
  delete_all_status: string;

  // Reminder notification channel preferences
  reminder_email: boolean;
  reminder_sms: boolean;
  reminder_push: boolean;
  get_preferences_status: string;
  update_preferences_status: string;
}

const initialState: NotificationsState = {
  notifications: [],
  total_count: 0,
  unseen_count: 0,
  current_page: 1,
  page_size: 20,
  has_more: true,

  get_notifications_status: ASYNC_STATUS.IDLE,
  get_notifications_error: null,

  load_more_status: ASYNC_STATUS.IDLE,

  mark_single_seen_status: ASYNC_STATUS.IDLE,
  mark_all_seen_status: ASYNC_STATUS.IDLE,
  delete_all_status: ASYNC_STATUS.IDLE,

  reminder_email: true,
  reminder_sms: true,
  reminder_push: true,
  get_preferences_status: ASYNC_STATUS.IDLE,
  update_preferences_status: ASYNC_STATUS.IDLE,
};

const notificationsSlice = createSlice({
  name: 'notifications_slice',
  initialState,
  reducers: {
    resetNotifications: state => {
      state.notifications = [];
      state.current_page = 1;
      state.has_more = true;
      state.get_notifications_status = ASYNC_STATUS.IDLE;
      state.get_notifications_error = null;
      state.load_more_status = ASYNC_STATUS.IDLE;
    },
    // Optimistic: set reminder channel preferences immediately in local state
    setReminderPreferences: (
      state,
      action: { payload: { reminderEmail: boolean; reminderSms: boolean; reminderPush: boolean } },
    ) => {
      state.reminder_email = action.payload.reminderEmail;
      state.reminder_sms = action.payload.reminderSms;
      state.reminder_push = action.payload.reminderPush;
    },
    // Optimistic: mark one item seen immediately in local state
    markItemSeen: (state, action: { payload: number }) => {
      const item = state.notifications.find(n => n.id === action.payload);
      if (item && !item.isseen) {
        item.isseen = true;
        state.unseen_count = Math.max(0, state.unseen_count - 1);
      }
    },
    // Optimistic: mark every item seen immediately in local state
    markAllSeen: state => {
      state.notifications.forEach(n => { n.isseen = true; });
      state.unseen_count = 0;
    },
  },
  extraReducers: builder => {
    // ── getNotificationsAsync ──────────────────────────────────────────────
    builder.addCase(getNotificationsAsync.pending, (state, action) => {
      if (action.meta.arg.page === 1) {
        state.get_notifications_status = ASYNC_STATUS.LOADING;
      } else {
        state.load_more_status = ASYNC_STATUS.LOADING;
      }
      state.get_notifications_error = null;
    });
    builder.addCase(getNotificationsAsync.fulfilled, (state, { payload, meta }) => {
      const isFirstPage = meta.arg.page === 1;
      if (isFirstPage) {
        state.notifications = payload.notifications;
        state.get_notifications_status = ASYNC_STATUS.SUCCEEDED;
      } else {
        const existingIds = new Set(state.notifications.map(n => n.id));
        const newItems = payload.notifications.filter(n => !existingIds.has(n.id));
        state.notifications = [...state.notifications, ...newItems];
        state.load_more_status = ASYNC_STATUS.SUCCEEDED;
      }
      state.total_count = payload.totalcount;
      state.unseen_count = payload.unseencount;
      state.current_page = payload.page;
      state.page_size = payload.pagesize;
      state.has_more = state.notifications.length < payload.totalcount;
    });
    builder.addCase(getNotificationsAsync.rejected, (state, action) => {
      if (action.meta.arg.page === 1) {
        state.get_notifications_status = ASYNC_STATUS.ERROR;
      } else {
        state.load_more_status = ASYNC_STATUS.ERROR;
      }
      state.get_notifications_error = action.payload as string;
      // if (action.payload !== '__OFFLINE_ERROR__') {
      //   showErrorToast((action.payload as string) ?? 'Failed to fetch notifications.');
      // }
    });

    // ── markSingleNotificationSeenAsync ────────────────────────────────────
    builder.addCase(markSingleNotificationSeenAsync.pending, state => {
      state.mark_single_seen_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(markSingleNotificationSeenAsync.fulfilled, state => {
      // The optimistic markItemSeen reducer already:
      //   • flipped isseen = true on the specific item
      //   • decremented unseen_count by 1
      // We must NOT overwrite unseen_count here — the PATCH /notifications/{id}/seen
      // response may return a stale or incorrect unseencount (e.g. 0) which would
      // wipe out the badge and the "mark all read" button for all other unread items.
      state.mark_single_seen_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(markSingleNotificationSeenAsync.rejected, state => {
      state.mark_single_seen_status = ASYNC_STATUS.ERROR;
    });

    // ── markAllNotificationsSeenAsync ──────────────────────────────────────
    builder.addCase(markAllNotificationsSeenAsync.pending, state => {
      state.mark_all_seen_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(markAllNotificationsSeenAsync.fulfilled, state => {
      state.mark_all_seen_status = ASYNC_STATUS.SUCCEEDED;
      state.notifications.forEach(n => { n.isseen = true; });
      state.unseen_count = 0;
    });
    builder.addCase(markAllNotificationsSeenAsync.rejected, state => {
      state.mark_all_seen_status = ASYNC_STATUS.ERROR;
    });

    // ── deleteAllNotificationsAsync ────────────────────────────────────────
    builder.addCase(deleteAllNotificationsAsync.pending, state => {
      state.delete_all_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(deleteAllNotificationsAsync.fulfilled, state => {
      state.delete_all_status = ASYNC_STATUS.SUCCEEDED;
      state.notifications = [];
      state.total_count = 0;
      state.unseen_count = 0;
      state.current_page = 1;
      state.has_more = false;
    });
    builder.addCase(deleteAllNotificationsAsync.rejected, (state, action) => {
      state.delete_all_status = ASYNC_STATUS.ERROR;
      showErrorToast((action.payload as string) ?? 'Failed to clear notifications.');
    });

    // ── getNotificationPreferencesAsync ────────────────────────────────────
    builder.addCase(getNotificationPreferencesAsync.pending, state => {
      state.get_preferences_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getNotificationPreferencesAsync.fulfilled, (state, { payload }) => {
      state.get_preferences_status = ASYNC_STATUS.SUCCEEDED;
      // Keep the previous value when a flag is missing from the response so a
      // wrapped/partial body never blanks out a toggle.
      state.reminder_email = payload?.reminderEmail ?? state.reminder_email;
      state.reminder_sms = payload?.reminderSms ?? state.reminder_sms;
      state.reminder_push = payload?.reminderPush ?? state.reminder_push;
    });
    builder.addCase(getNotificationPreferencesAsync.rejected, state => {
      state.get_preferences_status = ASYNC_STATUS.ERROR;
    });

    // ── updateNotificationPreferencesAsync ─────────────────────────────────
    builder.addCase(updateNotificationPreferencesAsync.pending, state => {
      state.update_preferences_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateNotificationPreferencesAsync.fulfilled, (state, { payload }) => {
      state.update_preferences_status = ASYNC_STATUS.SUCCEEDED;
      state.reminder_email = payload.reminderEmail;
      state.reminder_sms = payload.reminderSms;
      state.reminder_push = payload.reminderPush;
    });
    builder.addCase(updateNotificationPreferencesAsync.rejected, (state, action) => {
      state.update_preferences_status = ASYNC_STATUS.ERROR;
      showErrorToast((action.payload as string) ?? 'Failed to update notification preferences.');
    });
  },
});

export const { resetNotifications, markItemSeen, markAllSeen, setReminderPreferences } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
