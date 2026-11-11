import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import type { RoleTheme } from '../../types/roleManager.types';
import recordLinkService, { recordLinkKey, type LinkableRecord, type RecordLinkRef } from '../../services/recordLinks';
import { useRecordLinkSelection } from '../../hooks/useRecordLinkSelection';
import { RECORD_LINK_MODULE } from '../../constants/recordLinkModules';
import { showErrorToast, showSuccessToast } from '../common/CustomToast';
import { RecordLinkPicker } from './RecordLinkPicker';

const EXPENSE = RECORD_LINK_MODULE.Expense;
const isExpense = (r: LinkableRecord) => r.moduleKey === EXPENSE;

interface RecordExpensesTabProps {
  /** A vehicle or personal property item. */
  record: RecordLinkRef;
  canEdit?: boolean;
  ownerUserId?: number | null;
  /** Close the pop-up before opening another screen. */
  onNavigate?: () => void;
}

/**
 * The Expenses tab of a vehicle's or item's view (as on the web). An expense belongs to these records through a
 * record link, so this lists the linked expenses, adds a new one already linked (Add Expense opens the expense
 * form), and links or unlinks existing ones. Other links are left as they are.
 */
export function RecordExpensesTab({ record, canEdit: canEditProp = true, ownerUserId, onNavigate }: RecordExpensesTabProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { themeColors, isBusinessRole } = useUserRole();
  const { selectedBusinessId } = useSelectedBusiness();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const businessId = isBusinessRole() ? selectedBusinessId ?? null : null;
  const canEdit = canEditProp && ownerUserId == null;

  const [expenses, setExpenses] = useState<LinkableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { moduleKey, id: recordId } = record;
  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const links = await recordLinkService.getLinks({ moduleKey, id: recordId }, businessId, ownerUserId);
      setExpenses(links.filter(isExpense));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [moduleKey, recordId, businessId, ownerUserId]);

  useEffect(() => {
    load();
  }, [load]);
  // Back from adding an expense: show it.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const selection = useRecordLinkSelection({ moduleKey, recordId, businessId, enabled: editing });

  const save = async () => {
    setSaving(true);
    const ok = await selection.save(recordId);
    setSaving(false);
    if (!ok) {
      showErrorToast(t('record_links.saveFailed'));
      return;
    }
    showSuccessToast(t('record_links.saved'));
    setEditing(false);
    load();
  };

  const open = (expense: LinkableRecord) => {
    onNavigate?.();
    const params = { openEntityId: expense.id };
    if (typeof navigation.push === 'function') navigation.push('Utilities', params);
    else navigation.navigate('Utilities', params);
  };

  const addNew = () => {
    onNavigate?.();
    navigation.navigate('AddUtility', { linkTo: recordLinkKey(record) });
  };

  return (
    <View>
      <Text style={styles.muted}>{t('record_expenses.linked')}</Text>
      {canEdit && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.primaryBtn, { borderColor: theme.primary }]} onPress={addNew} activeOpacity={0.7}>
            <Feather name="plus" size={14} color={theme.primary} />
            <Text style={[styles.primaryText, { color: theme.primary }]}>{t('record_expenses.add')}</Text>
          </TouchableOpacity>
          {!editing && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditing(true)} activeOpacity={0.7}>
              <Feather name="link-2" size={13} color={theme.textPrimary} />
              <Text style={styles.secondaryText}>{t('record_expenses.linkExisting')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {editing && (
        <View style={styles.editor}>
          <RecordLinkPicker
            compact
            options={selection.options}
            selected={selection.selected}
            onChange={selection.setSelected}
            loading={selection.loading}
            error={selection.error}
            filter={isExpense}
          />
          <View style={styles.editorActions}>
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>{t('record_links.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              disabled={saving || selection.loading}
              style={[styles.saveBtn, { backgroundColor: theme.primary }, (saving || selection.loading) && { opacity: 0.6 }]}
            >
              <Text style={styles.saveText}>{saving ? t('record_links.saving') : t('record_links.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={styles.muted}>{t('record_expenses.loading')}</Text>
        </View>
      ) : failed ? (
        <Text style={[styles.muted, { color: '#D32F2F' }]}>{t('record_expenses.loadFailed')}</Text>
      ) : expenses.length === 0 ? (
        <Text style={styles.muted}>{ownerUserId != null ? t('record_expenses.noneShared') : t('record_expenses.none')}</Text>
      ) : (
        expenses.map(expense => (
          <TouchableOpacity key={recordLinkKey(expense)} style={styles.row} onPress={() => open(expense)} activeOpacity={0.7}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name} numberOfLines={1}>{expense.name}</Text>
              {!!expense.subtitle && <Text style={styles.sub} numberOfLines={1}>{expense.subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginBottom: 10 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    primaryText: { fontSize: 13, fontFamily: FONTS.display_semi_bold },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    secondaryText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    editor: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, marginBottom: 12 },
    editorActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
    saveBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
    saveText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: '#fff' },
    loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 6,
    },
    name: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    sub: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
  });
