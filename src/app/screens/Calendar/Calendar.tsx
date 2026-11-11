import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import { AuthHeader, CustomDateTimePicker } from '../../../components/common';
import { showErrorToast, showSuccessToast } from '../../../components/common/CustomToast';
import { ShareReminderModal } from '../../../components/reminders/ShareReminderModal';
import FONTS from '../../../utils/fonts';
import { isIOS } from '../../../utils/helpers';
import { useUserRole } from '../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../hooks/useSubscriptionGate';
import type { RoleTheme } from '../../../types/roleManager.types';
import calendarService, { localDate, ymd, type CalendarEvent, type CalendarSharedOwner, type CalendarSource } from '../../../services/calendar';
import { resolveScreenFromNotification } from '../../../utils/notificationNavigator';
import { setUserRole } from '../../../redux/slices/userRoleSlice';
import { setSelectedBusinessId } from '../../../redux/slices/businessSlice';
import { USER_ROLES } from '../../../utils/roleManager';

type Tone = CalendarSource | 'shared';
const TONES: Tone[] = ['personal', 'business', 'external', 'shared'];
/** Same colours as the web calendar (personal uses the app's own primary colour). */
const TONE_COLORS: Record<Exclude<Tone, 'personal'>, string> = {
  business: '#d97706',
  external: '#2563eb',
  shared: '#7c3aed',
};
const toneOf = (e: CalendarEvent): Tone => (e.isShared ? 'shared' : e.source);
type CalendarView = 'month' | 'week' | 'day';
const VIEWS: CalendarView[] = ['month', 'week', 'day'];
const startOfWeek = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());

const OVERDUE_COLOR = '#dc2626';
/** Record types whose items stand for a single dose or a refill countdown: a missed day isn't "late". */
const NOT_OUTSTANDING = new Set(['pet_medication', 'pet_medication_schedule', 'child_medication', 'child_medication_schedule', 'medication_dosage']);
/** Records finished for good when done that usually come back with a new date: after Done, offer to add it. */
const RENEWABLE_TYPES = new Set([
  'insurance', 'passport', 'driver_license', 'warranty', 'legal_document', 'business_license', 'compliance_record',
  'loan', 'utility', 'bank_account',
]);

/** The user's own record item from a past day that isn't done (same rule as the web). */
function isOverdue(e: CalendarEvent): boolean {
  if (e.isCompleted || e.isCustom || e.isShared || e.source === 'external' || e.reminderId == null) return false;
  if (e.entityType && NOT_OUTSTANDING.has(e.entityType.toLowerCase())) return false;
  const now = new Date();
  return localDate(e.start.slice(0, 10)) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** The user's own item that can be checked off from the calendar. */
function canMarkDone(e: CalendarEvent): boolean {
  if (e.isCompleted || e.isShared || e.source === 'external' || e.reminderId == null) return false;
  // Custom reminders from the new reminder engine are completed on the Reminders screen.
  if (e.isCustom && e.seriesId != null) return false;
  return (e.entityType ?? '').toLowerCase() !== 'license_certification';
}

const addYears = (d: Date, years: number) => new Date(d.getFullYear() + years, d.getMonth(), d.getDate());

/** App locale code → Intl locale (a few codes differ from BCP 47). */
const intlLocale = (code?: string) => {
  const map: Record<string, string> = { du: 'nl', po: 'pl', tu: 'tr', vt: 'vi' };
  const c = (code ?? 'en').split('-')[0];
  return map[c] ?? c;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** The 6-week grid shown for a month (weeks start on Sunday, as on the web). */
function monthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Days an event covers (multi-day all-day events have an exclusive end). */
function eventDays(e: CalendarEvent): Date[] {
  const start = localDate(e.start);
  const first = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  if (!e.end) return [first];
  const end = localDate(e.end);
  let last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (e.allDay || (end.getHours() === 0 && end.getMinutes() === 0)) last = addDays(last, -1);
  const days: Date[] = [];
  for (let d = first; d <= last && days.length < 62; d = addDays(d, 1)) days.push(d);
  return days.length ? days : [first];
}

/**
 * The calendar (same data as the web calendar): record dates, custom reminders (including the ones connections
 * shared with you), shared records and connected external calendars. A month grid with a dot per item, the selected
 * day's agenda below, source filters, and a detail pop-up for each item. Your own custom reminders can be shared
 * from there.
 */
interface CalendarScreenProps {
  /** Shown inside the bottom-bar Calendar tab: the app header and the Calendar/Reminders switch instead of a back button. */
  embedded?: boolean;
  topSlot?: React.ReactNode;
}

const CalendarScreen = ({ embedded = false, topSlot }: CalendarScreenProps = {}): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { themeColors, isBusinessRole } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const locale = intlLocale(i18n.language);
  const unseenNotificationCount: number = useSelector((state: any) => state.notifications_slice?.unseen_count ?? 0);
  const toneColor = useCallback((tone: Tone) => (tone === 'personal' ? theme.primary : TONE_COLORS[tone]), [theme.primary]);

  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tones, setTones] = useState<Tone[]>(TONES);
  const [open, setOpen] = useState<CalendarEvent | null>(null);
  const [share, setShare] = useState<{ seriesId: number; title: string } | null>(null);
  const [view, setView] = useState<CalendarView>('month');
  const [query, setQuery] = useState('');
  const [sharedOwners, setSharedOwners] = useState<CalendarSharedOwner[]>([]);
  /** Shared items to show, by owner; null = everyone's. */
  const [ownerIds, setOwnerIds] = useState<number[] | null>(null);
  const [overdue, setOverdue] = useState<CalendarEvent[]>([]);
  /** Event pop-up: details → (vaccine: given on / next due) → done (offer a new date on the record). */
  const [doneStep, setDoneStep] = useState<'view' | 'vaccine' | 'done'>('view');
  const [doneSaving, setDoneSaving] = useState(false);
  const [givenOn, setGivenOn] = useState<Date | null>(null);
  const [nextOn, setNextOn] = useState<Date | null>(null);

  const grid = useMemo(() => monthGrid(month), [month]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selected), i)), [selected]);
  // The days loaded for the current view (as the web: month grid, the week, or the day).
  const rangeDays = view === 'month' ? grid : view === 'week' ? weekDays : [selected];
  const fromKey = ymd(rangeDays[0]);
  const toKey = ymd(addDays(rangeDays[rangeDays.length - 1], 1));

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setFailed(false);
      // What's late (own records, last 90 days) for this side. The calendar still works if this fails.
      calendarService
        .getOutstanding()
        .then(list => setOverdue(list.filter(e => e.source === (isBusinessRole() ? 'business' : 'personal'))))
        .catch(() => setOverdue([]));
      try {
        const res = await calendarService.getEvents(fromKey, toKey);
        setEvents(res.events);
        setSharedOwners(res.sharedOwners);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromKey, toKey],
  );

  // On focus (and when the month changes): load. Coming back from adding a reminder refreshes it too.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      events.filter(e => {
        if (!tones.includes(toneOf(e))) return false;
        if (e.isShared && ownerIds && (e.ownerUserId == null || !ownerIds.includes(e.ownerUserId))) return false;
        if (!q) return true;
        return [e.title, e.description, e.ownerName, e.location].some(v => v && v.toLowerCase().includes(q));
      }),
    [events, tones, ownerIds, q],
  );
  const searchResults = useMemo(
    () => (q ? [...visible].sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title)) : []),
    [visible, q],
  );
  const toggleOwner = (userId: number) =>
    setOwnerIds(prev => {
      const all = sharedOwners.map(o => o.userId);
      const current = prev ?? all;
      const next = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId];
      return next.length === 0 || next.length === all.length ? null : next;
    });
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of visible) for (const d of eventDays(e)) map.set(ymd(d), [...(map.get(ymd(d)) ?? []), e]);
    for (const list of map.values())
      list.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
    return map;
  }, [visible]);
  const dayEvents = byDay.get(ymd(selected)) ?? [];

  const toggleTone = (tone: Tone) =>
    setTones(prev => (prev.includes(tone) ? (prev.length > 1 ? prev.filter(x => x !== tone) : prev) : [...prev, tone]));

  const goMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    setSelected(sameDay(startOfMonth(today), next) ? today : next);
  };
  /** Previous / next: a month, a week or a day, by view. */
  const go = (delta: number) => {
    if (view === 'month') return goMonth(delta);
    const next = addDays(selected, delta * (view === 'week' ? 7 : 1));
    setSelected(next);
    setMonth(startOfMonth(next));
  };
  const selectDay = (day: Date) => {
    setSelected(day);
    if (day.getMonth() !== month.getMonth() || day.getFullYear() !== month.getFullYear()) setMonth(startOfMonth(day));
  };
  const periodTitle =
    view === 'month'
      ? month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
      : view === 'week'
        ? `${weekDays[0].toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`
        : selected.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const goToday = () => {
    setMonth(startOfMonth(today));
    setSelected(today);
  };

  const timeText = (e: CalendarEvent) =>
    e.allDay ? t('calendar_screen.allDay') : localDate(e.start).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });

  const addReminder = () => {
    const at = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 12);
    checkSubscription(
      () => navigation.navigate('AddAdHocReminder', { initialDate: at.toISOString() }),
      isBusinessRole() ? 'business' : 'personal',
    );
  };

  /** "Open record" / "Open reminder" / "Open shared records" for an event, or null. */
  const openAction = (e: CalendarEvent): { label: string; run: () => void } | null => {
    if (e.source === 'external') {
      return e.externalUrl
        ? { label: t('calendar_screen.openExternal', { provider: e.provider ?? '' }), run: () => Linking.openURL(e.externalUrl!) }
        : null;
    }
    if (e.isShared && e.isCustom) return null; // someone else's reminder: nothing of theirs to open
    if (e.isShared) {
      return { label: t('calendar_screen.openShared'), run: () => navigation.navigate('Dashboard', { screen: 'Connections' }) };
    }
    if (e.isCustom) {
      return {
        label: t('calendar_screen.openReminder'),
        run: () =>
          navigation.navigate('Dashboard', {
            screen: 'Reminders',
            params: e.reminderId ? { segment: 'reminders', openReminderId: e.reminderId, openReminderEntityType: 'ad_hoc' } : { segment: 'reminders' },
          }),
      };
    }
    const target = resolveScreenFromNotification({
      entityType: e.entityType ?? undefined,
      entityId: e.entityId != null ? String(e.entityId) : undefined,
      businessId: e.businessId != null ? String(e.businessId) : undefined,
      notificationType: 'reminder',
    } as any);
    if (!target || target.screen === 'Dashboard') return null;
    return {
      label: t('calendar_screen.openRecord'),
      run: () => {
        if (e.businessId) {
          dispatch(setUserRole(USER_ROLES.BUSINESS) as any);
          dispatch(setSelectedBusinessId(Number(e.businessId)) as any);
        }
        navigation.navigate(target.screen, target.params);
      },
    };
  };

  const cell = Math.floor((width - 32) / 7);
  const weekdayNames = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(grid[0], i).toLocaleDateString(locale, { weekday: 'narrow' })),
    [grid, locale],
  );

  const renderFailed = () => (
    <View style={styles.center}>
      <Text style={[styles.muted, { color: '#D32F2F' }]}>{t('calendar_screen.loadFailed')}</Text>
      <TouchableOpacity onPress={() => load()} style={styles.todayBtn}>
        <Text style={styles.todayText}>{t('calendar_screen.retry')}</Text>
      </TouchableOpacity>
    </View>
  );

  /** One item in a list; `withDate` for search results, which span the whole period. */
  const renderEvent = (e: CalendarEvent, withDate = false) => {
    const late = isOverdue(e);
    const color = late ? OVERDUE_COLOR : toneColor(toneOf(e));
    return (
      <TouchableOpacity
        key={`${e.id}-${withDate ? 's' : ''}`}
        style={[styles.event, { borderLeftColor: color }, late && { backgroundColor: 'rgba(220,38,38,0.08)' }]}
        onPress={() => setOpen(e)}
        activeOpacity={0.7}
      >
        <View style={{ width: 64 }}>
          {withDate && (
            <Text style={styles.eventTime}>{localDate(e.start).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</Text>
          )}
          <Text style={styles.eventTime}>{timeText(e)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.eventTitle, e.isCompleted && styles.completed]} numberOfLines={2}>{e.title}</Text>
          {e.isShared && !!e.ownerName && (
            <Text style={[styles.eventMeta, { color }]} numberOfLines={1}>{t('calendar_screen.sharedBy', { name: e.ownerName })}</Text>
          )}
          {e.isCompleted && <Text style={[styles.eventMeta, { color: '#16a34a' }]}>{t('calendar_screen.completed')}</Text>}
          {late && <Text style={[styles.eventMeta, { color: OVERDUE_COLOR }]}>{t('calendar_screen.overdue.notDone')}</Text>}
        </View>
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    );
  };

  /** The day view: all-day items, then an hour-by-hour timeline (7 AM – 9 PM, plus any hour with an item). */
  const renderDayTimeline = () => {
    const allDay = dayEvents.filter(e => e.allDay || !sameDay(localDate(e.start), selected));
    const timed = dayEvents.filter(e => !allDay.includes(e));
    const byHour = new Map<number, CalendarEvent[]>();
    for (const e of timed) {
      const h = localDate(e.start).getHours();
      byHour.set(h, [...(byHour.get(h) ?? []), e]);
    }
    const hours = Array.from({ length: 24 }, (_, h) => h).filter(h => (h >= 7 && h <= 21) || byHour.has(h));
    return (
      <View style={{ marginTop: 12 }}>
        {allDay.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.hourLabel}>{t('calendar_screen.allDay')}</Text>
            {allDay.map(e => renderEvent(e))}
          </View>
        )}
        {hours.map(h => (
          <View key={h} style={styles.hourRow}>
            <Text style={styles.hourLabel}>
              {new Date(2000, 0, 1, h).toLocaleTimeString(locale, { hour: 'numeric' })}
            </Text>
            <View style={{ flex: 1, gap: 6, paddingVertical: 6 }}>{(byHour.get(h) ?? []).map(e => renderEvent(e))}</View>
          </View>
        ))}
        {dayEvents.length === 0 && <Text style={[styles.muted, { paddingVertical: 12 }]}>{t('calendar_screen.noEventsDay')}</Text>}
      </View>
    );
  };

  const openEvent = open;
  const action = openEvent ? openAction(openEvent) : null;
  const canShare = !!openEvent && openEvent.isCustom && !openEvent.isShared && openEvent.seriesId != null;
  const isVaccine = !!openEvent && (openEvent.entityType ?? '').toLowerCase() === 'pet_vaccination' && openEvent.entityId != null;

  const closeEvent = () => {
    setOpen(null);
    setDoneStep('view');
  };

  const startDone = () => {
    if (!openEvent) return;
    if (isVaccine) {
      // Given on the due date (or today, if that's still ahead); the next one a year later.
      const due = localDate(openEvent.start.slice(0, 10));
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const given = due > todayStart ? todayStart : due;
      setGivenOn(given);
      setNextOn(addYears(given, 1));
      setDoneStep('vaccine');
      return;
    }
    void markDone();
  };

  const markDone = async () => {
    if (!openEvent?.reminderId) return;
    setDoneSaving(true);
    try {
      await calendarService.completeItem(openEvent.reminderId);
      showSuccessToast(t('calendar_screen.done.marked', { title: openEvent.title }));
      load(true);
      if (RENEWABLE_TYPES.has((openEvent.entityType ?? '').toLowerCase()) && action) setDoneStep('done');
      else closeEvent();
    } catch {
      showErrorToast(t('calendar_screen.done.failed'));
    } finally {
      setDoneSaving(false);
    }
  };

  const saveVaccine = async () => {
    if (!openEvent?.entityId || !givenOn) return;
    if (nextOn && ymd(nextOn) <= ymd(givenOn)) {
      showErrorToast(t('calendar_screen.done.nextAfterGiven'));
      return;
    }
    setDoneSaving(true);
    try {
      await calendarService.recordVaccinationGiven(openEvent.entityId, ymd(givenOn), nextOn ? ymd(nextOn) : null);
      showSuccessToast(
        nextOn
          ? t('calendar_screen.done.vaccineSaved', { date: nextOn.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) })
          : t('calendar_screen.done.marked', { title: openEvent.title }),
      );
      load(true);
      closeEvent();
    } catch {
      showErrorToast(t('calendar_screen.done.failed'));
    } finally {
      setDoneSaving(false);
    }
  };

  const daysLate = (e: CalendarEvent) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.max(1, Math.round((todayStart - localDate(e.start.slice(0, 10)).getTime()) / 86_400_000));
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      {embedded ? (
        <>
          <CustomHeader
            onNotificationPress={() => navigation.navigate('Notifications')}
            notificationCount={unseenNotificationCount}
          />
          {topSlot}
        </>
      ) : (
        <AuthHeader
          title={t('calendar_screen.title')}
          onBackPress={() => navigation.goBack()}
          containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{ marginBottom: 0, marginTop: 10, textAlign: 'left' }}
          backButtonIconStyle={{ tintColor: theme.textPrimary }}
        />
      )}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.primary} colors={[theme.primary]} />}
      >
        {/* What's late: own records from the last 90 days not marked done */}
        {overdue.length > 0 && (
          <View style={styles.overdueCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Feather name="alert-circle" size={15} color={OVERDUE_COLOR} />
              <Text style={[styles.eventTitle, { color: OVERDUE_COLOR, fontSize: 14 }]}>{t('calendar_screen.overdue.title', { count: overdue.length })}</Text>
            </View>
            {overdue.slice(0, 5).map(e => (
              <TouchableOpacity key={e.id} style={styles.overdueRow} onPress={() => setOpen(e)} activeOpacity={0.7}>
                <Text style={[styles.eventTitle, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{e.title}</Text>
                <Text style={[styles.eventMeta, { color: OVERDUE_COLOR, marginTop: 0 }]}>
                  {t(daysLate(e) === 1 ? 'calendar_screen.overdue.daysLate_one' : 'calendar_screen.overdue.daysLate_other', { count: daysLate(e) })}
                </Text>
              </TouchableOpacity>
            ))}
            {overdue.length > 5 && <Text style={styles.muted}>{t('calendar_screen.overdue.more', { count: overdue.length - 5 })}</Text>}
          </View>
        )}

        {/* Month and navigation */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => go(-1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={t('calendar_screen.previous')}>
            <Feather name="chevron-left" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthText} numberOfLines={1}>{periodTitle}</Text>
          <TouchableOpacity onPress={() => go(1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={t('calendar_screen.next')}>
            <Feather name="chevron-right" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => navigation.navigate('CalendarSync')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={t('calendar_screen.syncCalendars')}
          >
            <Feather name="refresh-cw" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayBtn} onPress={goToday}>
            <Text style={styles.todayText}>{t('calendar_screen.today')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={addReminder} accessibilityLabel={t('calendar_screen.addReminder')}>
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Month / Week / Day */}
        <View style={styles.segment} accessibilityLabel={t('calendar_screen.views.label')}>
          {VIEWS.map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.segmentItem, view === v && { backgroundColor: theme.primary }]}
              onPress={() => setView(v)}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === v }}
            >
              <Text style={[styles.segmentText, view === v && { color: '#fff' }]}>{t(`calendar_screen.views.${v}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.search}>
          <Feather name="search" size={16} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('calendar_screen.searchPlaceholder')}
            placeholderTextColor={theme.placeholder}
            returnKeyType="search"
            autoCorrect={false}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={t('calendar_screen.clearSearch')}>
              <Feather name="x" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Source filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {TONES.map(tone => {
            const on = tones.includes(tone);
            return (
              <TouchableOpacity
                key={tone}
                style={[styles.chip, on && { borderColor: toneColor(tone), backgroundColor: theme.surface }]}
                onPress={() => toggleTone(tone)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                <View style={[styles.dot, { backgroundColor: on ? toneColor(tone) : theme.border }]} />
                <Text style={[styles.chipText, !on && { color: theme.textSecondary }]}>{t(`calendar_screen.sources.${tone}`)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Shared items: whose to show */}
        {tones.includes('shared') && sharedOwners.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
            <TouchableOpacity
              style={[styles.chip, !ownerIds && { borderColor: TONE_COLORS.shared, backgroundColor: theme.surface }]}
              onPress={() => setOwnerIds(null)}
            >
              <Feather name="users" size={13} color={!ownerIds ? TONE_COLORS.shared : theme.textSecondary} />
              <Text style={[styles.chipText, ownerIds && { color: theme.textSecondary }]}>{t('calendar_screen.filters.allShared')}</Text>
            </TouchableOpacity>
            {sharedOwners.map(o => {
              const on = !ownerIds || ownerIds.includes(o.userId);
              return (
                <TouchableOpacity
                  key={o.userId}
                  style={[styles.chip, on && ownerIds && { borderColor: TONE_COLORS.shared, backgroundColor: theme.surface }]}
                  onPress={() => toggleOwner(o.userId)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                >
                  <Text style={[styles.chipText, !on && { color: theme.textSecondary }]} numberOfLines={1}>{o.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {q ? (
          <>
            <Text style={styles.agendaTitle}>{t('calendar_screen.searchResults')}</Text>
            {loading ? (
              <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>
            ) : searchResults.length === 0 ? (
              <Text style={[styles.muted, { paddingVertical: 12 }]}>{t('calendar_screen.noResults')}</Text>
            ) : (
              searchResults.map(e => renderEvent(e, true))
            )}
          </>
        ) : view === 'week' ? (
          <>
            <View style={styles.weekStrip}>
              {weekDays.map(day => {
                const isSel = sameDay(day, selected);
                const isToday = sameDay(day, today);
                const n = (byDay.get(ymd(day)) ?? []).length;
                return (
                  <TouchableOpacity
                    key={ymd(day)}
                    style={[styles.weekDay, { width: cell }, isSel && { backgroundColor: theme.surface, borderColor: theme.primary }]}
                    onPress={() => selectDay(day)}
                  >
                    <Text style={styles.weekday}>{day.toLocaleDateString(locale, { weekday: 'narrow' })}</Text>
                    <View style={[styles.dayNum, isToday && { backgroundColor: theme.primary }]}>
                      <Text style={[styles.dayText, isToday && { color: '#fff' }]}>{day.getDate()}</Text>
                    </View>
                    <Text style={styles.count}>{n > 0 ? n : ' '}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {loading ? (
              <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>
            ) : failed ? (
              renderFailed()
            ) : (
              weekDays.map(day => {
                const list = byDay.get(ymd(day)) ?? [];
                return (
                  <View key={ymd(day)}>
                    <Text style={[styles.agendaTitle, sameDay(day, today) && { color: theme.primary }]}>
                      {day.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    {list.length === 0 ? (
                      <Text style={styles.muted}>{t('calendar_screen.noEventsDay')}</Text>
                    ) : (
                      list.map(e => renderEvent(e))
                    )}
                  </View>
                );
              })
            )}
          </>
        ) : view === 'day' ? (
          loading ? (
            <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>
          ) : failed ? (
            renderFailed()
          ) : (
            renderDayTimeline()
          )
        ) : (
        <>
        {/* Month grid */}
        <View style={styles.weekdays}>
          {weekdayNames.map((w, i) => (
            <Text key={i} style={[styles.weekday, { width: cell }]}>{w}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {grid.map(day => {
            const key = ymd(day);
            const list = byDay.get(key) ?? [];
            const inMonth = day.getMonth() === month.getMonth();
            const isSel = sameDay(day, selected);
            const isToday = sameDay(day, today);
            const dots = [...new Set(list.map(toneOf))].slice(0, 4);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.day, { width: cell, height: cell + 6 }, isSel && { backgroundColor: theme.surface, borderColor: theme.primary }]}
                onPress={() => selectDay(day)}
                accessibilityLabel={day.toLocaleDateString(locale, { dateStyle: 'full' } as any)}
              >
                <View style={[styles.dayNum, isToday && { backgroundColor: theme.primary }]}>
                  <Text style={[styles.dayText, !inMonth && { color: theme.textSecondary, opacity: 0.5 }, isToday && { color: '#fff' }]}>
                    {day.getDate()}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {dots.map(tone => (
                    <View key={tone} style={[styles.dot, { backgroundColor: toneColor(tone) }]} />
                  ))}
                </View>
                {list.length > 0 && <Text style={styles.count}>{list.length}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Agenda for the selected day */}
        <Text style={styles.agendaTitle}>{selected.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} />
            <Text style={styles.muted}>{t('calendar_screen.loading')}</Text>
          </View>
        ) : failed ? (
          renderFailed()
        ) : dayEvents.length === 0 ? (
          <Text style={[styles.muted, { paddingVertical: 12 }]}>{t('calendar_screen.noEventsDay')}</Text>
        ) : (
          dayEvents.map(e => renderEvent(e))
        )}
        </>
        )}
      </ScrollView>

      {/* Event detail */}
      <Modal visible={!!openEvent} transparent animationType="fade" onRequestClose={closeEvent}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={closeEvent}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          {openEvent && (
            <View style={styles.popup}>
              <View style={styles.popupHeader}>
                <View style={[styles.dot, { backgroundColor: toneColor(toneOf(openEvent)) }]} />
                <Text style={styles.popupSource}>
                  {(openEvent.isShared ? t('calendar_screen.sources.shared') : t(`calendar_screen.sources.${openEvent.source}`)).toUpperCase()}
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={closeEvent} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="x" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.popupTitle}>{openEvent.title}</Text>
              <View style={styles.popupRow}>
                <Feather name="calendar" size={15} color={theme.textSecondary} />
                <Text style={styles.popupText}>
                  {localDate(openEvent.start).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {openEvent.allDay ? '' : ` · ${timeText(openEvent)}`}
                </Text>
              </View>
              {openEvent.isShared && !!openEvent.ownerName && (
                <View style={styles.popupRow}>
                  <Feather name="users" size={15} color={theme.textSecondary} />
                  <Text style={[styles.popupText, { color: TONE_COLORS.shared }]}>
                    {t('calendar_screen.sharedBy', { name: openEvent.ownerName })}
                    <Text style={{ color: theme.textSecondary }}>
                      {' · '}
                      {openEvent.accessLevel === 'write' ? t('calendar_screen.access.edit') : t('calendar_screen.access.view')}
                    </Text>
                  </Text>
                </View>
              )}
              {!!openEvent.location && (
                <View style={styles.popupRow}>
                  <Feather name="map-pin" size={15} color={theme.textSecondary} />
                  <Text style={styles.popupText}>{openEvent.location}</Text>
                </View>
              )}
              {!!openEvent.description && <Text style={styles.description}>{openEvent.description}</Text>}
              {openEvent.isCompleted && <Text style={[styles.eventMeta, { color: '#16a34a', marginTop: 8 }]}>{t('calendar_screen.completed')}</Text>}
              {doneStep === 'view' && isOverdue(openEvent) && (
                <Text style={[styles.eventMeta, { color: OVERDUE_COLOR, marginTop: 8 }]}>{t('calendar_screen.overdue.notDone')}</Text>
              )}

              {doneStep === 'vaccine' && (
                <View style={{ marginTop: 12, gap: 8 }}>
                  <CustomDateTimePicker
                    label={t('calendar_screen.done.givenOn')}
                    value={givenOn}
                    onChange={v => setGivenOn(v instanceof Date ? v : v ? new Date(v) : null)}
                    mode="date"
                    maximumDate={new Date()}
                  />
                  <Text style={[styles.popupText, { fontFamily: FONTS.display_medium }]}>{t('calendar_screen.done.nextDue')}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { label: t('calendar_screen.done.inOneYear'), value: givenOn ? addYears(givenOn, 1) : null },
                      { label: t('calendar_screen.done.inThreeYears'), value: givenOn ? addYears(givenOn, 3) : null },
                      { label: t('calendar_screen.done.noNext'), value: null },
                    ].map(opt => {
                      const selected = (opt.value == null && nextOn == null) || (opt.value != null && nextOn != null && ymd(opt.value) === ymd(nextOn));
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          onPress={() => setNextOn(opt.value)}
                          style={[styles.secondaryBtn, selected && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                          accessibilityState={{ selected }}
                        >
                          <Text style={[styles.secondaryText, selected && { color: '#fff' }]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <CustomDateTimePicker
                    label={t('calendar_screen.done.nextDue')}
                    value={nextOn}
                    onChange={v => setNextOn(v instanceof Date ? v : v ? new Date(v) : null)}
                    mode="date"
                    minimumDate={givenOn ? addDays(givenOn, 1) : undefined}
                    clearable
                  />
                  <Text style={styles.muted}>{t('calendar_screen.done.vaccineHint')}</Text>
                </View>
              )}

              {doneStep === 'done' && (
                <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, borderRadius: 12, padding: 12, backgroundColor: 'rgba(22,163,74,0.1)' }}>
                  <Feather name="check" size={16} color="#16a34a" />
                  <Text style={[styles.popupText, { flex: 1, color: '#166534' }]}>{t('calendar_screen.done.newDateHint')}</Text>
                </View>
              )}

              {doneStep === 'vaccine' ? (
                <View style={styles.popupActions}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setDoneStep('view')}>
                    <Text style={styles.secondaryText}>{t('calendar_screen.done.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: theme.primary, opacity: doneSaving || !givenOn ? 0.6 : 1 }]}
                    disabled={doneSaving || !givenOn}
                    onPress={() => void saveVaccine()}
                  >
                    {doneSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryText}>{t('calendar_screen.done.save')}</Text>}
                  </TouchableOpacity>
                </View>
              ) : doneStep === 'done' ? (
                <View style={styles.popupActions}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={closeEvent}>
                    <Text style={styles.secondaryText}>{t('calendar_screen.done.notNow')}</Text>
                  </TouchableOpacity>
                  {action && (
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        closeEvent();
                        action.run();
                      }}
                    >
                      <Text style={styles.primaryText}>{t('calendar_screen.done.updateRecord')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
              <View style={styles.popupActions}>
                {canMarkDone(openEvent) && (
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: theme.primary }]}
                    disabled={doneSaving}
                    onPress={startDone}
                    accessibilityRole="button"
                  >
                    {doneSaving ? <ActivityIndicator size="small" color={theme.primary} /> : <Feather name="check" size={14} color={theme.primary} />}
                    <Text style={[styles.secondaryText, { color: theme.primary }]}>{t('calendar_screen.done.button')}</Text>
                  </TouchableOpacity>
                )}
                {canShare && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                      setShare({ seriesId: openEvent.seriesId!, title: openEvent.title });
                      closeEvent();
                    }}
                  >
                    <Feather name="share-2" size={14} color={theme.textPrimary} />
                    <Text style={styles.secondaryText}>{t('share_reminder.button')}</Text>
                  </TouchableOpacity>
                )}
                {action && (
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      closeEvent();
                      action.run();
                    }}
                  >
                    <Text style={styles.primaryText}>{action.label}</Text>
                  </TouchableOpacity>
                )}
              </View>
              )}
            </View>
          )}
        </View>
      </Modal>

      <ShareReminderModal seriesId={share?.seriesId ?? null} title={share?.title} onClose={() => setShare(null)} />
      {GateModal}
    </ScreenWrapper>
  );
};

export default CalendarScreen;

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    segment: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: 12, padding: 3, marginTop: 12 },
    segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 10 },
    segmentText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      backgroundColor: theme.inputBg,
    },
    searchInput: { flex: 1, paddingVertical: 9, fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    weekStrip: { flexDirection: 'row' },
    weekDay: { alignItems: 'center', paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
    hourRow: { flexDirection: 'row', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border, minHeight: 44 },
    hourLabel: { width: 52, fontSize: 11, fontFamily: FONTS.display_medium, color: theme.textSecondary, paddingTop: 6 },
    monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
    monthText: { flexShrink: 1, fontSize: 17, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    todayBtn: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    todayText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    chips: { gap: 8, paddingVertical: 12 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: { fontSize: 13, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    dot: { width: 7, height: 7, borderRadius: 4 },
    weekdays: { flexDirection: 'row' },
    weekday: { textAlign: 'center', fontSize: 12, fontFamily: FONTS.display_medium, color: theme.textSecondary, paddingVertical: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    day: { alignItems: 'center', paddingTop: 4, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
    dayNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    dots: { flexDirection: 'row', gap: 3, marginTop: 3, height: 7 },
    count: { fontSize: 9, fontFamily: FONTS.display_medium, color: theme.textSecondary, marginTop: 1 },
    agendaTitle: { fontSize: 16, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginTop: 16, marginBottom: 8 },
    center: { alignItems: 'center', gap: 8, paddingVertical: 20 },
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    event: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderLeftWidth: 4,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 8,
    },
    eventTime: { width: 64, fontSize: 12, fontFamily: FONTS.display_medium, color: theme.textSecondary },
    eventTitle: { fontSize: 15, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    completed: { textDecorationLine: 'line-through', color: theme.textSecondary },
    eventMeta: { fontSize: 12, fontFamily: FONTS.display_medium, marginTop: 2 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    popup: { backgroundColor: theme.background, borderRadius: 18, padding: 20 },
    popupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    popupSource: { fontSize: 12, letterSpacing: 0.5, fontFamily: FONTS.display_semi_bold, color: theme.textSecondary },
    popupTitle: { fontSize: 20, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary, marginTop: 8, marginBottom: 8 },
    popupRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
    popupText: { flex: 1, fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textPrimary },
    description: {
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.surface,
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
    popupActions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8, marginTop: 20 },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    secondaryText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    primaryBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
    overdueCard: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(220,38,38,0.35)',
      backgroundColor: 'rgba(220,38,38,0.06)',
      padding: 12,
    },
    overdueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
    primaryText: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: '#fff' },
  });
