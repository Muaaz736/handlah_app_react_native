import React, { useMemo } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';
import PrimaryButton from '../common/PrimaryButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import type { ViewAppointmentModalProps } from '../../types/viewAppointmentModal.types';
import { makeViewAppointmentModalStyles } from './ViewAppointmentModal.styles';
import MixedMediaDisplayer from '../common/MixedMediaDisplayer';
import { RoleTheme } from '../../types/roleManager.types';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';

const ViewAppointmentModal: React.FC<ViewAppointmentModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, appointment }) => {
  const { t } = useTranslation();

const { themeColors } = useUserRole();

const styles = useMemo(() => makeViewAppointmentModalStyles(themeColors as RoleTheme), [themeColors]);

  const title = appointment?.title;
  // const description = appointment?.description;
  const doctorName = appointment?.doctorname || appointment?.doctor?.name || appointment?.doctorName;
  const date = appointment?.appointmentdate
    ? new Date(appointment.appointmentdate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : appointment?.date
      ? new Date(appointment.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined;
  const time = appointment?.appointmenttime || appointment?.time;
  const location = appointment?.location;
  const reason = appointment?.reason;
  const outcome = appointment?.outcome;
  const notes = appointment?.notes;
  const nextSteps = appointment?.nextsteps || appointment?.tasks;
  const taskDueDate = appointment?.taskduedate
    ? new Date(appointment.taskduedate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : undefined;
  const photoIds: string[] = Array.isArray(appointment?.photourl) ? appointment!.photourl as string[] : [];

  return (
    <Modal
      visible={visible && appointment !== null}
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
                  <MaterialCommunityIcons name="calendar-clock" size={32} color={colors.white} />
                </View>
              </View>

              {/* Modal heading — always "Appointment Details", never the location */}
              <Text style={styles.title}>{t('modals.appointment_details')}</Text>

              {/* Content */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
            <RecordViewTabs {...linkTabs} onNavigate={linkTabs?.onNavigate ?? onClose}>
                <TouchableOpacity style={styles.contentContainer}>
                  {/* Title */}
                  {/* {!!title && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <Feather name="tag" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.title')}</Text>
                        <Text style={styles.value}>{title}</Text>
                      </View>
                    </View>
                  )} */}

                  {/* Doctor Name */}
                  {!!doctorName && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <Feather name="user" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.doctor')}</Text>
                        <Text style={styles.value}>{doctorName}</Text>
                      </View>
                    </View>
                  )}

                  {/* Date */}
                  {!!date && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.date')}</Text>
                        <Text style={styles.value}>{date}</Text>
                      </View>
                    </View>
                  )}

                  {/* Time */}
                  {!!time && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.time')}</Text>
                        <Text style={styles.value}>{time}</Text>
                      </View>
                    </View>
                  )}

                  {/* Location */}
                  {!!location && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons name="location-on" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.location')}</Text>
                        <Text style={styles.value}>{location}</Text>
                      </View>
                    </View>
                  )}

                  {/* Reason */}
                  {!!reason && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <Feather name="clipboard" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.reason')}</Text>
                        <Text style={styles.value}>{reason}</Text>
                      </View>
                    </View>
                  )}

                  {/* Outcome */}
                  {!!outcome && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <Feather name="file-text" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.outcome')}</Text>
                        <Text style={styles.value}>{outcome}</Text>
                      </View>
                    </View>
                  )}

                  {/* Notes */}
                  {!!notes && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <Feather name="book-open" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.notes') || 'Notes'}</Text>
                        <Text style={styles.value}>{notes}</Text>
                      </View>
                    </View>
                  )}

                  {/* Next Steps / Tasks */}
                  {!!nextSteps && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <AntDesign name="checkcircleo" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.next_steps') || 'Next Steps'}</Text>
                        <Text style={styles.value}>{nextSteps}</Text>
                      </View>
                    </View>
                  )}

                  {/* Task Due Date */}
                  {!!taskDueDate && (
                    <View style={styles.infoRow}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="calendar-check" size={18} color={colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.label}>{t('modals.task_due_date') || 'Task Due Date'}</Text>
                        <Text style={styles.value}>{taskDueDate}</Text>
                      </View>
                    </View>
                  )}

                  {/* Photo Attachments */}
                  {photoIds.length > 0 && (
                    <View style={styles.infoRow}>
                      <View style={[styles.iconContainer, { alignSelf: 'flex-start', marginTop: 2 }]}>
                        <Feather name="paperclip" size={18} color={colors.primary} />
                      </View>
                      <View style={[styles.infoContent, { flex: 1 }]}>
                        <Text style={styles.label}>{t('modals.attachments') || 'Attachments'}</Text>
                        <MixedMediaDisplayer attachmentIds={photoIds} showDocHeading={false} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
            </RecordViewTabs>
              </ScrollView>

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

export default ViewAppointmentModal;
