import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';
import createApiThunk from '../../utils/createApiThunk';
import { apiHandle } from '../../config/apiHandle';
import { extractApiError } from '../../utils/helpers';
import { ENV } from '../../config/env';
import * as V2 from './reminderV2';

export type ReminderStatusParam = 'today' | 'upcoming' | 'past_due' | 'completed';

/**
 * How far ahead to look for upcoming reminders. Only honoured by the backend
 * when status=upcoming (or no status is set); ignored for the other statuses.
 */
export type ReminderDateRange =
  | 'next_7'      // due within the next 7 days
  | 'next_30'     // due within the next 30 days
  | 'next_90'     // due within the next 3 months
  | 'this_month'  // due before end of current calendar month
  | 'this_year';  // due before end of current calendar year

/** Shared query params for all GET /reminders calls */
export interface GetRemindersParams {
  status?: ReminderStatusParam;
  dateRange?: ReminderDateRange; // only applies when status=upcoming
  entityType?: string;
  isBusiness?: boolean;
  businessId?: number;
  userId?: number;       // for emergency access
  isActive?: boolean;    // filter active vs inactive (disabled) reminders
  /** New engine, Completed tab: show only completed, dismissed or expired ones. */
  closedAs?: 'completed' | 'dismissed' | 'expired';
  page?: number;        // required by backend, default 1
  pageSize?: number;    // required by backend, default 20
}

export interface AddAdHocReminderPayload {
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time?: string | null;
  // daily & weekly
  startDate?: string;
  endDate?: string;
  selectedDays?: string[];
  // monthly
  selectedDates?: number[];
  // custom
  date?: string;
  // shared optional
  businessId?: number | null;
}

/** Build query string from GetRemindersParams */
const buildRemindersQuery = (arg?: GetRemindersParams): string => {
  const params: string[] = [];
  if (arg?.status) params.push(`status=${arg.status}`);
  // dateRange is only meaningful for the upcoming view.
  if (arg?.dateRange && (!arg.status || arg.status === 'upcoming')) {
    params.push(`dateRange=${arg.dateRange}`);
  }
  if (arg?.entityType) params.push(`entityType=${encodeURIComponent(arg.entityType)}`);
  if (arg?.isBusiness !== undefined) params.push(`isBusiness=${arg.isBusiness}`);
  if (arg?.businessId) params.push(`businessId=${arg.businessId}`);
  if (arg?.userId) params.push(`userId=${arg.userId}`);
  if (arg?.isActive !== undefined) params.push(`isActive=${arg.isActive}`);
  params.push(`page=${arg?.page ?? 1}`);
  params.push(`pageSize=${arg?.pageSize ?? 20}`);
  return params.length ? `?${params.join('&')}` : '';
};

const legacy_addAdHocReminderAsync = createApiThunk<any, AddAdHocReminderPayload>(
  TYPE_CONSTANTS.ADD_AD_HOC_REMINDER_ASYNC,
  'post',
  API_ENDPOINTS.REMINDERS.ADD_AD_HOC_REMINDER,
  'Failed to add reminder. Please try again.',
  { skipOfflineQueue: true },
);

export interface UpdateReminderPayload {
  title: string;
  message: string;
  reminderDate: string;
  reminderTime: string;
  isRecurring: boolean;
  recurrencePattern?: string | null;
  severity?: string | null;
}

// PUT /reminders/{id} — edit an ad_hoc reminder
const legacy_updateReminderAsync = createApiThunk<any, { id: number; data: UpdateReminderPayload }>(
  TYPE_CONSTANTS.UPDATE_REMINDER_ASYNC,
  'put',
  ({ id }) => `${API_ENDPOINTS.REMINDERS.UPDATE_REMINDER}/${id}`,
  'Failed to update reminder. Please try again.',
  { getBody: ({ data }) => data, skipOfflineQueue: true },
);

// DELETE /reminders/{id} — delete an ad_hoc reminder
const legacy_deleteReminderAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_REMINDER_ASYNC,
  'delete',
  (id) => `${API_ENDPOINTS.REMINDERS.DELETE_REMINDER}/${id}`,
  'Failed to delete reminder. Please try again.',
  { skipOfflineQueue: true },
);

// PATCH /reminders/{id}/active — enable/disable a single ad_hoc reminder
const legacy_setReminderActiveAsync = createApiThunk<any, { id: number; isActive: boolean }>(
  TYPE_CONSTANTS.SET_REMINDER_ACTIVE_ASYNC,
  'patch',
  ({ id }) => `${API_ENDPOINTS.REMINDERS.SET_ACTIVE}/${id}/active`,
  'Failed to update reminder. Please try again.',
  { getBody: ({ isActive }) => ({ isActive }), skipOfflineQueue: true },
);

// PUT /reminders/batch/{batchId} — replace an entire batch (same body as ad-hoc create)
const legacy_updateBatchReminderAsync = createApiThunk<
  any,
  { batchId: string; data: AddAdHocReminderPayload }
>(
  TYPE_CONSTANTS.UPDATE_BATCH_REMINDER_ASYNC,
  'put',
  ({ batchId }) => `${API_ENDPOINTS.REMINDERS.UPDATE_BATCH}/${batchId}`,
  'Failed to update reminders. Please try again.',
  { getBody: ({ data }) => data, skipOfflineQueue: true },
);

// DELETE /reminders/batch/{batchId} — delete an entire batch
const legacy_deleteBatchReminderAsync = createApiThunk<any, string>(
  TYPE_CONSTANTS.DELETE_BATCH_REMINDER_ASYNC,
  'delete',
  (batchId) => `${API_ENDPOINTS.REMINDERS.DELETE_BATCH}/${batchId}`,
  'Failed to delete reminders. Please try again.',
  { skipOfflineQueue: true },
);

// PATCH /reminders/batch/{batchId}/active — enable/disable an entire batch
const legacy_setBatchActiveAsync = createApiThunk<
  any,
  { batchId: string; isActive: boolean }
>(
  TYPE_CONSTANTS.SET_BATCH_REMINDER_ACTIVE_ASYNC,
  'patch',
  ({ batchId }) => `${API_ENDPOINTS.REMINDERS.SET_BATCH_ACTIVE}/${batchId}/active`,
  'Failed to update reminders. Please try again.',
  { getBody: ({ isActive }) => ({ isActive }), skipOfflineQueue: true },
);

const legacy_markReminderCompletedAsync = createApiThunk<any, number>(
  TYPE_CONSTANTS.MARK_COMPLETED_REMINDER_ASYNC,
  'patch',
  (id) => `${API_ENDPOINTS.REMINDERS.MARK_COMPLETED}/${id}/mark-completed`,
  'Failed to mark reminder as completed. Please try again.',
  { skipOfflineQueue: true },
);

const legacy_getReminderByIdAsync = createApiThunk<any, { id: number; userId?: number }>(
  TYPE_CONSTANTS.GET_REMINDER_BY_ID_ASYNC,
  'get',
  ({ id, userId }) =>
    userId
      ? `${API_ENDPOINTS.REMINDERS.GET_REMINDER_BY_ID}/${id}?userId=${userId}`
      : `${API_ENDPOINTS.REMINDERS.GET_REMINDER_BY_ID}/${id}`,
  'Failed to fetch reminder details. Please try again.',
);

const legacy_getRemindersAsync = createApiThunk<any, GetRemindersParams | undefined>(
  TYPE_CONSTANTS.GET_REMINDERS_ASYNC,
  'get',
  (arg) => `${API_ENDPOINTS.REMINDERS.GET_REMINDERS}${buildRemindersQuery(arg)}`,
  'Failed to fetch reminders. Please try again.',
);

const legacy_getTodayRemindersAsync = createApiThunk<any, GetRemindersParams | undefined>(
  TYPE_CONSTANTS.GET_TODAY_REMINDERS_ASYNC,
  'get',
  (arg) => `${API_ENDPOINTS.REMINDERS.GET_REMINDERS}${buildRemindersQuery(arg)}`,
  'Failed to fetch today reminders. Please try again.',
);

const legacy_getUpcomingRemindersAsync = createApiThunk<any, GetRemindersParams | undefined>(
  TYPE_CONSTANTS.GET_UPCOMING_REMINDERS_ASYNC,
  'get',
  (arg) => `${API_ENDPOINTS.REMINDERS.GET_REMINDERS}${buildRemindersQuery(arg)}`,
  'Failed to fetch upcoming reminders. Please try again.',
);


/** Case-insensitive field read — tries each provided key spelling. */
const pick = (obj: any, ...keys: string[]): any => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    const lower = k.toLowerCase();
    if (obj[lower] !== undefined && obj[lower] !== null) return obj[lower];
  }
  return undefined;
};

export interface NormalizedReminderGroup {
  batchId: string | null;
  title: string;
  entityType: string;
  entityId: number | null;
  nearestReminderDate: string | null;
  severity: string | null;
  isActive: boolean;
  isCompleted: boolean;
  count: number;
  /** From the group's own isrecurring field — not the individual reminder rows. */
  isRecurring: boolean;
  /** New engine: who a child's reminder is for ("Martin's dependant Ali"), shown to a caregiver. */
  forName: string | null;
  /** New engine: 'item' = an automated reminder whose reminders[] are its interval rows. */
  kind: string | null;
  /** New engine: false for a caregiver's view of a child's reminder (they can complete and dismiss, not delete). */
  canDelete: boolean;
  /** From the group's own recurrenceenddate field. Null means an infinite series. */
  recurrenceEndDate: string | null;
  /** Raw individual reminder rows (lowercase keys preserved for the modals). */
  reminders: any[];
}

/** True for user-managed custom reminders that allow edit/delete/enable. */
export const isAdHocGroup = (g: { entityType?: string }): boolean =>
  (g?.entityType ?? '').toLowerCase() === 'ad_hoc';

// Matches child_medication_schedule, pet_medication_schedule, and any future
// "<owner>_medication_schedule" variant — these recur but still need a
// per-occurrence "mark complete" action, unlike other recurring reminders.
export const isMedicationGroup = (g: { entityType?: string }): boolean =>
  (g?.entityType ?? '').toLowerCase().endsWith('_medication_schedule');

/** Normalize one raw group object into a stable, camelCase shape. */
export const normalizeReminderGroup = (raw: any): NormalizedReminderGroup => {
  const reminders: any[] = Array.isArray(pick(raw, 'reminders')) ? pick(raw, 'reminders') : [];
  const countRaw = pick(raw, 'count');
  return {
    batchId: pick(raw, 'batchId') ?? null,
    title: pick(raw, 'title') ?? '',
    entityType: pick(raw, 'entityType') ?? '',
    entityId: pick(raw, 'entityId') ?? null,
    nearestReminderDate: pick(raw, 'nearestReminderDate') ?? null,
    severity: pick(raw, 'severity') ?? null,
    isActive: pick(raw, 'isActive') !== false,
    isCompleted: !!pick(raw, 'isCompleted'),
    count: typeof countRaw === 'number' ? countRaw : reminders.length || 1,
    forName: pick(raw, 'forName') ?? null,
    kind: pick(raw, 'kind') ?? null,
    canDelete: pick(raw, 'canDelete') !== false,
    isRecurring: !!pick(raw, 'isRecurring', 'isrecurring'),
    // "enddate" is the group's own recurrence end date (sibling to
    // reminders[], not inside it). "recurrenceenddate" is a fallback in
    // case the backend ever only populates that one instead.
    recurrenceEndDate: pick(raw, 'endDate', 'enddate', 'recurrenceEndDate', 'recurrenceenddate') ?? null,
    reminders,
  };
};

/** Normalize a list of raw groups. */
export const normalizeReminderGroups = (items: any[]): NormalizedReminderGroup[] =>
  (Array.isArray(items) ? items : []).map(normalizeReminderGroup);

// ---------------------------------------------------------------------------------------------------------------------
// The new reminder engine (/v2). Same thunk names and result shapes, so the screens do not change. Used only when ENV.REMINDERS_V2 is on.
// ---------------------------------------------------------------------------------------------------------------------

const E2 = API_ENDPOINTS.REMINDERS_V2;
const listV2 = (prefix: string, fail: string) =>
  createApiThunk<any, GetRemindersParams | undefined>(
    prefix, 'get', (arg) => `${E2.LIST}${V2.buildListQuery(arg)}`, fail, { transformResponse: (d) => V2.toListPayload(d) },
  );

const v2_getReminders = listV2(TYPE_CONSTANTS.GET_REMINDERS_ASYNC, 'Failed to fetch reminders. Please try again.');
const v2_getToday = listV2(TYPE_CONSTANTS.GET_TODAY_REMINDERS_ASYNC, 'Failed to fetch today reminders. Please try again.');
const v2_getUpcoming = listV2(TYPE_CONSTANTS.GET_UPCOMING_REMINDERS_ASYNC, 'Failed to fetch upcoming reminders. Please try again.');

const v2_getById = createApiThunk<any, { id: number; userId?: number }>(
  TYPE_CONSTANTS.GET_REMINDER_BY_ID_ASYNC, 'get', ({ id }) => `${E2.BY_ID}/${id}`, 'Failed to fetch reminder details. Please try again.',
  { transformResponse: (d) => V2.toRow(d) },
);

const v2_complete = createApiThunk<any, number>(
  TYPE_CONSTANTS.MARK_COMPLETED_REMINDER_ASYNC, 'post',
  // Completing any interval row completes the whole item.
  (id) => (V2.isRowId(id) ? `${E2.ROW}/${V2.rowIdOf(id)}/complete?scope=item` : `${E2.COMPLETE}/${id}/complete?scope=this`), 'Failed to mark reminder as completed. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: () => null,
    // A repeating reminder brings up its next date: the screen treats that as "rolled over" (still recurring, not completed).
    transformResponse: (d, id) => {
      const next = d?.next ?? d?.Next;
      return {
        id, isrecurring: !!next, iscompleted: !next,
        reminderdate: next ? `${String(next.dueDate ?? next.DueDate).slice(0, 10)}T00:00:00` : undefined,
      };
    },
  },
);

const v2_dismiss = createApiThunk<any, number>(
  TYPE_CONSTANTS.DISMISS_REMINDER_ASYNC, 'post',
  // A row dismisses only itself; the other rows of the item still fire.
  (id) => (V2.isRowId(id) ? `${E2.ROW}/${V2.rowIdOf(id)}/dismiss?scope=interval` : `${E2.DISMISS}/${id}/dismiss?scope=this`), 'Failed to dismiss reminder. Please try again.',
  { skipOfflineQueue: true, getBody: () => null, transformResponse: (_d, id) => ({ id }) },
);

const v2_dismissBatch = createApiThunk<any, string>(
  TYPE_CONSTANTS.DISMISS_BATCH_REMINDER_ASYNC, 'post',
  (batchId) => `${E2.DISMISS}/${V2.occurrenceOfBatch(batchId)}/dismiss?scope=${V2.isItemBatch(batchId) ? 'this' : 'series'}`, 'Failed to dismiss reminders. Please try again.',
  { skipOfflineQueue: true, getBody: () => null },
);

const v2_delete = createApiThunk<any, number>(
  TYPE_CONSTANTS.DELETE_REMINDER_ASYNC, 'post',
  (id) => (V2.isRowId(id) ? `${E2.ROW}/${V2.rowIdOf(id)}/delete?scope=interval` : `${E2.DELETE}/${id}/delete?scope=this`), 'Failed to delete reminder. Please try again.',
  { skipOfflineQueue: true, getBody: () => null },
);

const v2_deleteBatch = createApiThunk<any, string>(
  TYPE_CONSTANTS.DELETE_BATCH_REMINDER_ASYNC, 'post',
  (batchId) => `${E2.DELETE}/${V2.occurrenceOfBatch(batchId)}/delete?scope=series&confirm=true`, 'Failed to delete reminders. Please try again.',
  { skipOfflineQueue: true, getBody: () => null },
);

const v2_setActive = createApiThunk<any, { id: number; isActive: boolean }>(
  TYPE_CONSTANTS.SET_REMINDER_ACTIVE_ASYNC, 'post',
  ({ id, isActive }) => `${E2.CUSTOM_OCCURRENCES}/${id}/${isActive ? 'activate' : 'deactivate'}?scope=this`, 'Failed to update reminder. Please try again.',
  { skipOfflineQueue: true, getBody: () => null },
);

const v2_setBatchActive = createApiThunk<any, { batchId: string; isActive: boolean }>(
  TYPE_CONSTANTS.SET_BATCH_REMINDER_ACTIVE_ASYNC, 'post',
  ({ batchId, isActive }) => `${E2.CUSTOM_OCCURRENCES}/${V2.occurrenceOfBatch(batchId)}/${isActive ? 'activate' : 'deactivate'}?scope=series`,
  'Failed to update reminders. Please try again.',
  { skipOfflineQueue: true, getBody: () => null },
);

const v2_addAdHoc = createApiThunk<any, AddAdHocReminderPayload>(
  TYPE_CONSTANTS.ADD_AD_HOC_REMINDER_ASYNC, 'post', E2.CUSTOM_CREATE, 'Failed to add reminder. Please try again.',
  { skipOfflineQueue: true, getBody: (p) => V2.customBody(p), transformResponse: (d) => V2.customToRows(d) },
);

// Edit one date of a custom reminder: the new engine edits the whole reminder (future dates only), so it is read first and written back changed.
const v2_update = createAsyncThunk<any, { id: number; data: UpdateReminderPayload }>(
  TYPE_CONSTANTS.UPDATE_REMINDER_ASYNC,
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const item: any = (await (apiHandle as any).get(`${E2.BY_ID}/${id}`))?.data;
      const seriesId = item?.seriesId ?? item?.seriesid;
      if (!seriesId) return rejectWithValue('This reminder cannot be edited.');
      const cur: any = (await (apiHandle as any).get(`${E2.CUSTOM_BY_ID}/${seriesId}`))?.data;
      const res: any = await (apiHandle as any).put(`${E2.CUSTOM_BY_ID}/${seriesId}`, {
        description: data.title?.trim() || data.message?.trim() || cur.description,
        frequency: cur.frequency,
        date: V2.dateOnly(data.reminderDate) ?? V2.dateOnly(cur.date),
        startDate: V2.dateOnly(cur.startDate),
        endDate: V2.dateOnly(cur.endDate),
        time: data.reminderTime || cur.time,
        selectedDays: cur.selectedDays,
        selectedDates: cur.selectedDates,
        businessId: cur.businessId ?? undefined,
      });
      return V2.customToRows(res?.data)[0] ?? { id };
    } catch (e) {
      return rejectWithValue(extractApiError(e, 'Failed to update reminder. Please try again.'));
    }
  },
);

// Replace a whole custom reminder (future dates only) from its group.
const v2_updateBatch = createApiThunk<any, { batchId: string; data: AddAdHocReminderPayload }>(
  TYPE_CONSTANTS.UPDATE_BATCH_REMINDER_ASYNC, 'put', ({ batchId }) => `${E2.CUSTOM_BY_ID}/${V2.seriesOfBatch(batchId)}`,
  'Failed to update reminders. Please try again.',
  { skipOfflineQueue: true, getBody: ({ data }) => V2.customBody(data), transformResponse: (d) => V2.customToRows(d) },
);

// ---- the thunks the screens import: the current system by default, the new engine when ENV.REMINDERS_V2 is on ----
export const addAdHocReminderAsync = (ENV.REMINDERS_V2 ? v2_addAdHoc : legacy_addAdHocReminderAsync) as typeof legacy_addAdHocReminderAsync;
export const updateReminderAsync = (ENV.REMINDERS_V2 ? v2_update : legacy_updateReminderAsync) as typeof legacy_updateReminderAsync;
export const deleteReminderAsync = (ENV.REMINDERS_V2 ? v2_delete : legacy_deleteReminderAsync) as typeof legacy_deleteReminderAsync;
export const setReminderActiveAsync = (ENV.REMINDERS_V2 ? v2_setActive : legacy_setReminderActiveAsync) as typeof legacy_setReminderActiveAsync;
export const updateBatchReminderAsync = (ENV.REMINDERS_V2 ? v2_updateBatch : legacy_updateBatchReminderAsync) as typeof legacy_updateBatchReminderAsync;
export const deleteBatchReminderAsync = (ENV.REMINDERS_V2 ? v2_deleteBatch : legacy_deleteBatchReminderAsync) as typeof legacy_deleteBatchReminderAsync;
export const setBatchActiveAsync = (ENV.REMINDERS_V2 ? v2_setBatchActive : legacy_setBatchActiveAsync) as typeof legacy_setBatchActiveAsync;
export const markReminderCompletedAsync = (ENV.REMINDERS_V2 ? v2_complete : legacy_markReminderCompletedAsync) as typeof legacy_markReminderCompletedAsync;
export const getReminderByIdAsync = (ENV.REMINDERS_V2 ? v2_getById : legacy_getReminderByIdAsync) as typeof legacy_getReminderByIdAsync;
export const getRemindersAsync = (ENV.REMINDERS_V2 ? v2_getReminders : legacy_getRemindersAsync) as typeof legacy_getRemindersAsync;
export const getTodayRemindersAsync = (ENV.REMINDERS_V2 ? v2_getToday : legacy_getTodayRemindersAsync) as typeof legacy_getTodayRemindersAsync;
export const getUpcomingRemindersAsync = (ENV.REMINDERS_V2 ? v2_getUpcoming : legacy_getUpcomingRemindersAsync) as typeof legacy_getUpcomingRemindersAsync;

/** New engine only: close a reminder without doing it (it stays in history as Dismissed). */
export const dismissReminderAsync = v2_dismiss;
export const dismissBatchReminderAsync = v2_dismissBatch;
