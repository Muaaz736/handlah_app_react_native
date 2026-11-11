import { apiHandle } from '../../../config/apiHandle';
import { ENV } from '../../../config/env';
import type {
  AddLifeEventStepPayload,
  BriefPreferencesDto,
  BriefTodayItemDto,
  DailyBriefDto,
  HouseholdInviteCreatedDto,
  HouseholdInvitePreviewDto,
  HouseholdMoneyFinderDto,
  LifeEventDetailDto,
  LifeEventsOverviewDto,
  LifeEventTemplateDto,
  MoneyFinderResultDto,
  MoneyFinderStatus,
  MyHouseholdDto,
  StartLifeEventPayload,
  SubscriptionCancelLinkDto,
  UpdateLifeEventPayload,
  UpdateLifeEventStepPayload,
} from './tools.types';

/**
 * API calls for the daily brief, life events and the Money Finder. Same endpoints the web app uses;
 * the app's API client adds the token and base URL.
 */

// ---------------------------------------------------------------------------------------------
// Daily brief
// ---------------------------------------------------------------------------------------------

export const dailyBriefApi = {
  async get(): Promise<DailyBriefDto> {
    return (await apiHandle.get('daily-brief')).data as DailyBriefDto;
  },

  async updatePreferences(prefs: { pushEnabled: boolean; deliveryTime: string; weeklySummary: boolean }): Promise<BriefPreferencesDto> {
    return (await apiHandle.put('daily-brief/preferences', prefs)).data as BriefPreferencesDto;
  },

  /** Ticks off an item: a life-event step, a new-engine reminder occurrence, or an older reminder. */
  async complete(item: BriefTodayItemDto): Promise<void> {
    if (item.kind === 'life-event-step' && item.lifeeventid != null && item.stepid != null) {
      await lifeEventsApi.updateStep(item.lifeeventid, item.stepid, { status: 'done' });
      return;
    }
    if (item.reminderid == null) return;
    if (item.seriesid != null) {
      await apiHandle.post(`v2/reminders/occurrences/${item.reminderid}/complete`, null, { params: { scope: 'this' } });
    } else {
      await apiHandle.patch(`reminders/${item.reminderid}/mark-completed`);
    }
  },
};

// ---------------------------------------------------------------------------------------------
// Life events
// ---------------------------------------------------------------------------------------------

export const lifeEventsApi = {
  async getOverview(includeArchived = false): Promise<LifeEventsOverviewDto> {
    return (await apiHandle.get('life-events', { params: includeArchived ? { includeArchived } : undefined })).data as LifeEventsOverviewDto;
  },
  async getTemplates(): Promise<LifeEventTemplateDto[]> {
    return (await apiHandle.get('life-events/templates')).data as LifeEventTemplateDto[];
  },
  async get(id: number): Promise<LifeEventDetailDto> {
    return (await apiHandle.get(`life-events/${id}`)).data as LifeEventDetailDto;
  },
  async start(payload: StartLifeEventPayload): Promise<LifeEventDetailDto> {
    return (await apiHandle.post('life-events', payload)).data as LifeEventDetailDto;
  },
  async update(id: number, payload: UpdateLifeEventPayload): Promise<LifeEventDetailDto> {
    return (await apiHandle.patch(`life-events/${id}`, payload)).data as LifeEventDetailDto;
  },
  async remove(id: number): Promise<void> {
    await apiHandle.delete(`life-events/${id}`);
  },
  async addStep(id: number, payload: AddLifeEventStepPayload): Promise<LifeEventDetailDto> {
    return (await apiHandle.post(`life-events/${id}/steps`, payload)).data as LifeEventDetailDto;
  },
  async updateStep(id: number, stepId: number, payload: UpdateLifeEventStepPayload): Promise<LifeEventDetailDto> {
    return (await apiHandle.patch(`life-events/${id}/steps/${stepId}`, payload)).data as LifeEventDetailDto;
  },
  async removeStep(id: number, stepId: number): Promise<LifeEventDetailDto> {
    return (await apiHandle.delete(`life-events/${id}/steps/${stepId}`)).data as LifeEventDetailDto;
  },
  async dismissSuggestion(key: string): Promise<void> {
    await apiHandle.post('life-events/suggestions/dismiss', { key });
  },
};

// ---------------------------------------------------------------------------------------------
// Money Finder, households and smart Cancel
// ---------------------------------------------------------------------------------------------

export const moneyFinderApi = {
  async get(extraLoanPayment?: number): Promise<MoneyFinderResultDto> {
    return (await apiHandle.get('money-finder', { params: extraLoanPayment ? { extraLoanPayment } : undefined })).data as MoneyFinderResultDto;
  },
  async act(findingKey: string, status: MoneyFinderStatus, options?: { savedAnnualAmount?: number; snoozeDays?: number }): Promise<MoneyFinderResultDto> {
    return (await apiHandle.post('money-finder/actions', {
      findingKey,
      status,
      savedAnnualAmount: options?.savedAnnualAmount,
      snoozeDays: options?.snoozeDays,
    })).data as MoneyFinderResultDto;
  },
  async undo(findingKey: string): Promise<MoneyFinderResultDto> {
    return (await apiHandle.post('money-finder/actions/undo', { findingKey })).data as MoneyFinderResultDto;
  },
  async getHousehold(): Promise<HouseholdMoneyFinderDto> {
    return (await apiHandle.get('money-finder/household')).data as HouseholdMoneyFinderDto;
  },
  /** planRef null clears the choice. */
  async setKeeper(serviceKey: string, planRef: number | null): Promise<HouseholdMoneyFinderDto> {
    return (await apiHandle.put('money-finder/household/keeper', { serviceKey, planRef })).data as HouseholdMoneyFinderDto;
  },
  async getCancelLink(subscriptionId: number): Promise<SubscriptionCancelLinkDto> {
    return (await apiHandle.get(`money-finder/subscriptions/${subscriptionId}/cancel-link`)).data as SubscriptionCancelLinkDto;
  },
  async markCanceled(subscriptionId: number, findingKey?: string): Promise<void> {
    await apiHandle.post(`money-finder/subscriptions/${subscriptionId}/mark-canceled`, { findingKey });
  },
};

export const householdApi = {
  /** Null when the user isn't in a household (204). */
  async getMine(): Promise<MyHouseholdDto | null> {
    const res = await apiHandle.get('households/me');
    return res.status === 204 || !res.data ? null : (res.data as MyHouseholdDto);
  },
  async create(name: string): Promise<MyHouseholdDto> {
    return (await apiHandle.post('households', { name })).data as MyHouseholdDto;
  },
  async update(changes: { name?: string; showSubscriptionNames?: boolean }): Promise<MyHouseholdDto> {
    return (await apiHandle.patch('households/me', changes)).data as MyHouseholdDto;
  },
  async leave(): Promise<void> {
    await apiHandle.post('households/me/leave');
  },
  async removeMember(userId: number): Promise<MyHouseholdDto> {
    return (await apiHandle.delete(`households/me/members/${userId}`)).data as MyHouseholdDto;
  },
  async createInvite(label?: string): Promise<HouseholdInviteCreatedDto> {
    return (await apiHandle.post('households/me/invites', { label: label || undefined })).data as HouseholdInviteCreatedDto;
  },
  async revokeInvite(inviteId: number): Promise<void> {
    await apiHandle.delete(`households/me/invites/${inviteId}`);
  },
  /** The token goes in the body so it never lands in request logs. */
  async previewInvite(token: string): Promise<HouseholdInvitePreviewDto> {
    return (await apiHandle.post('households/invites/preview', { token })).data as HouseholdInvitePreviewDto;
  },
  async acceptInvite(token: string): Promise<MyHouseholdDto> {
    return (await apiHandle.post('households/invites/accept', { token })).data as MyHouseholdDto;
  },
};

/** The message the API sends with a refused action, if any. */
export function apiErrorMessage(err: unknown): string | null {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
  return typeof data?.message === 'string' ? data.message : null;
}

export function apiStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

// ---------------------------------------------------------------------------------------------
// Household invite links
// ---------------------------------------------------------------------------------------------

/** The web app's origin ("https://host"), from WEBAPP_HOME_URL in the env file. */
function webOrigin(): string {
  const match = /^https:\/\/[^/?#]+/i.exec(String(ENV.WEBAPP_HOME_URL ?? '').trim());
  return match ? match[0] : '';
}

const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** The link an invitee opens (the token rides in the #fragment, which browsers never send to a server). */
export function householdJoinLink(token: string): string {
  return `${webOrigin()}/join-household#${token}`;
}

/** The token from a pasted invite link (or the bare token); null when it isn't one. */
export function inviteTokenFrom(text: string): string | null {
  const trimmed = text.trim();
  const fromHash = trimmed.includes('#') ? trimmed.slice(trimmed.lastIndexOf('#') + 1) : trimmed;
  return TOKEN.test(fromHash) ? fromHash : null;
}

// ---------------------------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------------------------

export function formatMoney(value: number, currency = 'USD'): string {
  const whole = Math.round(value * 100) % 100 === 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(whole ? 0 : 2)}`;
  }
}

/** A date-only or local date-time from the API as a local Date ("2026-11-06" stays the 6th). */
export function localDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = localDate(value);
  if (isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
}

/** "YYYY-MM-DD" for a local Date. */
export function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
