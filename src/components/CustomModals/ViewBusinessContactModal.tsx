import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Linking,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../utils/colors';
import { useUserRole } from '../../hooks/useUserRole';
import { darkenColor } from '../../utils/roleManager';
import { BusinessContactItem } from '../../types/reduxTypes/businessContactsSlice.types';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getBusinessContactTypesAsync, getDropdownOptionsAsync } from '../../redux/services/authService';
import { AppDispatch } from '../../types/store.types';
import { makeViewBusinessContactModalStyles } from './ViewBusinessContactModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

interface ViewBusinessContactModalProps {
  visible: boolean;
  onClose: () => void;
  contact: BusinessContactItem | null;
}

const ViewBusinessContactModal: React.FC<ViewBusinessContactModalProps & RecordLinkTabsProp> = ({ linkTabs,
  visible,
  onClose,
  contact,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeViewBusinessContactModalStyles(themeColors as RoleTheme), [themeColors]);
  const { get_dropdown_options_data, get_business_contact_types_data } = useSelector((state: any) => state.user_auth);
  const dispatch = useDispatch<AppDispatch>();

  useFocusEffect(useCallback(() => {
    dispatch(getBusinessContactTypesAsync());
    dispatch(getDropdownOptionsAsync('BusinessContactRole'));
  }, [dispatch]));

  if (!contact) return null;

  const handlePhonePress = (): void => {
    if (contact.phoneNumber) {
      Linking.openURL(`tel:${contact.phoneNumber}`);
    }
  };

  const handleEmailPress = (): void => {
    if (contact.emailAddress) {
      Linking.openURL(`mailto:${contact.emailAddress}`);
    }
  };


  return (
    <Modal
      visible={visible && contact !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header close button */}
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>

              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: themeColors.primary },
                  ]}
                >
                  <FontAwesome5
                    name="user-tie"
                    size={28}
                    color={colors.white}
                  />
                </View>
              </View>

              {/* Name */}
              <Text style={styles.name}>{contact.fullName || '—'}</Text>

              {/* Role + Primary badges */}
              <View style={styles.badgeRow}>
                {!!contact.role && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: themeColors?.isDark
                          ? darkenColor(themeColors.lightCGreen || '#E8F5E9', 0.5)
                          : (themeColors.lightCGreen || '#E8F5E9'),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{get_dropdown_options_data?.find((option: any) => String(option.value) === String(contact.role))?.label || '-'}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: contact.isPrimary
                        ? themeColors.primary
                        : themeColors?.isDark
                          ? darkenColor(colors.lightGray, 0.6)
                          : colors.lightGray,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: contact.isPrimary ? colors.white : (themeColors?.isDark ? colors.white : colors.gray) },
                    ]}
                  >
                    {contact.isPrimary ? 'Primary' : 'Secondary'}
                  </Text>
                </View>
                {contact.isReference && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: themeColors?.isDark ? darkenColor('#FFF3E0', 0.7) : '#FFF3E0' },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: themeColors?.isDark ? '#FFB74D' : '#E65100' }]}>
                      Reference
                    </Text>
                  </View>
                )}
              </View>

              {/* Contact Type */}
              {!!contact.contactType && (
                <View
                  style={[
                    styles.typeTag,
                    {
                      backgroundColor: themeColors?.isDark
                        ? darkenColor(themeColors.lightCGreen || '#E8F5E9', 0.5)
                        : (themeColors.lightCGreen || '#E8F5E9'),
                    },
                  ]}
                >
                  <Text
                    style={[styles.typeTagText, { color: themeColors.primary }]}
                  >
                    {get_business_contact_types_data?.find((option: any) => String(option.value) === String(contact.contactType))?.label || '-'}
                  </Text>
                </View>
              )}

              {/* Scrollable details */}
              <ScrollView
                style={styles.contentScroll}
                showsVerticalScrollIndicator={false}
              >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
                <View style={styles.detailsContainer}>
                  {/* Phone & Email row */}
                  <View style={styles.inlineRow}>
                    {!!contact.phoneNumber && (
                      <TouchableOpacity
                        style={styles.inlineItem}
                        onPress={handlePhonePress}
                      >
                        <Feather
                          name="phone"
                          size={15}
                          color={themeColors.primary}
                        />
                        <Text style={styles.inlineText}>
                          {contact.phoneNumber}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {!!contact.emailAddress && (
                      <TouchableOpacity
                        style={styles.inlineItem}
                        onPress={handleEmailPress}
                      >
                        <MaterialIcons
                          name="mail-outline"
                          size={15}
                          color={themeColors.primary}
                        />
                        <Text style={styles.inlineText}>
                          {contact.emailAddress}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {!!contact.companyTeam && (
                    <View style={styles.detailRow}>
                      <Feather
                        name="briefcase"
                        size={15}
                        color={themeColors.primary}
                      />
                      <Text style={styles.detailText}>
                        {contact.companyTeam}
                      </Text>
                    </View>
                  )}

                  {!!contact.manager && (
                    <View style={styles.detailRow}>
                      <FontAwesome5
                        name="user-check"
                        size={14}
                        color={themeColors.primary}
                      />
                      <Text style={styles.detailText}>
                        Manager: {contact.manager}
                      </Text>
                    </View>
                  )}

                  {!!contact.location && (
                    <View style={styles.detailRow}>
                      <Feather
                        name="map-pin"
                        size={15}
                        color={themeColors.primary}
                      />
                      <Text style={styles.detailText}>{contact.location}</Text>
                    </View>
                  )}

                  {!!contact.tags && (
                    <View style={styles.detailRow}>
                      <Feather
                        name="tag"
                        size={15}
                        color={themeColors.primary}
                      />
                      <Text style={styles.detailText}>{contact.tags}</Text>
                    </View>
                  )}

                  {!!contact.status && (
                    <View style={styles.detailRow}>
                      <MaterialIcons
                        name="info-outline"
                        size={15}
                        color={themeColors.primary}
                      />
                      <Text style={styles.detailText}>
                        Status:{' '}
                        <Text style={styles.statusValue}>{contact.status}</Text>
                      </Text>
                    </View>
                  )}
                </View>
            </RecordViewTabs>
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewBusinessContactModal;
