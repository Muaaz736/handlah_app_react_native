import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomDateTimePicker } from '../../../../components/common';
import { showErrorToast, showSuccessToast } from '../../../../components/common/CustomToast';
import { getColorWithOpacity } from '../../../../utils/colors';
import { enforceHttps } from '../../../../utils/httpsGuard';
import { resolveAttentionItemTarget } from '../../../../utils/notificationNavigator';
import { apiStatus, formatShortDate, lifeEventsApi, localDate, ymd } from '../toolsApi';
import type { LifeEventDetailDto, LifeEventPhase, LifeEventStepDto, LifeEventStepStatus } from '../tools.types';
import { Card, FailedState, LoadingState, PillButton, ProgressBar, ToolsHeader, useToolsTheme } from '../toolsUi';
import { daysFromToday, LifeEventIcon, TEMPLATE_ICON_BY_KEY } from './lifeEventIcons';

const PHASES: LifeEventPhase[] = ['before', 'during', 'after'];

/** A plain https/http link from a step; null for anything else. */
function safeLink(url: string | null | undefined): string | null {
  if (!url) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
  return /^https?:\/\/[^\s/]+\.[^\s]+/i.test(candidate) ? enforceHttps(candidate) : null;
}

/** One life event's checklist, grouped before / during / after. */
const LifeEventDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = Number(route.params?.id);

  const [event, setEvent] = useState<LifeEventDetailDto | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed' | 'missing'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [busyStep, setBusyStep] = useState<number | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [hideClosed, setHideClosed] = useState(false);
  const [adding, setAdding] = useState<{ title: string; phase: LifeEventPhase; due: Date | null } | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!Number.isFinite(id)) {
      setStatus('missing');
      return;
    }
    if (!quiet) setStatus('loading');
    try {
      setEvent(await lifeEventsApi.get(id));
      setStatus('ready');
    } catch (err) {
      if (!quiet) setStatus(apiStatus(err) === 404 ? 'missing' : 'failed');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const byPhase = useMemo(() => {
    const steps = event?.steps ?? [];
    return PHASES.map(phase => ({
      phase,
      steps: steps.filter(x => x.phase === phase && (!hideClosed || x.status === 'open')),
    })).filter(g => g.steps.length > 0);
  }, [event, hideClosed]);

  if (status === 'loading' && !event) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <ToolsHeader title={t('lifeEvents.title')} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (status !== 'ready' || !event) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <ToolsHeader title={t('lifeEvents.title')} />
        <FailedState
          message={status === 'missing' ? t('lifeEvents.detail.missing') : t('lifeEvents.loadFailed')}
          retryLabel={status === 'missing' ? t('lifeEvents.detail.back') : t('lifeEvents.retry')}
          onRetry={() => (status === 'missing' ? navigation.goBack() : void load())}
        />
      </SafeAreaView>
    );
  }

  const closed = event.steps.filter(x => x.status !== 'open').length;

  const setStepStatus = async (step: LifeEventStepDto, next: LifeEventStepStatus) => {
    setBusyStep(step.id);
    try {
      const updated = await lifeEventsApi.updateStep(event.id, step.id, { status: next });
      setEvent(updated);
      if (updated.status === 'completed' && event.status !== 'completed') showSuccessToast(t('lifeEvents.detail.allDone'));
    } catch {
      showErrorToast(t('lifeEvents.detail.saveFailed'));
    } finally {
      setBusyStep(null);
    }
  };

  const removeStep = (step: LifeEventStepDto) => {
    Alert.alert(t('lifeEvents.detail.remove'), t('lifeEvents.detail.confirmRemoveStep', { title: step.title }), [
      { text: t('lifeEvents.cancel'), style: 'cancel' },
      {
        text: t('lifeEvents.detail.remove'),
        style: 'destructive',
        onPress: async () => {
          setBusyStep(step.id);
          try {
            setEvent(await lifeEventsApi.removeStep(event.id, step.id));
          } catch {
            showErrorToast(t('lifeEvents.detail.saveFailed'));
          } finally {
            setBusyStep(null);
          }
        },
      },
    ]);
  };

  const changeDate = async (value: Date | null) => {
    setSavingEvent(true);
    try {
      setEvent(await lifeEventsApi.update(event.id, value ? { eventDate: ymd(value) } : { clearEventDate: true }));
    } catch {
      showErrorToast(t('lifeEvents.detail.saveFailed'));
    } finally {
      setSavingEvent(false);
    }
  };

  const setEventStatus = async (next: 'active' | 'archived') => {
    setSavingEvent(true);
    try {
      setEvent(await lifeEventsApi.update(event.id, { status: next }));
    } catch {
      showErrorToast(t('lifeEvents.detail.saveFailed'));
    } finally {
      setSavingEvent(false);
    }
  };

  const deleteEvent = () => {
    Alert.alert(t('lifeEvents.detail.delete'), t('lifeEvents.detail.confirmDelete', { title: event.title }), [
      { text: t('lifeEvents.cancel'), style: 'cancel' },
      {
        text: t('lifeEvents.detail.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await lifeEventsApi.remove(event.id);
            navigation.goBack();
          } catch {
            showErrorToast(t('lifeEvents.detail.saveFailed'));
          }
        },
      },
    ]);
  };

  const addStep = async () => {
    if (!adding || !adding.title.trim()) return;
    setSavingEvent(true);
    try {
      setEvent(await lifeEventsApi.addStep(event.id, {
        title: adding.title.trim(),
        phase: adding.phase,
        dueDate: adding.due ? ymd(adding.due) : null,
      }));
      setAdding(null);
    } catch {
      showErrorToast(t('lifeEvents.detail.saveFailed'));
    } finally {
      setSavingEvent(false);
    }
  };

  const stepTarget = (step: LifeEventStepDto) =>
    step.entitytype || step.module
      ? resolveAttentionItemTarget({ entityType: step.entitytype ?? undefined, entityId: step.entityid, routeKey: step.module ?? undefined })
      : null;

  const detailsLine = event.details.oldAddress && event.details.newAddress
    ? `${event.details.oldAddress} → ${event.details.newAddress}`
    : event.details.newAddress ?? event.details.newName ?? event.details.destination ?? '';

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ToolsHeader title={event.title} subtitle={detailsLine || undefined} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load(true);
              setRefreshing(false);
            }}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <Card>
          <View style={s.row}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: getColorWithOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
              <LifeEventIcon name={TEMPLATE_ICON_BY_KEY[event.templatekey]} size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.body, s.strong]}>{t('lifeEvents.stepsDone', { done: closed, total: event.steps.length })}</Text>
              <View style={{ marginTop: 6 }}>
                <ProgressBar value={closed} total={event.steps.length} />
              </View>
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <CustomDateTimePicker
              label={t('lifeEvents.detail.date')}
              value={event.eventdate ? localDate(event.eventdate.slice(0, 10)) : null}
              onChange={value => void changeDate(value instanceof Date ? value : value ? new Date(value) : null)}
              mode="date"
              clearable
              disabled={savingEvent}
            />
            <Text style={s.small}>{t('lifeEvents.detail.dateHint')}</Text>
          </View>

          <View style={[s.wrap, { marginTop: 12 }]}>
            {event.status === 'archived' ? (
              <PillButton title={t('lifeEvents.detail.restore')} icon="rotate-ccw" variant="outline" onPress={() => void setEventStatus('active')} />
            ) : (
              <PillButton title={t('lifeEvents.detail.archive')} icon="archive" variant="outline" onPress={() => void setEventStatus('archived')} />
            )}
            <PillButton title={t('lifeEvents.detail.delete')} icon="trash-2" variant="ghost" onPress={deleteEvent} style={{ marginLeft: 'auto' }} />
            {savingEvent && <ActivityIndicator color={theme.primary} />}
          </View>
        </Card>

        <View style={s.rowBetween}>
          <View style={s.row}>
            <Switch value={hideClosed} onValueChange={setHideClosed} trackColor={{ true: theme.primary, false: theme.border }} />
            <Text style={s.body}>{t('lifeEvents.detail.hideDone')}</Text>
          </View>
          {!adding && (
            <PillButton title={t('lifeEvents.detail.addStep')} icon="plus" onPress={() => setAdding({ title: '', phase: 'after', due: null })} />
          )}
        </View>

        {adding && (
          <Card style={{ gap: 10 }}>
            <Text style={[s.body, s.strong]}>{t('lifeEvents.detail.stepTitle')}</Text>
            <TextInput
              autoFocus
              value={adding.title}
              maxLength={200}
              onChangeText={title => setAdding({ ...adding, title })}
              onSubmitEditing={() => void addStep()}
              style={s.input}
              placeholderTextColor={theme.placeholder}
            />
            <Text style={[s.body, s.strong]}>{t('lifeEvents.detail.phase')}</Text>
            <View style={s.wrap}>
              {PHASES.map(p => {
                const selected = adding.phase === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setAdding({ ...adding, phase: p })}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={{ borderRadius: 999, borderWidth: 1, borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.primary : 'transparent', paddingHorizontal: 12, paddingVertical: 6 }}
                  >
                    <Text style={[s.body, { color: selected ? '#fff' : theme.textPrimary }]}>{t(`lifeEvents.phase.${p}`)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <CustomDateTimePicker
              label={t('lifeEvents.detail.due')}
              value={adding.due}
              onChange={value => setAdding({ ...adding, due: value instanceof Date ? value : value ? new Date(value) : null })}
              mode="date"
              clearable
            />
            <View style={[s.row, { justifyContent: 'flex-end' }]}>
              <PillButton title={t('lifeEvents.cancel')} variant="outline" onPress={() => setAdding(null)} />
              <PillButton title={t('lifeEvents.detail.add')} disabled={!adding.title.trim()} loading={savingEvent} onPress={() => void addStep()} />
            </View>
          </Card>
        )}

        {byPhase.length === 0 && <Text style={s.muted}>{t('lifeEvents.detail.nothingOpen')}</Text>}

        {byPhase.map(group => (
          <Card key={group.phase} style={{ paddingVertical: 8 }}>
            <Text style={[s.small, { color: theme.primary, letterSpacing: 1, paddingTop: 6, paddingBottom: 4 }]}>
              {t(`lifeEvents.phase.${group.phase}`).toUpperCase()}
            </Text>
            {group.steps.map((step, index) => {
              const done = step.status === 'done';
              const skipped = step.status === 'skipped';
              const busy = busyStep === step.id;
              const days = step.status === 'open' ? daysFromToday(step.duedate) : null;
              const target = stepTarget(step);
              const link = safeLink(step.actionurl);
              return (
                <View key={step.id}>
                  {index > 0 && <View style={s.divider} />}
                  <View style={[s.row, { alignItems: 'flex-start', paddingVertical: 6 }]}>
                    <TouchableOpacity
                      onPress={() => void setStepStatus(step, done ? 'open' : 'done')}
                      disabled={busy || skipped}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done }}
                      accessibilityLabel={done ? t('lifeEvents.detail.reopen') : t('lifeEvents.detail.markDone')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        width: 24, height: 24, borderRadius: 12, marginTop: 2, borderWidth: 2,
                        borderColor: done ? theme.primary : theme.textSecondary,
                        backgroundColor: done ? theme.primary : 'transparent',
                        alignItems: 'center', justifyContent: 'center', opacity: skipped ? 0.4 : 1,
                      }}
                    >
                      {busy ? <ActivityIndicator size="small" color={done ? '#fff' : theme.primary} /> : done ? <Feather name="check" size={14} color="#fff" /> : null}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.body, s.strong, (done || skipped) && { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>{step.title}</Text>
                      {step.description ? <Text style={s.small}>{step.description}</Text> : null}
                      <View style={[s.wrap, { marginTop: 4, alignItems: 'center' }]}>
                        {step.duedate ? (
                          <Text style={[s.small, days != null && days < 0 && { color: '#B91C1C' }, days === 0 && { color: '#B45309' }]}>
                            {days != null && days < 0
                              ? t('lifeEvents.detail.overdue', { date: formatShortDate(step.duedate) })
                              : days === 0
                                ? t('lifeEvents.detail.dueToday')
                                : t('lifeEvents.detail.dueOn', { date: formatShortDate(step.duedate) })}
                          </Text>
                        ) : null}
                        {skipped && <Text style={s.small}>{t('lifeEvents.detail.skipped')}</Text>}
                        {target && (
                          <TouchableOpacity onPress={() => navigation.navigate(target.screen, target.params)} accessibilityRole="link">
                            <Text style={[s.small, { color: theme.primary }]}>
                              {step.entityid != null ? t('lifeEvents.detail.openRecord') : t('lifeEvents.detail.openModule')}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {link && (
                          <TouchableOpacity onPress={() => void Linking.openURL(link)} accessibilityRole="link">
                            <Text style={[s.small, { color: theme.primary }]}>{t('lifeEvents.detail.openWebsite')} ↗</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {!done && (
                      <TouchableOpacity
                        onPress={() => void setStepStatus(step, skipped ? 'open' : 'skipped')}
                        disabled={busy}
                        accessibilityRole="button"
                        accessibilityLabel={skipped ? t('lifeEvents.detail.unskip') : t('lifeEvents.detail.skip')}
                        style={{ padding: 6 }}
                      >
                        <Feather name={skipped ? 'rotate-ccw' : 'skip-forward'} size={16} color={theme.textSecondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => removeStep(step)}
                      disabled={busy}
                      accessibilityRole="button"
                      accessibilityLabel={t('lifeEvents.detail.remove')}
                      style={{ padding: 6 }}
                    >
                      <Feather name="trash-2" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LifeEventDetailScreen;
