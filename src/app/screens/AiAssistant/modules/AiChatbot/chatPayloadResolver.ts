/**
 * Resolves dropdown-option / state IDs inside a chatbot response into
 * human-readable labels, for display only.
 *
 * The chatbot's review/action payload can contain raw IDs for fields backed
 * by a dropdown list (e.g. `state`, `passportType`) instead of a label. Those
 * IDs must never reach the user as-is — this module walks the payload,
 * resolves each matching ID via the existing API layer (`apiHandle`), and
 * attaches the resolved copy as `ui_action.displayPayload`, leaving
 * `ui_action.payload` (the original, ID-based payload the Save/Confirm event
 * actually submits) completely untouched.
 */
import { apiHandle } from '../../../../../config/apiHandle';
import { API_ENDPOINTS } from '../../../../../config/constants';
import type { ChatAPIResponse } from '../../AiAssistant.types';

// ─── Configured dropdown-backed fields (Entity.Field) ──────────────────────
// Every one of these resolves through the same generic
// GET /dropdown-options/id/{id} endpoint, so we don't need to know which
// entity a field belongs to at runtime — only whether the key matches.
const DROPDOWN_FIELD_KEYS = [
  'Passport.PassportType',
  'DriverLicense.Class',
  'LicenseCertification.Type',
  'ChildMedication.MedicationType',
  'ChildMedication.DoseUnit',
  'PetMedication.DoseUnit',
  'Pet.Type',
  'LegalDocument.Type',
  'Subscription.PaymentMethod',
  'ServiceWorkHistory.PaymentMethod',
  'Property.Category',
  'RealEstate.Type',
  'Utility.UtilityType',
  'Vehicle.VehicleType',
  'VehicleServiceRecord.Type',
  'VehicleAccident.InsuranceType',
  'BankAccount.Type',
  'BusinessContact.Role',
  'BusinessContact.ContactType',
  'Business.EntityType',
  'ComplianceRecord.Type',
  'UserSocialNetworkSetup.SocialNetworkTypeId',
  'Vehicle.RegistrationType',
  'ChildIllness.Category',
  'ChildIllness.Severity',
];

// ─── Normalized key matching (casing/separator agnostic) ───────────────────
// Strips '.', '_', '-' and lowercases, so "DriverLicense.Class",
// "driverLicenseClass" and "driver_license_class" all compare equal.
const normalize = (key: string): string => key.toLowerCase().replace(/[._-]/g, '');

const lastSegment = (key: string): string => {
  const parts = key.split('.');
  return parts[parts.length - 1];
};

// Two lookup sets per configured field, since the chatbot payload may use
// either the full "Entity.Field" path or just the bare field name:
//   - "Passport.PassportType" / "passport.passportType" -> full-path match
//   - "passportType" / "PassportType"                    -> bare-field match
const DROPDOWN_FULL_KEYS = new Set(DROPDOWN_FIELD_KEYS.map(normalize));
const DROPDOWN_FIELD_ONLY_KEYS = new Set(
  DROPDOWN_FIELD_KEYS.map(k => normalize(lastSegment(k))),
);

const isDropdownField = (key: string): boolean =>
  DROPDOWN_FULL_KEYS.has(normalize(key)) || DROPDOWN_FIELD_ONLY_KEYS.has(normalize(lastSegment(key)));

const isStateField = (key: string): boolean => normalize(lastSegment(key)) === 'state';
const isCountryField = (key: string): boolean => normalize(lastSegment(key)) === 'country';

// A value is only worth resolving if it actually looks like a raw ID — this
// keeps dates, license numbers, amounts, counts, and already-resolved labels
// (e.g. a re-rendered "state": "Ontario") untouched.
const isIdLike = (value: unknown): value is string | number => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number') {
    return Number.isFinite(value) && Number.isInteger(value) && value > 0;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 && /^\d+$/.test(trimmed);
  }
  return false;
};

// ─── API calls (existing axios instance — no duplicate request logic) ──────
async function fetchStateLabel(id: string | number): Promise<string | null> {
  try {
    const response = await apiHandle.get(`${API_ENDPOINTS.AUTH.STATE_BY_ID}/${id}`);
    const state = response?.data?.states?.[0];
    return state?.description ?? null;
  } catch (error) {
    console.warn(`[chatPayloadResolver] Failed to resolve state ${id}:`, error);
    return null;
  }
}

async function fetchDropdownLabel(id: string | number): Promise<string | null> {
  try {
    const response = await apiHandle.get(`${API_ENDPOINTS.DROPDOWN_OPTION_BY_ID}/${id}`);
    return response?.data?.label ?? null;
  } catch (error) {
    console.warn(`[chatPayloadResolver] Failed to resolve dropdown option ${id}:`, error);
    return null;
  }
}

async function fetchCountryLabel(id: string | number): Promise<string | null> {
  try {
    const response = await apiHandle.get(`${API_ENDPOINTS.AUTH.COUNTRY_BY_ID}/${id}`);
    const data = response?.data;
    const country = Array.isArray(data?.countries) ? data.countries[0] : data;
    return country?.countryname ?? country?.name ?? null;
  } catch (error) {
    console.warn(`[chatPayloadResolver] Failed to resolve country ${id}:`, error);
    return null;
  }
}

// Per-resolution-run caches so the same ID (e.g. PaymentMethod = 5 appearing
// twice) only triggers one network call and reuses the result.
interface ResolveCaches {
  states: Map<string, Promise<string | null>>;
  countries: Map<string, Promise<string | null>>;
  dropdowns: Map<string, Promise<string | null>>;
}

const makeCaches = (): ResolveCaches => ({
  states: new Map(),
  countries: new Map(),
  dropdowns: new Map(),
});

const getCached = (
  cache: Map<string, Promise<string | null>>,
  id: string | number,
  fetcher: (id: string | number) => Promise<string | null>,
): Promise<string | null> => {
  const key = String(id);
  if (!cache.has(key)) {
    cache.set(key, fetcher(id));
  }
  return cache.get(key)!;
};

// Some list/review responses already embed the resolved label right next to
// the ID — either as "<field>label" (e.g. "state" / "statelabel") or
// "<field>name" (e.g. "country" / "countryname"). When that's there, use it
// directly instead of spending a network call — it's also guaranteed
// consistent with whatever the backend already resolved. Falls through to an
// API lookup only when the sibling is missing or null.
const SIBLING_LABEL_SUFFIXES = ['label', 'name'];

// A few entities expose a resolved label under a name that doesn't follow the
// generic <field>label/<field>name convention above — e.g. a driver license's
// "class" ID is actually described by "typelabel", not "classlabel". Add
// overrides here as they turn up. Resolution falls back to the
// dropdown-options API when the override key isn't present on the object —
// UNLESS the base field isn't itself a configured dropdown field (e.g.
// "jurisdiction" isn't), in which case the raw ID is just left as-is.
const SIBLING_LABEL_OVERRIDES: Record<string, string> = {
  class: 'typelabel', // DriverLicense.Class
  jurisdiction: 'jurisdictionstate', // LicenseCertification.Jurisdiction — no API fallback
};

/** True if `candidateKey` is the configured/generic label companion of `baseKey`. */
export function isLabelCompanionOf(candidateKey: string, baseKey: string): boolean {
  const base = normalize(lastSegment(baseKey));
  if (!base) return false;
  const candidate = normalize(lastSegment(candidateKey));
  const overrideKey = SIBLING_LABEL_OVERRIDES[base];
  if (overrideKey && normalize(lastSegment(overrideKey)) === candidate) return true;
  return SIBLING_LABEL_SUFFIXES.some(suffix => `${base}${suffix}` === candidate);
}

function findSiblingLabel(parent: Record<string, any> | null, key: string): string | null {
  if (!parent) return null;
  const base = normalize(lastSegment(key));

  // An explicit override (e.g. class -> typelabel) takes priority over the
  // generic <field>label/<field>name guess.
  const overrideKey = SIBLING_LABEL_OVERRIDES[base];
  if (overrideKey) {
    const overrideTarget = normalize(lastSegment(overrideKey));
    for (const [siblingKey, siblingValue] of Object.entries(parent)) {
      if (normalize(lastSegment(siblingKey)) !== overrideTarget) continue;
      if (typeof siblingValue === 'string' && siblingValue.trim()) return siblingValue.trim();
    }
  }

  const targets = SIBLING_LABEL_SUFFIXES.map(suffix => `${base}${suffix}`);
  for (const [siblingKey, siblingValue] of Object.entries(parent)) {
    if (!targets.includes(normalize(lastSegment(siblingKey)))) continue;
    if (typeof siblingValue === 'string' && siblingValue.trim()) {
      return siblingValue.trim();
    }
  }
  return null;
}

// ─── Recursive payload walk ─────────────────────────────────────────────────
async function resolveNode(
  key: string | null,
  value: any,
  caches: ResolveCaches,
  parent: Record<string, any> | null = null,
): Promise<any> {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return Promise.all(value.map(item => resolveNode(null, item, caches, null)));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    const resolvedEntries = await Promise.all(
      entries.map(async ([entryKey, entryValue]) => [
        entryKey,
        await resolveNode(entryKey, entryValue, caches, value),
      ] as const),
    );
    return Object.fromEntries(resolvedEntries);
  }

  if (key && isIdLike(value)) {
    const siblingLabel = findSiblingLabel(parent, key);
    if (siblingLabel) return siblingLabel;

    if (isStateField(key)) {
      const label = await getCached(caches.states, value, fetchStateLabel);
      return label ?? value; // fall back to the original ID if the lookup failed
    }
    if (isCountryField(key)) {
      const label = await getCached(caches.countries, value, fetchCountryLabel);
      return label ?? value;
    }
    if (isDropdownField(key)) {
      const label = await getCached(caches.dropdowns, value, fetchDropdownLabel);
      return label ?? value;
    }
  }

  return value;
}

/**
 * Resolves every state/dropdown ID inside a payload (or list item) into its
 * display label. The original object is never mutated — this returns a
 * brand-new object.
 */
export async function resolvePayloadForDisplay<T extends Record<string, any> | null | undefined>(
  payload: T,
  caches: ResolveCaches = makeCaches(),
): Promise<T> {
  if (!payload || typeof payload !== 'object') return payload;
  return resolveNode(null, payload, caches, null);
}

/**
 * Same as {@link resolvePayloadForDisplay}, applied to each item of a list
 * (e.g. a "list" ui_action's `items`).
 */
export async function resolveItemsForDisplay<T extends Record<string, any>>(
  items: T[],
  caches: ResolveCaches = makeCaches(),
): Promise<T[]> {
  return Promise.all(items.map(item => resolveNode(null, item, caches, null))) as Promise<T[]>;
}

/**
 * Resolves the IDs in a chatbot response's review payload and/or list items
 * for display, attaching the results as `ui_action.displayPayload` /
 * `ui_action.displayItems`. The originals (`ui_action.payload`,
 * `ui_action.items`) are left exactly as received — `payload` in particular
 * is what the Save/Confirm event actually submits. Never throws — a
 * resolution failure just means the UI falls back to the original data.
 */
export async function resolveChatbotResponse(
  response: ChatAPIResponse | null | undefined,
): Promise<ChatAPIResponse | null | undefined> {
  if (!response?.ui_action) return response;

  const payload = response.ui_action.payload;
  const items = response.ui_action.items;
  const hasPayload = !!payload && typeof payload === 'object';
  const hasItems = Array.isArray(items) && items.length > 0;
  if (!hasPayload && !hasItems) return response;

  try {
    // Shared caches so an ID appearing in both the payload and the items list
    // (or across multiple items) only triggers one network call.
    const caches: ResolveCaches = makeCaches();
    const [displayPayload, displayItems] = await Promise.all([
      hasPayload ? resolvePayloadForDisplay(payload, caches) : Promise.resolve(undefined),
      hasItems ? resolveItemsForDisplay(items as Record<string, any>[], caches) : Promise.resolve(undefined),
    ]);

    return {
      ...response,
      ui_action: {
        ...response.ui_action,
        ...(displayPayload !== undefined ? { displayPayload } : {}),
        ...(displayItems !== undefined ? { displayItems } : {}),
      },
    };
  } catch (error) {
    console.warn('[chatPayloadResolver] Failed to resolve chatbot response for display:', error);
    return response;
  }
}
