import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import colors, { getColorWithOpacity } from '../../utils/colors';
import FONTS from '../../utils/fonts';
import {
  NormalizedReminderGroup,
  isAdHocGroup,
} from '../../redux/services/reminderService';
import { CLOSED_LOOK, ClosedAs, formatTimeOfDay } from '../../redux/services/reminderV2';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ReminderGroupCardProps {
  group: NormalizedReminderGroup;
  themeColors: any;
  onView: (reminder: any, group: NormalizedReminderGroup) => void;
  onEdit: (group: NormalizedReminderGroup) => void;
  onDelete: (group: NormalizedReminderGroup) => void;
  onToggleActive: (group: NormalizedReminderGroup, next: boolean) => void;
  onMarkComplete?: (group: NormalizedReminderGroup) => void;
  onDismiss?: (group: NormalizedReminderGroup) => void;
  showActiveToggle?: boolean;
  isMutating?: boolean;
}

const ROW_CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  sent: { bg: '#E8EEF9', fg: '#3E5C9A', label: 'Sent' },
  skipped: { bg: '#ECECEF', fg: '#5F6368', label: 'Skipped' },
  pastDue: { bg: '#FBEBD3', fg: '#B26A00', label: 'Past due' },
  dueToday: { bg: '#FDE7E7', fg: '#C23B3B', label: 'Today' },
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#E5484D',
  warning: '#F5A623',
  info: '#3E8EDE',
};

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const pickField = (obj: any, ...keys: string[]): any => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
    const lower = k.toLowerCase();
    if (obj?.[lower] !== undefined && obj?.[lower] !== null) return obj[lower];
  }
  return undefined;
};

const formatHeaderDate = (iso: string | null | undefined, timeStr: string | null | undefined) => {
  const dateStr = formatDate(iso);
  if (!timeStr) {
    if (iso) {
      const d = new Date(iso);
      const today = new Date();
      if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        return 'Today';
      }
    }
    return dateStr;
  }

  if (iso) {
    const d = new Date(iso);
    const today = new Date();
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      return `Today • ${timeStr}`;
    }
  }
  return `${dateStr} • ${timeStr}`;
};

const ReminderGroupCard: React.FC<ReminderGroupCardProps> = ({
  group,
  themeColors,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onMarkComplete,
  onDismiss,
  showActiveToggle = true,
  isMutating = false,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const isBatch = group.count > 1 && !!group.batchId;
  const adHoc = isAdHocGroup(group);
  const isItem = group.kind === 'item';
  const canMarkComplete = !!onMarkComplete && (!isBatch || isItem);
  const closedKinds = Array.from(new Set(group.reminders.map((r: any) => pickField(r, 'closedAs')).filter(Boolean))) as string[];
  const canDismiss = !!onDismiss && (!isBatch || isItem || adHoc);
  const canDelete = group.canDelete !== false;
  const severityColor = group.severity
    ? SEVERITY_COLOR[group.severity.toLowerCase()]
    : undefined;

  const handleHeaderPress = (): void => {
    if (isBatch) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(prev => !prev);
    } else {
      onView(group.reminders[0] ?? group, group);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: themeColors.surface},
        !group.isActive && styles.cardInactive,
      ]}
    >
      <TouchableOpacity
        style={styles.headerRow}
        onPress={handleHeaderPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {!!severityColor && (
            <View
              style={[styles.severityDot, { backgroundColor: severityColor }]}
            />
          )}
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {group.title || t('reminders_screen.untitled', { defaultValue: 'Reminder' })}
            </Text>
            {!!group.forName && (
              <Text style={[styles.subtitle, { color: themeColors.primary }]} numberOfLines={1}>
                {group.forName}
              </Text>
            )}
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {(() => {
                const rTime = formatTimeOfDay(pickField(group.reminders?.[0], 'reminderTime', 'remindertime'));
                const formatted = formatHeaderDate(group.nearestReminderDate, rTime);
                return isBatch && closedKinds.length === 0
                  ? t('reminders_screen.next_on', {
                    defaultValue: `Next: ${formatted}`,
                    date: formatted,
                  })
                  : formatted;
              })()}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isBatch && (
            <View
              style={[
                styles.countChip,
                { backgroundColor: getColorWithOpacity(themeColors.primary, 0.12) },
              ]}
            >
              <Text style={[styles.countChipText, { color: themeColors.primary }]}>
                {group.count}
              </Text>
            </View>
          )}
          {closedKinds.map(k => {
            const look = CLOSED_LOOK[k as ClosedAs];
            if (!look) return null;
            return (
              <View key={k} style={[styles.closedChip, { backgroundColor: look.bg }]}>
                <Ionicons name={look.icon} size={11} color={look.fg} />
                <Text style={[styles.closedChipText, { color: look.fg }]}>
                  {t(`reminders_screen.closed_${k}`, { defaultValue: look.label })}
                </Text>
              </View>
            );
          })}
          {!group.isActive && closedKinds.length === 0 && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>
                {t('reminders_screen.inactive', { defaultValue: 'Off' })}
              </Text>
            </View>
          )}
          <Ionicons
            name={
              isBatch
                ? expanded
                  ? 'chevron-up'
                  : 'chevron-down'
                : 'chevron-forward'
            }
            size={20}
            color={colors.gray}
          />
        </View>
      </TouchableOpacity>

      {isBatch && expanded && (
        <View style={styles.childrenWrap}>
          {group.reminders.map((child: any, idx: number) => {
            const childDate = pickField(child, 'reminderDate', 'reminderdate');
            const childTime = formatTimeOfDay(pickField(child, 'reminderTime', 'remindertime'));
            const childClosed = pickField(child, 'closedAs') as ClosedAs | undefined;
            const childLabel = pickField(child, 'rowLabel') as string | undefined;
            const childRowStatus = pickField(child, 'rowStatus') as string | undefined;
            const rowChip = !childClosed && childRowStatus ? ROW_CHIP[childRowStatus] : undefined;
            const childLook = childClosed ? CLOSED_LOOK[childClosed] : undefined;
            return (
              <TouchableOpacity
                key={String(pickField(child, 'id') ?? idx)}
                style={styles.childRow}
                onPress={() => onView(child, group)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="ellipse"
                  size={7}
                  color={themeColors.primary}
                  style={styles.childDot}
                />
                <Text style={[styles.childDate, { color: themeColors.textPrimary }]}>{formatDate(childDate)}</Text>
                {!!childLabel && (
                  <Text style={[styles.childTime, { marginLeft: 8, flexShrink: 1 }]} numberOfLines={1}>{childLabel}</Text>
                )}
                {!!rowChip && (
                  <View style={[styles.closedChip, { backgroundColor: rowChip.bg, marginLeft: 8, marginRight: 0 }]}>
                    <Text style={[styles.closedChipText, { color: rowChip.fg }]}>
                      {t(`reminders_screen.row_${childRowStatus}`, { defaultValue: rowChip.label })}
                    </Text>
                  </View>
                )}
                {!!childTime && (
                  <Text style={styles.childTime}>{String(childTime)}</Text>
                )}
                {!!childLook && (
                  <View style={[styles.closedChip, { backgroundColor: childLook.bg, marginLeft: 8, marginRight: 0 }]}>
                    <Ionicons name={childLook.icon} size={11} color={childLook.fg} />
                    <Text style={[styles.closedChipText, { color: childLook.fg }]}>
                      {t(`reminders_screen.closed_${childClosed}`, { defaultValue: childLook.label })}
                    </Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.gray}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {(adHoc || canMarkComplete || canDismiss) && (
        <View
          style={[
            styles.actionRow,
            !(adHoc && showActiveToggle) && styles.actionRowEnd,
          ]}
        >
          {adHoc && showActiveToggle && (
            <View style={styles.toggleWrap}>
              <Text style={styles.toggleLabel}>
                {group.isActive
                  ? t('reminders_screen.active', { defaultValue: 'Active' })
                  : t('reminders_screen.inactive', { defaultValue: 'Inactive' })}
              </Text>
              <View style={{ elevation: 10, shadowColor: colors.gray, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}>
                <Switch
                  value={group.isActive}
                  onValueChange={next => onToggleActive(group, next)}
                  disabled={isMutating}
                  trackColor={{ false: colors.border, true: themeColors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            {canMarkComplete && (
              <TouchableOpacity
                style={[styles.markBtn, { borderColor: themeColors.primary }]}
                onPress={() => onMarkComplete(group)}
                disabled={isMutating}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={15}
                  color={themeColors.primary}
                />
                <Text style={[styles.markBtnText, { color: themeColors.primary }]}>
                  {t(group.isActive ? 'common.complete' : 'common.completed', { defaultValue: group.isActive ? 'Complete' : 'Completed' })}
                </Text>
              </TouchableOpacity>
            )}
            {canDismiss && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => onDismiss!(group)}
                disabled={isMutating}
                accessibilityLabel={t('common.dismiss', { defaultValue: 'Dismiss' })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x-circle" size={17} color={colors.gray} />
              </TouchableOpacity>
            )}
            {adHoc && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => onEdit(group)}
                disabled={isMutating}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="edit-2" size={17} color={themeColors.primary} />
              </TouchableOpacity>
            )}
            {adHoc && canDelete && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => onDelete(group)}
                disabled={isMutating}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isMutating ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Feather name="trash-2" size={17} color={colors.error} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ReminderGroupCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.display_bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: colors.gray,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countChip: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  countChipText: {
    fontSize: 12,
    fontFamily: FONTS.display_bold,
  },
  inactiveBadge: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 8,
  },
  closedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 6,
  },
  closedChipText: {
    fontSize: 10,
    fontFamily: FONTS.display_semi_bold,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.display_medium,
    color: colors.gray,
  },
  childrenWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  childDot: {
    marginRight: 10,
  },
  childDate: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
  },
  childTime: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: colors.gray,
    marginLeft: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionRowEnd: {
    justifyContent: 'flex-end',
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: colors.gray,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 2,
  },
  markBtnText: {
    fontSize: 12,
    fontFamily: FONTS.display_semi_bold,
  },
});
