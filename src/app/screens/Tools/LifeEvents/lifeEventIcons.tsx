import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ICONS: Record<string, string> = {
  truck: 'truck-outline',
  signature: 'draw-pen',
  baby: 'baby-carriage',
  paw: 'paw',
  car: 'car-outline',
  key: 'key-outline',
  plane: 'airplane',
  heart: 'hand-heart-outline',
  briefcase: 'briefcase-outline',
};

/** Icon for a template's icon name (from the API); a flag when unknown. */
export const LifeEventIcon: React.FC<{ name: string | null | undefined; size?: number; color: string }> = ({ name, size = 20, color }) => (
  <MaterialCommunityIcons name={(name && ICONS[name]) || 'flag-outline'} size={size} color={color} />
);

/** Template icon by template key, for lists that only carry the key. */
export const TEMPLATE_ICON_BY_KEY: Record<string, string> = {
  moving: 'truck',
  'name-change': 'signature',
  'new-baby': 'baby',
  'new-pet': 'paw',
  'buying-car': 'car',
  'selling-car': 'key',
  'travel-abroad': 'plane',
  'loss-of-loved-one': 'heart',
  'starting-business': 'briefcase',
};

/** Whole days from today to a date-only value (negative = past); null when there is no date. */
export function daysFromToday(value: string | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}
