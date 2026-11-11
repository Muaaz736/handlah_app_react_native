import React, { useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';
import type { ViewDoctorModalProps } from '../../types/viewDoctorModal.types';
import { makeViewDoctorModalStyles } from './ViewDoctorModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewDoctorModal: React.FC<ViewDoctorModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, doctor }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewDoctorModalStyles(themeColors as RoleTheme), [themeColors]);
  // Map API lowercase fields to expected fields
  const phone = doctor?.phonenumber || doctor?.phone;
  const email = doctor?.emailaddress || doctor?.email;
  const speciality = doctor?.specialization || doctor?.speciality;
  const address = doctor?.clinicaddress || doctor?.address;
  const officeClinic = doctor?.clinicaddress || doctor?.officeclinic;
  const npiId = doctor?.npiphysicianid || doctor?.npiId;


  const handlePhonePress = (): void => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmailPress = (): void => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleWebsitePress = (): void => {
    if (doctor?.website) {
      const url = doctor.website.startsWith('http')
        ? doctor.website
        : `https://${doctor.website}`;
      Linking.openURL(enforceHttps(url));
    }
  };

  return (
    <Modal
      visible={visible && doctor !== null}
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
                  <FontAwesome5 name="user-md" size={32} color={colors.white} />
                </View>
              </View>
              <RecordViewTabs {...linkTabs} alignCenter contentMaxHeight={380} onNavigate={linkTabs?.onNavigate ?? onClose}>

              {/* Name */}
              <Text style={styles.name}>{doctor?.name || '-'}</Text>

              {/* Speciality Tag */}
              {speciality && (
                <View style={styles.specialityTag}>
                  <Text style={styles.specialityText}>
                    {speciality}
                  </Text>
                </View>
              )}
              {/* NPI ID */}
              {npiId ? (
                <Text style={styles.npiId}>NPI: {npiId}</Text>
              ) : null}

              {/* Contact Info */}
              <View style={styles.contactContainer}>
                {/* Phone and Email Row */}
                <View style={styles.inlineRow}>
                  {phone && (
                    <TouchableOpacity
                      style={styles.inlineItem}
                      onPress={handlePhonePress}
                    >
                      <Feather name="phone" size={16} color={colors.black} />
                      <Text style={styles.inlineText}>
                        {phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {email && (
                    <TouchableOpacity
                      style={styles.inlineItem}
                      onPress={handleEmailPress}
                    >
                      <MaterialIcons name="mail-outline" size={16} color={colors.black} />
                      <Text style={styles.inlineText}>
                        {email}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Website */}
                {doctor?.website && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={handleWebsitePress}
                  >
                    <Feather name="globe" size={16} color={colors.black} />
                    <Text style={[styles.contactText, styles.websiteText]}>
                      {doctor.website}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Office/Clinic Label */}
                {officeClinic && (
                  <View style={styles.sectionLabel}>
                    <Text style={styles.labelText}>
                      Office/Clinic
                    </Text>
                  </View>
                )}

                {/* Office/Clinic Address */}
                {officeClinic && (
                  <View style={styles.addressRow}>
                    <Text style={styles.addressText}>
                      {officeClinic}
                    </Text>
                  </View>
                )}

                {/* Address Label */}
                <View style={styles.sectionLabel}>
                  <Text style={styles.labelText}>
                    Address
                  </Text>
                </View>

                {/* Address Value */}
                {address && (
                  <View style={styles.addressRow}>
                    <Text style={styles.addressText}>
                      {address}
                    </Text>
                  </View>
                )}

                {/* Dates */}
                {(doctor?.startdate || doctor?.startDate || doctor?.enddate || doctor?.endDate || doctor?.dependentenddate || doctor?.dependentEndDate) && (
                  <View style={styles.datesContainer}>
                    {(doctor?.startdate || doctor?.startDate) && (
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Start Date:</Text>
                        <Text style={styles.dateValue}>
                          {new Date(doctor.startdate || doctor.startDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {(doctor?.enddate || doctor?.endDate) && (
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>End Date:</Text>
                        <Text style={styles.dateValue}>
                          {new Date(doctor.enddate || doctor.endDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {(doctor?.dependentenddate || doctor?.dependentEndDate) && (
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Dependent End Date:</Text>
                        <Text style={styles.dateValue}>
                          {new Date(doctor.dependentenddate || doctor.dependentEndDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

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

export default ViewDoctorModal;
