import type { GetRemindersParams, ReminderStatusParam } from './reminderService';

const pick = (o: any, k: string): any => {
  if (!o) return undefined;
  if (o[k] !== undefined) return o[k];
  const lower = k.toLowerCase();
  const hit = Object.keys(o).find(x => x.toLowerCase() === lower);
  return hit ? o[hit] : undefined;
};

const num = (v: any): number | null => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
const str = (v: any): string => (v === null || v === undefined ? '' : String(v).trim());

const SEVERITY: Record<string, string> = { info: 'info', warning: 'warning', critical: 'critical' };

export const STATUS_PARAM: Record<ReminderStatusParam, string> = {
  today: 'dueToday',
  upcoming: 'upcoming,inactive',
  past_due: 'pastDue',
  completed: 'completed,dismissed,expired',
};

export type ClosedAs = 'completed' | 'dismissed' | 'expired';

export const batchOf = (seriesId: number, occurrenceId: number): string => `v2:series:${seriesId}:${occurrenceId}`;
export const itemBatchOf = (occurrenceId: number): string => `v2:item:${occurrenceId}`;
export const isItemBatch = (batchId: string): boolean => String(batchId).startsWith('v2:item:');
export const occurrenceOfBatch = (batchId: string): number | null => {
  const p = String(batchId).split(':');
  if (p[0] !== 'v2') return null;
  if (p.length === 4) return num(p[3]);
  if (p.length === 3 && p[1] === 'item') return num(p[2]);
  return null;
};

export const rowRecordId = (rowId: number): number => -rowId;
export const isRowId = (id: number): boolean => Number(id) < 0;
export const rowIdOf = (id: number): number => Math.abs(Number(id));

export const seriesOfBatch = (batchId: string): number | null => {
  const p = String(batchId).split(':');
  return p[0] === 'v2' && p.length === 4 ? num(p[2]) : null;
};

export const buildListQuery = (arg?: GetRemindersParams): string => {
  const q: string[] = [`side=${arg?.isBusiness ? 'business' : 'personal'}`, 'groupBy=item'];
  let status = arg?.status ? STATUS_PARAM[arg.status] : undefined;
  if (arg?.closedAs && arg.status === 'completed') status = arg.closedAs;
  else if (arg?.isActive === false) status = 'inactive';
  else if (arg?.isActive === true && status) status = status.split(',').filter(s => s !== 'inactive').join(',');
  if (status) q.push(`status=${encodeURIComponent(status)}`);
  if (arg?.entityType) q.push(`type=${encodeURIComponent(arg.entityType)}`);
  if (arg?.dateRange && (!arg.status || arg.status === 'upcoming')) {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    if (arg.dateRange === 'next_7') to.setDate(to.getDate() + 7);
    else if (arg.dateRange === 'next_30') to.setDate(to.getDate() + 30);
    else if (arg.dateRange === 'next_90') to.setDate(to.getDate() + 90);
    else if (arg.dateRange === 'this_month') to.setMonth(to.getMonth() + 1, 0);
    else to.setMonth(11, 31);
    const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    q.push(`from=${ymd(from)}`, `to=${ymd(to)}`);
  }
  q.push(`page=${arg?.page ?? 1}`, `pageSize=${arg?.pageSize ?? 20}`);
  return `?${q.join('&')}`;
};

export const toRow = (item: any): any => {
  const status = str(pick(item, 'status'));
  const seriesId = num(pick(item, 'seriesId')) ?? 0;
  const id = num(pick(item, 'occurrenceId')) ?? 0;
  const custom = str(pick(item, 'sourceKind')) === 'custom';
  const due = str(pick(item, 'dueDate'));
  const time = str(pick(item, 'dueTime'));
  const closed = status === 'completed' || status === 'dismissed' || status === 'expired';
  return {
    id,
    entitytype: str(pick(item, 'entityType')),
    entityid: num(pick(item, 'sourceRecordId')),
    businessid: num(pick(item, 'businessId')),
    title: str(pick(item, 'title')),
    message: str(pick(item, 'message')),
    reminderdate: due ? `${due.slice(0, 10)}T00:00:00` : null,
    remindertime: time ? time.slice(0, 5) : null,
    isactive: !!pick(item, 'isActive'),
    isrecurring: !!pick(item, 'isRecurring'),
    recurrencepattern: null,
    severity: SEVERITY[str(pick(item, 'severity'))] ?? str(pick(item, 'severity')),
    iscompleted: closed,
    completedat: closed ? pick(item, 'actionAtUtc') ?? null : null,
    batchid: custom ? batchOf(seriesId, id) : null,
    status,
    closedas: closed ? (status as ClosedAs) : null,
    forname: str(pick(item, 'forName')) || null,
    parententityid: num(pick(item, 'parentChildId')),
    parententitytype: num(pick(item, 'parentChildId')) ? 'child' : null,
    candelete: pick(item, 'canDelete') !== false,
    _seriesid: seriesId,
  };
};

export const toRowRecord = (item: any, r: any): any => {
  const base = toRow(item);
  const status = str(pick(r, 'status'));
  const closed = status === 'completed' || status === 'dismissed' || status === 'expired';
  const date = str(pick(r, 'intervalDate'));
  return {
    ...base,
    id: rowRecordId(num(pick(r, 'rowId')) ?? 0),
    kind: 'row',
    batchid: null,
    message: str(pick(r, 'label')),
    reminderdate: date ? `${date.slice(0, 10)}T00:00:00` : base.reminderdate,
    remindertime: null,
    rowlabel: str(pick(r, 'label')),
    rowstatus: status,
    iscompleted: closed,
    closedas: closed ? status : null,
    candismissrow: pick(r, 'canDismiss') === true,
    candeleterow: pick(r, 'canDelete') === true,
  };
};

export const toGroups = (items: any[]): any[] => {
  const groups = new Map<string, any>();
  for (const item of items) {
    const rowsRaw = pick(item, 'rows');
    const rows: any[] = Array.isArray(rowsRaw) ? rowsRaw : [];
    if (str(pick(item, 'sourceKind')) !== 'custom' && rows.length > 1) {
      const head = toRow(item);
      groups.set(`i:${head.id}`, {
        batchid: itemBatchOf(head.id), kind: 'item', title: head.title, entitytype: head.entitytype, entityid: head.entityid,
        nearestreminderdate: head.reminderdate, severity: head.severity || null, isactive: head.isactive, iscompleted: head.iscompleted,
        isrecurring: head.isrecurring, count: rows.length, forname: head.forname, candelete: head.candelete,
        reminders: rows.map(r => toRowRecord(item, r)),
      });
      continue;
    }
    const row = toRow(item);
    const key = row.batchid ? `s:${row._seriesid}` : `o:${row.id}`;
    const g = groups.get(key);
    if (g) {
      g.reminders.push(row);
      g.count = g.reminders.length;
      if (row.reminderdate < g.nearestreminderdate) g.nearestreminderdate = row.reminderdate;
      continue;
    }
    groups.set(key, {
      batchid: row.batchid,
      title: row.title,
      entitytype: row.entitytype,
      entityid: row.entityid,
      nearestreminderdate: row.reminderdate,
      severity: row.severity || null,
      isactive: row.isactive,
      iscompleted: row.iscompleted,
      isrecurring: row.isrecurring,
      count: 1,
      forname: row.forname,
      candelete: row.candelete,
      reminders: [row],
    });
  }
  return [...groups.values()];
};

export const toListPayload = (data: any): any => ({
  items: toGroups(Array.isArray(pick(data, 'items')) ? pick(data, 'items') : []),
  fetched: Array.isArray(pick(data, 'items')) ? pick(data, 'items').length : 0,
  total: num(pick(data, 'total')) ?? 0,
  page: num(pick(data, 'page')) ?? 1,
  pageSize: num(pick(data, 'pageSize')) ?? 20,
});

export const customToRows = (data: any): any[] => {
  const up = pick(data, 'upcoming');
  return Array.isArray(up) ? up.map(toRow) : [];
};

export const dateOnly = (v?: string | Date | null): string | undefined => {
  if (!v) return undefined;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return undefined;
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  }
  const text = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? undefined : dateOnly(parsed);
};

export const customBody = (p: any): any => ({
  description: p.description,
  frequency: String(p.frequency || 'custom').toLowerCase(),
  date: dateOnly(p.date),
  startDate: dateOnly(p.startDate),
  endDate: dateOnly(p.endDate),
  time: p.time || undefined,
  selectedDays: p.selectedDays,
  selectedDates: p.selectedDates,
  businessId: p.businessId ?? undefined,
});

export const CLOSED_LOOK: Record<ClosedAs, { bg: string; fg: string; icon: string; label: string }> = {
  completed: { bg: '#E3F4E8', fg: '#1E8A4C', icon: 'checkmark-circle', label: 'Completed' },
  dismissed: { bg: '#ECECEF', fg: '#5F6368', icon: 'close-circle', label: 'Dismissed' },
  expired: { bg: '#FBEBD3', fg: '#B26A00', icon: 'time', label: 'Expired' },
};

export const formatTimeOfDay = (v?: string | null): string => {
  if (!v) return '';
  const m = String(v).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return String(v);
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${min} ${suffix}`;
};
