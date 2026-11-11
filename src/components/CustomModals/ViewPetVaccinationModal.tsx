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

interface PetVaccination {
  id?: number;
  vaccinename?: string;
  name?: string;
  dategiven?: string;
  nextdate?: string;
  notes?: string;
  photourl?: string[];
  [key: string]: any;
}

interface ViewPetVaccinationModalProps {
  visible: boolean;
  onClose: () => void;
  vaccination: PetVaccination | null;
}

const ViewPetVaccinationModal: React.FC<ViewPetVaccinationModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  vaccination,
}) => {
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeViewIllnessModalStyles(themeColors as RoleTheme), [themeColors]);

  const name = vaccination?.vaccinename || vaccination?.name || '-';
  const dateGiven = vaccination?.dategiven ? formatDate(vaccination.dategiven) : '-';
  const nextDate = vaccination?.nextdate ? formatDate(vaccination.nextdate) : '-';
  const notes = vaccination?.notes;
  const photoIds: string[] = Array.isArray(vaccination?.photourl)
    ? (vaccination!.photourl as string[])
    : [];

  return (
    <Modal
      visible={visible && vaccination !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.topIconContainer}>
            <View style={styles.topIconCircle}>
              <MaterialCommunityIcons name="needle" size={26} color={themeColors.background} />
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

            {/* Dates */}
            <Text style={styles.sectionTitle}>
              {t('pets.vaccination_details', { defaultValue: 'Vaccination Details' })}
            </Text>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.date_given', { defaultValue: 'Date Given' })}</Text>
                <Text style={styles.value}>{dateGiven}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.next_date', { defaultValue: 'Next Date' })}</Text>
                <Text style={styles.value}>{nextDate}</Text>
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

export default ViewPetVaccinationModal;
