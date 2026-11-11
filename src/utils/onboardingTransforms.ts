import { OnboardingPayload } from '../redux/services/onboardingService';

// ─── Personal Step01 option IDs ──────────────────────────────────────────────
const PERSONAL_OWNED_ITEM_IDS = new Set([
  'own-house',
  'own-vehicle',
  'cards-loans',
  'health-records',
  'own-pet',
  'business',
]);

// ─── Business Step01 option IDs ───────────────────────────────────────────────
const BUSINESS_OWNED_ITEM_IDS = new Set([
  'own-house',
  'own-vehicle',
  'cards-loans',
  'documents',
  'projects',
  'business-contacts',
]);

// ─── ID → API key maps ────────────────────────────────────────────────────────
const OWNED_ITEM_MAP: Record<string, string> = {
  'own-house': 'house',
  'own-vehicle': 'vehicle',
  'cards-loans': 'cards_loans',
  'health-records': 'health_records',
  'own-pet': 'pet',
  business: 'business',
  documents: 'documents',
  projects: 'projects',
  'business-contacts': 'business_contacts',
};

const RESPONSIBILITY_MAP: Record<string, string> = {
  'bills-payments': 'bills_payments',
  'insurance-policies': 'insurance_policies',
  maintenance: 'maintenance',
  'medical-records': 'medical_records',
  'important-docs': 'important_docs',
  compliance: 'compliance',
  licenses: 'licenses',
};

const FRUSTRATION_MAP: Record<string, string> = {
  'missing-dates': 'missing_dates',
  'finding-things': 'finding_things',
  'too-many-systems': 'too_many_systems',
  'no-emergency-ready': 'not_emergency_ready',
  'family-admin': 'family_admin',
  'business-stress': 'business_stress',
};

const REMINDER_STYLE_MAP: Record<string, string> = {
  aggressive: 'Aggressive',
  balanced: 'Balanced',
  minimal: 'Minimal',
  silent: 'Silent',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapIds(ids: string[], map: Record<string, string>): string[] {
  return ids.reduce<string[]>((acc, id) => {
    const mapped = map[id];
    if (mapped) acc.push(mapped);
    return acc;
  }, []);
}

/**
 * Builds a Personal onboarding API payload from Redux slice state.
 * lifeSelections contains both Step01 (ownedItems) and Step02 (responsibilities) IDs.
 */
export function buildPersonalPayload(
  lifeSelections: string[],
  frustrationSelections: string[],
  reminderPreferences: string[],
): OnboardingPayload {
  const ownedItemIds = lifeSelections.filter(id => PERSONAL_OWNED_ITEM_IDS.has(id));
  const responsibilityIds = lifeSelections.filter(id => !PERSONAL_OWNED_ITEM_IDS.has(id));

  return {
    spaceType: 'Personal',
    ownedItems: mapIds(ownedItemIds, OWNED_ITEM_MAP),
    responsibilities: mapIds(responsibilityIds, RESPONSIBILITY_MAP),
    frustrations: mapIds(frustrationSelections, FRUSTRATION_MAP),
    reminderStyle: REMINDER_STYLE_MAP[reminderPreferences[0]] ?? 'Balanced',
  };
}

/**
 * Builds a Business onboarding API payload from Redux slice state.
 */
export function buildBusinessPayload(
  lifeSelections: string[],
  frustrationSelections: string[],
  reminderPreferences: string[],
  businessId?: number | null,
): OnboardingPayload {
  const ownedItemIds = lifeSelections.filter(id => BUSINESS_OWNED_ITEM_IDS.has(id));
  const responsibilityIds = lifeSelections.filter(id => !BUSINESS_OWNED_ITEM_IDS.has(id));

  return {
    spaceType: 'Business',
    ownedItems: mapIds(ownedItemIds, OWNED_ITEM_MAP),
    responsibilities: mapIds(responsibilityIds, RESPONSIBILITY_MAP),
    frustrations: mapIds(frustrationSelections, FRUSTRATION_MAP),
    reminderStyle: REMINDER_STYLE_MAP[reminderPreferences[0]] ?? 'Balanced',
    ...(businessId ? { businessId } : {}),
  };
}
