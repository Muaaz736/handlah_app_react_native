import React, { useMemo } from 'react';
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
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import type { ViewCaregiverModalProps } from '../../types/viewCaregiverModal.types';
import { makeViewCaregiverModalStyles } from './ViewCaregiverModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewCaregiverModal: React.FC<ViewCaregiverModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, caregiver }) => {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewCaregiverModalStyles(themeColors as RoleTheme), [themeColors]);
  const phone =
    caregiver?.phonenumber ||
    caregiver?.phone ||
    caregiver?.handlahuser?.phonenumber;
  const email =
    caregiver?.emailaddress ||
    caregiver?.email ||
    caregiver?.handlahuser?.email;
  const rawUsername =
    caregiver?.handlahuser?.username ||
    caregiver?.handlahusername ||
    caregiver?.username;
  const username = rawUsername
    ? rawUsername.startsWith('@')
      ? rawUsername
      : `@${rawUsername}`
    : undefined;

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

  return (
    <Modal
      visible={visible && caregiver !== null}
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
                  <AntDesign name="addusergroup" size={32} color={colors.white} />
                </View>
              </View>
              <RecordViewTabs {...linkTabs} alignCenter contentMaxHeight={380} onNavigate={linkTabs?.onNavigate ?? onClose}>

              {/* Relation Tag */}
              <View style={styles.relationTag}>
                <Text style={styles.relationText}>
                  {caregiver?.relation || 'Relation'}
                </Text>
              </View>

              {/* Name */}
              <Text style={styles.name}>{caregiver?.name}</Text>

              {/* Username */}
              <Text style={styles.username}>
                {username}
              </Text>

              {/* Contact Info */}
              <View style={styles.contactContainer}>
                {/* Phone */}
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={handlePhonePress}
                >
                  <Feather name="phone" size={18} color={colors.black} />
                  <Text style={styles.contactText}>
                    {phone || 'Not Provided'}
                  </Text>
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={handleEmailPress}
                >
                  <MaterialIcons name="mail-outline" size={18} color={colors.black} />
                  <Text style={[styles.contactText, styles.emailText]}>
                    {email || 'Not Provided'}
                  </Text>
                </TouchableOpacity>
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

export default ViewCaregiverModal;
