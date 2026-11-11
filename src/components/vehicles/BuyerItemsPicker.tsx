import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS } from '../../config/constants';
import { useUserRole } from '../../hooks/useUserRole';
import FONTS from '../../utils/fonts';

/** What the seller sends the buyer with a vehicle (the buyer gets copies; the seller keeps theirs). Same shape as the website. */
export interface VehicleTransferItems {
  notes: boolean;
  photos: boolean;
  carFax: boolean;
  serviceRecordIds: number[];
  accidentIds: number[];
  warrantyIds: number[];
  insuranceIds: number[];
  loanIds: number[];
  expenseIds: number[];
}

interface ItemOption {
  id: number;
  label: string;
  /** A date (YYYY-MM-DD) when the record has one. */
  detail: string | null;
}

type ListKind = 'serviceRecords' | 'accidents' | 'warranties' | 'insurances' | 'loans' | 'expenses';

interface ItemOptions extends Record<ListKind, ItemOption[]> {
  hasNotes: boolean;
  photoCount: number;
  carFaxCount: number;
}

const KINDS: ListKind[] = ['serviceRecords', 'accidents', 'warranties', 'insurances', 'loans', 'expenses'];

/** Sent by default: the car's history. The seller's own policies, loans and expenses are off until chosen. */
const ON_BY_DEFAULT: Record<ListKind, boolean> = {
  serviceRecords: true,
  accidents: true,
  warranties: true,
  insurances: false,
  loans: false,
  expenses: false,
};

const pick = (o: any, key: string): any => {
  if (!o || typeof o !== 'object') return undefined;
  if (key in o) return o[key];
  const k = Object.keys(o).find(x => x.toLowerCase() === key.toLowerCase());
  return k ? o[k] : undefined;
};

async function loadOptions(vehicleId: number | string): Promise<ItemOptions | null> {
  try {
    const res = await apiHandle.get(`${API_ENDPOINTS.VEHICLE_TRANSFERS.ITEMS}/${vehicleId}/items`);
    const d = res.data;
    const list = (k: string): ItemOption[] =>
      ((pick(d, k) as any[]) ?? []).map(x => ({
        id: Number(pick(x, 'id')),
        label: String(pick(x, 'label') ?? ''),
        detail: (pick(x, 'detail') as string | null) ?? null,
      }));
    return {
      hasNotes: Boolean(pick(d, 'hasNotes')),
      photoCount: Number(pick(d, 'photoCount') ?? 0),
      carFaxCount: Number(pick(d, 'carFaxCount') ?? 0),
      serviceRecords: list('serviceRecords'),
      accidents: list('accidents'),
      warranties: list('warranties'),
      insurances: list('insurances'),
      loans: list('loans'),
      expenses: list('expenses'),
    };
  } catch {
    return null;
  }
}

export interface BuyerItemsState {
  options: ItemOptions | null;
  loading: boolean;
  notes: boolean;
  photos: boolean;
  carFax: boolean;
  selected: Record<ListKind, Set<number>>;
  setFlag: (k: 'notes' | 'photos' | 'carFax', v: boolean) => void;
  toggle: (kind: ListKind, id: number) => void;
  setAll: (kind: ListKind, on: boolean) => void;
  /** The choice to send with the transfer; undefined when the list couldn't be loaded (the buyer then gets the usual set). */
  toPayload: () => VehicleTransferItems | undefined;
}

const emptySelection = () => Object.fromEntries(KINDS.map(k => [k, new Set<number>()])) as Record<ListKind, Set<number>>;

/** What the seller chooses to send the buyer with a vehicle. */
export function useBuyerItems(vehicleId: number | string | undefined): BuyerItemsState {
  const [options, setOptions] = useState<ItemOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState(true);
  const [photos, setPhotos] = useState(true);
  const [carFax, setCarFax] = useState(true);
  const [selected, setSelected] = useState<Record<ListKind, Set<number>>>(emptySelection);

  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadOptions(vehicleId).then(o => {
      if (cancelled) return;
      setOptions(o);
      if (o) {
        setSelected(Object.fromEntries(KINDS.map(k => [k, new Set(ON_BY_DEFAULT[k] ? o[k].map(x => x.id) : [])])) as Record<ListKind, Set<number>>);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return {
    options,
    loading,
    notes,
    photos,
    carFax,
    selected,
    setFlag: (k, v) => (k === 'notes' ? setNotes(v) : k === 'photos' ? setPhotos(v) : setCarFax(v)),
    toggle: (kind, id) =>
      setSelected(prev => {
        const next = new Set(prev[kind]);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { ...prev, [kind]: next };
      }),
    setAll: (kind, on) => setSelected(prev => ({ ...prev, [kind]: new Set(on && options ? options[kind].map(x => x.id) : []) })),
    toPayload: () =>
      options
        ? {
            notes,
            photos,
            carFax,
            serviceRecordIds: [...selected.serviceRecords],
            accidentIds: [...selected.accidents],
            warrantyIds: [...selected.warranties],
            insuranceIds: [...selected.insurances],
            loanIds: [...selected.loans],
            expenseIds: [...selected.expenses],
          }
        : undefined,
  };
}

function fmtDay(iso?: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

/** "Send to the buyer": the vehicle's notes, photos, CarFax and each record attached to it, with a switch or checkbox each. */
export function BuyerItemsPicker({ state }: { state: BuyerItemsState }): React.ReactElement {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const { options, loading } = state;
  const muted = themeColors.textSecondary ?? '#7c7c7c';

  const fallback: Record<ListKind, string> = {
    serviceRecords: t('vehicles.buyer_items.serviceFallback'),
    accidents: t('vehicles.buyer_items.accidentFallback'),
    warranties: t('vehicles.buyer_items.warrantyFallback'),
    insurances: t('vehicles.buyer_items.insuranceFallback'),
    loans: t('vehicles.buyer_items.loanFallback'),
    expenses: t('vehicles.buyer_items.expenseFallback'),
  };

  const toggleRow = (label: string, checked: boolean, onChange: (v: boolean) => void, hint?: string) => (
    <View style={styles.toggleRow}>
      <View style={styles.flex}>
        <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: muted }]}>{hint}</Text> : null}
      </View>
      <Switch value={checked} onValueChange={onChange} trackColor={{ false: themeColors.border, true: themeColors.primary }} thumbColor="#ffffff" />
    </View>
  );

  const group = (kind: ListKind, items: ItemOption[]) => {
    if (!items.length) return null;
    const chosen = state.selected[kind];
    const all = items.every(x => chosen.has(x.id));
    const staysWithYou = kind === 'insurances' || kind === 'loans';
    return (
      <View key={kind} style={[styles.group, { borderTopColor: themeColors.border }]}>
        <View style={styles.groupHeader}>
          <View style={styles.flex}>
            <Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>
              {t(`vehicles.buyer_items.${kind}`)} <Text style={{ color: muted }}>({chosen.size}/{items.length})</Text>
            </Text>
            {staysWithYou ? <Text style={[styles.hint, { color: muted }]}>{t('vehicles.buyer_items.staysWithYou')}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => state.setAll(kind, !all)} accessibilityRole="button">
            <Text style={[styles.link, { color: themeColors.primary }]}>
              {all ? t('vehicles.buyer_items.selectNone') : t('vehicles.buyer_items.selectAll')}
            </Text>
          </TouchableOpacity>
        </View>
        {items.map(x => {
          const on = chosen.has(x.id);
          return (
            <TouchableOpacity
              key={x.id}
              style={styles.itemRow}
              onPress={() => state.toggle(kind, x.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
            >
              <MaterialCommunityIcons
                name={on ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={on ? themeColors.primary : muted}
              />
              <Text style={[styles.itemLabel, { color: themeColors.textPrimary }]} numberOfLines={1}>
                {x.label || fallback[kind]}
              </Text>
              {x.detail ? <Text style={[styles.hint, { color: muted }]}>{fmtDay(x.detail)}</Text> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.card, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('vehicles.buyer_items.title')}</Text>
      <Text style={[styles.hint, { color: muted, marginBottom: 6 }]}>{t('vehicles.buyer_items.hint')}</Text>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={themeColors.primary} />
          <Text style={[styles.hint, { color: muted }]}>{t('vehicles.buyer_items.loading')}</Text>
        </View>
      ) : !options ? (
        <Text style={[styles.hint, { color: muted }]}>{t('vehicles.buyer_items.loadFailed')}</Text>
      ) : (
        <View>
          {toggleRow(t('vehicles.buyer_items.notes'), state.notes, v => state.setFlag('notes', v), t('vehicles.buyer_items.notesHint'))}
          {options.photoCount > 0 &&
            toggleRow(t('vehicles.buyer_items.photos', { count: options.photoCount }), state.photos, v => state.setFlag('photos', v))}
          {options.carFaxCount > 0 &&
            toggleRow(t('vehicles.buyer_items.carFax', { count: options.carFaxCount }), state.carFax, v => state.setFlag('carFax', v))}
          {KINDS.map(k => group(k, options[k]))}
          {KINDS.every(k => options[k].length === 0) && (
            <Text style={[styles.hint, styles.group, { color: muted, borderTopColor: themeColors.border }]}>{t('vehicles.buyer_items.nothingElse')}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginTop: 12, marginBottom: 4 },
  title: { fontSize: 15, fontFamily: FONTS.display_semi_bold },
  hint: { fontSize: 12 },
  flex: { flex: 1, minWidth: 0 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 6 },
  rowLabel: { fontSize: 14, fontFamily: FONTS.display_medium },
  group: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, marginTop: 6 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  link: { fontSize: 12, fontFamily: FONTS.display_semi_bold },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  itemLabel: { flex: 1, fontSize: 13 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
});
