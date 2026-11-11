import React, { useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import type { ViewMedicationModalProps } from '../../types/viewMedicationModal.types';
import { MixedMediaDisplayer } from '../common';
import { makeViewMedicationModalStyles } from './ViewMedicationModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewMedicationModal: React.FC<ViewMedicationModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, medication, doctors }) => {
  const { t } = useTranslation();

  const { themeColors } = useUserRole();

  const styles = useMemo(() => makeViewMedicationModalStyles(themeColors as RoleTheme), [themeColors]);

  // Map API lowercase fields to expected fields
  const name = medication?.medicationname || medication?.name;
  const typeForm = medication?.medicationtypelabel || medication?.typeForm;
  const dose = medication?.dosage || medication?.dose;
  const doseUnit = medication?.doseunitlabel || medication?.doseUnit;
  const scheduleType = medication?.scheduletype || medication?.scheduleType;
  const rawTimes = medication?.specifictimes || medication?.times;
  const times = Array.isArray(rawTimes) ? rawTimes.join(', ') : rawTimes;
  const rxNumber = medication?.prescriptionnumber ? `RX-${medication.prescriptionnumber}` : medication?.rxNumber;
  const startDate = medication?.startdate ? new Date(medication.startdate).toLocaleDateString() : medication?.startDate;
  const endDate = medication?.enddate ? new Date(medication.enddate).toLocaleDateString() : medication?.endDate;
  const refillDate = medication?.refilldate ? new Date(medication.refilldate).toLocaleDateString() : medication?.refillDate;
  const prescriber = medication?.prescribingdoctor?.name;
  const prescriberOffice = medication?.prescriberoffice || medication?.prescriberOffice;
  const pharmacyName = medication?.pharmacyname || medication?.pharmacyName;
  const pharmacyPhone = medication?.pharmacyphone || medication?.pharmacyPhone;
  const pharmacyAddress = medication?.pharmacyaddress || medication?.pharmacyAddress;
  const pharmacyWebsite = medication?.pharmacywebsite || medication?.pharmacyWebsite;
  const sideEffects = medication?.sideeffects || medication?.sideEffects;

  const photoUrls: string[] = Array.isArray(medication?.photourl)
    ? medication.photourl
    : medication?.photourl
      ? [medication.photourl]
      : [];

  const handleWebsitePress = (): void => {
    if (pharmacyWebsite) {
      const url = pharmacyWebsite.startsWith('http')
        ? pharmacyWebsite
        : `https://${pharmacyWebsite}`;
      Linking.openURL(enforceHttps(url));
    }
  };

  return (
    <Modal
      visible={visible && medication !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* <TouchableWithoutFeedback onPress={onClose}> */}
      <View style={styles.overlay} >
        {/* <TouchableWithoutFeedback > */}
        <View style={styles.modalContainer}>
          {/* Top Icon */}
          <View style={styles.topIconContainer}>
            <View style={styles.topIconCircle}>
              <MaterialCommunityIcons
                name="pill"
                size={24}
                color={colors.white}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ flex: 1 }}
          >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
            {/* Medication Header with Image */}
            {photoUrls.length > 0 ? (
              <MixedMediaDisplayer
                attachmentIds={photoUrls}
                imageHeight={140}
              />
            ) : null}
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>
                {name || '-'}
              </Text>
              {(dose || doseUnit) ? (
                <Text style={styles.medicationType}>
                  {[dose, doseUnit].filter(Boolean).join(' ')}
                </Text>
              ) : null}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Schedule Type */}
            {scheduleType ? (
              <Text style={styles.scheduleType}>{scheduleType}</Text>
            ) : null}

            {/* Times & RX Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t('health_tracker.times')}</Text>
                <Text style={styles.infoValue}>{times || '-'}</Text>
              </View>
              <View style={styles.infoColumn}>
                {rxNumber ? (
                  <Text style={styles.infoValueHighlight}>{rxNumber}</Text>
                ) : null}
              </View>
            </View>

            {/* Dates Row */}
            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t('health_tracker.start_date')}</Text>
                <Text style={styles.infoValue}>{startDate || '-'}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t('health_tracker.end_date')}</Text>
                <Text style={styles.infoValue}>{endDate || '-'}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t('health_tracker.refill_date')}</Text>
                <Text style={styles.infoValue}>{refillDate || '-'}</Text>
              </View>
            </View>

            {/* Prescriber Row */}
            {(prescriber || prescriberOffice) ? (
              <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>{t('health_tracker.prescriber')}</Text>
                  <Text style={styles.infoValue}>{prescriber || '-'}</Text>
                </View>
                <View style={[styles.infoColumn, { flex: 2 }]}>
                  <Text style={styles.infoLabel}>{t('health_tracker.prescriber_office')}</Text>
                  <Text style={styles.infoValue}>{prescriberOffice || '-'}</Text>
                </View>
              </View>
            ) : null}

            {/* Pharmacy Row */}
            {(pharmacyName || pharmacyPhone) ? (
              <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>{t('health_tracker.pharmacy_name')}</Text>
                  <Text style={styles.infoValue}>{pharmacyName || '-'}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>{t('health_tracker.pharmacy_phone')}</Text>
                  <Text style={styles.infoValue}>{pharmacyPhone || '-'}</Text>
                </View>
              </View>
            ) : null}

            {/* Pharmacy Address */}
            {pharmacyAddress ? (
              <View style={styles.singleInfoRow}>
                <Text style={styles.infoLabel}>{t('health_tracker.pharmacy_address')}</Text>
                <Text style={styles.infoValue}>{pharmacyAddress}</Text>
              </View>
            ) : null}

            {/* Pharmacy Website */}
            {pharmacyWebsite ? (
              <View style={styles.singleInfoRow}>
                <Text style={styles.infoLabel}>{t('health_tracker.pharmacy_website')}</Text>
                <TouchableOpacity onPress={handleWebsitePress}>
                  <Text style={styles.websiteLink}>{pharmacyWebsite}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Side Effects / Notes */}
            {sideEffects ? (
              <View style={styles.singleInfoRow}>
                <Text style={styles.infoLabel}>{t('health_tracker.side_effects_notes')}</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{sideEffects}</Text>
                </View>
              </View>
            ) : null}
            </RecordViewTabs>
          </ScrollView>

          {/* Close Button */}
          <PrimaryButton
            title={t('common.close')}
            onPress={onClose}
            buttonStyle={styles.closeButton}
          />
        </View>
        {/* </TouchableWithoutFeedback> */}
      </View>
      {/* </TouchableWithoutFeedback> */}
    </Modal>
  );
};

export default ViewMedicationModal;
