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
import { convert24HourTo12Hour, formatDate } from '../../utils/helpers';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

interface PetVetAppointment {
  id?: number;
  date?: string;
  time?: string;
  clinic?: string;
  vet?: string;
  reason?: string;
  outcome?: string;
  nextsteps?: string;
  notes?: string;
  photourl?: string[];
  [key: string]: any;
}

interface ViewPetVetAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: PetVetAppointment | null;
}

const ViewPetVetAppointmentModal: React.FC<ViewPetVetAppointmentModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  appointment,
}) => {
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeViewIllnessModalStyles(themeColors as RoleTheme), [themeColors]);

  const clinic = appointment?.clinic || '-';
  const vet = appointment?.vet || '-';
  const date = appointment?.date ? formatDate(appointment.date) : '-';
  const time = appointment?.time ? convert24HourTo12Hour(appointment.time) : '-';
  const reason = appointment?.reason;
  const outcome = appointment?.outcome;
  const nextSteps = appointment?.nextsteps;
  const notes = appointment?.notes;
  const photoIds: string[] = Array.isArray(appointment?.photourl)
    ? (appointment!.photourl as string[])
    : [];

  return (
    <Modal
      visible={visible && appointment !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.topIconContainer}>
            <View style={styles.topIconCircle}>
              <MaterialCommunityIcons name="calendar-clock" size={26} color={themeColors.background} />
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
                <Text style={styles.headerTitle}>
                  {t('pets.vet_appointment_details', { defaultValue: 'Vet Appointment' })}
                </Text>
                {!!clinic && clinic !== '-' && (
                  <Text style={styles.headerSubtitle}>{clinic}</Text>
                )}
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Clinic & Vet */}
            <Text style={styles.sectionTitle}>
              {t('pets.appointment_info', { defaultValue: 'Appointment Info' })}
            </Text>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.clinic', { defaultValue: 'Clinic' })}</Text>
                <Text style={styles.value}>{clinic}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.vet', { defaultValue: 'Veterinarian' })}</Text>
                <Text style={styles.value}>{vet}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('common.date', { defaultValue: 'Date' })}</Text>
                <Text style={styles.value}>{date}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('common.time', { defaultValue: 'Time' })}</Text>
                <Text style={styles.value}>{time}</Text>
              </View>
            </View>

            {/* Outcome */}
            {(!!reason || !!outcome) && (
              <>
                <Text style={styles.sectionTitle}>
                  {t('pets.outcome_section', { defaultValue: 'Outcome' })}
                </Text>
                <View style={styles.gridRow}>
                  {!!reason && (
                    <View style={styles.gridItem}>
                      <Text style={styles.label}>{t('pets.reason', { defaultValue: 'Reason' })}</Text>
                      <Text style={styles.value}>{reason}</Text>
                    </View>
                  )}
                  {!!outcome && (
                    <View style={styles.gridItem}>
                      <Text style={styles.label}>{t('pets.outcome', { defaultValue: 'Outcome' })}</Text>
                      <Text style={styles.value}>{outcome}</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Next Steps */}
            {!!nextSteps && (
              <View style={styles.singleRow}>
                <Text style={styles.label}>{t('pets.next_steps', { defaultValue: 'Next Steps' })}</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{nextSteps}</Text>
                </View>
              </View>
            )}

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

export default ViewPetVetAppointmentModal;
