import { apiHandle } from '../config/apiHandle';

/** Where a calendar event comes from (the calendar's source filter). */
export type CalendarSource = 'personal' | 'business' | 'external';

/** One calendar event (same API and fields as the web calendar). */
export interface CalendarEvent {
  id: string;
  source: CalendarSource;
  title: string;
  description: string | null;
  /** Local "YYYY-MM-DDTHH:mm:ss" (the user's time zone). */
  start: string;
  /** Local, exclusive; null for single-day all-day items. */
  end: string | null;
  allDay: boolean;
  time: string | null;
  reminderId: number | null;
  entityType: string | null;
  entityId: number | null;
  parentEntityId: number | null;
  businessId: number | null;
  isCustom: boolean;
  isCompleted: boolean;
  isShared: boolean;
  ownerUserId: number | null;
  ownerName: string | null;
  accessLevel: string | null;
  provider: string | null;
  location: string | null;
  externalUrl: string | null;
  /** Custom reminders (new engine): the reminder itself, for sharing. */
  seriesId: number | null;
}

export interface CalendarSharedOwner {
  userId: number;
  name: string;
}

function pick(o: unknown, key: string): unknown {
  if (!o || typeof o !== 'object') return undefined;
  const rec = o as Record<string, unknown>;
  if (key in rec) return rec[key];
  const lower = key.toLowerCase();
  const found = Object.keys(rec).find(k => k.toLowerCase() === lower);
  return found ? rec[found] : undefined;
}
const str = (v: unknown) => (v == null ? '' : String(v));
const strOrNull = (v: unknown) => (v == null || String(v).trim() === '' ? null : String(v).trim());
const numOrNull = (v: unknown) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

function normalizeEvent(o: unknown): CalendarEvent | null {
  const id = str(pick(o, 'id'));
  const start = str(pick(o, 'start'));
  if (!id || !start) return null;
  const source = str(pick(o, 'source')).toLowerCase();
  return {
    id,
    source: (source === 'business' || source === 'external' ? source : 'personal') as CalendarSource,
    title: str(pick(o, 'title')) || '—',
    description: strOrNull(pick(o, 'description')),
    start,
    end: strOrNull(pick(o, 'end')),
    allDay: Boolean(pick(o, 'allDay')),
    time: strOrNull(pick(o, 'time')),
    reminderId: numOrNull(pick(o, 'reminderId')),
    entityType: strOrNull(pick(o, 'entityType')),
    entityId: numOrNull(pick(o, 'entityId')),
    parentEntityId: numOrNull(pick(o, 'parentEntityId')),
    businessId: numOrNull(pick(o, 'businessId')),
    isCustom: Boolean(pick(o, 'isCustom')),
    isCompleted: Boolean(pick(o, 'isCompleted')),
    isShared: Boolean(pick(o, 'isShared')),
    ownerUserId: numOrNull(pick(o, 'ownerUserId')),
    ownerName: strOrNull(pick(o, 'ownerName')),
    accessLevel: strOrNull(pick(o, 'accessLevel')),
    provider: strOrNull(pick(o, 'provider')),
    location: strOrNull(pick(o, 'location')),
    externalUrl: strOrNull(pick(o, 'externalUrl')),
    seriesId: numOrNull(pick(o, 'seriesId')),
  };
}

/** A connection a custom reminder can be shared with. */
export interface ReminderSharePerson {
  userId: number;
  name: string;
  email: string | null;
  isShared: boolean;
}

function toPeople(body: unknown): ReminderSharePerson[] {
  const people = pick(body, 'people');
  return (Array.isArray(people) ? people : []).map(p => ({
    userId: Number(pick(p, 'userId')),
    name: str(pick(p, 'name')),
    email: strOrNull(pick(p, 'email')),
    isShared: pick(p, 'isShared') === true,
  }));
}

/** A calendar provider the user can connect (Google / Outlook / Apple…), as GET calendar/connections lists it. */
export type CalendarProviderKey = 'google' | 'outlook' | 'apple' | 'skylight' | 'amazon' | string;
export interface CalendarProvider {
  provider: CalendarProviderKey;
  available: boolean;
  comingSoon: boolean;
  authType: 'oauth' | 'caldav' | null;
  status: 'pending' | 'connected' | 'error' | null;
  accountEmail: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  realTime: boolean;
}
/** The private .ics link other calendar apps subscribe to. */
export interface CalendarFeed {
  enabled: boolean;
  url: string | null;
  webcalUrl: string | null;
}

function normalizeProvider(o: unknown): CalendarProvider | null {
  const provider = str(pick(o, 'provider')).toLowerCase();
  if (!provider) return null;
  const authType = strOrNull(pick(o, 'authType'));
  const status = strOrNull(pick(o, 'status'));
  return {
    provider,
    available: Boolean(pick(o, 'available')),
    comingSoon: Boolean(pick(o, 'comingSoon')),
    authType: authType === 'oauth' || authType === 'caldav' ? authType : null,
    status: status === 'pending' || status === 'connected' || status === 'error' ? status : null,
    accountEmail: strOrNull(pick(o, 'accountEmail')),
    lastSyncedAt: strOrNull(pick(o, 'lastSyncedAt')),
    lastError: strOrNull(pick(o, 'lastError')),
    realTime: Boolean(pick(o, 'realTime')),
  };
}

function normalizeFeed(o: unknown): CalendarFeed {
  return { enabled: Boolean(pick(o, 'enabled')), url: strOrNull(pick(o, 'url')), webcalUrl: strOrNull(pick(o, 'webcalUrl')) };
}

/** The API's validation / service errors come back as a plain string or a problem object. */
export function calendarErrorMessage(error: unknown): string | null {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  const detail = pick(data, 'detail') ?? pick(data, 'title');
  return typeof detail === 'string' && detail.trim() ? detail : null;
}

const calendarService = {
  /** Events from `from` (inclusive) to `to` (exclusive), "YYYY-MM-DD". Filtering happens on the screen. */
  async getEvents(from: string, to: string): Promise<{ events: CalendarEvent[]; sharedOwners: CalendarSharedOwner[] }> {
    const { data } = await apiHandle.get('calendar/events', { params: { from, to } });
    const rawEvents = pick(data, 'events');
    const rawOwners = pick(data, 'sharedOwners');
    return {
      events: Array.isArray(rawEvents) ? rawEvents.map(normalizeEvent).filter((e): e is CalendarEvent => e !== null) : [],
      sharedOwners: Array.isArray(rawOwners)
        ? rawOwners
            .map(o => ({ userId: Number(pick(o, 'userId')), name: str(pick(o, 'name')) }))
            .filter(o => Number.isFinite(o.userId) && o.userId > 0)
        : [],
    };
  },

  /** Own record items from the last 90 days that aren't done, one per record, oldest first. */
  async getOutstanding(): Promise<CalendarEvent[]> {
    const { data } = await apiHandle.get('calendar/outstanding');
    return Array.isArray(data) ? data.map(normalizeEvent).filter((e): e is CalendarEvent => e !== null) : [];
  },

  /** Marks the item done (all its notifications for that due date). */
  async completeItem(reminderId: number): Promise<void> {
    await apiHandle.post(`calendar/items/${reminderId}/complete`);
  },

  /** A pet vaccination was given on dateGiven ("YYYY-MM-DD"); nextDate null when there is no next one. */
  async recordVaccinationGiven(vaccinationId: number, dateGiven: string, nextDate: string | null): Promise<void> {
    await apiHandle.post(`calendar/vaccinations/${vaccinationId}/given`, { dateGiven, nextDate });
  },

  /** Calendar sync (same endpoints as the web's Calendar sync page). */
  async getConnections(): Promise<{ providers: CalendarProvider[]; feed: CalendarFeed }> {
    const { data } = await apiHandle.get('calendar/connections');
    const raw = pick(data, 'providers');
    return {
      providers: Array.isArray(raw) ? raw.map(normalizeProvider).filter((p): p is CalendarProvider => p !== null) : [],
      feed: normalizeFeed(pick(data, 'feed')),
    };
  },

  /** Google / Outlook: the consent page to open; after it the provider returns to `returnPath` on the web app. */
  async startOAuth(provider: CalendarProviderKey, returnPath: string): Promise<string> {
    const { data } = await apiHandle.post(`calendar/connections/${provider}/authorize`, { returnPath });
    return str(pick(data, 'url'));
  },

  async connectApple(appleId: string, appSpecificPassword: string): Promise<void> {
    await apiHandle.post('calendar/connections/apple', { appleId, appSpecificPassword });
  },

  async syncNow(provider: CalendarProviderKey): Promise<void> {
    await apiHandle.post(`calendar/connections/${provider}/sync`);
  },

  async disconnect(provider: CalendarProviderKey): Promise<void> {
    await apiHandle.delete(`calendar/connections/${provider}`);
  },

  async setFeed(enabled: boolean, regenerate = false): Promise<CalendarFeed> {
    const { data } = await apiHandle.put('calendar/feed', { enabled, regenerate });
    return normalizeFeed(data);
  },

  /** The owner's connections, each marked if the custom reminder is shared with them. */
  async getReminderShares(seriesId: number): Promise<ReminderSharePerson[]> {
    const { data } = await apiHandle.get(`v2/reminders/custom/${seriesId}/shares`);
    return toPeople(data);
  },

  /** Share the custom reminder with exactly these connections (anyone left out stops seeing it). */
  async setReminderShares(seriesId: number, userIds: number[]): Promise<ReminderSharePerson[]> {
    const { data } = await apiHandle.put(`v2/reminders/custom/${seriesId}/shares`, { userIds });
    return toPeople(data);
  },
};

export default calendarService;

/** "YYYY-MM-DD" of a local date. */
export const ymd = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A local "YYYY-MM-DDTHH:mm:ss" as a Date in the device's zone (no UTC shift). */
export function localDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
  if (!m) return new Date(value);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0));
}
