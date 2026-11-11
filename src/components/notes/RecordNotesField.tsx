import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import type { RecordNotesState } from '../../hooks/useRecordNotes';

/** The "Encrypt notes" switch with its hint, for a form that keeps its own notes box. */
export function RecordNotesEncryptRow({ notes }: { notes: RecordNotesState }) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  if (!notes.enabled) return null;
  return (
    <View style={styles.encryptWrap}>
      <View style={styles.encryptRow}>
        <Feather name="lock" size={14} color={notes.encrypted ? theme.primary : theme.textSecondary} />
        <Text style={styles.encryptLabel}>{t('record_notes.encrypt')}</Text>
        <Switch
          value={notes.encrypted}
          onValueChange={notes.setEncrypted}
          disabled={notes.loading}
          trackColor={{ true: theme.primary, false: theme.border }}
          thumbColor="#fff"
          accessibilityLabel={t('record_notes.encrypt')}
        />
      </View>
      <Text style={styles.hint}>{notes.encrypted ? t('record_notes.encryptedHint') : t('record_notes.plainHint')}</Text>
    </View>
  );
}

/**
 * Notes on an Add / Edit form, bound to useRecordNotes, with the "Encrypt notes" switch: when on, the notes are kept
 * encrypted like saved passwords, for sensitive details.
 */
export function RecordNotesField({ notes }: { notes: RecordNotesState }) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  if (!notes.enabled) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('record_notes.label')}</Text>
      <TextInput
        style={[styles.input, notes.encrypted && { borderColor: theme.primary }]}
        multiline
        maxLength={notes.maxLength}
        value={notes.notes}
        onChangeText={notes.setNotes}
        editable={!notes.loading}
        placeholder={notes.loading ? t('record_notes.loading') : t('record_notes.placeholder')}
        placeholderTextColor={theme.placeholder}
        textAlignVertical="top"
      />
      <Text style={[styles.hint, { textAlign: 'right' }]}>{notes.notes.length}/{notes.maxLength}</Text>
      <RecordNotesEncryptRow notes={notes} />
      {notes.error && <Text style={[styles.hint, { color: '#D32F2F' }]}>{t('record_notes.loadFailed')}</Text>}
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: { marginTop: 8, marginBottom: 8 },
    title: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary, marginBottom: 6 },
    input: {
      minHeight: 96,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
    },
    encryptWrap: { marginTop: 6 },
    encryptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    encryptLabel: { flex: 1, fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    hint: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 4 },
  });
