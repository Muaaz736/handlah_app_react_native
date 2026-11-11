import React, { forwardRef } from 'react';
import { ActivityIndicator, ImageBackground, ImageSourcePropType, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { HomeTile, type TileSize } from './HomeTile';

export interface TileItem {
  key: string;
  title: string;
  subtitle?: string;
  image: ImageSourcePropType;
  icon: string;
  onPress: () => void;
}

const SIZE_FOR_ROW: Record<number, TileSize> = { 1: 'hero', 2: 'medium', 3: 'small' };

/** Rows of tiles: one per row = full width, two = halves, three = thirds (as in the designs). */
export function TileRows({ rows, iconColor, tileRefs }: {
  rows: TileItem[][];
  iconColor: string;
  /** Refs for particular tiles, by key (e.g. the tutorial's spotlight on Identity Hub). */
  tileRefs?: Record<string, React.Ref<View>>;
}) {
  return (
    <View style={styles.rows}>
      {rows.map(row => (
        <View key={row.map(i => i.key).join('|')} style={styles.row}>
          {row.map(item => (
            <View
              key={item.key}
              style={{ flex: 1 }}
              ref={tileRefs?.[item.key]}
              collapsable={false}
            >
              <HomeTile
                title={item.title}
                subtitle={item.subtitle}
                image={item.image}
                icon={item.icon}
                iconColor={iconColor}
                size={SIZE_FOR_ROW[row.length] ?? 'small'}
                onPress={item.onPress}
                testID={`home-tile-${item.key}`}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Two tiles per row; an odd one out gets the full width. */
export function pairRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

/** A group's tiles laid out like the website: up to three in a row, four as 2 + 2, five as 2 + 3. */
export function groupRows<T>(items: T[]): T[][] {
  if (items.length <= 3) return items.length ? [items] : [];
  if (items.length === 4) return [items.slice(0, 2), items.slice(2)];
  if (items.length === 5) return [items.slice(0, 2), items.slice(2)];
  if (items.length === 6) return [items.slice(0, 3), items.slice(3)];
  return pairRows(items);
}

/**
 * "Dashboard | Advanced" switch, shown at the top in both views so there's always a way back
 * (the old switch sat under the tiles, which the Advanced Dashboard replaces).
 */
export function DashboardModeSwitch({ advanced, onChange, accent, labels }: {
  advanced: boolean;
  onChange: (advanced: boolean) => void;
  accent: string;
  labels: { dashboard: string; advanced: string };
}) {
  const option = (value: boolean, label: string) => {
    const active = advanced === value;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => { if (!active) onChange(value); }}
        style={[styles.modeOption, active && { backgroundColor: accent }]}
        activeOpacity={0.8}
        testID={value ? 'dashboard-mode-advanced' : 'dashboard-mode-standard'}
      >
        <Text style={[styles.modeText, active && styles.modeTextActive]} numberOfLines={1}>{label}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.modeRow}>
      <View style={styles.modeTrack}>
        {option(false, labels.dashboard)}
        {option(true, labels.advanced)}
      </View>
    </View>
  );
}

/**
 * The dashboard photo, softened so the tiles stand out: blurred and dimmed under a light veil.
 */
export function DashboardBackground({ source, children, style }: {
  source: ImageSourcePropType;
  children?: React.ReactNode;
  style?: any;
}) {
  return (
    <ImageBackground source={source} style={style ?? StyleSheet.absoluteFill} resizeMode="cover" blurRadius={14}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.backgroundVeil]} />
      {children}
    </ImageBackground>
  );
}

/** "Essentials · 4 items" heading above a group of business tiles. */
export function TileSectionHeader({ title, countLabel }: { title: string; countLabel?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!countLabel && <Text style={styles.sectionCount}>{countLabel}</Text>}
    </View>
  );
}

interface GlassSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
  onClear?: () => void;
  /** The microphone: talk to Halo (the AI assistant). */
  onMicPress?: () => void;
}

/** The frosted search bar over the background photo, with the microphone button on the right. */
export const GlassSearchBar = forwardRef<TextInput, GlassSearchBarProps>(
  ({ value, onChangeText, placeholder, onFocus, onBlur, loading, onClear, onMicPress }, ref) => (
    <View style={styles.search}>
      <Feather name="search" size={19} color="#fff" />
      <TextInput
        ref={ref}
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.85)"
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : value.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={18} color="#fff" />
        </TouchableOpacity>
      ) : null}
      {!!onMicPress && (
        <TouchableOpacity style={styles.mic} onPress={onMicPress} activeOpacity={0.8} accessibilityLabel="Halo">
          <Feather name="mic" size={18} color="#1a1a1a" />
        </TouchableOpacity>
      )}
    </View>
  ),
);
GlassSearchBar.displayName = 'GlassSearchBar';

const styles = StyleSheet.create({
  modeRow: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'flex-start' },
  modeTrack: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  modeOption: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 999 },
  modeText: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: 'rgba(255,255,255,0.9)' },
  modeTextActive: { color: '#fff' },
  backgroundVeil: { backgroundColor: 'rgba(16,24,20,0.38)' },
  rows: { gap: 7 },
  row: { flexDirection: 'row', gap: 7 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 4,
    // Frosted glass: a translucent fill with a light edge.
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: '#fff',
    paddingVertical: 0,
  },
  mic: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
