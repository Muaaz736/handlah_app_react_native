import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import {
  CustomInput,
  CustomDateTimePicker,
  PrimaryButton,
} from '../common';
import { UpdateReminderPayload } from '../../redux/services/reminderService';

export interface EditReminderModalProps {
  visible: boolean;
  reminder: any | null;
  onClose: () => void;
  onSave: (payload: UpdateReminderPayload) => void;
  isSaving?: boolean;
}

// "07:25 PM" -> Date
const parseTimeToDate = (timeStr?: string | null): Date | null => {
  if (!timeStr) return null;
  const m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = (m[3] || '').toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
};

// Date/ISO -> "07:25 PM"
const formatTimeForApi = (value: any): string => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const EditReminderModal: React.FC<EditReminderModalProps> = ({
  visible,
  reminder,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [reminderDate, setReminderDate] = useState<any>(null);
  const [reminderTime, setReminderTime] = useState<any>(null);

  // Prefill whenever a new reminder is opened.
  useEffect(() => {
    if (!reminder) return;
    setTitle(reminder.title || '');
    setMessage(reminder.message || '');
    setReminderDate(reminder.reminderdate ? new Date(reminder.reminderdate) : null);
    setReminderTime(parseTimeToDate(reminder.remindertime));
  }, [reminder]);

  const handleSave = (): void => {
    // Severity & recurrence are managed automatically by the backend.
    onSave({
      title: title.trim(),
      message: message.trim(),
      reminderDate: reminderDate ? new Date(reminderDate).toISOString() : '',
      reminderTime: formatTimeForApi(reminderTime),
      isRecurring: !!reminder?.isrecurring,
    });
  };

  let isDateValid = true;
  let isTimeValid = true;

  if (reminderDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selDate = new Date(reminderDate);
    selDate.setHours(0, 0, 0, 0);
    if (selDate < today) {
      isDateValid = false;
    } else if (selDate.getTime() === today.getTime() && reminderTime) {
      const selTime = new Date(reminderTime);
      if (!isNaN(selTime.getTime())) {
        const currentHours = new Date().getHours();
        const currentMinutes = new Date().getMinutes();
        if (selTime.getHours() < currentHours || (selTime.getHours() === currentHours && selTime.getMinutes() < currentMinutes)) {
          isTimeValid = false;
        }
      }
    }
  }

  const canSave = !!title.trim() && !!reminderDate && !!reminderTime && isDateValid && isTimeValid && !isSaving;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: themeColors?.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.5)' }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: themeColors.background }]}>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
                  {t('reminders_screen.edit_reminder', { defaultValue: 'Edit Reminder' })}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={themeColors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <CustomInput
                  label={t('common.title', { defaultValue: 'Title' })}
                  placeholder={t('common.title', { defaultValue: 'Title' })}
                  value={title}
                  onChangeText={setTitle}
                />
                <CustomInput
                  label={t('common.message', { defaultValue: 'Message' })}
                  placeholder={t('common.message', { defaultValue: 'Message' })}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />

                <CustomDateTimePicker
                  label={t('reminders_screen.reminder_date') || 'Reminder Date'}
                  placeholder={t('common.select') || 'Select'}
                  value={reminderDate}
                  onChange={(val: any) => setReminderDate(val)}
                  mode="date"
                  displayFormat="MM/DD/YYYY"
                  suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                />
                {!isDateValid && (
                  <Text style={{ color: colors.error, fontSize: 12, marginTop: -12, marginBottom: 12, marginLeft: 4 }}>
                    Date cannot be in the past
                  </Text>
                )}

                <CustomDateTimePicker
                  label={t('reminders_screen.reminder_time') || 'Reminder Time'}
                  placeholder={t('common.select') || 'Select'}
                  value={reminderTime}
                  onChange={(val: any) => setReminderTime(val)}
                  mode="time"
                  suffixIcon={<Ionicons name="time-outline" size={20} color={themeColors.textSecondary} />}
                />
                {!isTimeValid && (
                  <Text style={{ color: colors.error, fontSize: 12, marginTop: -12, marginBottom: 12, marginLeft: 4 }}>
                    Time cannot be in the past for today
                  </Text>
                )}
              </ScrollView>

              <PrimaryButton
                title={t('common.save') || 'Save'}
                onPress={handleSave}
                loading={isSaving}
                disabled={!canSave}
                buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EditReminderModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.display_bold,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: colors.text,
    marginBottom: 6,
    marginTop: 4,
    textAlign: 'left',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: colors.text,
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 16,
  },
});
