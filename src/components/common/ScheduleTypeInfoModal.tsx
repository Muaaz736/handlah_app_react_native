import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserRole } from '../../hooks/useUserRole';
import { makeScheduleTypeInfoModalStyles } from './ScheduleTypeInfoModal.styles';
import { RoleTheme } from '../../types/roleManager.types';

interface ScheduleTypeInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const SCHEDULE_GUIDE_ITEMS: { key: string; icon: string }[] = [
  { key: 'one_time', icon: 'calendar-check-outline' },
  { key: 'daily', icon: 'calendar-sync-outline' },
  { key: 'weekly', icon: 'calendar-week' },
  { key: 'monthly', icon: 'calendar-month-outline' },
  { key: 'every_x_days', icon: 'calendar-refresh-outline' },
  { key: 'as_needed', icon: 'hand-back-right-outline' },
  { key: 'with_meals', icon: 'silverware-fork-knife' },
];

const ScheduleTypeInfoModal: React.FC<ScheduleTypeInfoModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeScheduleTypeInfoModalStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { textAlign: 'left' }]}>{t('schedule_guide.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { textAlign: 'left' }]}>{t('schedule_guide.subtitle')}</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {SCHEDULE_GUIDE_ITEMS.map(item => (
              <View key={item.key} style={styles.itemRow}>
                <View style={[styles.iconCircle, { backgroundColor: themeColors.primary + '15' }]}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={themeColors.primary} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemTitle, { textAlign: 'left' }]}>
                    {t(`schedule_guide.${item.key}.title`)}
                  </Text>
                  <Text style={[styles.itemDescription, { textAlign: 'left' }]}>
                    {t(`schedule_guide.${item.key}.description`)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.gotItButton, { backgroundColor: themeColors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.gotItButtonText}>{t('schedule_guide.got_it')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ScheduleTypeInfoModal;
