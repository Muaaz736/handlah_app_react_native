import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import { recordLinkKey, type LinkableRecord } from '../../services/recordLinks';

interface RecordLinkPickerProps {
  options: LinkableRecord[];
  selected: string[];
  onChange: (keys: string[]) => void;
  loading?: boolean;
  error?: boolean;
  /** Smaller field (inside a record's Linked records tab). */
  compact?: boolean;
  /** Keep only some modules (e.g. expenses on a vehicle's Expenses tab). */
  filter?: (record: LinkableRecord) => boolean;
  placeholder?: string;
}

/**
 * Multi-select of records to link, grouped by module, with search (records and module names). Shows the picked
 * records as removable chips; picking happens in a full-height sheet so it works the same on iOS and Android.
 */
export function RecordLinkPicker({ options, selected, onChange, loading, error, compact, filter, placeholder }: RecordLinkPickerProps) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => (filter ? options.filter(filter) : options), [options, filter]);
  const byKey = useMemo(() => new Map(visible.map(o => [recordLinkKey(o), o])), [visible]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const chips = selected.map(k => byKey.get(k)).filter((r): r is LinkableRecord => !!r);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = new Map<string, LinkableRecord[]>();
    for (const o of visible) {
      if (q && !`${o.name} ${o.subtitle ?? ''} ${o.moduleName}`.toLowerCase().includes(q)) continue;
      groups.set(o.moduleName, [...(groups.get(o.moduleName) ?? []), o]);
    }
    return [...groups.entries()].map(([title, data]) => ({ title, data }));
  }, [visible, query]);

  const toggle = (key: string) =>
    onChange(selectedSet.has(key) ? selected.filter(k => k !== key) : [...selected, key]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.field, compact && styles.fieldCompact, error && { borderColor: '#D32F2F' }]}
        onPress={() => setOpen(true)}
        disabled={loading}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Feather name="link-2" size={16} color={theme.textSecondary} />
        )}
        <Text style={styles.fieldText} numberOfLines={1}>
          {error
            ? t('record_links.loadFailed')
            : chips.length
              ? t('record_links.selectedCount', { count: chips.length })
              : placeholder ?? t('record_links.selectPlaceholder')}
        </Text>
        <Feather name="chevron-down" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      {chips.length > 0 && (
        <View style={styles.chips}>
          {chips.map(c => (
            <TouchableOpacity key={recordLinkKey(c)} style={styles.chip} onPress={() => toggle(recordLinkKey(c))} activeOpacity={0.7}>
              <Text style={styles.chipText} numberOfLines={1}>
                {c.name}
                <Text style={styles.chipModule}> · {c.moduleName}</Text>
              </Text>
              <Feather name="x" size={14} color={theme.textPrimary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)} presentationStyle="pageSheet">
        <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('record_links.selectTitle')}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.done}>{t('record_links.done')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>{t('record_links.selectHint')}</Text>
            <View style={styles.search}>
              <Feather name="search" size={16} color={theme.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={t('record_links.search')}
                placeholderTextColor={theme.placeholder}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Feather name="x" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <SectionList
              sections={sections}
              keyExtractor={item => recordLinkKey(item)}
              keyboardShouldPersistTaps="handled"
              stickySectionHeadersEnabled
              contentContainerStyle={{ paddingBottom: 24 }}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  {visible.length === 0 ? t('record_links.noneAvailable') : t('record_links.noResults')}
                </Text>
              }
              renderSectionHeader={({ section }) => (
                <Text style={styles.sectionHeader}>{section.title.toUpperCase()}</Text>
              )}
              renderItem={({ item }) => {
                const key = recordLinkKey(item);
                const on = selectedSet.has(key);
                return (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => toggle(key)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                  >
                    <View style={[styles.box, on && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                      {on && <Feather name="check" size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                      {!!item.subtitle && <Text style={styles.rowSub} numberOfLines={1}>{item.subtitle}</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            {chips.length > 0 && (
              <TouchableOpacity style={styles.clear} onPress={() => onChange(selected.filter(k => !byKey.has(k)))}>
                <Text style={styles.clearText}>{t('record_links.clearAll')}</Text>
              </TouchableOpacity>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 50,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.inputBg,
    },
    fieldCompact: { minHeight: 42 },
    fieldText: { flex: 1, fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      maxWidth: '100%',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    chipText: { flexShrink: 1, fontSize: 12, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    chipModule: { fontFamily: FONTS.display_regular, color: theme.textSecondary },
    sheet: { flex: 1, backgroundColor: theme.background },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    sheetTitle: { flex: 1, fontSize: 17, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    done: { fontSize: 16, fontFamily: FONTS.display_semi_bold, color: theme.primary },
    hint: { paddingHorizontal: 16, marginTop: 4, fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      margin: 16,
      paddingHorizontal: 12,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.inputBg,
    },
    searchInput: { flex: 1, fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary, paddingVertical: 0 },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      fontSize: 11,
      letterSpacing: 0.5,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textSecondary,
      backgroundColor: theme.background,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    box: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowName: { fontSize: 15, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    rowSub: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    empty: { padding: 24, textAlign: 'center', fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    clear: { alignSelf: 'center', padding: 12 },
    clearText: { fontSize: 14, fontFamily: FONTS.display_medium, color: '#D32F2F' },
  });
