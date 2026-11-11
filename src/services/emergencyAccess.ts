import { apiHandle } from '../config/apiHandle';

/**
 * Emergency access status: where a request stands on a connection, in both directions, with the times the
 * countdowns need. Same endpoints the web app uses. All times from the API are UTC.
 */

/** pending = waiting for the owner or the timer; granted = access is open. */
export type EmergencyAccessPhase = 'pending' | 'granted';

/** Connection bubble: not_requested | requested (you asked) | pending (they asked, waiting on you) | granted. */
export type EmergencyAccessLabel = 'not_requested' | 'requested' | 'pending' | 'granted';

export interface EmergencyAccessState {
  requestId: number;
  state: EmergencyAccessPhase;
  /** Pending | Approved | AutoApproved */
  status: string;
  reason: string;
  requestedByUserId: number;
  targetUserId: number;
  requestedOn: string;
  autoApproveOn: string;
  grantedOn: string | null;
  accessExpiresOn: string | null;
}

export interface EmergencyAccessStatus {
  connectionId: number;
  otherUserId: number;
  otherUserName: string;
  /** They made you their emergency contact: you can request access to their records. */
  canRequest: boolean;
  /** You made them your emergency contact: they can request access to your records. */
  canBeRequested: boolean;
  /** Your request for their records. */
  outgoing: EmergencyAccessState | null;
  /** Their request for your records. */
  incoming: EmergencyAccessState | null;
  label: EmergencyAccessLabel;
  waitingPeriodMinutes: number;
  accessDurationMinutes: number;
  /** Server clock when the status was read, to correct the phone clock in countdowns. */
  serverTimeUtc: string;
}

type Raw = Record<string, unknown>;

/** Reads a field whatever its casing (the API sends lowercase names). */
function pick(o: Raw, name: string): unknown {
  if (name in o) return o[name];
  const lower = name.toLowerCase();
  const key = Object.keys(o).find(k => k.toLowerCase() === lower);
  return key ? o[key] : undefined;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);
const bool = (v: unknown): boolean => v === true || v === 'true';

/** An API time as ISO UTC (a time without a zone is UTC). */
function utcIso(v: unknown): string {
  const text = str(v).trim();
  if (!text) return '';
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text}Z`;
}

function toState(o: unknown): EmergencyAccessState | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Raw;
  const requestId = num(pick(r, 'requestId'));
  if (!requestId) return null;
  return {
    requestId,
    state: str(pick(r, 'state')).toLowerCase() === 'granted' ? 'granted' : 'pending',
    status: str(pick(r, 'status')),
    reason: str(pick(r, 'reason')),
    requestedByUserId: num(pick(r, 'requestedByUserId')),
    targetUserId: num(pick(r, 'targetUserId')),
    requestedOn: utcIso(pick(r, 'requestedOn')),
    autoApproveOn: utcIso(pick(r, 'autoApproveOn')),
    grantedOn: utcIso(pick(r, 'grantedOn')) || null,
    accessExpiresOn: utcIso(pick(r, 'accessExpiresOn')) || null,
  };
}

const LABELS: EmergencyAccessLabel[] = ['not_requested', 'requested', 'pending', 'granted'];

function toStatus(o: unknown): EmergencyAccessStatus | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Raw;
  const connectionId = num(pick(r, 'connectionId'));
  if (!connectionId) return null;
  const label = str(pick(r, 'label')) as EmergencyAccessLabel;
  return {
    connectionId,
    otherUserId: num(pick(r, 'otherUserId')),
    otherUserName: str(pick(r, 'otherUserName')),
    canRequest: bool(pick(r, 'canRequest')),
    canBeRequested: bool(pick(r, 'canBeRequested')),
    outgoing: toState(pick(r, 'outgoing')),
    incoming: toState(pick(r, 'incoming')),
    label: LABELS.includes(label) ? label : 'not_requested',
    waitingPeriodMinutes: num(pick(r, 'waitingPeriodMinutes')),
    accessDurationMinutes: num(pick(r, 'accessDurationMinutes')),
    serverTimeUtc: utcIso(pick(r, 'serverTimeUtc')),
  };
}

export const emergencyAccessApi = {
  /** Every emergency-contact connection's state, for the connection bubbles. */
  async getAll(targetAccountType?: 'Personal' | 'Business'): Promise<EmergencyAccessStatus[]> {
    const res = await apiHandle.get('connections/emergency/status', {
      params: targetAccountType ? { targetAccountType } : undefined,
    });
    const list = res.data && typeof res.data === 'object' ? pick(res.data as Raw, 'statuses') : null;
    return Array.isArray(list) ? list.map(toStatus).filter((x): x is EmergencyAccessStatus => x !== null) : [];
  },

  /** One connection, both directions. Null when neither person is the other's emergency contact (404). */
  async get(connectionId: number | string): Promise<EmergencyAccessStatus | null> {
    try {
      const res = await apiHandle.get(`connections/${encodeURIComponent(String(connectionId))}/emergency-status`);
      return toStatus(res.data);
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
      throw err;
    }
  },

  async approve(requestId: number): Promise<void> {
    await apiHandle.post(`connections/emergency/${requestId}/approve`);
  },

  async decline(requestId: number): Promise<void> {
    await apiHandle.post(`connections/emergency/${requestId}/reject`);
  },

  /** Either person cancels a pending request or ends / revokes granted access. A new request is needed afterwards. */
  async revoke(requestId: number): Promise<void> {
    await apiHandle.post(`connections/emergency/${requestId}/revoke`);
  },
};

// ---------------------------------------------------------------------------------------------
// Time helpers for the countdowns
// ---------------------------------------------------------------------------------------------

/** Milliseconds to add to the phone clock to match the server. */
export function clockOffset(serverTimeUtc: string): number {
  const server = Date.parse(serverTimeUtc);
  return Number.isFinite(server) ? server - Date.now() : 0;
}

/** "3d 4h", "17h 42m", "42m 10s" */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/** Minutes as the largest whole unit, for "{{count}} hours" text. */
export function durationParts(minutes: number): { unit: 'minute' | 'hour' | 'day' | 'week'; count: number } {
  if (minutes >= 10080 && minutes % 10080 === 0) return { unit: 'week', count: minutes / 10080 };
  if (minutes >= 2880 && minutes % 1440 === 0) return { unit: 'day', count: minutes / 1440 };
  if (minutes > 0 && minutes % 60 === 0) return { unit: 'hour', count: minutes / 60 };
  return { unit: 'minute', count: Math.max(0, minutes) };
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}
