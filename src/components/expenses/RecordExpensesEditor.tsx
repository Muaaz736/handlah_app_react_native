import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import CustomInput from '../common/CustomInput';
import CustomDropDown from '../common/CustomDropDown';
import { showErrorToast } from '../common/CustomToast';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS } from '../../config/constants';
import { useDropdownOptions } from '../../hooks/useDropdownOptions';
import { billingFrequencyOptions } from '../../utils/billingFrequency';
import { groupedExpenseTypeOptions } from '../../utils/expenseTypes';
import { RECORD_LINK_MODULE } from '../../constants/recordLinkModules';
import { createdRecordId, recordLinkKey } from '../../services/recordLinks';
import type { RecordLinkSelection } from '../../hooks/useRecordLinkSelection';
import { RecordLinkPicker } from '../recordLinks/RecordLinkPicker';

/*
 * Expenses on records that aren't real estate (vehicles, personal property), as on the web: an expense belongs to
 * them through a record link, so the Add / Edit screens add new expenses (created when the record is saved) or link
 * existing ones, all saved with the record's own "Select Records to Link" selection.
 */

const EXPENSE = RECORD_LINK_MODULE.Expense;
const isExpenseKey = (key: string) => key.startsWith(`${EXPENSE}:`);

interface ExpenseDraftData {
  utilityType: string;
  vendor: string;
  averageMonthlyAmount: string;
  billingFrequency: string;
  dueDay: string;
  accountNumber: string;
  notes: string;
}

interface ExpenseDraft {
  key: number;
  data: ExpenseDraftData;
}

const emptyDraft = (): ExpenseDraftData => ({
  utilityType: '',
  vendor: '',
  averageMonthlyAmount: '',
  billingFrequency: '',
  dueDay: '',
  accountNumber: '',
  notes: '',
});

/** New expenses typed on an Add / Edit screen, created when the record is saved. */
export function useExpenseDrafts(businessId?: number | null) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<ExpenseDraft[]>([]);

  const add = useCallback(() => setDrafts(prev => [{ key: Date.now(), data: emptyDraft() }, ...prev]), []);
  const update = useCallback(
    (key: number, patch: Partial<ExpenseDraftData>) =>
      setDrafts(prev => prev.map(d => (d.key === key ? { ...d, data: { ...d.data, ...patch } } : d))),
    [],
  );
  const remove = useCallback((key: number) => setDrafts(prev => prev.filter(d => d.key !== key)), []);

  /**
   * Creates every draft that has an expense type and returns their link keys ("utility:<id>"), to pass to
   * `links.saveOrWarn(id, keys)`. A draft that fails to save is reported and kept.
   */
  const createAll = useCallback(async (): Promise<string[]> => {
    const ready = drafts.filter(d => d.data.utilityType);
    if (ready.length === 0) return [];
    const results = await Promise.all(
      ready.map(async d => {
        const amount = parseFloat(d.data.averageMonthlyAmount);
        const due = parseInt(d.data.dueDay, 10);
        try {
          const { data } = await apiHandle.post(API_ENDPOINTS.LIABILITIES.ADD_UTILITY, {
            utilityType: d.data.utilityType,
            vendor: d.data.vendor || undefined,
            averageMonthlyAmount: Number.isFinite(amount) ? amount : undefined,
            billingFrequency: d.data.billingFrequency || undefined,
            dueDay: Number.isFinite(due) ? due : undefined,
            accountNumber: d.data.accountNumber || undefined,
            notes: d.data.notes || undefined,
            businessId: businessId ?? null,
            isDraft: false,
          });
          return { draft: d, id: createdRecordId(data) };
        } catch {
          return { draft: d, id: null };
        }
      }),
    );
    const failed = results.filter(r => r.id == null);
    if (failed.length) showErrorToast(t('record_expenses.createFailed', { count: failed.length }));
    const saved = new Set(results.filter(r => r.id != null).map(r => r.draft.key));
    setDrafts(prev => prev.filter(d => !saved.has(d.key)));
    return results.filter(r => r.id != null).map(r => recordLinkKey({ moduleKey: EXPENSE, id: Number(r.id) }));
  }, [drafts, businessId, t]);

  return { drafts, add, update, remove, createAll };
}

export type ExpenseDrafts = ReturnType<typeof useExpenseDrafts>;

/** The Expenses part of a vehicle's or item's Add / Edit screen. */
export function RecordExpensesEditor({ links, drafts }: { links: RecordLinkSelection; drafts: ExpenseDrafts }) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [openKey, setOpenKey] = useState<number | null>(null);
  const typeOptions = useDropdownOptions('UtilityType');
  const groupedTypes = useMemo(() => groupedExpenseTypeOptions(typeOptions), [typeOptions]);

  const expenseOptions = useMemo(() => links.options.filter(o => o.moduleKey === EXPENSE), [links.options]);
  const linkedKeys = useMemo(() => links.selected.filter(isExpenseKey), [links.selected]);
  const byKey = useMemo(() => new Map(expenseOptions.map(o => [recordLinkKey(o), o])), [expenseOptions]);

  // Only the expense part of the selection changes here; other links stay as they are.
  const setLinkedExpenses = (keys: string[]) => links.setSelected([...links.selected.filter(k => !isExpenseKey(k)), ...keys]);

  if (!links.enabled) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('record_expenses.title')}</Text>
          <Text style={styles.hint}>{t('record_expenses.editorHint')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { borderColor: theme.primary }]}
          onPress={() => {
            drafts.add();
            setOpenKey(null);
          }}
        >
          <Feather name="plus" size={14} color={theme.primary} />
          <Text style={[styles.addText, { color: theme.primary }]}>{t('record_expenses.add')}</Text>
        </TouchableOpacity>
      </View>

      {drafts.drafts.map((d, idx) => {
        const isOpen = openKey === null ? idx === 0 : openKey === d.key;
        return (
          <View key={d.key} style={styles.card}>
            <View style={styles.cardHead}>
              <TouchableOpacity style={styles.cardToggle} onPress={() => setOpenKey(isOpen ? -1 : d.key)}>
                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textPrimary} />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {d.data.vendor || t('record_expenses.newExpense')}
                </Text>
                <Text style={styles.muted}>{t('record_expenses.unsaved')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => drafts.remove(d.key)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={t('record_expenses.discard')}
              >
                <Feather name="trash-2" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            {isOpen && (
              <View style={styles.cardBody}>
                <Text style={styles.label}>{t('utilities.utility_type')} *</Text>
                <CustomDropDown
                  options={groupedTypes}
                  value={d.data.utilityType}
                  onSelect={value => drafts.update(d.key, { utilityType: (value as string) || '' })}
                  placeholder={t('utilities.select')}
                  search
                  leftIcon
                />
                <Text style={styles.label}>{t('utilities.vendor')}</Text>
                <CustomInput
                  value={d.data.vendor}
                  onChangeText={text => drafts.update(d.key, { vendor: text })}
                  placeholder={t('utilities.vendor_placeholder')}
                  inputStyle={{ textAlign: 'left' }}
                />
                <Text style={styles.label}>{t('utilities.average_monthly_amount')}</Text>
                <CustomInput
                  value={d.data.averageMonthlyAmount}
                  onChangeText={text => drafts.update(d.key, { averageMonthlyAmount: text.replace(/[^0-9.]/g, '') })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  inputStyle={{ textAlign: 'left' }}
                />
                <Text style={styles.label}>{t('utilities.billing_frequency')}</Text>
                <CustomDropDown
                  options={billingFrequencyOptions()}
                  value={d.data.billingFrequency}
                  onSelect={value => drafts.update(d.key, { billingFrequency: (value as string) || '' })}
                  placeholder={t('utilities.billing_frequency_placeholder')}
                  search={false}
                  leftIcon
                />
                <Text style={styles.label}>{t('utilities.due_day_optional')}</Text>
                <CustomInput
                  value={d.data.dueDay}
                  onChangeText={text => drafts.update(d.key, { dueDay: text.replace(/[^0-9]/g, '').slice(0, 2) })}
                  placeholder="1"
                  keyboardType="number-pad"
                  inputStyle={{ textAlign: 'left' }}
                />
                <Text style={styles.label}>{t('utilities.account_number_optional')}</Text>
                <CustomInput
                  value={d.data.accountNumber}
                  onChangeText={text => drafts.update(d.key, { accountNumber: text })}
                  placeholder={t('utilities.account_number_placeholder')}
                  inputStyle={{ textAlign: 'left' }}
                />
              </View>
            )}
          </View>
        );
      })}

      <Text style={styles.subTitle}>{t('record_expenses.linked')}</Text>
      {linkedKeys.length === 0 ? (
        <Text style={styles.muted}>{t('record_expenses.noneLinked')}</Text>
      ) : (
        linkedKeys.map(key => {
          const rec = byKey.get(key);
          return (
            <View key={key} style={styles.linkedRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkedName} numberOfLines={1}>{rec?.name ?? key}</Text>
                {!!rec?.subtitle && <Text style={styles.muted} numberOfLines={1}>{rec.subtitle}</Text>}
              </View>
              <TouchableOpacity
                onPress={() => setLinkedExpenses(linkedKeys.filter(k => k !== key))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={t('record_expenses.unlink', { name: rec?.name ?? '' })}
              >
                <Feather name="x" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          );
        })
      )}

      <Text style={styles.subTitle}>{t('record_expenses.linkExisting')}</Text>
      <RecordLinkPicker
        compact
        options={expenseOptions}
        selected={linkedKeys}
        onChange={setLinkedExpenses}
        loading={links.loading}
        error={links.error}
      />
    </View>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    wrap: { gap: 10, marginTop: 8, marginBottom: 8 },
    headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    title: { fontSize: 15, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    hint: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    addText: { fontSize: 13, fontFamily: FONTS.display_semi_bold },
    card: { borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: theme.surface },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
    cardToggle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { flexShrink: 1, fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    cardBody: { borderTopWidth: 1, borderTopColor: theme.border, padding: 12, gap: 6 },
    label: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary, marginTop: 6 },
    subTitle: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginTop: 6 },
    muted: { fontSize: 12, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    linkedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.surface,
    },
    linkedName: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
  });
