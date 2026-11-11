import React, { useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import MixedMediaDisplayer from '../common/MixedMediaDisplayer';
import { makeViewIllnessModalStyles } from './ViewIllnessModal.styles';
import { formatDate } from '../../utils/helpers';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

interface PetMedication {
  id?: number;
  name?: string;
  dose?: string;
  doseunit?: string;
  doseunitlabel?: string;
  scheduletype?: string;
  times?: string[];
  startdate?: string;
  enddate?: string;
  notes?: string;
  photourl?: string[];
  [key: string]: any;
}

interface ViewPetMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  medication: PetMedication | null;
}

const ViewPetMedicationModal: React.FC<ViewPetMedicationModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  medication,
}) => {
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeViewIllnessModalStyles(themeColors as RoleTheme), [themeColors]);

  const name = medication?.name || '-';
  const dose = medication?.dose;
  const doseUnit = medication?.doseunitlabel;
  const doseDisplay = [dose, doseUnit].filter(Boolean).join(' ') || '-';
  const scheduleType = medication?.scheduletype || '-';
  const times = Array.isArray(medication?.times)
    ? medication!.times.join(', ')
    : medication?.times || '-';
  const startDate = medication?.startdate ? formatDate(medication.startdate) : '-';
  const endDate = medication?.enddate ? formatDate(medication.enddate) : '-';
  const notes = medication?.notes;
  const photoIds: string[] = Array.isArray(medication?.photourl)
    ? (medication!.photourl as string[])
    : [];

  return (
    <Modal
      visible={visible && medication !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.topIconContainer}>
            <View style={styles.topIconCircle}>
              <MaterialCommunityIcons name="pill" size={26} color={themeColors.background} />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerTitle}>{name}</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Dosage & Schedule */}
            <Text style={styles.sectionTitle}>
              {t('pets.dosage_schedule', { defaultValue: 'Dosage & Schedule' })}
            </Text>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.dose', { defaultValue: 'Dose' })}</Text>
                <Text style={styles.value}>{doseDisplay}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.schedule_type', { defaultValue: 'Schedule Type' })}</Text>
                <Text style={styles.value}>{scheduleType}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('health_tracker.times', { defaultValue: 'Times' })}</Text>
                <Text style={styles.value}>{times}</Text>
              </View>
            </View>

            {/* Timeline */}
            <Text style={styles.sectionTitle}>
              {t('health_tracker.timeline', { defaultValue: 'Timeline' })}
            </Text>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('health_tracker.start_date', { defaultValue: 'Start Date' })}</Text>
                <Text style={styles.value}>{startDate}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('health_tracker.end_date', { defaultValue: 'End Date' })}</Text>
                <Text style={styles.value}>{endDate}</Text>
              </View>
            </View>

            {/* Notes */}
            {!!notes && (
              <View style={styles.singleRow}>
                <Text style={styles.label}>{t('pets.notes', { defaultValue: 'Notes' })}</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{notes}</Text>
                </View>
              </View>
            )}

            {/* Photos */}
            {photoIds.length > 0 && (
              <View style={styles.singleRow}>
                <Text style={styles.label}>{t('health_tracker.attachments', { defaultValue: 'Attachments' })}</Text>
                <MixedMediaDisplayer attachmentIds={photoIds} imageHeight={140} />
              </View>
            )}
            </RecordViewTabs>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              title={t('common.close', { defaultValue: 'Close' })}
              onPress={onClose}
              buttonStyle={styles.closeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ViewPetMedicationModal;
