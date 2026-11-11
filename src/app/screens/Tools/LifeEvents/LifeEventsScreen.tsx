import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { showErrorToast } from '../../../../components/common/CustomToast';
import { getColorWithOpacity } from '../../../../utils/colors';
import { formatShortDate, lifeEventsApi } from '../toolsApi';
import type { LifeEventSummaryDto, LifeEventsOverviewDto, LifeEventTemplateDto } from '../tools.types';
import { Card, FailedState, LoadingState, PillButton, ProgressBar, ToolsHeader, useToolsTheme } from '../toolsUi';
import { daysFromToday, LifeEventIcon, TEMPLATE_ICON_BY_KEY } from './lifeEventIcons';
import StartLifeEventModal from './StartLifeEventModal';

/** Life events: suggestions from recent changes, events in progress, and every playbook to start. */
const LifeEventsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const navigation = useNavigation<any>();

  const [overview, setOverview] = useState<LifeEventsOverviewDto | null>(null);
  const [templates, setTemplates] = useState<LifeEventTemplateDto[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState<LifeEventTemplateDto | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setStatus('loading');
    try {
      const [o, tpl] = await Promise.all([lifeEventsApi.getOverview(true), lifeEventsApi.getTemplates()]);
      setOverview(o);
      setTemplates(tpl);
      setStatus('ready');
    } catch {
      if (!quiet) setStatus('failed');
    }
  }, []);

  // First visit shows a spinner; coming back from an event refreshes quietly.
  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void load(loadedOnce.current);
      loadedOnce.current = true;
    }, [load]),
  );

  const groups = useMemo(() => {
    const events = overview?.events ?? [];
    return {
      active: events.filter(e => e.status === 'active'),
      past: events.filter(e => e.status !== 'active'),
    };
  }, [overview]);

  const templateByKey = useMemo(() => Object.fromEntries(templates.map(tpl => [tpl.key, tpl])), [templates]);

  const dismiss = async (key: string) => {
    setBusyKey(key);
    try {
      await lifeEventsApi.dismissSuggestion(key);
      setOverview(o => (o ? { ...o, suggestions: o.suggestions.filter(x => x.key !== key) } : o));
    } catch {
      showErrorToast(t('lifeEvents.dismissFailed'));
    } finally {
      setBusyKey(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ToolsHeader title={t('lifeEvents.title')} subtitle={t('lifeEvents.subtitle')} />
      {status === 'loading' && !overview ? (
        <LoadingState />
      ) : status === 'failed' || !overview ? (
        <FailedState message={t('lifeEvents.loadFailed')} retryLabel={t('lifeEvents.retry')} onRetry={() => void load()} />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={theme.primary} colors={[theme.primary]} />}
        >
          {overview.suggestions.map(sug => {
            const template = templateByKey[sug.templatekey];
            return (
              <Card key={sug.key} style={{ borderColor: getColorWithOpacity(theme.primary, 0.5) }}>
                <View style={s.row}>
                  <Feather name="star" size={14} color={theme.primary} />
                  <Text style={[s.small, { color: theme.primary }]}>{t('lifeEvents.suggested')}</Text>
                </View>
                <Text style={[s.h2, { marginTop: 4 }]}>{sug.title}</Text>
                <Text style={[s.muted, { marginTop: 2 }]}>{sug.reason}</Text>
                <View style={[s.wrap, { marginTop: 10 }]}>
                  <PillButton title={t('lifeEvents.startChecklist')} disabled={!template} onPress={() => template && setStarting(template)} />
                  <PillButton title={t('lifeEvents.notNow')} variant="outline" disabled={busyKey === sug.key} onPress={() => void dismiss(sug.key)} />
                </View>
              </Card>
            );
          })}

          {groups.active.length > 0 && (
            <>
              <Text style={s.h2}>{t('lifeEvents.inProgress')}</Text>
              {groups.active.map(e => (
                <EventCard key={e.id} event={e} onOpen={() => navigation.navigate('LifeEventDetail', { id: e.id })} />
              ))}
            </>
          )}

          <Text style={[s.h2, { marginTop: 4 }]}>{groups.active.length > 0 ? t('lifeEvents.startAnother') : t('lifeEvents.startOne')}</Text>
          {templates.map(tpl => (
            <TouchableOpacity key={tpl.key} onPress={() => setStarting(tpl)} activeOpacity={0.85} accessibilityRole="button">
              <Card style={[s.row, { alignItems: 'flex-start' }]}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
                  <LifeEventIcon name={tpl.icon} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.body, s.strong]}>{tpl.title}</Text>
                  <Text style={s.muted}>{tpl.description}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {groups.past.length > 0 && (
            <>
              <TouchableOpacity onPress={() => setShowPast(v => !v)} style={[s.row, { marginTop: 4 }]} accessibilityRole="button">
                <Feather name={showPast ? 'chevron-down' : 'chevron-right'} size={16} color={theme.textPrimary} />
                <Text style={[s.body, s.strong]}>{t('lifeEvents.pastEvents', { count: groups.past.length })}</Text>
              </TouchableOpacity>
              {showPast && groups.past.map(e => (
                <EventCard key={e.id} event={e} onOpen={() => navigation.navigate('LifeEventDetail', { id: e.id })} />
              ))}
            </>
          )}
        </ScrollView>
      )}

      <StartLifeEventModal
        template={starting}
        onClose={() => setStarting(null)}
        onStarted={started => {
          setStarting(null);
          navigation.navigate('LifeEventDetail', { id: started.id });
        }}
      />
    </SafeAreaView>
  );
};

const EventCard: React.FC<{ event: LifeEventSummaryDto; onOpen: () => void }> = ({ event, onOpen }) => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const closed = event.donesteps + event.skippedsteps;
  const nextDays = daysFromToday(event.nextstep?.duedate);
  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.85} accessibilityRole="button">
      <Card>
        <View style={s.row}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: getColorWithOpacity(theme.primary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
            <LifeEventIcon name={TEMPLATE_ICON_BY_KEY[event.templatekey]} size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.body, s.strong]} numberOfLines={1}>{event.title}</Text>
            <Text style={s.small}>
              {event.status === 'active'
                ? t('lifeEvents.stepsDone', { done: closed, total: event.totalsteps })
                : event.status === 'completed'
                  ? t('lifeEvents.completed')
                  : t('lifeEvents.archived')}
              {event.eventdate ? ` · ${formatShortDate(event.eventdate)}` : ''}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.textSecondary} />
        </View>
        <View style={{ marginTop: 10 }}>
          <ProgressBar value={closed} total={event.totalsteps} />
        </View>
        {event.status === 'active' && event.nextstep && (
          <Text style={[s.small, { marginTop: 8 }, nextDays != null && nextDays < 0 && { color: '#B91C1C' }]}>
            {t('lifeEvents.next', { title: event.nextstep.title })}
            {event.nextstep.duedate ? ` · ${formatShortDate(event.nextstep.duedate)}` : ''}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export default LifeEventsScreen;
