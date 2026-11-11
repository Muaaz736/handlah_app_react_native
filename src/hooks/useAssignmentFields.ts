import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../types/store.types';
import {
  getVehiclesAsync,
  getPersonalPropertyAsync,
  getBusinessPropertyAsync,
  getRealStateOverviewAsync,
  getBusinessRealStateOverviewAsync,
} from '../redux/services/assetsService';
import { getConnectionSharingsummary } from '../redux/services/sharingService';

export type AssignmentKind = 'vehicle' | 'property' | 'realestate';

export interface AssignmentOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface AssignmentSlotState {
  kind: AssignmentKind;
  mode: 'locked' | 'dropdown';
  options: AssignmentOption[];
  disabled: boolean;
  lockedText?: string;
}

export interface UseAssignmentFieldsParams {
  slots: AssignmentKind[];
  isOwnerScoped: boolean;
  isEmergency?: boolean;
  ownerUserId?: number;
  ownerName?: string;
  ownerBusinessId?: number;
  isBusiness: boolean;
  myBusinessId?: number;
  linkedIds: Partial<Record<AssignmentKind, number | string | null | undefined>>;
  linkedAssets?: Partial<Record<AssignmentKind, Record<string, any> | null | undefined>>;
  dropPastEndDateRealEstate?: boolean;
}

export interface UseAssignmentFieldsResult {
  isLoading: boolean;
  activeSlot: AssignmentKind | null;
  slotStates: Partial<Record<AssignmentKind, AssignmentSlotState>>;
  sectionLocked: boolean;
  sectionMessage: string | null;
  isUnnamedHiddenLink: boolean;
}

// ─── helpers ────────────────────────────────────────────────────────────────

const pick = (obj: any, ...keys: string[]): any => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  const lower: Record<string, any> = {};
  for (const k of Object.keys(obj)) lower[k.toLowerCase()] = obj[k];
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

const idOf = (item: any): string => String(pick(item, 'id'));

const labelFor = (kind: AssignmentKind, item: any): string => {
  if (!item) return '';
  const id = idOf(item);
  if (kind === 'vehicle') {
    const year = pick(item, 'year');
    const make = pick(item, 'make');
    const model = pick(item, 'model');
    const nickname = pick(item, 'nickname');
    const full = [year, make, model].filter(Boolean).join(' ').trim();
    return full || nickname || `Vehicle #${id}`;
  }
  if (kind === 'property') {
    const name = pick(item, 'name');
    const category = pick(item, 'category');
    return name || category || `Property #${id}`;
  }
  const nickname = pick(item, 'nickname');
  const streetAddress = pick(item, 'streetAddress', 'streetaddress');
  return nickname || streetAddress || `Real Estate #${id}`;
};

const normalizeModuleName = (s?: string): string => (s || '').toLowerCase().replace(/[\s_-]+/g, '');

const MODULE_ALIAS: Record<string, AssignmentKind> = {
  vehicle: 'vehicle',
  vehicles: 'vehicle',
  property: 'property',
  properties: 'property',
  realestate: 'realestate',
  realestates: 'realestate',
};

const isReadOnlyAccess = (isOwnerScoped: boolean, level?: string): boolean =>
  isOwnerScoped && String(level || '').trim().toLowerCase() === 'read';

const isUnset = (raw: unknown): boolean =>
  raw === null || raw === undefined || raw === '' || raw === 0 || raw === '0';

const isVehicleAssignable = (v: any): boolean => {
  const sold = pick(v, 'isSold', 'issold');
  const transferred = pick(v, 'isTransferred', 'istransferred');
  return !(sold && transferred);
};

const isRealEstateStillActive = (re: any): boolean => {
  const end = pick(re, 'endSellDate', 'endselldate');
  if (!end) return true;
  const d = new Date(end);
  return isNaN(d.getTime()) || d.getTime() >= Date.now();
};

const ASSET_TYPE_LABEL = (kind: AssignmentKind, isBusiness: boolean): string => {
  if (kind === 'vehicle') return 'vehicle';
  if (kind === 'realestate') return 'real estate';
  return isBusiness ? 'business property' : 'personal property';
};

// ─── hook ───────────────────────────────────────────────────────────────────

export function useAssignmentFields(params: UseAssignmentFieldsParams): UseAssignmentFieldsResult {
  const dispatch = useDispatch<AppDispatch>();
  const {
    slots,
    isOwnerScoped,
    isEmergency = false,
    ownerUserId,
    ownerName,
    ownerBusinessId,
    isBusiness,
    myBusinessId,
    linkedIds,
    linkedAssets,
    dropPastEndDateRealEstate = false,
  } = params;

  const ownerLabel = ownerName || 'this connection';

  const { get_vehicles_data, get_personal_property_data, get_real_state_overview_data } = useSelector(
    (state: any) => state.assets_slice,
  );

  const [summary, setSummary] = useState<any>(undefined); // undefined = not loaded yet, null = load failed
  const [summaryLoading, setSummaryLoading] = useState<boolean>(isOwnerScoped);

  const scopeBusinessId = isOwnerScoped
    ? ownerBusinessId
    : isBusiness
      ? myBusinessId
      : undefined;
  const slotsKey = slots.join(',');

  useEffect(() => {
    const ownerParam: Record<string, number> = isOwnerScoped && ownerUserId
      ? (isEmergency ? { userId: ownerUserId } : { ownerId: ownerUserId })
      : {};

    const silentArg = isOwnerScoped ? { suppressErrorToast: true } : {};
    if (slots.includes('vehicle')) {
      const arg: any = { ...ownerParam, ...silentArg, ...(scopeBusinessId ? { businessId: scopeBusinessId } : {}) };
      dispatch(getVehiclesAsync(Object.keys(arg).length ? arg : undefined) as any);
    }

    if (slots.includes('property')) {
      if (scopeBusinessId) {
        dispatch(getBusinessPropertyAsync({ businessId: scopeBusinessId, ...ownerParam, ...silentArg } as any) as any);
      } else {
        const arg = { ...ownerParam, ...silentArg };
        dispatch(getPersonalPropertyAsync(Object.keys(arg).length ? arg : undefined) as any);
      }
    }

    if (slots.includes('realestate')) {
      const arg: any = { ...ownerParam, ...silentArg, activeOnly: true, ...(scopeBusinessId ? { businessId: scopeBusinessId } : {}) };
      if (scopeBusinessId) {
        dispatch(getBusinessRealStateOverviewAsync(arg) as any);
      } else {
        dispatch(getRealStateOverviewAsync(arg) as any);
      }
    }

    if (isOwnerScoped && ownerUserId) {
      let cancelled = false;
      setSummaryLoading(true);
      (dispatch(
        getConnectionSharingsummary(
          ownerBusinessId ? { userId: ownerUserId, businessId: ownerBusinessId } : { userId: ownerUserId },
        ) as any,
      ) as any)
        .then((action: any) => {
          if (cancelled) return;
          if (action?.type?.endsWith?.('/fulfilled')) {
            setSummary(action.payload ?? null);
          } else {
            setSummary(null); // failed — fall back to the list-based heuristic below
          }
        })
        .catch(() => {
          if (!cancelled) setSummary(null);
        })
        .finally(() => {
          if (!cancelled) setSummaryLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    setSummaryLoading(false);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnerScoped, isEmergency, ownerUserId, ownerBusinessId, isBusiness, myBusinessId, slotsKey]);

  const sharedModuleSet = useMemo(() => {
    if (!isOwnerScoped) return null; // rule doesn't apply — treat everything as shared
    if (summary === undefined || summary === null) return summary; // still loading / failed
    const raw = summary?.data ?? summary;
    const list = pick(raw, 'sharedWithYou', 'sharedwithyou') || [];
    const set = new Set<AssignmentKind>();
    for (const item of list) {
      const rawName = pick(item, 'moduleName', 'modulename', 'resourceType', 'resourcetype');
      const mapped = MODULE_ALIAS[normalizeModuleName(rawName)];
      if (mapped) set.add(mapped);
    }
    return set;
  }, [isOwnerScoped, summary]);

  const items: Record<AssignmentKind, any[]> = useMemo(() => {
    const rawVehicles = get_vehicles_data?.vehicles || (Array.isArray(get_vehicles_data) ? get_vehicles_data : []) || [];
    const rawProperties =
      get_personal_property_data?.properties || (Array.isArray(get_personal_property_data) ? get_personal_property_data : []) || [];
    const rawRealEstates =
      get_real_state_overview_data?.realestates || (Array.isArray(get_real_state_overview_data) ? get_real_state_overview_data : []) || [];
    return {
      vehicle: rawVehicles.filter(isVehicleAssignable),
      property: rawProperties,
      realestate: dropPastEndDateRealEstate ? rawRealEstates.filter(isRealEstateStillActive) : rawRealEstates,
    };
  }, [get_vehicles_data, get_personal_property_data, get_real_state_overview_data, dropPastEndDateRealEstate]);

  const isSharedModule = (k: AssignmentKind): boolean => {
    if (!isOwnerScoped) return true;
    if (sharedModuleSet instanceof Set) return sharedModuleSet.has(k);
    // Summary failed, or hasn't arrived yet — never fall back to the viewer's
    // own data; only fall back to "shared if the (owner-scoped) list already
    // has records" (§3.2).
    return items[k].length > 0;
  };

  const idFor = (k: AssignmentKind): string | null => {
    const raw = linkedIds[k];
    return isUnset(raw) ? null : String(raw);
  };

  // Mutual exclusivity precedence: property > vehicle > realestate.
  const activeSlot: AssignmentKind | null =
    (slots.includes('property') && idFor('property') && 'property') ||
    (slots.includes('vehicle') && idFor('vehicle') && 'vehicle') ||
    (slots.includes('realestate') && idFor('realestate') && 'realestate') ||
    null;

  const activeId = activeSlot ? idFor(activeSlot) : null;
  const activeItemInList =
    activeSlot && activeId ? items[activeSlot].find(i => idOf(i) === activeId) : undefined;
  const activeLinkedAsset = activeSlot ? linkedAssets?.[activeSlot] : undefined;
  const activeLinkedLabel = activeSlot
    ? labelFor(activeSlot, activeLinkedAsset || activeItemInList) || ''
    : '';

  const lockedHidden = isOwnerScoped && activeSlot !== null && !isSharedModule(activeSlot);
  const activeAccessLevel = activeItemInList ? pick(activeItemInList, 'accessLevel', 'accesslevel') : undefined;
  const lockedReadOnly =
    !lockedHidden && activeSlot !== null && activeItemInList !== undefined && isReadOnlyAccess(isOwnerScoped, activeAccessLevel);
  const sectionLocked = lockedHidden || lockedReadOnly;

  const isUnnamedHiddenLink = lockedHidden && !activeLinkedAsset && !activeItemInList;

  const sectionMessage = lockedHidden
    ? `This record is linked to something ${ownerLabel} hasn't shared with you, so the assignment can't be changed here.`
    : lockedReadOnly && activeSlot
      ? `The assigned ${ASSET_TYPE_LABEL(activeSlot, isBusiness)} is shared with you with read-only access, so this assignment can't be changed here.`
      : null;

  const buildSlot = (k: AssignmentKind): AssignmentSlotState => {
    const shared = isSharedModule(k);
    const isActive = activeSlot === k;
    const lockedText = isActive
      ? isUnnamedHiddenLink
        ? 'Assigned (not shared with you)'
        : activeLinkedLabel || `Not shared by ${ownerLabel}`
      : `Not shared by ${ownerLabel}`;

    if (!shared) {
      return { kind: k, mode: 'locked', options: [], disabled: true, lockedText };
    }

    let options: AssignmentOption[] = items[k].map(i => ({
      label: labelFor(k, i),
      value: idOf(i),
      disabled: isReadOnlyAccess(isOwnerScoped, pick(i, 'accessLevel', 'accesslevel')),
    }));

    const curId = idFor(k);
    if (isOwnerScoped && isActive && curId && !options.some(o => o.value === curId)) {
      // The owner shared other records from this module, but not this one —
      // keep the current value visible and selectable so the user can move
      // away from it and back without it just vanishing.
      options = [{ label: activeLinkedLabel || `#${curId}`, value: curId, disabled: false }, ...options];
    }

    return { kind: k, mode: 'dropdown', options, disabled: sectionLocked };
  };

  const slotStates: Partial<Record<AssignmentKind, AssignmentSlotState>> = {};
  for (const k of slots) slotStates[k] = buildSlot(k);

  return {
    isLoading: isOwnerScoped ? summaryLoading : false,
    activeSlot,
    slotStates,
    sectionLocked,
    sectionMessage,
    isUnnamedHiddenLink,
  };
}
