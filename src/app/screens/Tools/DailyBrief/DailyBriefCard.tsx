import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FONTS from '../../../../utils/fonts';
import { getColorWithOpacity } from '../../../../utils/colors';
import { showErrorToast } from '../../../../components/common/CustomToast';
import { dailyBriefApi, formatMoney, formatShortDate } from '../toolsApi';
import type { BriefCountdownDto, BriefTodayItemDto, DailyBriefDto } from '../tools.types';
import { Card, CardTitle, FailedState, PillButton, ProgressBar, useOpenRecord, useToolsTheme } from '../toolsUi';
import BriefSettingsModal from './BriefSettingsModal';
import { resolveInsightEditTarget } from '../../../../app/OnBoarding/NewOnboarding/Insights/insightNavigation';

function greetingKey(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
}

const COUNTDOWN_COLORS: Record<string, { bg: string; fg: string }> = {
  critical: { bg: '#FFE8E8', fg: '#B91C1C' },
  warning: { bg: '#FFF3E0', fg: '#B45309' },
  info: { bg: '#EEF2EF', fg: '#166534' },
};

/**
 * Today's brief at the top of the Advanced Dashboard (personal): what's due today, money going out
 * this week, dates coming up, what changed, the life event in progress and one quick task, plus
 * shortcuts to Life events and the Money Finder.
 */
const DailyBriefCard: React.FC = () => {
  const { t } = useTranslation();
  const { s, theme } = useToolsTheme();
  const navigation = useNavigation<any>();
  const openRecord = useOpenRecord();

  const [brief, setBrief] = useState<DailyBriefDto | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [completing, setCompleting] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setStatus('loading');
    try {
      setBrief(await dailyBriefApi.get());
      setStatus('ready');
    } catch {
      if (!quiet) setStatus('failed');
    }
  }, []);

  // First visit shows a spinner; coming back from a record or a life event refreshes quietly.
  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void load(loadedOnce.current);
      loadedOnce.current = true;
    }, [load]),
  );

  const complete = async (item: BriefTodayItemDto) => {
    setCompleting(item.id);
    setBrief(b => (b ? { ...b, today: b.today.map(i => (i.id === item.id ? { ...i, isdone: true, cancomplete: false } : i)) } : b));
    try {
      await dailyBriefApi.complete(item);
      void load(true);
    } catch {
      showErrorToast(t('dailyBrief.completeFailed'));
      setBrief(b => (b ? { ...b, today: b.today.map(i => (i.id === item.id ? item : i)) } : b));
    } finally {
      setCompleting(null);
    }
  };

  const openTodayItem = (item: BriefTodayItemDto) => {
    if (item.kind === 'life-event-step' && item.lifeeventid != null) {
      navigation.navigate('LifeEventDetail', { id: item.lifeeventid });
      return;
    }
    if (item.kind === 'event' || (item.kind === 'reminder' && item.entitytype == null)) {
      navigation.navigate('Dashboard', { screen: 'Reminders', params: { segment: 'reminders' } });
      return;
    }
    openRecord(item.entitytype, item.entityid);
  };

  const shortcuts = (
    <View style={[s.wrap, { marginTop: 12 }]}>
      <PillButton title={t('lifeEvents.title')} icon="flag" variant="outline" onPress={() => navigation.navigate('LifeEvents')} />
      <PillButton title={t('moneyFinder.title')} icon="dollar-sign" variant="outline" onPress={() => navigation.navigate('MoneyFinder')} />
    </View>
  );

  if (status === 'loading' && !brief) {
    return (
      <Card style={{ marginTop: 12, marginBottom: 12, alignItems: 'center', paddingVertical: 28 }}>
        <ActivityIndicator color={theme.primary} />
      </Card>
    );
  }

  if (status === 'failed' || !brief) {
    return (
      <Card style={{ marginTop: 12, marginBottom: 12 }}>
        <FailedState message={t('dailyBrief.loadFailed')} retryLabel={t('dailyBrief.retry')} onRetry={() => void load()} />
        {shortcuts}
      </Card>
    );
  }

  const openCount = brief.today.filter(i => !i.isdone).length;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = brief.firstname
    ? t(`dailyBrief.greeting.${greetingKey()}Name`, { name: brief.firstname })
    : t(`dailyBrief.greeting.${greetingKey()}`);
  const summary = brief.isquietday
    ? t('dailyBrief.quietDay')
    : t('dailyBrief.summary', {
        today: t('dailyBrief.thingsToday', { count: openCount }),
        money: brief.moneyout.count > 0 ? t('dailyBrief.moneyOutShort', { amount: formatMoney(brief.moneyout.total) }) : t('dailyBrief.noMoneyOut'),
      });

  return (
    <View style={{ gap: 12, marginTop: 12, marginBottom: 12 }}>
      {/* Greeting */}
      <Card>
        <Text style={[s.small, { color: theme.primary, fontFamily: FONTS.display_semi_bold, letterSpacing: 1 }]}>
          {t('dailyBrief.title').toUpperCase()} · {dateLabel}
        </Text>
        <View style={[s.rowBetween, { marginTop: 4, alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.h2}>{greeting}</Text>
            <Text style={[s.muted, { marginTop: 4 }]}>{summary}</Text>
          </View>
          {brief.healthscore > 0 && (
            <View
              accessibilityLabel={`${t('dailyBrief.readiness')}: ${brief.healthscore}`}
              style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[s.body, s.strong]}>{brief.healthscore}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          style={[s.row, { marginTop: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: theme.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }]}
          accessibilityRole="button"
        >
          <Feather name="bell" size={14} color={theme.textSecondary} />
          <Text style={s.small}>
            {brief.preferences.pushenabled ? t('dailyBrief.pushOnAt', { time: brief.preferences.deliverytime }) : t('dailyBrief.pushOff')}
          </Text>
        </TouchableOpacity>
        {shortcuts}
      </Card>

      {/* Today */}
      <Card>
        <CardTitle icon="clock" title={t('dailyBrief.today.title')} aside={brief.today.length > 0 ? t('dailyBrief.today.left', { count: openCount }) : undefined} />
        {brief.today.length === 0 ? (
          <Text style={s.muted}>{t('dailyBrief.today.empty')}</Text>
        ) : (
          brief.today.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={s.divider} />}
              <View style={s.row}>
                {item.cancomplete ? (
                  <TouchableOpacity
                    onPress={() => void complete(item)}
                    disabled={completing === item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('dailyBrief.today.markDone')}: ${item.title}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.textSecondary, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {completing === item.id && <ActivityIndicator size="small" color={theme.primary} />}
                  </TouchableOpacity>
                ) : item.isdone ? (
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                ) : (
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: getColorWithOpacity(theme.textSecondary, 0.12), alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name={item.kind === 'payment' ? 'dollar-sign' : item.kind === 'life-event-step' ? 'flag' : 'clock'} size={12} color={theme.textSecondary} />
                  </View>
                )}
                <TouchableOpacity style={{ flex: 1 }} onPress={() => openTodayItem(item)} accessibilityRole="button">
                  <Text
                    style={[s.body, s.strong, item.isdone && { color: theme.textSecondary, textDecorationLine: 'line-through' }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {item.subtitle ? <Text style={s.small} numberOfLines={1}>{item.subtitle}</Text> : null}
                </TouchableOpacity>
                {item.time ? <Text style={s.small}>{item.time}</Text> : item.amount != null ? <Text style={s.small}>{formatMoney(item.amount)}</Text> : null}
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Money out this week */}
      <Card>
        <CardTitle
          icon="dollar-sign"
          title={t('dailyBrief.moneyOut.title')}
          aside={<Text style={[s.body, s.strong, { fontSize: 17 }]}>{formatMoney(brief.moneyout.total)}</Text>}
        />
        {brief.moneyout.count === 0 ? (
          <Text style={s.muted}>{t('dailyBrief.moneyOut.empty')}</Text>
        ) : (
          <View style={{ gap: 6 }}>
            {brief.moneyout.items.slice(0, 5).map(p => (
              <TouchableOpacity key={p.key} style={s.rowBetween} onPress={() => openRecord(p.entitytype, p.entityid)} accessibilityRole="button">
                <Text style={[s.body, { flex: 1 }]} numberOfLines={1}>{p.label}</Text>
                <Text style={s.small}>
                  {formatShortDate(p.duedate)} · {p.isestimate ? '~' : ''}{formatMoney(p.amount)}
                </Text>
              </TouchableOpacity>
            ))}
            {brief.moneyout.items.length > 5 && (
              <Text style={s.small}>{t('dailyBrief.moneyOut.more', { count: brief.moneyout.items.length - 5 })}</Text>
            )}
          </View>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('MoneyFinder')} style={[s.row, { marginTop: 10 }]} accessibilityRole="button">
          <Text style={[s.body, s.strong, { color: theme.primary }]}>{t('dailyBrief.moneyOut.openFinder')}</Text>
          <Feather name="arrow-right" size={14} color={theme.primary} />
        </TouchableOpacity>
      </Card>

      {/* Coming up */}
      {brief.countdowns.length > 0 && (
        <Card>
          <CardTitle icon="calendar" title={t('dailyBrief.countdowns.title')} />
          <View style={{ gap: 10 }}>
            {brief.countdowns.map((c: BriefCountdownDto) => {
              const colors = COUNTDOWN_COLORS[c.severity] ?? COUNTDOWN_COLORS.info;
              return (
                <TouchableOpacity key={c.key} style={[s.row, { alignItems: 'flex-start' }]} onPress={() => openRecord(c.entitytype, c.entityid)} accessibilityRole="button">
                  <View style={{ minWidth: 48, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.bg, alignItems: 'center' }}>
                    <Text style={{ color: colors.fg, fontSize: 12, fontFamily: FONTS.display_semi_bold }}>{c.daysleft < 0 ? '!' : `${c.daysleft}d`}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.body, s.strong]}>{c.title}</Text>
                    <Text style={s.small}>{formatShortDate(c.date)}{c.context ? ` · ${c.context}` : ''}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      )}

      {/* Life event in progress */}
      {brief.lifeevent && (
        <TouchableOpacity onPress={() => navigation.navigate('LifeEventDetail', { id: brief.lifeevent!.id })} activeOpacity={0.85} accessibilityRole="button">
          <Card>
            <CardTitle icon="flag" title={brief.lifeevent.title} aside={<Feather name="chevron-right" size={16} color={theme.textSecondary} />} />
            <ProgressBar value={brief.lifeevent.donesteps} total={brief.lifeevent.totalsteps} />
            <Text style={[s.body, { marginTop: 8 }]}>
              {t('dailyBrief.lifeEvent.progress', { done: brief.lifeevent.donesteps, total: brief.lifeevent.totalsteps })}
            </Text>
            {brief.lifeevent.nextstep && (
              <Text style={s.small}>
                {t('dailyBrief.lifeEvent.next', { title: brief.lifeevent.nextstep.title })}
                {brief.lifeevent.nextstep.duedate ? ` · ${formatShortDate(brief.lifeevent.nextstep.duedate)}` : ''}
              </Text>
            )}
          </Card>
        </TouchableOpacity>
      )}

      {/* What changed */}
      {brief.changes.length > 0 && (
        <Card>
          <CardTitle icon="share-2" title={t('dailyBrief.changes.title')} />
          <View style={{ gap: 10 }}>
            {brief.changes.map((c, i) => (
              <TouchableOpacity
                key={`${c.kind}-${i}`}
                style={[s.row, { alignItems: 'flex-start' }]}
                accessibilityRole="button"
                onPress={() => {
                  if (c.kind === 'shared-with-you') navigation.navigate('Dashboard', { screen: 'Connections' });
                  else if (c.kind === 'price-increase') navigation.navigate('MoneyFinder');
                  else openRecord(c.entitytype, c.entityid);
                }}
              >
                <Feather name={c.kind === 'price-increase' ? 'trending-up' : 'share-2'} size={15} color={theme.textSecondary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.body}>{c.title}</Text>
                  {c.detail ? <Text style={s.small}>{c.detail}</Text> : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* 60-second task */}
      {brief.quicktask && (
        <LinearGradient colors={[theme.secondary, theme.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 16 }}>
          <View style={s.row}>
            <Feather name="zap" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontFamily: FONTS.display_medium }}>{t('dailyBrief.quickTask.title')}</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 15, fontFamily: FONTS.display_semi_bold, marginTop: 6 }}>{brief.quicktask.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: FONTS.display_regular, marginTop: 4 }}>{brief.quicktask.message}</Text>
          {resolveInsightEditTarget(brief.quicktask, { spaceType: 'Personal' }) ? (
            <TouchableOpacity
              onPress={() => {
                // Same destination the Insights tab uses for this insight.
                const target = resolveInsightEditTarget(brief.quicktask!, { spaceType: 'Personal' });
                if (target) navigation.navigate(target.screen, target.params);
              }}
              style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.primary, fontSize: 13, fontFamily: FONTS.display_semi_bold }}>
                {brief.quicktask.actiontext || t('dailyBrief.quickTask.doIt')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </LinearGradient>
      )}

      <BriefSettingsModal
        visible={settingsOpen}
        preferences={brief.preferences}
        onClose={() => setSettingsOpen(false)}
        onSaved={preferences => setBrief(b => (b ? { ...b, preferences } : b))}
      />
    </View>
  );
};

export default DailyBriefCard;
