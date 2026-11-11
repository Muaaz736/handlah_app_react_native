import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useUserRole } from '../../../hooks/useUserRole';
import { getColorWithOpacity } from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import type { RoleTheme } from '../../../types/roleManager.types';
import CalendarScreen from './Calendar';
import Reminders from '../Reminders/Reminders';

export type CalendarHubSegment = 'calendar' | 'reminders';

type HubParams = {
  Reminders: { segment?: CalendarHubSegment; openReminderId?: number; openReminderEntityType?: string } | undefined;
};

/**
 * The bottom-bar "Calendar" tab: the calendar and the reminders list in one place, with a switch at the top.
 * The tab keeps the route name "Reminders" so every existing link to reminders (notifications, the daily
 * brief, the calendar's "Open reminder") still lands here; those links open the Reminders side.
 */
const CalendarHub = (): React.ReactElement => {
  const route = useRoute<RouteProp<HubParams, 'Reminders'>>();
  const params = route.params;
  const [segment, setSegment] = useState<CalendarHubSegment>(() => pickSegment(params) ?? 'calendar');

  useEffect(() => {
    const next = pickSegment(params);
    if (next) setSegment(next);
  }, [params]);

  const switcher = <SegmentSwitch value={segment} onChange={setSegment} />;

  return segment === 'calendar'
    ? <CalendarScreen embedded topSlot={switcher} />
    : <Reminders embedded topSlot={switcher} />;
};

function pickSegment(params: HubParams['Reminders']): CalendarHubSegment | null {
  if (!params) return null;
  if (params.segment) return params.segment;
  if (params.openReminderId != null) return 'reminders';
  return null;
}

const SegmentSwitch: React.FC<{ value: CalendarHubSegment; onChange: (v: CalendarHubSegment) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const pending: number = useSelector((state: any) => state.reminder_slice?.pending_reminders_count ?? 0);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const items: { key: CalendarHubSegment; label: string; icon: string; count?: number }[] = [
    { key: 'calendar', label: t('calendar_hub.calendar'), icon: 'calendar' },
    { key: 'reminders', label: t('calendar_hub.reminders'), icon: 'bell', count: pending },
  ];

  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {items.map(item => {
        const active = item.key === value;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.pill, active && { backgroundColor: theme.primary }]}
            onPress={() => onChange(item.key)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
          >
            <Feather name={item.icon} size={15} color={active ? '#ffffff' : theme.textPrimary} />
            <Text style={[styles.label, { color: active ? '#ffffff' : theme.textPrimary }]}>{item.label}</Text>
            {item.count != null && item.count > 0 && (
              <View style={[styles.count, { backgroundColor: active ? '#ffffff' : theme.primary }]}>
                <Text style={[styles.countText, { color: active ? theme.primary : '#ffffff' }]}>
                  {item.count > 99 ? '99+' : item.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

function makeStyles(theme: RoleTheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 4,
      padding: 4,
      gap: 4,
      borderRadius: 999,
      backgroundColor: getColorWithOpacity(theme.primary, 0.1),
      borderWidth: 1,
      borderColor: theme.border,
    },
    pill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 9,
      borderRadius: 999,
    },
    label: { fontSize: 14, fontFamily: FONTS.display_semi_bold },
    count: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 11, fontFamily: FONTS.display_semi_bold },
  });
}

export default CalendarHub;
