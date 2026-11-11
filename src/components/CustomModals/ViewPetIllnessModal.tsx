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

interface PetIllness {
  id?: number;
  date?: string;
  diagnosis?: string;
  treatments?: string;
  notes?: string;
  photourl?: string[];
  [key: string]: any;
}

interface ViewPetIllnessModalProps {
  visible: boolean;
  onClose: () => void;
  illness: PetIllness | null;
}

const ViewPetIllnessModal: React.FC<ViewPetIllnessModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  illness,
}) => {
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeViewIllnessModalStyles(themeColors as RoleTheme), [themeColors]);

  const diagnosis = illness?.diagnosis || '-';
  const date = illness?.date ? formatDate(illness.date) : '-';
  const treatments = illness?.treatments;
  const notes = illness?.notes;
  const photoIds: string[] = Array.isArray(illness?.photourl)
    ? (illness!.photourl as string[])
    : [];

  return (
    <Modal
      visible={visible && illness !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.topIconContainer}>
            <View style={styles.topIconCircle}>
              <MaterialCommunityIcons name="stethoscope" size={26} color={themeColors.background} />
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
                <Text style={styles.headerTitle}>{diagnosis}</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Core Details */}
            <Text style={styles.sectionTitle}>
              {t('pets.illness_details', { defaultValue: 'Illness Details' })}
            </Text>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('pets.diagnosis', { defaultValue: 'Diagnosis' })}</Text>
                <Text style={styles.value}>{diagnosis}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>{t('common.date', { defaultValue: 'Date' })}</Text>
                <Text style={styles.value}>{date}</Text>
              </View>
            </View>

            {/* Treatments */}
            {!!treatments && (
              <View style={styles.singleRow}>
                <Text style={styles.label}>{t('pets.treatment', { defaultValue: 'Treatment' })}</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{treatments}</Text>
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

export default ViewPetIllnessModal;
