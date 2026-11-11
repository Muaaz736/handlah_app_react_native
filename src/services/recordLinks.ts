import { apiHandle } from '../config/apiHandle';

/** A record that can be (or is) linked to another record. Mirrors the API's LinkableRecordDto. */
export interface LinkableRecord {
  /** Stable module key, e.g. "utility", "realestate" (see RECORD_LINK_MODULE). */
  moduleKey: string;
  /** Display name of the module, used to group records. */
  moduleName: string;
  id: number;
  name: string;
  subtitle?: string;
  /** For someone a record is shared with: their access to this linked record. */
  accessLevel?: 'read' | 'write';
  /** For a nested record (health, pet, vehicle, property, compliance): the record it belongs to. */
  parentId?: number;
  /**
   * Attached through its own field (a warranty, expense, insurance… added to a property, vehicle or item)
   * rather than a record link: listed with the links, but not part of the editable selection.
   */
  isAttached?: boolean;
}

export interface RecordLinkRef {
  moduleKey: string;
  id: number;
}

/** Value used for a record in selections: "moduleKey:id". */
export const recordLinkKey = (ref: RecordLinkRef): string => `${ref.moduleKey}:${ref.id}`;

export function parseRecordLinkKey(key: string): RecordLinkRef | null {
  const i = key.lastIndexOf(':');
  if (i <= 0) return null;
  const id = Number(key.slice(i + 1));
  return Number.isInteger(id) && id > 0 ? { moduleKey: key.slice(0, i), id } : null;
}

/** Case-insensitive field read (the API may answer camelCase or lowercase). */
function pick(o: Record<string, unknown>, key: string): unknown {
  if (key in o) return o[key];
  const lower = key.toLowerCase();
  const found = Object.keys(o).find(k => k.toLowerCase() === lower);
  return found ? o[found] : undefined;
}

function normalize(raw: unknown): LinkableRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const moduleKey = String(pick(o, 'moduleKey') ?? '');
  const id = Number(pick(o, 'id'));
  if (!moduleKey || !Number.isFinite(id)) return null;
  const subtitle = pick(o, 'subtitle');
  const access = String(pick(o, 'accessLevel') ?? '').toLowerCase();
  const parentId = Number(pick(o, 'parentId'));
  return {
    moduleKey,
    moduleName: String(pick(o, 'moduleName') ?? moduleKey),
    id,
    name: String(pick(o, 'name') ?? `#${id}`),
    subtitle: subtitle == null || subtitle === '' ? undefined : String(subtitle),
    accessLevel: access === 'read' || access === 'write' ? access : undefined,
    parentId: Number.isInteger(parentId) && parentId > 0 ? parentId : undefined,
    isAttached: pick(o, 'isAttached') === true ? true : undefined,
  };
}

const normalizeList = (raw: unknown): LinkableRecord[] =>
  Array.isArray(raw) ? raw.map(normalize).filter((r): r is LinkableRecord => r !== null) : [];

const field = (data: unknown, key: string) => pick((data ?? {}) as Record<string, unknown>, key);

/**
 * Record links: "link any record to any other record" (same API as the web app). Links are two-way and scoped:
 * personal records link only to personal records, business records only within the same business, so every call
 * takes the businessId of the scope (omit / null for personal).
 */
const recordLinkService = {
  /** Every record the user can link to in the scope, optionally leaving out the record being edited. */
  async getOptions(businessId?: number | null, exclude?: RecordLinkRef): Promise<LinkableRecord[]> {
    const { data } = await apiHandle.get('record-links/options', {
      params: { businessId: businessId ?? undefined, excludeModule: exclude?.moduleKey, excludeId: exclude?.id },
    });
    return normalizeList(field(data, 'records'));
  },

  /** The records linked to one record. `ownerUserId` = a record someone shared with you (read-only). */
  async getLinks(record: RecordLinkRef, businessId?: number | null, ownerUserId?: number | null): Promise<LinkableRecord[]> {
    const { data } = await apiHandle.get(`record-links/${record.moduleKey}/${record.id}`, {
      params: { businessId: businessId ?? undefined, ownerUserId: ownerUserId ?? undefined },
    });
    return normalizeList(field(data, 'links'));
  },

  /** Replaces the full set of records linked to `record`. Returns the saved links. */
  async setLinks(record: RecordLinkRef, links: RecordLinkRef[], businessId?: number | null): Promise<LinkableRecord[]> {
    const { data } = await apiHandle.put(`record-links/${record.moduleKey}/${record.id}`, {
      links,
      businessId: businessId ?? null,
    });
    return normalizeList(field(data, 'links'));
  },
};

export default recordLinkService;

/**
 * The id of a record a create call returned. The API answers either the record itself or wraps it
 * ({ bankaccount: {...} }, { data: {...} }), so this looks one or two levels down. Null when the save was queued
 * offline (no id yet).
 */
export function createdRecordId(payload: unknown): number | null {
  const visit = (v: unknown, depth: number): number | null => {
    if (!v || typeof v !== 'object' || depth > 2) return null;
    const o = v as Record<string, unknown>;
    if (o._offlineQueued) return null;
    const id = Number(pick(o, 'id'));
    if (Number.isInteger(id) && id > 0) return id;
    for (const value of Object.values(o)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const found = visit(value, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };
  return visit(payload, 0);
}

// ---- Sharing linked records along with a shared record (same API as the web Share dialog) ----

const RESOURCE_TYPE_ALIASES: Record<string, string> = {
  passport: 'passports',
  driverlicense: 'driverlicenses',
  driverslicense: 'driverlicenses',
  licensecertifications: 'licensecertification',
  personalinformation: 'personalinfo',
  legaldocuments: 'legaldocument',
  usersocialnetworksetup: 'usersocialnetwork',
  bankaccounts: 'bankaccount',
  properties: 'property',
  utilities: 'utility',
  subscriptions: 'subscription',
  bookmarks: 'bookmark',
  insurances: 'insurance',
  warranties: 'warranty',
  loans: 'loan',
  businesslicenses: 'businesslicense',
  businesscontacts: 'businesscontact',
  businessprojects: 'businessproject',
  compliancefolders: 'compliancefolder',
};

export const normalizeShareResourceType = (resourceType: string): string => {
  const compact = String(resourceType ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  return RESOURCE_TYPE_ALIASES[compact] ?? compact;
};

/** The linked records shared with one person, as "moduleKey:id" keys, and their access level. */
export interface LinkedRecordSelection {
  accessLevel: 'read' | 'write';
  keys: string[];
}

export const shareLinkedRecordsService = {
  /** Records that can be shared along with a record (its linked records) or a whole module (resourceId null). */
  async getOptions(resourceType: string, resourceId: number | null, businessId?: number | null): Promise<LinkableRecord[]> {
    try {
      const { data } = await apiHandle.get('sharing/linked-records/options', {
        params: { resourceType: normalizeShareResourceType(resourceType), resourceId: resourceId ?? undefined, businessId: businessId ?? undefined },
      });
      return normalizeList(field(data, 'records'));
    } catch {
      return [];
    }
  },

  /** For each person the record or module is shared with: the linked records picked for them. */
  async getSelections(resourceType: string, resourceId: number | null, businessId?: number | null): Promise<Map<number, LinkedRecordSelection>> {
    const result = new Map<number, LinkedRecordSelection>();
    try {
      const { data } = await apiHandle.get('sharing/linked-records', {
        params: { resourceType: normalizeShareResourceType(resourceType), resourceId: resourceId ?? undefined, businessId: businessId ?? undefined },
      });
      const rows = field(data, 'selections');
      for (const raw of Array.isArray(rows) ? rows : []) {
        const o = (raw ?? {}) as Record<string, unknown>;
        const userId = Number(pick(o, 'sharedWithUserId'));
        if (!Number.isFinite(userId)) continue;
        const records = pick(o, 'records');
        result.set(userId, {
          accessLevel: String(pick(o, 'accessLevel') ?? 'read').toLowerCase() === 'write' ? 'write' : 'read',
          keys: (Array.isArray(records) ? records : [])
            .map(x => {
              const r = (x ?? {}) as Record<string, unknown>;
              return `${String(pick(r, 'moduleKey') ?? '')}:${Number(pick(r, 'id'))}`;
            })
            .filter(k => !k.startsWith(':')),
        });
      }
    } catch {
      // Nothing loaded: everyone shows "none shared", the safe default.
    }
    return result;
  },

  /** Replaces the linked records shared with one person (empty = none) at View ("read") or Edit ("write"). */
  async set(payload: {
    resourceType: string;
    resourceId: number | null;
    businessId?: number | null;
    sharedWithUserId: number;
    accessLevel: 'read' | 'write';
    keys: string[];
  }): Promise<boolean> {
    try {
      await apiHandle.put('sharing/linked-records', {
        resourceType: normalizeShareResourceType(payload.resourceType),
        resourceId: payload.resourceId,
        businessId: payload.businessId ?? null,
        sharedWithUserId: payload.sharedWithUserId,
        accessLevel: payload.accessLevel,
        records: payload.keys.map(parseRecordLinkKey).filter((r): r is RecordLinkRef => r !== null),
      });
      return true;
    } catch {
      return false;
    }
  },
};
