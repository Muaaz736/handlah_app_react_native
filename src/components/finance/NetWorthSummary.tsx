import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import {
  accountCategory,
  formatMoney,
  summarizeAccounts,
  type AccountCategory,
  type AccountLike,
  type AccountTypeOption,
  type NetWorthLine,
} from '../../utils/financeAccounts';

const LIABILITY_RED = '#D32F2F';
const ASSET_GREEN = '#2E7D32';

interface NetWorthSummaryProps {
  accounts: AccountLike[];
  /** The BankAccountType dropdown options (with their Asset / Liability category). */
  options: AccountTypeOption[] | null | undefined;
}

/**
 * Top of the Finance screen: Assets, Liabilities and Net Worth from the accounts' balances, by each account
 * type's category, with a breakdown by account type that opens on tap. Same numbers as the web app.
 */
export function NetWorthSummary({ accounts, options }: NetWorthSummaryProps) {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const summary = useMemo(() => summarizeAccounts(options, accounts), [options, accounts]);
  const [open, setOpen] = useState(false);

  if (accounts.length === 0) return null;

  const box = (label: string, value: number, tone: 'asset' | 'liability' | 'net') => (
    <View style={styles.box}>
      <Text style={styles.boxLabel} numberOfLines={1}>{label}</Text>
      <Text
        style={[
          styles.boxValue,
          (tone === 'liability' || (tone === 'net' && value < 0)) && { color: LIABILITY_RED },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {formatMoney(tone === 'liability' ? -value : value)}
      </Text>
    </View>
  );

  const column = (title: string, lines: NetWorthLine[], total: number) => (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title.toUpperCase()}</Text>
      {lines.length === 0 ? (
        <Text style={styles.muted}>{t('banking_finance.summary.none')}</Text>
      ) : (
        <>
          {lines.map(l => (
            <View key={`${l.category}-${l.type}`} style={styles.line}>
              <Text style={styles.lineType} numberOfLines={1}>
                {l.type} <Text style={styles.muted}>({l.count})</Text>
              </Text>
              <Text style={styles.lineAmount}>{formatMoney(l.total)}</Text>
            </View>
          ))}
          <View style={[styles.line, styles.totalLine]}>
            <Text style={styles.totalText}>{t('banking_finance.summary.total')}</Text>
            <Text style={styles.totalText}>{formatMoney(total)}</Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.boxes}>
        {box(t('banking_finance.summary.assets'), summary.assets, 'asset')}
        {box(t('banking_finance.summary.liabilities'), summary.liabilities, 'liability')}
        {box(t('banking_finance.summary.net_worth'), summary.netWorth, 'net')}
      </View>
      <View style={styles.breakdown}>
        <TouchableOpacity
          style={styles.breakdownHeader}
          onPress={() => setOpen(o => !o)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
        >
          <Text style={styles.breakdownTitle}>{t('banking_finance.summary.breakdown')}</Text>
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textPrimary} />
        </TouchableOpacity>
        {open && (
          <View style={styles.breakdownBody}>
            {column(t('banking_finance.summary.assets'), summary.lines.filter(l => l.category === 'Asset'), summary.assets)}
            {column(t('banking_finance.summary.liabilities'), summary.lines.filter(l => l.category === 'Liability'), summary.liabilities)}
          </View>
        )}
      </View>
    </View>
  );
}

/** "Asset" / "Liability" tag for an account card or a type option. */
export function AccountCategoryTag({ category }: { category: AccountCategory }) {
  const { t } = useTranslation();
  const liability = category === 'Liability';
  return (
    <View style={[tagStyles.tag, { backgroundColor: liability ? '#FFF0F0' : '#EEF6EE' }]}>
      <Text style={[tagStyles.text, { color: liability ? LIABILITY_RED : ASSET_GREEN }]}>
        {liability ? t('banking_finance.summary.liability') : t('banking_finance.summary.asset')}
      </Text>
    </View>
  );
}

/** The tag for an account, from its type's category. */
export function AccountTag({ account, options }: { account: AccountLike; options: AccountTypeOption[] | null | undefined }) {
  const category = useMemo(() => accountCategory(options, account), [options, account]);
  return <AccountCategoryTag category={category} />;
}

const tagStyles = StyleSheet.create({
  tag: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 11, fontFamily: FONTS.display_medium },
});

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: { marginBottom: 16, gap: 12 },
    boxes: { flexDirection: 'row', gap: 8 },
    box: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    boxLabel: { fontSize: 12, fontFamily: FONTS.display_medium, color: theme.textSecondary, marginBottom: 4 },
    boxValue: { fontSize: 15, fontFamily: FONTS.display_bold, color: theme.textPrimary },
    breakdown: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    breakdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    breakdownTitle: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    breakdownBody: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 16,
    },
    column: { gap: 6 },
    columnTitle: { fontSize: 11, fontFamily: FONTS.display_semi_bold, color: theme.textSecondary, letterSpacing: 0.5 },
    line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    lineType: { flex: 1, fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    lineAmount: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    totalLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border, paddingTop: 6, marginTop: 2 },
    totalText: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
  });
