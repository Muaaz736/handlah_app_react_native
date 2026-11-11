import { ENV } from '../../config/env';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import createApiThunk from '../../utils/createApiThunk';

export interface OnboardingPayload {
  spaceType: 'Personal' | 'Business';
  ownedItems: string[];
  responsibilities: string[];
  frustrations: string[];
  reminderStyle: string;
  businessId?: number | null;
}

export interface OnboardingStatusResponse {
  personalcomplete: boolean;
  businesscomplete: boolean;
}

export interface DashboardSubItem {
  id: number;
  entitytype: string;
  entityid: number | null;
  title: string;
  message: string;
  reminderdate: string;
  remindertime: string;
  iscompleted: boolean;
  forname: string | null;
  rowstatus?: string;
}

export interface DashboardAttentionItem {
  title: string;
  module: string;
  description: string;
  urgency: string;
  dayslabel: string;
  icon: string;
  entitytype: string;
  entityid: number;
  routekey: string;
  buttontext: string;
  reminderid: number | null;
  batchid: string | null;
  parentid?: number | null;
  parententityid?: number | null;
  items?: DashboardSubItem[];
  rows?: any[] | null;
}

export interface DashboardBriefing {
  title: string;
  completionpercent: number;
  needattentioncount: number;
  quickwinscount: number;
  upcomingcount: number;
  reminderstotal?: number;
  reminderscompleted?: number;
}

export interface DashboardFavorite {
  id: number;
  name: string;
  icon: string;
  route: string;
  tabcategoryid: number;
  categoryname: string;
  displayorder: number;
  isfavorite: boolean;
}

export interface DashboardResponse {
  briefing: DashboardBriefing;
  favorites: DashboardFavorite[];
  needattention: DashboardAttentionItem[];
  quickwins: DashboardAttentionItem[];
  upcoming: DashboardAttentionItem[];
}

export const submitOnboardingAsync = createApiThunk<OnboardingPayload, any>(
  TYPE_CONSTANTS.SUBMIT_ONBOARDING_ASYNC,
  'post',
  API_ENDPOINTS.ONBOARDING.SUBMIT,
  'Onboarding submission failed. Please try again.',
  { skipOfflineQueue: true },
);

export const getOnboardingStatusAsync = createApiThunk<any, OnboardingStatusResponse>(
  TYPE_CONSTANTS.GET_ONBOARDING_STATUS_ASYNC,
  'get',
  API_ENDPOINTS.ONBOARDING.STATUS,
  'Failed to get onboarding status. Please try again.',
  { skipOfflineQueue: true },
);

export interface MarkDashboardItemDonePayload {
  entityType: string;
  entityId: number;
  reminderId?: number | null;
  batchId?: string | null;
  nextDate?: string | null;
}

const CLOSED_ROW = ['completed', 'dismissed', 'expired'];

const withRowSeries = (data: any): any => {
  if (!data) return data;
  const convert = (item: any) => {
    const rows: any[] = Array.isArray(item?.rows) ? item.rows : [];
    if (rows.length < 2) return item;
    return {
      ...item,
      batchid: `v2:item:${item.reminderid}`,
      items: rows.map(r => ({
        id: -Number(r.rowid),
        entitytype: item.entitytype,
        entityid: item.entityid ?? null,
        title: r.label ?? '',
        message: r.label ?? '',
        reminderdate: r.intervaldate ? `${String(r.intervaldate).slice(0, 10)}T00:00:00` : '',
        remindertime: '',
        iscompleted: CLOSED_ROW.includes(String(r.status).toLowerCase()) || r.candismiss === false,
        rowstatus: String(r.status ?? '').toLowerCase(),
        forname: item.forname ?? null,
      })),
    };
  };
  const list = (v: any) => (Array.isArray(v) ? v.map(convert) : v);
  return { ...data, needattention: list(data.needattention), quickwins: list(data.quickwins), upcoming: list(data.upcoming) };
};

export const getDashboardAsync = createApiThunk<
  { spaceType: 'Personal' | 'Business'; businessId?: number | null },
  DashboardResponse
>(
  TYPE_CONSTANTS.GET_DASHBOARD_ASYNC,
  'get',
  (arg) => {
    const params: string[] = [`spaceType=${(arg as any)?.spaceType ?? 'Personal'}`];
    if ((arg as any)?.businessId) params.push(`businessId=${(arg as any).businessId}`);
    return `${ENV.REMINDERS_V2 ? API_ENDPOINTS.DASHBOARD_V2.GET : API_ENDPOINTS.DASHBOARD.GET}?${params.join('&')}`;
  },
  'Failed to load dashboard. Please try again.',
  {
    skipOfflineQueue: true,
    transformResponse: ENV.REMINDERS_V2 ? (d: any) => withRowSeries(d) : undefined,
  },
);

export const markDashboardItemDoneAsync = createApiThunk<
  void,
  MarkDashboardItemDonePayload
>(
  TYPE_CONSTANTS.MARK_DASHBOARD_DONE_ASYNC,
  'post',
  ENV.REMINDERS_V2 ? API_ENDPOINTS.DASHBOARD_V2.MARK_DONE : API_ENDPOINTS.DASHBOARD.MARK_DONE,
  'Failed to mark item as done. Please try again.',
  {
    skipOfflineQueue: true,
    getBody: ENV.REMINDERS_V2
      ? (p: MarkDashboardItemDonePayload) => {
          if (p.reminderId && p.reminderId < 0) return { rowId: -p.reminderId, action: 'dismiss' };
          if (!p.reminderId) throw new Error('This item can no longer be marked done from here. Refresh the dashboard.');
          return { reminderId: p.reminderId, nextDate: p.nextDate ?? undefined };
        }
      : undefined,
  },
);