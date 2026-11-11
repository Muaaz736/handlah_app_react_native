import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import { authenticateWithAlert } from '../../utils/biometricServices';
import { showErrorToast, showSuccessToast } from '../common/CustomToast';
import { hasRecordNotes, recordNotesMaxLength, recordNotesService, type RecordNotes } from '../../services/recordNotes';

interface RecordNotesViewProps {
  moduleKey: string;
  recordId: number | null | undefined;
  /** Allow changing them here (also on a sold vehicle, whose other details are read-only); the API says if the caller may. */
  editable?: boolean;
  /** Show "—" when there are none rather than nothing. */
  showEmpty?: boolean;
}

/**
 * A record's notes on its view. Encrypted notes stay hidden until "Show", which asks for Face ID / Touch ID / fingerprint
 * first. With `editable`, they can be changed in place.
 */
export function RecordNotesView({ moduleKey, recordId, editable = false, showEmpty = false }: RecordNotesViewProps) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [data, setData] = useState<RecordNotes | null>(null);
  const [failed, setFailed] = useState(false);
  const [shown, setShown] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftEncrypted, setDraftEncrypted] = useState(false);
  const [saving, setSaving] = useState(false);
  const supported = hasRecordNotes(moduleKey);

  useEffect(() => {
    if (!recordId || !supported) return;
    let cancelled = false;
    setData(null);
    setFailed(false);
    setShown(false);
    setEditing(false);
    recordNotesService
      .get(moduleKey, recordId)
      .then(r => !cancelled && setData(r))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [moduleKey, recordId, supported]);

  if (!recordId || !supported) return null;
  if (failed || !data) {
    return showEmpty ? <Text style={styles.muted}>{failed ? t('record_notes.loadFailed') : t('record_notes.loading')}</Text> : null;
  }
  const canEdit = editable && data.canEdit;
  if (!data.notes && !canEdit && !showEmpty) return null;

  const reveal = async () => {
    if (shown) return setShown(false);
    if (await authenticateWithAlert({ showFailureAlert: true })) setShown(true);
  };

  const startEdit = async () => {
    if (data.encrypted && data.notes && !shown && !(await authenticateWithAlert({ showFailureAlert: true }))) return;
    setDraft(data.notes);
    setDraftEncrypted(data.encrypted);
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      setData(await recordNotesService.set(moduleKey, recordId, draft, draftEncrypted));
      setEditing(false);
      setShown(true);
      showSuccessToast(t('record_notes.saved'));
    } catch {
      showErrorToast(t('record_notes.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>{t('record_notes.label')}</Text>
        {data.encrypted && (
          <View style={styles.badge}>
            <Feather name="lock" size={11} color={theme.textSecondary} />
            <Text style={styles.badgeText}>{t('record_notes.encryptedBadge')}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {data.encrypted && !!data.notes && !editing && (
          <TouchableOpacity onPress={reveal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.action}>
            <Feather name={shown ? 'eye-off' : 'eye'} size={14} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>{shown ? t('record_notes.hide') : t('record_notes.show')}</Text>
          </TouchableOpacity>
        )}
        {canEdit && !editing && (
          <TouchableOpacity onPress={startEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.action}>
            <Feather name="edit-2" size={13} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>{data.notes ? t('record_notes.edit') : t('record_notes.add')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View style={{ gap: 8 }}>
          <TextInput
            style={styles.input}
            multiline
            autoFocus
            maxLength={recordNotesMaxLength(moduleKey)}
            value={draft}
            onChangeText={setDraft}
            textAlignVertical="top"
            placeholder={t('record_notes.placeholder')}
            placeholderTextColor={theme.placeholder}
          />
          <View style={styles.encryptRow}>
            <Feather name="lock" size={13} color={draftEncrypted ? theme.primary : theme.textSecondary} />
            <Text style={styles.encryptLabel}>{t('record_notes.encrypt')}</Text>
            <Switch value={draftEncrypted} onValueChange={setDraftEncrypted} trackColor={{ true: theme.primary, false: theme.border }} thumbColor="#fff" />
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditing(false)} disabled={saving}>
              <Text style={styles.secondaryText}>{t('record_notes.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={saveEdit} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryText}>{t('record_notes.save')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : data.encrypted && !shown ? (
        <Text style={[styles.body, { color: theme.textSecondary, letterSpacing: 3 }]}>{data.notes ? '••••••••••' : '—'}</Text>
      ) : (
        <Text style={styles.body}>{data.notes || '—'}</Text>
      )}
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 12, marginBottom: 12, backgroundColor: theme.surface },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    title: { fontSize: 13, fontFamily: FONTS.display_semi_bold },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: theme.inputBg },
    badgeText: { fontSize: 11, fontFamily: FONTS.display_medium, color: theme.textSecondary },
    action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, fontFamily: FONTS.display_medium },
    body: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    input: {
      minHeight: 90,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
    },
    encryptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    encryptLabel: { flex: 1, fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    secondaryBtn: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    secondaryText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    primaryBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
    primaryText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#fff' },
  });
