import { createSlice } from '@reduxjs/toolkit';
import {
    showErrorToast,
    showSuccessToast,
    showInfoToast,
} from '../../components/common';
import i18next from 'i18next';
import { formatDate } from '../../utils/helpers';

import { ASYNC_STATUS } from '../../config/constants';
import {
    getRemindersAsync,
    addAdHocReminderAsync,
    markReminderCompletedAsync,
    getUpcomingRemindersAsync,
    getTodayRemindersAsync,
    setReminderActiveAsync,
    setBatchActiveAsync,
    updateBatchReminderAsync,
    deleteBatchReminderAsync,
    dismissReminderAsync,
    dismissBatchReminderAsync,
    normalizeReminderGroups,
} from '../services/reminderService';
import { ReminderTypes } from '../../types/reduxTypes/reminderSlice.types';

const initialState: ReminderTypes = {

    get_reminder_status: ASYNC_STATUS.IDLE,
    get_reminder_data: null,
    get_reminder_items: [],
    get_reminder_groups: [],
    get_reminder_pagination: null,
    get_reminder_error: null,

    reminder_action_status: ASYNC_STATUS.IDLE,
    reminder_action_error: null,

    add_ad_hoc_reminder_status: ASYNC_STATUS.IDLE,
    add_ad_hoc_reminder_data: null,
    add_ad_hoc_reminder_error: null,

    mark_completed_reminder_status: ASYNC_STATUS.IDLE,
    mark_completed_reminder_data: null,
    mark_completed_reminder_error: null,

    pending_reminders_count: 0,


    get_upcoming_reminders_status: ASYNC_STATUS.IDLE,
    get_upcoming_reminders_data: null,
    get_upcoming_reminders_error: null,

    get_today_reminders_status: ASYNC_STATUS.IDLE,
    get_today_reminders_data: null,
    get_today_reminders_error: null,

};

const reminderSlice = createSlice({
    name: 'reminder_slice',
    initialState: initialState,
    reducers: {
        setAddAdHocReminderStatus: (state) => {
            state.add_ad_hoc_reminder_status = ASYNC_STATUS.IDLE;
        },
        setMarkCompletedReminderStatus: (state) => {
            state.mark_completed_reminder_status = ASYNC_STATUS.IDLE;
        },
        setPendingRemindersCount: (state, action) => {
            state.pending_reminders_count = action.payload;
        },
        setReminderActionStatus: (state) => {
            state.reminder_action_status = ASYNC_STATUS.IDLE;
            state.reminder_action_error = null;
        },
    },
    extraReducers: builder => {


        builder.addCase(getRemindersAsync.pending, (state) => {
            state.get_reminder_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getRemindersAsync.fulfilled, (state, { payload, meta }) => {
            state.get_reminder_status = ASYNC_STATUS.SUCCEEDED;
            state.get_reminder_data = payload;

            const newItems: any[] = Array.isArray(payload)
                ? payload
                : (payload?.data ?? payload?.items ?? payload?.reminders ?? []);

            const page: number = (meta.arg as any)?.page ?? 1;
            const pageSize: number = (meta.arg as any)?.pageSize ?? 20;
            const total: number = payload?.total ?? payload?.totalCount ?? payload?.totalItems ?? newItems.length;
            const fetched: number = payload?.fetched ?? newItems.length;
            const hasMore = fetched === pageSize && (page * pageSize) < (total || Infinity);

            if (page <= 1) {
                state.get_reminder_items = newItems;
            } else {
                state.get_reminder_items = [...state.get_reminder_items, ...newItems];
            }

            state.get_reminder_groups = normalizeReminderGroups(state.get_reminder_items);

            state.get_reminder_pagination = { page, pageSize, total, hasMore };
        });
        builder.addCase(getRemindersAsync.rejected, (state, action) => {
            state.get_reminder_status = ASYNC_STATUS.ERROR;
            state.get_reminder_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        builder.addCase(getTodayRemindersAsync.pending, (state) => {
            state.get_today_reminders_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getTodayRemindersAsync.fulfilled, (state, { payload }) => {
            state.get_today_reminders_status = ASYNC_STATUS.SUCCEEDED;
            const items: any[] = Array.isArray(payload)
                ? payload
                : (payload?.data ?? payload?.items ?? payload?.reminders ?? []);
            state.get_today_reminders_data = items;
            const upcomingCount = Array.isArray(state.get_upcoming_reminders_data)
                ? state.get_upcoming_reminders_data.length
                : 0;
            state.pending_reminders_count = items.length + upcomingCount;
        });
        builder.addCase(getTodayRemindersAsync.rejected, (state, action) => {
            state.get_today_reminders_status = ASYNC_STATUS.ERROR;
            state.get_today_reminders_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        builder.addCase(getUpcomingRemindersAsync.pending, (state) => {
            state.get_upcoming_reminders_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(getUpcomingRemindersAsync.fulfilled, (state, { payload }) => {
            state.get_upcoming_reminders_status = ASYNC_STATUS.SUCCEEDED;
            const items: any[] = Array.isArray(payload)
                ? payload
                : (payload?.data ?? payload?.items ?? payload?.reminders ?? []);
            state.get_upcoming_reminders_data = items;
            const todayCount = Array.isArray(state.get_today_reminders_data)
                ? state.get_today_reminders_data.length
                : 0;
            state.pending_reminders_count = todayCount + items.length;
        });
        builder.addCase(getUpcomingRemindersAsync.rejected, (state, action) => {
            state.get_upcoming_reminders_status = ASYNC_STATUS.ERROR;
            state.get_upcoming_reminders_error = action.payload as string;
            showErrorToast(action.payload as string);
        });


        builder.addCase(addAdHocReminderAsync.pending, (state) => {
            state.add_ad_hoc_reminder_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(addAdHocReminderAsync.fulfilled, (state, { payload }) => {
            state.add_ad_hoc_reminder_status = ASYNC_STATUS.SUCCEEDED;
            state.add_ad_hoc_reminder_data = payload;
            showSuccessToast('Reminder added successfully');
        });
        builder.addCase(addAdHocReminderAsync.rejected, (state, action) => {
            state.add_ad_hoc_reminder_status = ASYNC_STATUS.ERROR;
            state.add_ad_hoc_reminder_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        builder.addCase(markReminderCompletedAsync.pending, (state) => {
            state.mark_completed_reminder_status = ASYNC_STATUS.LOADING;
        });
        builder.addCase(markReminderCompletedAsync.fulfilled, (state, { payload, meta }) => {
            state.mark_completed_reminder_status = ASYNC_STATUS.SUCCEEDED;
            state.mark_completed_reminder_data = payload;
            
            const isRecurring = payload?.isrecurring || payload?.isRecurring;
            const isCompleted = payload?.iscompleted || payload?.isCompleted;
            const isRolledOver = isRecurring && !isCompleted;

            if (Array.isArray(state.get_reminder_data)) {
                if (isRolledOver) {
                    state.get_reminder_data = state.get_reminder_data.map(
                        (item: any) => item.id === meta.arg ? { ...item, ...payload } : item
                    );
                } else {
                    state.get_reminder_data = state.get_reminder_data.filter(
                        (item: any) => item.id !== meta.arg,
                    );
                }
            }

            if (!isRolledOver) {
                state.pending_reminders_count = Math.max(0, state.pending_reminders_count - 1);
            }

            if (isRolledOver) {
                const nextDate = payload?.reminderdate || payload?.reminderDate;
                const formattedDate = nextDate ? formatDate(nextDate) : '';
                const msg = i18next.t('reminders.acknowledged_next', { defaultValue: 'Acknowledged — next: ' }) + formattedDate;
                showInfoToast(msg);
            } else {
                const msg = i18next.t('reminders.marked_completed', { defaultValue: 'Reminder marked as completed' });
                showSuccessToast(msg);
            }
        });
        builder.addCase(markReminderCompletedAsync.rejected, (state, action) => {
            state.mark_completed_reminder_status = ASYNC_STATUS.ERROR;
            state.mark_completed_reminder_error = action.payload as string;
            showErrorToast(action.payload as string);
        });

        const actionPending = (state: ReminderTypes) => {
            state.reminder_action_status = ASYNC_STATUS.LOADING;
            state.reminder_action_error = null;
        };
        const actionRejected = (state: ReminderTypes, action: any) => {
            state.reminder_action_status = ASYNC_STATUS.ERROR;
            state.reminder_action_error = action.payload as string;
            showErrorToast(action.payload as string);
        };

        builder.addCase(setReminderActiveAsync.pending, actionPending);
        builder.addCase(setReminderActiveAsync.fulfilled, (state, { meta }) => {
            state.reminder_action_status = ASYNC_STATUS.SUCCEEDED;
            showSuccessToast(
                (meta.arg as any)?.isActive
                    ? 'Reminder enabled'
                    : 'Reminder disabled',
            );
        });
        builder.addCase(setReminderActiveAsync.rejected, actionRejected);

        builder.addCase(dismissReminderAsync.pending, actionPending);
        builder.addCase(dismissReminderAsync.fulfilled, (state, { meta }) => {
            state.reminder_action_status = ASYNC_STATUS.SUCCEEDED;
            if (Number(meta.arg) >= 0) state.pending_reminders_count = Math.max(0, state.pending_reminders_count - 1);
            showSuccessToast(i18next.t('reminders.dismissed', { defaultValue: 'Reminder dismissed' }));
        });
        builder.addCase(dismissReminderAsync.rejected, actionRejected);
        builder.addCase(dismissBatchReminderAsync.pending, actionPending);
        builder.addCase(dismissBatchReminderAsync.fulfilled, (state) => {
            state.reminder_action_status = ASYNC_STATUS.SUCCEEDED;
            state.pending_reminders_count = Math.max(0, state.pending_reminders_count - 1);
            showSuccessToast(i18next.t('reminders.dismissed', { defaultValue: 'Reminder dismissed' }));
        });
        builder.addCase(dismissBatchReminderAsync.rejected, actionRejected);

        builder.addCase(setBatchActiveAsync.pending, actionPending);
        builder.addCase(setBatchActiveAsync.fulfilled, (state, { meta }) => {
            state.reminder_action_status = ASYNC_STATUS.SUCCEEDED;
            showSuccessToast(
                (meta.arg as any)?.isActive
                    ? 'Reminders enabled'
                    : 'Reminders disabled',
            );
        });
        builder.addCase(setBatchActiveAsync.rejected, actionRejected);

        builder.addCase(updateBatchReminderAsync.pending, actionPending);
        builder.addCase(updateBatchReminderAsync.fulfilled, (state) => {
            state.reminder_action_status = ASYNC_STATUS.SUCCEEDED;
            showSuccessToast('Reminders updated successfully');
        });
        builder.addCase(updateBatchReminderAsync.rejected, actionRejected);

        builder.addCase(deleteBatchReminderAsync.pending, actionPending);
        builder.addCase(deleteBatchReminderAsync.fulfilled, (state) => {
            state.reminder_action_status = ASYNC_STATUS.SUCCEEDED;
            showSuccessToast('Reminders deleted');
        });
        builder.addCase(deleteBatchReminderAsync.rejected, actionRejected);

    },
});

export const {
    setAddAdHocReminderStatus,
    setMarkCompletedReminderStatus,
    setPendingRemindersCount,
    setReminderActionStatus,
} = reminderSlice.actions;
export default reminderSlice.reducer;