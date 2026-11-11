import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Home-screen preferences kept on this device (Account → Home Screen). Shared through a small in-memory store so a
 * change in Account shows on Home right away.
 */
const SHOW_FAVORITES_KEY = 'home_show_favorites';

let showFavorites = true;
let loaded = false;
const listeners = new Set<(value: boolean) => void>();

const load = async () => {
  if (loaded) return;
  loaded = true;
  try {
    const stored = await AsyncStorage.getItem(SHOW_FAVORITES_KEY);
    if (stored != null) {
      showFavorites = stored !== 'false';
      listeners.forEach(l => l(showFavorites));
    }
  } catch {
    // Keep the default (shown).
  }
};

export const setShowFavorites = (value: boolean): void => {
  showFavorites = value;
  listeners.forEach(l => l(value));
  AsyncStorage.setItem(SHOW_FAVORITES_KEY, String(value)).catch(() => {});
};

/** Whether the Favorites row shows on Home (on by default), and a setter. */
export function useShowFavorites(): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(showFavorites);
  useEffect(() => {
    listeners.add(setValue);
    load();
    setValue(showFavorites);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return [value, setShowFavorites];
}
