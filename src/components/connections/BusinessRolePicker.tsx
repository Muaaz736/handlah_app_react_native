import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import FONTS from '../../utils/fonts';

export type BusinessRole = 'standard' | 'owner_admin';

/**
 * The other person's role on each business being shared with them (as on the website):
 * Standard (shares as today) or Owner/Admin (can add and edit everything in that business, but not delete).
 */
export default function BusinessRolePicker({
  selected,
  options,
  roles,
  onChange,
}: {
  /** Selected business ids, as the multi-select keeps them. */
  selected: string[];
  options: { label: string; value: string }[];
  roles: Record<string, BusinessRole>;
  onChange: (roles: Record<string, BusinessRole>) => void;
}): React.ReactElement | null {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  if (selected.length === 0) return null;

  const pill = (id: string, value: BusinessRole, label: string) => {
    const active = (roles[id] ?? 'standard') === value;
    return (
      <TouchableOpacity
        key={value}
        onPress={() => onChange({ ...roles, [id]: value })}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[styles.pill, { borderColor: themeColors.border }, active && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}
      >
        <Text style={[styles.pillText, { color: active ? '#fff' : themeColors.textPrimary }]} numberOfLines={1}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('business_roles.connection_role')}</Text>
      {selected.map(id => (
        <View key={id} style={[styles.row, { borderColor: themeColors.border }]}>
          <Text style={[styles.name, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {options.find(o => o.value === id)?.label ?? `#${id}`}
          </Text>
          <View style={styles.pills}>
            {pill(id, 'standard', t('business_roles.standard'))}
            {pill(id, 'owner_admin', t('business_roles.owner_admin'))}
          </View>
        </View>
      ))}
      <Text style={[styles.hint, { color: themeColors.textSecondary }]}>{t('business_roles.hint')}</Text>
    </View>
  );
}

/** Roles for the selected businesses, as the API takes them (business id → role). */
export function rolesPayload(selected: string[], roles: Record<string, BusinessRole>): Record<number, BusinessRole> {
  return Object.fromEntries(selected.map(id => [Number(id), roles[id] ?? 'standard']));
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  title: { fontSize: 13, fontFamily: FONTS.display_semi_bold, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6, gap: 8 },
  name: { flex: 1, fontSize: 14 },
  pills: { flexDirection: 'row', gap: 6 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 12, fontFamily: FONTS.display_semi_bold },
  hint: { fontSize: 11, marginTop: 2 },
});
