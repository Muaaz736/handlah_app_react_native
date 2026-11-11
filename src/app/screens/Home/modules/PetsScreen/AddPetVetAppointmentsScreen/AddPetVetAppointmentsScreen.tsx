import React, { useState, useRef, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CustomInput,
  CustomDateTimePicker,
  PrimaryButton,
  MixedMediaUploader,
  AuthHeader,
  OfflineChainGuard,
} from '../../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { AddPetVetAppointmentsScreenProps } from './addPetVetAppointmentsScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { addPetVetAppointmentAsync, editPetVetAppointmentAsync } from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../PetsScreen.styles';
import { makeAddPetVetAppointmentsScreenStyles } from './AddPetVetAppointmentsScreen.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { VendorAutocompleteInput } from '../../../../../../components/common';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const AddPetVetAppointmentsScreen: React.FC<
  AddPetVetAppointmentsScreenProps
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeAddPetVetAppointmentsScreenStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  const petData = route?.params?.petData || {};
  const petId = route?.params?.petId || petData?.id;
  const isEdit = route?.params?.isEdit || false;
  const appointment = route?.params?.appointment || null;
  const fromPetsScreen = route?.params?.fromPetsScreen || false;
  const ownerUserId = (route?.params as any)?.ownerUserId;
  // "Select Records to Link" (as on the web): saved after the record itself.
  const links = useRecordLinkSelection({
      moduleKey: RECORD_LINK_MODULE.PetVetAppointment,
      recordId: isEdit && appointment?.id ? Number(appointment.id) : null,
      businessId: null,
      enabled: !ownerUserId,
  });
  // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
  const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.PetVetAppointment, recordId: isEdit && appointment?.id ? Number(appointment.id) : null, enabled: links.enabled, choiceOnly: true });

  const { add_pet_vet_appointment_status, edit_pet_vet_appointment_status } = useSelector(
    (state: any) => state.essentials_slice,
  );
  const isLoading = add_pet_vet_appointment_status === ASYNC_STATUS.LOADING || edit_pet_vet_appointment_status === ASYNC_STATUS.LOADING;

  const formikRef = useRef<FormikProps<any>>(null);


  const formatTimeForEdit = (timeStr: string): Date | string => {
    if (!timeStr) return '';
    // timeStr is "HH:mm" — build a Date with today's date so the picker can parse it
    const parts = timeStr.split(':');
    if (parts.length < 2) return '';
    const now = new Date();
    now.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    return now;
  };

  const initialValues = {
    date: isEdit && appointment ? appointment.date : '',
    time: isEdit && appointment ? formatTimeForEdit(appointment.time) : '',
    clinic: isEdit && appointment ? appointment.clinic || '' : '',
    vet: isEdit && appointment ? appointment.vet || '' : '',
    reason: isEdit && appointment ? appointment.reason || '' : '',
    outcome: isEdit && appointment ? appointment.outcome || '' : '',
    nextSteps: isEdit && appointment ? appointment.nextsteps || '' : '',
    photoUrls: (() => {
      const raw = isEdit && appointment ? appointment.photourl : null;
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      return [raw];
    })(),
    notes: isEdit && appointment ? appointment.notes || '' : '',
  };

  // --- Handlers ---
  const handleAddAppointment = (values: typeof initialValues) => {
    if (!values.date || !values.time || !values.clinic || !petId) return;
    const timeParsed = new Date(values.time);
    const hh = String(timeParsed.getHours()).padStart(2, '0');
    const mm = String(timeParsed.getMinutes()).padStart(2, '0');
    const appointmentPayload = {
      date: new Date(values.date).toISOString(),
      time: `${hh}:${mm}`,
      clinic: values.clinic,
      vet: values.vet || undefined,
      reason: values.reason || undefined,
      outcome: values.outcome || undefined,
      nextSteps: values.nextSteps || undefined,
      photoUrl: values.photoUrls.length > 0 ? values.photoUrls : undefined,
      notes: values.notes || undefined,
      hasReminder: true
    };

    if (isEdit && appointment?.id) {
      dispatch(
        editPetVetAppointmentAsync({ petId, appointmentId: appointment.id, data: appointmentPayload }),
      ).then((action: any) => {
            saveLinksAfter(links, action, appointment.id, undefined, recordNotes);
        if (action.type === editPetVetAppointmentAsync.fulfilled.type) {
          navigation.goBack();
        }
      });
    } else {
      dispatch(
        addPetVetAppointmentAsync({ petId, data: { ...appointmentPayload, ...(ownerUserId ? { ownerUserId } : {}) } }),
      ).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
        if (action.type === addPetVetAppointmentAsync.fulfilled.type) {
          if (fromPetsScreen) navigation.goBack();
          else (navigation as any).navigate('AddPetIllness', { petData, petId });
        }
      });
    }
  };

  const handleSkip = () => {
    if (fromPetsScreen) navigation.goBack();
    else (navigation as any).navigate('AddPetIllness', { petData, petId });
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header with Skip Button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
      }}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={commonStyles.header}
          title={isEdit ? t('pets.update_vet_appointment') : t('pets.vet_appointments')}
          titleStyle={commonStyles.HeaderTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />
        {!isEdit && !fromPetsScreen && (
          <TouchableOpacity
            style={[
              commonStyles.skipButton,
              {
                borderColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary,
                backgroundColor: themeColors?.isDark ? themeColors.primary + '10' : themeColors.secondary + '10',
              },
            ]}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={[commonStyles.skipButtonText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('common.skip_this')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -10 : 0}
      >

        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={commonStyles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema('pet_vet_appointment')}
            onSubmit={handleAddAppointment}
          >
            {({
              handleChange,
              handleSubmit,
              setFieldValue,
              values,
              touched,
              errors,
            }) => (
              <>
                {/* Date and Time Row */}
                <View style={commonStyles.datesRow}>
                  <View style={commonStyles.dateGroup}>
                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                      {t('pets.date_diagnosed')} *
                    </Text>
                    <CustomDateTimePicker
                      value={values.date}
                      onChange={(val: any) => {
                        setFieldValue('date', val);
                      }}
                      placeholder={t('pets.select_type')}
                      displayFormat="MM/DD/YYYY"
                      error={
                        touched.date && errors.date
                          ? String(errors.date)
                          : undefined
                      }
                      suffixIcon={
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={themeColors.textSecondary}
                        />
                      }
                    />
                  </View>
                  <View style={commonStyles.dateGroup}>
                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                      {t('pets.date_time')} *
                    </Text>
                    <CustomDateTimePicker
                      value={values.time}
                      onChange={(val: any) => {
                        setFieldValue('time', val);
                      }}
                      placeholder="--:--"
                      mode="time"
                      error={
                        touched.time && errors.time
                          ? String(errors.time)
                          : undefined
                      }
                    />
                  </View>
                </View>

                {/* Clinic Input */}
                <View style={commonStyles.inputGroup}>
                  <VendorAutocompleteInput category="vet_clinic"
                    value={values.clinic}
                    onChangeText={handleChange('clinic')}
                    placeholder={t('pets.clinic_placeholder')}
                    label={`${t('pets.clinic_name')} *`}
                    labelStyle={{ textAlign: 'left' }}
                    error={
                      touched.clinic && errors.clinic
                        ? String(errors.clinic)
                        : undefined
                    }
                  />
                </View>

                {/* Vet Input */}
                <View style={commonStyles.inputGroup}>
                  <CustomInput
                    value={values.vet}
                    onChangeText={handleChange('vet')}
                    placeholder={t('pets.vet_placeholder') || 'Vet name'}
                    label={t('pets.vet_name') || 'Vet'}
                    labelStyle={{ textAlign: 'left' }}
                  />
                </View>

                {/* Reason and Outcome Row */}
                <View style={commonStyles.datesRow}>
                  <View style={commonStyles.dateGroup}>
                    <CustomInput
                      value={values.reason}
                      onChangeText={handleChange('reason')}
                      placeholder={t('pets.reason_placeholder')}
                      label={`${t('pets.reason')} *`}
                      labelStyle={{ textAlign: 'left' }}
                      error={
                        touched.reason && errors.reason
                          ? String(errors.reason)
                          : undefined
                      }
                    />
                  </View>
                  <View style={commonStyles.dateGroup}>
                    <CustomInput
                      value={values.outcome}
                      onChangeText={handleChange('outcome')}
                      placeholder={t('pets.outcome_placeholder')}
                      label={t('pets.outcome')}
                      labelStyle={{ textAlign: 'left' }}
                    />
                  </View>
                </View>

                {/* Next Steps Input */}
                <View style={commonStyles.inputGroup}>
                  <CustomInput
                    value={values.nextSteps}
                    onChangeText={handleChange('nextSteps')}
                    placeholder={t('pets.next_steps_placeholder')}
                    label={t('pets.next_steps')}
                    labelStyle={{ textAlign: 'left' }}
                  />
                </View>

                {/* Upload Section */}
                <View style={commonStyles.uploadSection}>
                  <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                    {t('pets.upload_photo')}
                  </Text>
                  <MixedMediaUploader
                    mediaIds={values.photoUrls}
                    onMediaChange={(ids: string[]) => setFieldValue('photoUrls', ids)}
                    uploadType="box"
                    maxItems={5}
                    autoUpload={true}
                    removable={true}
                  />
                </View>

                {/* Notes Input */}
                <View style={commonStyles.inputGroup}>
                  <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                    {t('pets.notes')}
                  </Text>
                  <TextInput
                    value={values.notes}
                    onChangeText={handleChange('notes')}
                    placeholder={t('pets.notes_placeholder')}
                    placeholderTextColor="#999999"
                    multiline
                    numberOfLines={4}
                    style={[commonStyles.textArea]}
                  />
                </View>


              </>
            )}
          </Formik>
        <RecordNotesEncryptRow notes={recordNotes} />
        <RecordLinksField links={links} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={commonStyles.footer}>
          {isEdit ? (
            <PrimaryButton
              title={t('common.update')}
              onPress={() => formikRef.current?.handleSubmit()}
              buttonStyle={{ backgroundColor: themeColors.primary }}
            />
          ) : (
            <OfflineChainGuard isWizardMode={!fromPetsScreen}>
              <PrimaryButton
                title={fromPetsScreen ? t('common.save') : t('pets.continue')}
                onPress={() => formikRef.current?.handleSubmit()}
                loading={isLoading}
                disabled={isLoading}
                buttonStyle={{ backgroundColor: themeColors.primary }}
              />
            </OfflineChainGuard>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPetVetAppointmentsScreen;
