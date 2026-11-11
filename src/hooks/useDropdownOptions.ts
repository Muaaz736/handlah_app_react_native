import { useEffect, useState } from 'react';
import { apiHandle } from '../config/apiHandle';
import { API_ENDPOINTS } from '../config/constants';

export interface DropdownOption {
  label: string;
  value: string;
  stype?: string | null;
  sortOrder?: number | null;
}

// Options change rarely: one request per list per app run, shared by every screen that asks.
const cache = new Map<string, Promise<DropdownOption[]>>();

function toOptions(data: any): DropdownOption[] {
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.options) ? data.options : [];
  return list.map((o: any) => ({
    label: String(o.label ?? o.Label ?? o.name ?? o.value ?? ''),
    value: String(o.value ?? o.Value ?? o.id ?? ''),
    stype: o.stype ?? o.Stype ?? o.subtype ?? null,
    sortOrder: o.sortOrder ?? o.sortorder ?? null,
  }));
}

export function loadDropdownOptions(moduleName: string): Promise<DropdownOption[]> {
  let p = cache.get(moduleName);
  if (!p) {
    p = apiHandle
      .get(`${API_ENDPOINTS.DROPDOWN_OPTIONS}/${moduleName}`)
      .then(r => toOptions(r.data))
      .catch(() => {
        cache.delete(moduleName);
        return [];
      });
    cache.set(moduleName, p);
  }
  return p;
}

/**
 * A dropdown list (BankAccountType, UtilityType…) for display, without going through the shared redux slot that
 * forms overwrite with whichever list they loaded last.
 */
export function useDropdownOptions(moduleName: string | null | undefined): DropdownOption[] {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  useEffect(() => {
    if (!moduleName) return;
    let cancelled = false;
    loadDropdownOptions(moduleName).then(o => !cancelled && setOptions(o));
    return () => {
      cancelled = true;
    };
  }, [moduleName]);
  return options;
}

/** The label of a stored value, matching ignoring case. */
export function dropdownLabel(options: DropdownOption[], value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const v = String(value).toLowerCase();
  return options.find(o => o.value.toLowerCase() === v || o.label.toLowerCase() === v)?.label;
}
