/**
 * Whether a record is still current, for the grey "inactive" styling and status badge (as on the web): Sold (it or its
 * vehicle / property was sold or transferred), End dated (its end date has passed) or Expired (its expiration has passed).
 */
export type RecordStatusKind = 'active' | 'sold' | 'ended' | 'expired';

export interface RecordStatus {
  kind: RecordStatusKind;
  date?: string;
}

function dayOf(value: unknown): Date | null {
  if (!value) return null;
  const s = String(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

/** A field by name, ignoring case (the API sends both "endDate" and "enddate"). */
function field(record: any, name: string): unknown {
  if (!record || typeof record !== 'object') return undefined;
  if (name in record) return record[name];
  const key = Object.keys(record).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? record[key] : undefined;
}

/** The status of a record from its own fields: sold / transferred, then expiration, then end date. */
export function recordStatusOf(record: any): RecordStatus {
  if (field(record, 'isSold') === true || field(record, 'isTransferred') === true) {
    const sold = field(record, 'soldDate');
    return { kind: 'sold', date: sold ? String(sold) : undefined };
  }
  const exp = field(record, 'expiration') ?? field(record, 'expirationDate');
  const expDay = dayOf(exp);
  if (expDay && expDay < today()) return { kind: 'expired', date: String(exp) };
  const end = field(record, 'endDate');
  const endDay = dayOf(end);
  if (endDay && endDay < today()) return { kind: 'ended', date: String(end) };
  return { kind: 'active' };
}

export const isInactive = (status: RecordStatus) => status.kind !== 'active';

/** Grey card for an inactive record in a list. */
export const INACTIVE_CARD_STYLE = { backgroundColor: '#ECEEEC', borderColor: '#DADDDA' } as const;
