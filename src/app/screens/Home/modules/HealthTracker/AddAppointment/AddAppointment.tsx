import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik, FormikProps } from 'formik';
import colors from '../../../../../../utils/colors';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import {
  AuthHeader,
  CustomDateTimePicker,
  CustomDropDown,
  CustomInput,
  PrimaryButton,
  ImageUploader,
} from '../../../../../../components/common';
import {
  addChildAppointmentAsync,
  addChildDoctorAsync,
  getChildrenAsync,
  getChildDoctorsAsync,
} from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeStyles } from './AddAppointment.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { VendorAutocompleteInput } from '../../../../../../components/common';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

type RouteParams = {
  AddAppointment: { childId: string };
};

const AddAppointment: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AddAppointment'>>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeStyles(themeColors as RoleTheme), [themeColors]);
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const formikRef = useRef<FormikProps<any> | null>(null);

  const childId = route.params?.childId;
  const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.HealthAppointment,
        recordId: null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.HealthAppointment, recordId: null, enabled: links.enabled });

  const {
    add_child_appointment_status,
    get_child_doctors_data,
  } = useSelector((state: any) => state.essentials_slice);
  const isLoading = add_child_appointment_status === ASYNC_STATUS.LOADING;

  // Fetch doctors on mount
  useEffect(() => {
    if (childId) {
      dispatch(getChildDoctorsAsync(childId));
    }
  }, [childId]);

  const rawDoctors = get_child_doctors_data?.doctors || get_child_doctors_data || [];
  const doctorOptions = Array.isArray(rawDoctors)
    ? rawDoctors.map((doctor: any) => ({
      label: doctor.name,
      value: doctor.id.toString(),
    }))
    : [];

  const { add_child_doctor_status } = useSelector(
    (state: any) => state.essentials_slice,
  );
  const isAddingDoctor = add_child_doctor_status === ASYNC_STATUS.LOADING;

  const [showQuickAddDoctor, setShowQuickAddDoctor] = useState(false);
  const [quickDoctorName, setQuickDoctorName] = useState('');

  const handleQuickAddDoctor = () => {
    const name = quickDoctorName.trim();
    if (!name) {
      showErrorAlert(t('health_tracker.name') + ' is required');
      return;
    }
    if (!childId) return;
    dispatch(
      addChildDoctorAsync({
        childId,
        doctorData: { name },
        ...(ownerUserId ? { ownerUserId } : {}),
      }),
    ).then((action: any) => {
      if (action.type === addChildDoctorAsync.fulfilled.type) {
        setQuickDoctorName('');
        setShowQuickAddDoctor(false);
        dispatch(getChildDoctorsAsync(childId));
      }
    });
  };

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string[]>([]);

  const initialValues = {
    startDate: null as string | Date | null,
    time: null as string | Date | null,
    selectDoctor: '',
    location: '',
    reason: '',
    outcome: '',
    task: '',
    dueDate: null as string | Date | null,
  };

  // Handler for dropdown selection with proper type handling
  const handleDoctorSelect = (
    value: string | string[] | null,
    setFieldValue: any,
  ) => {
    if (typeof value === 'string') {
      setFieldValue('selectDoctor', value);
    } else if (value === null) {
      setFieldValue('selectDoctor', '');
    }
  };

  const handleSubmit = (values: any) => {
    if (!childId) {
      showErrorAlert(t('common.error') || 'No child selected');
      return;
    }

    // Format dates to ISO strings
    const formatDateToISO = (
      date: Date | string | null,
    ): string | undefined => {
      if (!date) return undefined;
      try {
        if (typeof date === 'object' && 'toISOString' in date) {
          return (date as Date).toISOString();
        }
        return new Date(date as string).toISOString();
      } catch {
        return undefined;
      }
    };

    const appointmentData = {
      // title: values.location || undefined,
      // description: values.reason || undefined,
      appointmentDate: formatDateToISO(values.startDate),
      appointmentTime: values.time
        ? typeof values.time === 'object' && 'toISOString' in values.time
          ? (values.time as Date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          : values.time
        : undefined,
      location: values.location || undefined,
      doctorName: values.selectDoctor
        ? doctorOptions.find((d: any) => d.value === values.selectDoctor)?.label
        : undefined,
      doctorId: values.selectDoctor ? parseInt(values.selectDoctor) : undefined,
      appointmentType: undefined,
      reason: values.reason || undefined,
      outcome: values.outcome || undefined,
      // notes: values.outcome || undefined,
      // nextSteps: values.task || undefined,
      tasks: values.task || undefined,
      taskDueDate: formatDateToISO(values.dueDate),
      hasReminder: reminderEnabled,
      photoUrl: photoUrl,
    };

    dispatch(
      addChildAppointmentAsync({
        childId,
        appointmentData,
        ...(ownerUserId ? { ownerUserId } : {}),
      }),
    ).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
      if (action.type === addChildAppointmentAsync.fulfilled.type) {
        dispatch(getChildrenAsync({}));
        navigation.goBack();
      }
    });
  };

  // Handle photo upload callback
  const handlePhotoUploaded = (ids: string[] | string) => {
    setPhotoUrl(Array.isArray(ids) ? ids : ids ? [ids] : []);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl([]);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        style={commonStyles.container}
        behavior={isIOS ? 'padding' : 'height'}
      >
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          title={t('health_tracker.add_appointment')}
          subtitle={t('health_tracker.visits_notes_steps')}
          titleStyle={styles.HeaderTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema('appointment')}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            setFieldValue,
            handleSubmit: formikHandleSubmit,
          }) => (
            <>
              <ScrollView
                style={commonStyles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={commonStyles.formContainer}>
                  {/* Start Date and Time Row */}
                  <View style={styles.rowContainer}>
                    <View style={styles.halfInput}>
                      <CustomDateTimePicker
                        label={`${t('health_tracker.start_date')} *`}
                        placeholder={t('common.select')}
                        value={values.startDate}
                        onChange={date => setFieldValue('startDate', date)}
                        mode="date"
                        displayFormat="MM/DD/YYYY"
                        labelStyle={{ textAlign: 'left' }}
                        suffixIcon={
                          <MaterialCommunityIcons
                            name="calendar-blank-outline"
                            size={20}
                            color={themeColors.textSecondary}
                          />
                        }
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <CustomDateTimePicker
                        label={`${t('health_tracker.time')} *`}
                        placeholder="--:--"
                        value={values.time}
                        onChange={date => setFieldValue('time', date)}
                        mode="time"
                        labelStyle={{ textAlign: 'left' }}
                        suffixIcon={
                          <Ionicons
                            name="time-outline"
                            size={20}
                            color={themeColors.textSecondary}
                          />
                        }
                      />
                    </View>
                  </View>
                  {/* Error messages for date and time */}
                  <View style={styles.rowContainer}>
                    <View style={styles.halfInput}>
                      {errors.startDate && touched.startDate && (
                        <Text style={styles.errorTextRow}>
                          {errors.startDate as string}
                        </Text>
                      )}
                    </View>
                    <View style={styles.halfInput}>
                      {errors.time && touched.time && (
                        <Text style={styles.errorTextRow}>
                          {errors.time as string}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Select Doctor */}
                  <View style={styles.inputGroup}>
                    <View style={styles.doctorLabelRow}>
                      <Text
                        style={[
                          commonStyles.label,
                          { textAlign: 'left', marginBottom: 0 },
                        ]}
                      >
                        {t('health_tracker.select_doctor')}
                      </Text>
                      <TouchableOpacity
                        style={styles.quickAddBtn}
                        onPress={() => setShowQuickAddDoctor(v => !v)}
                      >
                        <Feather
                          name={showQuickAddDoctor ? 'minus' : 'plus'}
                          size={13}
                          color={themeColors.primary}
                        />
                        <Text
                          style={[
                            styles.quickAddBtnText,
                            { color: themeColors.primary },
                          ]}
                        >
                          {t('health_tracker.quick_add_doctor')}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Quick Add Doctor inline form */}
                    {showQuickAddDoctor && (
                      <View style={styles.quickAddDoctorForm}>
                        <TextInput
                          style={styles.quickAddDoctorInput}
                          placeholder={t(
                            'health_tracker.doctor_name_placeholder',
                          )}
                          placeholderTextColor={colors.gray}
                          value={quickDoctorName}
                          onChangeText={setQuickDoctorName}
                          editable={!isAddingDoctor}
                        />
                        <TouchableOpacity
                          style={[
                            styles.quickAddDoctorSaveBtn,
                            { backgroundColor: themeColors.primary },
                          ]}
                          onPress={handleQuickAddDoctor}
                          disabled={isAddingDoctor}
                        >
                          {isAddingDoctor ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.white}
                            />
                          ) : (
                            <Text style={styles.quickAddDoctorSaveBtnText}>
                              {t('health_tracker.add_doctor')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={{ marginTop: 8 }}>
                      <CustomDropDown
                        options={doctorOptions}
                        value={values.selectDoctor}
                        onSelect={value =>
                          handleDoctorSelect(value, setFieldValue)
                        }
                        placeholder={t('common.select')}
                        search={doctorOptions.length > 3}
                        leftIcon={true}
                        style={styles.dropdown}
                      />
                    </View>
                  </View>

                  {/* Location */}
                  <VendorAutocompleteInput category="health_office_clinic"
                    label={`${t('health_tracker.location')} *`}
                    placeholder={t('health_tracker.location')}
                    value={values.location}
                    onChangeText={handleChange('location')}
                    containerStyle={styles.inputContainerNoMargin}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />
                  {errors.location && touched.location && (
                    <Text style={styles.errorTextLocation}>
                      {errors.location as string}
                    </Text>
                  )}
                  <View style={{ marginTop: 8 }}>
                    <CustomInput
                      label={t('health_tracker.reason')}
                      placeholder={t('health_tracker.reason')}
                      value={values.reason}
                      onChangeText={handleChange('reason')}
                      containerStyle={styles.inputContainerNoMargin}
                      labelStyle={{ textAlign: 'left' }}
                      inputStyle={{ textAlign: 'left' }}
                    />
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    <CustomInput
                      label={t('health_tracker.outcome')}
                      placeholder={t('health_tracker.outcome')}
                      value={values.outcome}
                      onChangeText={handleChange('outcome')}
                      containerStyle={styles.inputContainerNoMargin}
                      labelStyle={{ textAlign: 'left' }}
                      inputStyle={{ textAlign: 'left' }}
                    />
                  </View>

                  {/* Appointment Reminder */}
                  <TouchableOpacity
                    style={styles.reminderRow}
                    onPress={() => setReminderEnabled(!reminderEnabled)}
                  >
                    <Feather name="bell" size={20} color={themeColors.textPrimary} />
                    <Text style={[styles.reminderText, { textAlign: 'left' }]}>
                      {t('health_tracker.appointment_reminder')}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        reminderEnabled && {
                          backgroundColor: themeColors.primary,
                          borderColor: themeColors.primary,
                        },
                      ]}
                    >
                      {reminderEnabled && (
                        <Feather name="check" size={14} color={colors.white} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Upload Photo */}
                  <ImageUploader
                    label={t('health_tracker.upload_photo')}
                    placeholder={t('health_tracker.upload_photo')}
                    imageIds={photoUrl}
                    multiple={true}
                    maxImages={5}
                    onImageUploaded={handlePhotoUploaded}
                    onImageSelect={() => { }}
                    uploadType="box"
                    iconType="ionicons"
                    iconName="cloud-upload-outline"
                    iconColor={themeColors.secondary}
                    removable={photoUrl.length > 0}
                    onRemove={handleRemovePhoto}
                    autoUpload={true}
                    containerStyle={styles.uploadContainer}
                  />

                  <View style={styles.divider} />

                  {/* Next Steps / Tasks Section */}
                  <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>
                    {t('health_tracker.next_steps_tasks')}
                  </Text>

                  {/* Task */}
                  <CustomInput
                    label={t('health_tracker.task')}
                    placeholder={t('health_tracker.task')}
                    value={values.task}
                    onChangeText={handleChange('task')}
                    containerStyle={styles.inputContainer}
                    labelStyle={{ textAlign: 'left' }}
                    inputStyle={{ textAlign: 'left' }}
                  />

                  {/* Due Date */}
                  <CustomDateTimePicker
                    label={t('health_tracker.due_date')}
                    placeholder={t('common.select')}
                    value={values.dueDate}
                    onChange={date => setFieldValue('dueDate', date)}
                    mode="date"
                    displayFormat="MM/DD/YYYY"
                    labelStyle={{ textAlign: 'left' }}
                    suffixIcon={
                      <MaterialCommunityIcons
                        name="calendar-blank-outline"
                        size={20}
                        color={themeColors.textSecondary}
                      />
                    }
                    containerStyle={styles.datePickerContainer}
                  />
                </View>
              <RecordNotesField notes={recordNotes} />
              <RecordLinksField links={links} />
              </ScrollView>

              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title={
                    isLoading
                      ? t('common.loading')
                      : t('health_tracker.add_appointment')
                  }
                  onPress={formikHandleSubmit}
                  buttonStyle={[
                    styles.saveButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  disabled={isLoading}
                />
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAppointment;
