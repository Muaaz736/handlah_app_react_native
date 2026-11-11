import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import type { RecordLinkSelection } from '../../hooks/useRecordLinkSelection';
import { RecordLinkPicker } from './RecordLinkPicker';

/**
 * "Select Records to Link (Optional)" on an Add/Edit form (as on the web). The form saves the selection after the
 * record itself is saved: `links.saveOrWarn(id)`.
 */
export function RecordLinksField({ links }: { links: RecordLinkSelection }) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  if (!links.enabled) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('record_links.selectTitle')}</Text>
      <Text style={styles.hint}>{t('record_links.selectHint')}</Text>
      <RecordLinkPicker
        options={links.options}
        selected={links.selected}
        onChange={links.setSelected}
        loading={links.loading}
        error={links.error}
      />
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: { marginTop: 8, marginBottom: 16 },
    title: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary, marginBottom: 2 },
    hint: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginBottom: 8 },
  });
