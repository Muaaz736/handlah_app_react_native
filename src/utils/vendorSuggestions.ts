import AsyncStorage from '@react-native-async-storage/async-storage';

export type VendorSuggestionCategory =
  | 'lender_provider'
  | 'lender_provider_property'
  | 'lender_provider_real_estate'
  | 'lender_provider_vehicle'
  | 'warranty_provider'
  | 'warranty_provider_property'
  | 'warranty_provider_real_estate'
  | 'warranty_provider_vehicle'
  | 'utility_vendor'
  | 'utility_vendor_real_estate'
  | 'insurance_carrier'
  | 'insurance_carrier_vehicle'
  | 'insurance_carrier_property'
  | 'insurance_carrier_real_estate'
  | 'real_estate_service_vendor'
  | 'vehicle_shop'
  | 'pharmacy_name'
  | 'health_office_clinic'
  | 'health_office_clinic_doctor'
  | 'banking_institution'
  | 'vet_clinic'
  | 'business_contact_company'
  | 'business_license_vendor';

const STORAGE_KEY_PREFIX = 'vendor_suggestions:';
const MAX_SUGGESTIONS = 20
const CATEGORY_GROUPS: VendorSuggestionCategory[][] = [
  [
    'banking_institution',
    'lender_provider',
    'lender_provider_property',
    'lender_provider_real_estate',
    'lender_provider_vehicle',
    'warranty_provider',
    'warranty_provider_property',
    'warranty_provider_real_estate',
    'warranty_provider_vehicle',
    'insurance_carrier',
    'insurance_carrier_vehicle',
    'insurance_carrier_property',
    'insurance_carrier_real_estate',
  ],
  ['health_office_clinic', 'health_office_clinic_doctor'],
];

const canonicalCategory = (
  category: VendorSuggestionCategory,
): VendorSuggestionCategory => {
  const group = CATEGORY_GROUPS.find(members => members.includes(category));
  return group ? group[0] : category;
};

const storageKey = (category: VendorSuggestionCategory): string =>
  `${STORAGE_KEY_PREFIX}${canonicalCategory(category)}`;

export const getVendorSuggestions = async (
  category: VendorSuggestionCategory,
): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(storageKey(category));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveVendorSuggestion = async (
  category: VendorSuggestionCategory,
  value: string,
): Promise<void> => {
  const trimmed = value.trim();
  if (!trimmed) return;
  try {
    const existing = await getVendorSuggestions(category);
    const deduped = existing.filter(
      item => item.toLowerCase() !== trimmed.toLowerCase(),
    );
    const updated = [trimmed, ...deduped].slice(0, MAX_SUGGESTIONS);
    await AsyncStorage.setItem(storageKey(category), JSON.stringify(updated));
  } catch {
    // non-critical – ignore storage errors
  }
};

export const removeVendorSuggestion = async (
  category: VendorSuggestionCategory,
  value: string,
): Promise<void> => {
  try {
    const existing = await getVendorSuggestions(category);
    const updated = existing.filter(
      item => item.toLowerCase() !== value.trim().toLowerCase(),
    );
    await AsyncStorage.setItem(storageKey(category), JSON.stringify(updated));
  } catch {
    // non-critical – ignore storage errors
  }
};
