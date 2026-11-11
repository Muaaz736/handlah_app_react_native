/**
 * Resolves country / state IDs (as stored by the backend) into display names.
 *
 * The backend stores `country` and `state` as numeric IDs (e.g. New Hampshire
 * is `29`) and does not return resolved names, so the app maps them itself.
 * Countries come from a single global list; states are fetched per country.
 * Both are cached module-side so repeated lookups don't re-hit the network.
 */
import { useEffect, useMemo, useState } from 'react';
import { apiHandle } from '../config/apiHandle';
import { API_ENDPOINTS } from '../config/constants';

let countriesCache: Record<string, string> | null = null;
let countriesInFlight: Promise<Record<string, string>> | null = null;
const statesCache: Record<string, Record<string, string>> = {};
const statesInFlight: Record<string, Promise<Record<string, string>>> = {};

/** id -> country name (cached). */
export const loadCountryNames = async (): Promise<Record<string, string>> => {
  if (countriesCache) return countriesCache;
  if (!countriesInFlight) {
    countriesInFlight = apiHandle
      .get(API_ENDPOINTS.AUTH.COUNTRIES)
      .then(res => {
        const list: any[] = res?.data?.countries ?? [];
        const map: Record<string, string> = {};
        list.forEach(c => {
          map[String(c.id)] = c.countryname;
        });
        countriesCache = map;
        return map;
      })
      .catch(() => ({}))
      .finally(() => {
        countriesInFlight = null;
      });
  }
  return countriesInFlight;
};

/** id -> state name for one country (cached). */
export const loadStateNames = async (
  countryId: string | number,
): Promise<Record<string, string>> => {
  const key = String(countryId);
  if (!key) return {};
  if (statesCache[key]) return statesCache[key];
  if (!statesInFlight[key]) {
    statesInFlight[key] = apiHandle
      .get(`${API_ENDPOINTS.AUTH.STATES}/${key}`)
      .then(res => {
        const list: any[] = res?.data?.states ?? [];
        const map: Record<string, string> = {};
        list.forEach(s => {
          map[String(s.id)] = s.description;
        });
        statesCache[key] = map;
        return map;
      })
      .catch(() => ({}))
      .finally(() => {
        delete statesInFlight[key];
      });
  }
  return statesInFlight[key];
};

export interface LocationRow {
  country?: string | number | null;
  state?: string | number | null;
}

/**
 * Builds `{ countryNames, stateNames }` lookup maps (id -> name) for a set of
 * rows. Loads the global country list once and the states for each distinct
 * country present. State IDs are globally unique, so they merge into one map.
 */
export const useLocationNameMaps = (
  rows: LocationRow[],
): { countryNames: Record<string, string>; stateNames: Record<string, string> } => {
  const [countryNames, setCountryNames] = useState<Record<string, string>>(
    countriesCache ?? {},
  );
  const [stateNames, setStateNames] = useState<Record<string, string>>({});

  const countryIds = useMemo(
    () =>
      Array.from(
        new Set(
          (rows || [])
            .map(r => r?.country)
            .filter(v => v !== null && v !== undefined && v !== ''),
        ),
      ).map(String),
    [rows],
  );
  const countryIdsKey = countryIds.join(',');

  useEffect(() => {
    let active = true;
    loadCountryNames().then(m => {
      if (active) setCountryNames(m);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all(countryIds.map(cid => loadStateNames(cid))).then(maps => {
      if (!active) return;
      const merged: Record<string, string> = {};
      maps.forEach(m => Object.assign(merged, m));
      setStateNames(prev => ({ ...prev, ...merged }));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryIdsKey]);

  return { countryNames, stateNames };
};

/** Resolve a single id to its name using a lookup map; falls back to the id. */
export const nameFromMap = (
  map: Record<string, string>,
  id?: string | number | null,
): string => {
  if (id === null || id === undefined || id === '') return '';
  return map[String(id)] ?? String(id);
};
