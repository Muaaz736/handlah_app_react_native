import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FONTS from '../../utils/fonts';
import { useUserRole } from '../../hooks/useUserRole';
import type { RoleTheme } from '../../types/roleManager.types';
import calendarService, { type ReminderSharePerson } from '../../services/calendar';
import { showErrorToast, showSuccessToast } from '../common/CustomToast';

interface ShareReminderModalProps {
  /** The custom reminder (series) to share; null keeps the pop-up closed. */
  seriesId: number | null;
  /** The reminder's text, shown under the heading. */
  title?: string;
  onClose: () => void;
}

/**
 * Pick which connections a custom reminder is shared with (as on the web). Shared reminders show on those people's
 * calendars, view only. Saving sends the whole list, so unticking someone stops sharing with them.
 */
export function ShareReminderModal({ seriesId, title, onClose }: ShareReminderModalProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { themeColors } = useUserRole();
  const theme = themeColors as RoleTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [people, setPeople] = useState<ReminderSharePerson[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (seriesId == null) return;
    let cancelled = false;
    setPeople(null);
    setFailed(false);
    calendarService
      .getReminderShares(seriesId)
      .then(list => {
        if (cancelled) return;
        setPeople(list);
        setSelected(new Set(list.filter(p => p.isShared).map(p => p.userId)));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  const toggle = (userId: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  const save = async () => {
    if (seriesId == null) return;
    setSaving(true);
    try {
      await calendarService.setReminderShares(seriesId, [...selected]);
      showSuccessToast(t('share_reminder.saved'));
      onClose();
    } catch {
      showErrorToast(t('share_reminder.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={seriesId != null} transparent animationType="fade" onRequestClose={() => !saving && onClose()}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => !saving && onClose()}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('share_reminder.title')}</Text>
            <TouchableOpacity onPress={onClose} disabled={saving} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          {!!title && <Text style={styles.subtitle} numberOfLines={1}>{title}</Text>}
          <Text style={styles.help}>{t('share_reminder.help')}</Text>

          <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 8 }}>
            {!people && !failed && (
              <View style={styles.loading}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.muted}>{t('share_reminder.loading')}</Text>
              </View>
            )}
            {failed && <Text style={[styles.muted, { color: '#D32F2F' }]}>{t('share_reminder.loadFailed')}</Text>}
            {people && people.length === 0 && (
              <View style={{ gap: 8 }}>
                <Text style={styles.muted}>{t('share_reminder.noConnections')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    navigation.navigate('Dashboard', { screen: 'Connections' });
                  }}
                >
                  <Text style={[styles.link, { color: theme.primary }]}>{t('share_reminder.connections')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {people?.map(p => {
              const on = selected.has(p.userId);
              return (
                <TouchableOpacity
                  key={p.userId}
                  style={[styles.person, on && { borderColor: theme.primary }]}
                  onPress={() => toggle(p.userId)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                >
                  <View style={[styles.box, on && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                    {on && <Feather name="check" size={14} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                    {!!p.email && p.email !== p.name && <Text style={styles.muted} numberOfLines={1}>{p.email}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.muted}>{people && people.length > 0 ? t('share_reminder.selected', { count: selected.size }) : ''}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
                <Text style={styles.cancelText}>{t('share_reminder.cancel')}</Text>
              </TouchableOpacity>
              {people && people.length > 0 && (
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme.primary }, saving && { opacity: 0.6 }]}
                  onPress={save}
                  disabled={saving}
                >
                  {saving && <ActivityIndicator size="small" color="#fff" />}
                  <Text style={styles.saveText}>{saving ? t('share_reminder.saving') : t('share_reminder.save')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: theme.background, borderRadius: 18, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 19, fontFamily: FONTS.display_semi_bold, color: theme.textPrimary },
    subtitle: { fontSize: 14, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 2 },
    help: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary, marginTop: 8, marginBottom: 12 },
    loading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
    muted: { fontSize: 13, fontFamily: FONTS.display_regular, color: theme.textSecondary },
    link: { fontSize: 14, fontFamily: FONTS.display_semi_bold },
    person: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.surface,
    },
    box: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: { fontSize: 15, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 8 },
    cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
    cancelText: { fontSize: 14, fontFamily: FONTS.display_medium, color: theme.textPrimary },
    saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    saveText: { fontSize: 14, fontFamily: FONTS.display_semi_bold, color: '#fff' },
  });
