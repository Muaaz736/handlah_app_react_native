import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FONTS from '../../../../utils/fonts';
import { getColorWithOpacity } from '../../../../utils/colors';
import { enforceHttps } from '../../../../utils/httpsGuard';
import { showErrorToast, showSuccessToast } from '../../../../components/common/CustomToast';
import { apiStatus, formatMoney, formatShortDate, moneyFinderApi } from '../toolsApi';
import type { MoneyFinderResultDto, MoneyFindingDto, MoneyFinderStatus } from '../tools.types';
import { Card, FailedState, LoadingState, PillButton, ToolsHeader, useOpenRecord, useToolsTheme } from '../toolsUi';
import HouseholdSection from './HouseholdSection';
import SmartCancelModal, { type CancelTarget } from './SmartCancelModal';

const EXTRA_OPTIONS = [25, 50, 100, 200];

/** Findings where cancelling the subscription is the natural next step. */
const CANCELABLE_TYPES = new Set(['overlap', 'price-increase', 'trial-ending', 'renewal', 'cancelled-still-billing']);

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  overlap: { bg: '#EDE9FE', fg: '#5B21B6' },
  'price-increase': { bg: '#FEF3C7', fg: '#92400E' },
  'trial-ending': { bg: '#FEE2E2', fg: '#991B1B' },
  renewal: { bg: '#FFF3E0', fg: '#9A3412' },
  'cancelled-still-billing': { bg: '#FEE2E2', fg: '#991B1B' },
  'warranty-ending': { bg: '#E0F2FE', fg: '#075985' },
  'loan-payoff': { bg: '#DBEAFE', fg: '#1E40AF' },
};

function safeLink(url: string | null | undefined): string | null {
  if (!url) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
  return /^https?:\/\/[^\s/]+\.[^\s]+/i.test(candidate) ? enforceHttps(candidate) : null;
}

/**
 * Money Finder: overlaps, price increases, trials and renewals, warranties ending and loan payoff,
 * worked out only from the user's own records, plus the household section and smart Cancel.
 */
const MoneyFinderScreen: React.FC = () => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const openRecord = useOpenRecord();

  const [data, setData] = useState<MoneyFinderResultDto | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [extra, setExtra] = useState(50);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [savingFor, setSavingFor] = useState<{ key: string; amount: string } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [householdRefresh, setHouseholdRefresh] = useState(0);

  const load = useCallback(async (extraLoanPayment: number, quiet = false) => {
    if (!quiet) setStatus('loading');
    try {
      setData(await moneyFinderApi.get(extraLoanPayment));
      setStatus('ready');
    } catch {
      if (!quiet) setStatus('failed');
    }
  }, []);

  useEffect(() => {
    void load(50);
  }, [load]);

  const act = async (finding: MoneyFindingDto, action: MoneyFinderStatus, savedAnnualAmount?: number) => {
    setBusyKey(finding.key);
    try {
      setData(await moneyFinderApi.act(finding.key, action, { savedAnnualAmount, snoozeDays: action === 'snoozed' ? 30 : undefined }));
      setSavingFor(null);
      if (action === 'saved') showSuccessToast(t('moneyFinder.savedToast'));
    } catch (err) {
      const gone = apiStatus(err) === 404;
      showErrorToast(gone ? t('moneyFinder.gone') : t('moneyFinder.actionFailed'));
      if (gone) void load(extra, true);
    } finally {
      setBusyKey(null);
    }
  };

  const undo = async (key: string) => {
    setBusyKey(key);
    try {
      setData(await moneyFinderApi.undo(key));
    } catch {
      showErrorToast(t('moneyFinder.actionFailed'));
    } finally {
      setBusyKey(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(extra, true);
    setHouseholdRefresh(n => n + 1);
    setRefreshing(false);
  };

  const body = () => {
    if (status === 'loading' && !data) return <LoadingState />;
    if (status === 'failed' || !data) {
      return <FailedState message={t('moneyFinder.loadFailed')} retryLabel={t('moneyFinder.retry')} onRetry={() => void load(extra)} />;
    }
    const { summary } = data;
    return (
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={theme.primary} colors={[theme.primary]} />}
      >
        <View style={[s.row, { marginTop: -4 }]}>
          <Feather name="lock" size={13} color={theme.textSecondary} />
          <Text style={[s.small, { flex: 1 }]}>{t('moneyFinder.privacy')}</Text>
        </View>

        {/* Hero */}
        <LinearGradient colors={[theme.secondary, theme.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 18 }}>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: FONTS.display_regular }}>{t('moneyFinder.savedThisYear')}</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontFamily: FONTS.display_bold }}>{formatMoney(summary.savedthisyear)}</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {[
              [t('moneyFinder.stillToReview'), `${formatMoney(summary.potentialannual)}${t('moneyFinder.perYear')}`],
              [t('moneyFinder.fixedCosts'), `${formatMoney(summary.fixedmonthly)}${t('moneyFinder.perMonth')}`],
              [t('moneyFinder.next30Days'), formatMoney(summary.next30daystotal)],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: FONTS.display_regular }}>{label}</Text>
                <Text style={{ color: '#fff', fontSize: 14, fontFamily: FONTS.display_semi_bold }}>{value}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Findings */}
        <Text style={s.h2}>{t('moneyFinder.findings', { count: data.findings.length })}</Text>
        {data.findings.length === 0 && (
          <Card style={s.row}>
            <Feather name="check-circle" size={20} color={theme.primary} />
            <Text style={[s.body, { flex: 1 }]}>{t('moneyFinder.nothingFound')}</Text>
          </Card>
        )}
        {data.findings.map(f => {
          const busy = busyKey === f.key;
          const website = safeLink(f.website);
          const colors = TYPE_COLORS[f.type] ?? { bg: getColorWithOpacity(theme.textSecondary, 0.12), fg: theme.textPrimary };
          return (
            <Card key={f.key} style={{ gap: 6 }}>
              <View style={s.rowBetween}>
                <View style={[s.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[s.badgeText, { color: colors.fg }]}>{t(`moneyFinder.type.${f.type}`, { defaultValue: f.type })}</Text>
                </View>
                {f.annualamount != null && f.annualamount > 0 && (
                  <Text style={[s.body, s.strong, { color: theme.primary }]}>{formatMoney(f.annualamount)}{t('moneyFinder.perYear')}</Text>
                )}
              </View>
              <Text style={[s.body, s.strong, { fontSize: 15 }]}>{f.title}</Text>
              <Text style={s.muted}>{f.message}</Text>
              {f.actiondate ? <Text style={s.small}>{t('moneyFinder.onDate', { date: formatShortDate(f.actiondate) })}</Text> : null}

              {f.type === 'loan-payoff' && f.loanpayoff && (
                <View style={{ gap: 6 }}>
                  <Text style={s.body}>{t('moneyFinder.tryExtra')}</Text>
                  <View style={s.wrap}>
                    {EXTRA_OPTIONS.map(v => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => {
                          setExtra(v);
                          void load(v, true);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: extra === v }}
                        style={{ borderRadius: 999, borderWidth: 1, borderColor: extra === v ? theme.primary : theme.border, backgroundColor: extra === v ? theme.primary : 'transparent', paddingHorizontal: 12, paddingVertical: 5 }}
                      >
                        <Text style={[s.small, { color: extra === v ? '#fff' : theme.textPrimary }]}>{formatMoney(v)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={s.small}>
                    {t('moneyFinder.payoffDetail', {
                      months: f.loanpayoff.monthswithextra,
                      saved: f.loanpayoff.monthssaved,
                      interest: formatMoney(f.loanpayoff.interestsaved),
                    })}
                  </Text>
                </View>
              )}

              {savingFor?.key === f.key ? (
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Text style={s.body}>{t('moneyFinder.howMuchSaved')}</Text>
                  <TextInput
                    value={savingFor.amount}
                    onChangeText={amount => setSavingFor({ key: f.key, amount })}
                    keyboardType="decimal-pad"
                    autoFocus
                    style={[s.input, { width: 160 }]}
                  />
                  <View style={s.wrap}>
                    <PillButton
                      title={t('moneyFinder.confirmSaved')}
                      loading={busy}
                      onPress={() => {
                        const n = Number(savingFor.amount);
                        void act(f, 'saved', Number.isFinite(n) && n >= 0 ? n : undefined);
                      }}
                    />
                    <PillButton title={t('moneyFinder.cancel')} variant="ghost" onPress={() => setSavingFor(null)} />
                  </View>
                </View>
              ) : (
                <View style={[s.wrap, { marginTop: 4 }]}>
                  {f.type !== 'loan-payoff' && f.type !== 'warranty-ending' && (
                    <PillButton
                      title={t('moneyFinder.iSaved')}
                      disabled={busy}
                      onPress={() => setSavingFor({ key: f.key, amount: f.annualamount != null ? String(f.annualamount) : '' })}
                    />
                  )}
                  {f.entitytype === 'subscription' && CANCELABLE_TYPES.has(f.type) && (
                    <PillButton
                      title={t('moneyFinder.smartCancel.button')}
                      icon="scissors"
                      variant="outline"
                      onPress={() => setCancelTarget({ subscriptionId: f.entityid, name: f.title, findingKey: f.key })}
                    />
                  )}
                  {(f.type === 'overlap' || f.type === 'renewal' || f.type === 'price-increase') && (
                    <PillButton title={t('moneyFinder.keep')} variant="outline" disabled={busy} onPress={() => void act(f, 'kept')} />
                  )}
                  {(f.type === 'warranty-ending' || f.type === 'loan-payoff') && (
                    <PillButton title={t('moneyFinder.gotIt')} variant="outline" disabled={busy} onPress={() => void act(f, 'dismissed')} />
                  )}
                  <PillButton title={t('moneyFinder.remindLater')} variant="outline" disabled={busy} onPress={() => void act(f, 'snoozed')} />
                  <PillButton title={t('moneyFinder.openRecord')} variant="ghost" onPress={() => openRecord(f.entitytype, f.entityid)} />
                  {website && (
                    <PillButton title={t('moneyFinder.openWebsite')} icon="external-link" variant="ghost" onPress={() => void Linking.openURL(website)} />
                  )}
                  {!['loan-payoff', 'warranty-ending', 'overlap', 'renewal', 'price-increase'].includes(f.type) && (
                    <PillButton title={t('moneyFinder.dismiss')} variant="ghost" disabled={busy} onPress={() => void act(f, 'dismissed')} />
                  )}
                  {busy && <ActivityIndicator color={theme.primary} />}
                </View>
              )}
            </Card>
          );
        })}

        {/* Household */}
        <Text style={[s.h2, { marginTop: 4 }]}>{t('moneyFinder.household.sectionTitle')}</Text>
        <HouseholdSection onCancel={setCancelTarget} refreshKey={householdRefresh} />

        {/* Fixed costs */}
        <Card>
          <Text style={[s.cardTitle, { marginBottom: 10 }]}>{t('moneyFinder.fixedCostsTitle')}</Text>
          {data.fixedcosts.length === 0 ? (
            <Text style={s.muted}>{t('moneyFinder.noFixedCosts')}</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {data.fixedcosts.map(c => {
                const pct = summary.fixedmonthly > 0 ? Math.round((c.monthly / summary.fixedmonthly) * 100) : 0;
                return (
                  <View key={c.category}>
                    <View style={s.rowBetween}>
                      <Text style={s.body}>{t(`moneyFinder.category.${c.category}`, { defaultValue: c.category })} ({c.count})</Text>
                      <Text style={[s.body, s.strong]}>{formatMoney(c.monthly)}{t('moneyFinder.perMonth')}</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: getColorWithOpacity(theme.primary, 0.12), marginTop: 4, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: theme.primary, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Next 30 days */}
        <Card>
          <Text style={[s.cardTitle, { marginBottom: 10 }]}>{t('moneyFinder.upcomingTitle')}</Text>
          {data.upcoming.length === 0 ? (
            <Text style={s.muted}>{t('moneyFinder.noUpcoming')}</Text>
          ) : (
            <View style={{ gap: 6 }}>
              {data.upcoming.slice(0, 12).map(p => (
                <TouchableOpacity key={p.key} style={s.rowBetween} onPress={() => openRecord(p.entitytype, p.entityid)} accessibilityRole="button">
                  <Text style={[s.body, { flex: 1 }]} numberOfLines={1}>{p.label}</Text>
                  <Text style={s.small}>{formatShortDate(p.duedate)} · {p.isestimate ? '~' : ''}{formatMoney(p.amount)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* History */}
        {data.history.length > 0 && (
          <Card>
            <Text style={[s.cardTitle, { marginBottom: 10 }]}>{t('moneyFinder.historyTitle')}</Text>
            <View style={{ gap: 10 }}>
              {data.history.map(h => (
                <View key={h.key} style={s.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.body} numberOfLines={1}>{h.label ?? t(`moneyFinder.type.${h.type}`, { defaultValue: h.type })}</Text>
                    <Text style={s.small}>
                      {t(`moneyFinder.status.${h.status}`, { defaultValue: h.status })}
                      {h.status === 'saved' && h.savedannualamount ? ` · ${formatMoney(h.savedannualamount)}${t('moneyFinder.perYear')}` : ''}
                      {` · ${formatShortDate(h.date)}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => void undo(h.key)}
                    disabled={busyKey === h.key}
                    accessibilityRole="button"
                    accessibilityLabel={t('moneyFinder.undo')}
                    style={{ padding: 8 }}
                  >
                    <Feather name="rotate-ccw" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ToolsHeader title={t('moneyFinder.title')} />
      {body()}
      <SmartCancelModal
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCanceled={() => {
          void load(extra, true);
          setHouseholdRefresh(n => n + 1);
        }}
        onOpenRecord={id => openRecord('subscription', id)}
      />
    </SafeAreaView>
  );
};

export default MoneyFinderScreen;
