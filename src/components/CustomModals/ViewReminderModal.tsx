import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { makeViewReminderModalStyles } from './ViewReminderModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { CLOSED_LOOK, ClosedAs, formatTimeOfDay } from '../../redux/services/reminderV2';

export interface ViewReminderModalProps {
  visible: boolean;
  onClose: () => void;
  reminder: any | null;
  onMarkAsCompleted?: () => void;
  isMarkingCompleted?: boolean;
  /** New engine: close the reminder without doing it. Hidden when not provided. */
  onDismiss?: () => void;
  isDismissing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  onViewDetails?: () => void;
  /** Custom reminders (new engine): share with connections. Hidden when not provided. */
  onShare?: () => void;
}

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

const formatTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const capitalize = (s?: string | null): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

const InfoRow = ({
  label,
  value,
  themeColor,
  style,
}: {
  label: string;
  value: string;
  themeColor?: string;
  style: ReturnType<typeof makeViewReminderModalStyles>;
}) => (
  <View style={style.infoRow}>
    <Text style={style.label}>{label}</Text>
    <Text style={[style.value, themeColor ? { color: themeColor } : null]}>
      {value}
    </Text>
  </View>
);

const ViewReminderModal: React.FC<ViewReminderModalProps> = ({
  visible,
  onClose,
  reminder,
  onMarkAsCompleted,
  isMarkingCompleted = false,
  onDismiss,
  isDismissing = false,
  onEdit,
  onDelete,
  onShare,
  isDeleting = false,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewReminderModalStyles(themeColors as RoleTheme), [themeColors]);

  if (!reminder) return null;

  const isRecurring: boolean = !!reminder.isrecurring;
  const isActive: boolean = reminder.isactive !== false;
  const isCompleted: boolean =
    reminder._tabStatus === 'completed' ||
    reminder.status === 'completed' ||
    reminder.reminderStatus === 'completed' ||
    reminder.status === 'dismissed' ||
    reminder.status === 'expired' ||
    !!reminder.completedat;

  // How it ended (new engine history), if it did.
  const closedKind: ClosedAs | null =
    reminder.closedas === 'dismissed' || reminder.status === 'dismissed' ? 'dismissed'
    : reminder.closedas === 'expired' || reminder.status === 'expired' ? 'expired'
    : isCompleted ? 'completed'
    : null;
  const closedLook = closedKind ? CLOSED_LOOK[closedKind] : null;
  const timeText = formatTimeOfDay(reminder.remindertime);
  const closedOnLabel = closedKind === 'dismissed'
    ? t('reminders_screen.dismissed_on', { defaultValue: 'Dismissed On' })
    : closedKind === 'expired'
      ? t('reminders_screen.expired_on', { defaultValue: 'Expired On' })
      : t('reminders_screen.completed_on', { defaultValue: 'Completed On' });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View
                style={[
                  styles.header,
                  {
                    backgroundColor: getColorWithOpacity(
                      themeColors.primary,
                      0.1,
                    ),
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: themeColors.primary },
                  ]}
                >
                  <Ionicons
                    name="alarm-outline"
                    size={28}
                    color={themeColors.background}
                  />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title} numberOfLines={2}>
                    {reminder.title ||
                      t('reminders_screen.untitled') ||
                      'Reminder'}
                  </Text>
                  {closedLook ? (
                    <View style={[styles.statusBadge, { backgroundColor: closedLook.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <Ionicons name={closedLook.icon} size={13} color={closedLook.fg} />
                      <Text style={[styles.statusText, { color: closedLook.fg }]}>
                        {t(`reminders_screen.closed_${closedKind}`, { defaultValue: closedLook.label })}
                      </Text>
                    </View>
                  ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isActive
                          ? getColorWithOpacity(themeColors.primary, 0.5)
                          : colors.lightGray,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isActive ? colors.black : colors.gray },
                      ]}
                    >
                      {isActive
                        ? t('reminders_screen.active') || 'Active'
                        : t('reminders_screen.inactive') || 'Inactive'}
                    </Text>
                  </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color={themeColors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.body}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bodyContent}
              >
                {/* Message */}
                {!!reminder.message && (
                  <View
                    style={[
                      styles.messageBox,
                      {
                        backgroundColor: getColorWithOpacity(
                          themeColors.primary,
                          0.06,
                        ),
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="message-text-outline"
                      size={18}
                      color={themeColors.primary}
                    />
                    <Text style={styles.messageText}>{reminder.message}</Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* Details */}

                <InfoRow
                  label={t('reminders_screen.reminder_date') || 'Reminder Date'}
                  value={formatDate(reminder.reminderdate)}
                  style={styles}
                />

                {!!timeText && (
                  <InfoRow
                    label={t('reminders_screen.reminder_time', { defaultValue: 'Time' })}
                    value={timeText}
                    style={styles}
                  />
                )}

                {!!reminder.forname && (
                  <InfoRow
                    label={t('reminders_screen.for_whom', { defaultValue: 'For' })}
                    value={String(reminder.forname)}
                    style={styles}
                  />
                )}


                {isRecurring && !!reminder.recurrencepattern && (
                  <InfoRow
                    label={
                      t('reminders_screen.recurrence_pattern') ||
                      'Recurrence Pattern'
                    }
                    value={capitalize(reminder.recurrencepattern)}
                    style={styles}
                  />
                )}

                <InfoRow
                  label={
                    t('reminders_screen.notification_count') ||
                    'Notifications Sent'
                  }
                  value={String(reminder.notificationcount ?? 0)}
                  style={styles}
                />
                {isCompleted && !!(reminder.completedat || reminder.completedAt) && (
                  <InfoRow
                    label={closedOnLabel}
                    value={formatDate(reminder.completedat || reminder.completedAt)}
                    themeColor={themeColors.primary}
                    style={styles}
                  />
                )}
              </ScrollView>

              {/* View Details — deep-link to the linked module record */}
              {!!onViewDetails && (
                <TouchableOpacity
                  style={[
                    styles.viewDetailsButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  onPress={onViewDetails}
                  activeOpacity={0.85}
                >
                  <Ionicons name="open-outline" size={18} color={themeColors.background} />
                  <Text style={styles.viewDetailsText}>
                    {t('reminders_screen.view_details', {
                      defaultValue: 'View Details',
                    })}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Edit / Delete — only for ad_hoc reminders */}
              {!closedKind && (!!onEdit || !!onDelete || !!onShare) && (
                <View style={styles.actionRow}>
                  {!!onShare && (
                    <TouchableOpacity
                      style={[styles.markCompletedButton, { borderColor: themeColors.primary }]}
                      onPress={onShare}
                      activeOpacity={0.8}
                      disabled={isDeleting}
                    >
                      <Ionicons name="share-social-outline" size={18} color={themeColors.primary} />
                      <Text style={[styles.markCompletedText, { color: themeColors.primary }]}>
                        {t('share_reminder.button')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!!onEdit && (
                    <TouchableOpacity
                      style={[styles.markCompletedButton, { borderColor: themeColors.primary }]}
                      onPress={onEdit}
                      activeOpacity={0.8}
                      disabled={isDeleting}
                    >
                      <Ionicons name="create-outline" size={18} color={themeColors.primary} />
                      <Text style={[styles.markCompletedText, { color: themeColors.primary }]}>
                        {t('common.edit', { defaultValue: 'Edit' })}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!!onDelete && (
                    <TouchableOpacity
                      style={[styles.markCompletedButton, { borderColor: colors.error }]}
                      onPress={onDelete}
                      activeOpacity={0.8}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                          <Text style={[styles.markCompletedText, { color: colors.error }]}>
                            {t('common.delete') || 'Delete'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={[styles.actionRow, { flexWrap: 'wrap' }]}>
                {/* Dismiss: close it without doing it (new engine, open reminders only) */}
                {!closedKind && !!onDismiss && (
                  <TouchableOpacity
                    style={[styles.markCompletedButton, { borderColor: colors.gray }, isDismissing && { opacity: 0.6 }]}
                    onPress={onDismiss}
                    activeOpacity={0.8}
                    disabled={isDismissing}
                  >
                    {isDismissing ? (
                      <ActivityIndicator size="small" color={colors.gray} />
                    ) : (
                      <>
                        <Ionicons name="close-circle-outline" size={18} color={colors.gray} />
                        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.markCompletedText, { color: colors.gray }]}>
                          {t('common.dismiss', { defaultValue: 'Dismiss' })}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {!isCompleted && !!onMarkAsCompleted && (
                  <TouchableOpacity
                    style={[
                      styles.markCompletedButton,
                      { borderColor: themeColors.primary },
                      isMarkingCompleted && { opacity: 0.6 },
                    ]}
                    onPress={onMarkAsCompleted}
                    activeOpacity={0.8}
                    disabled={isMarkingCompleted}
                  >
                    {isMarkingCompleted ? (
                      <ActivityIndicator
                        size="small"
                        color={themeColors.primary}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color={themeColors.primary}
                        />
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          style={[
                            styles.markCompletedText,
                            { color: themeColors.primary },
                          ]}
                        >
                          {t('common.mark_as_completed', { defaultValue: 'Mark as Completed' })}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: themeColors.primary },
                    !isCompleted && !!onMarkAsCompleted && !onDismiss && { flex: 0, paddingHorizontal: 20 },
                    // With Dismiss and Complete side by side, Close sits on its own full-width row below them.
                    !isCompleted && !!onMarkAsCompleted && !!onDismiss && { flexBasis: '100%', margin: 0, marginTop: 2 },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>
                    {t('common.close') || 'Close'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewReminderModal;
