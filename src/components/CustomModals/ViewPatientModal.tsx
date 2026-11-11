import React, { useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';
import type { ViewPatientModalProps } from '../../types/viewPatientModal.types';
import { makeViewPatientModalStyles } from './ViewPatientModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewPatientModal: React.FC<ViewPatientModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, patient }) => {
  const { t } = useTranslation();
  
const { themeColors } = useUserRole();
  
const styles = useMemo(() => makeViewPatientModalStyles(themeColors as RoleTheme), [themeColors]);
  
  return (
    <Modal
      visible={visible && patient !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Avatar Icon */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <AntDesign name="user" size={32} color={colors.white} />
                </View>
              </View>
              <RecordViewTabs {...linkTabs} alignCenter contentMaxHeight={380} onNavigate={linkTabs?.onNavigate ?? onClose}>

              {/* Patient Tag */}
              <View style={styles.patientTag}>
                <Text style={styles.patientTagText}>{t('health_tracker.patient')}</Text>
              </View>

              {/* Name */}
              <Text style={styles.name}>{patient?.name || 'Kevin'}</Text>

              {/* DOB */}
              {patient?.dob && (
                <Text style={styles.dob}>{t('health_tracker.dob')}: {patient.dob}</Text>
              )}

              </RecordViewTabs>

              {/* Close Button */}
              <PrimaryButton
                title={t('common.close')}
                onPress={onClose}
                buttonStyle={styles.closeButton}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewPatientModal;
