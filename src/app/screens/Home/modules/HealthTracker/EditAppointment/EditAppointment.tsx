import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik, FormikProps } from 'formik';
import { EditAppointmentRouteParams } from './EditAppointment.types';
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
import colors from '../../../../../../utils/colors';
import {
    updateChildAppointmentAsync,
    getChildByIdAsync,
    getChildDoctorsAsync,
} from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { setUpdateAppointmentStatus } from '../../../../../../redux/slices/essentialsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeEditAppointmentStyles } from './EditAppointment.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { VendorAutocompleteInput } from '../../../../../../components/common';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

type EditAppointmentRouteProp = RouteProp<{ EditAppointment: EditAppointmentRouteParams }, 'EditAppointment'>;

const EditAppointment: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditAppointmentRouteProp>();
    const dispatch = useDispatch<AppDispatch>();
    const { t, i18n } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeEditAppointmentStyles(themeColors as RoleTheme), [themeColors]);
    const formikRef = useRef<FormikProps<any> | null>(null);

    const appointment = (route.params as any)?.appointment || {};
    const childId = appointment?.childid?.toString() || appointment?.childId?.toString() || '';
    const appointmentId = appointment?.id;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.HealthAppointment,
        recordId: appointmentId ? Number(appointmentId) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.HealthAppointment, recordId: appointmentId ? Number(appointmentId) : null, enabled: links.enabled });

    const { update_child_appointment_status, get_child_doctors_data } = useSelector(
        (state: any) => state.essentials_slice,
    );
    const isLoading = update_child_appointment_status === ASYNC_STATUS.LOADING;

    useEffect(() => {
        if (childId) {
            dispatch(getChildDoctorsAsync(childId));
        }
    }, [childId]);

    useEffect(() => {
        if (update_child_appointment_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(getChildByIdAsync({ childId: childId.toString() }));
            dispatch(setUpdateAppointmentStatus());
            navigation.goBack();
        }
    }, [update_child_appointment_status]);

    // Ensure get_child_doctors_data is always an array before mapping
    const doctorOptions = Array.isArray(get_child_doctors_data)
        ? get_child_doctors_data.map((doctor: any) => ({
            label: doctor.name,
            value: doctor.id.toString(),
        }))
        : [];

    useEffect(() => {
        if (doctorOptions.length > 0 && formikRef.current) {
            const doctorId = appointment?.doctorid?.toString() || appointment?.doctorId?.toString() || '';
            if (doctorId) {
                formikRef.current.setFieldValue('selectDoctor', doctorId);
            }
        }
    }, [get_child_doctors_data]);

    const handleDoctorDropdownOpen = () => {
        if (doctorOptions.length === 0) {
            showErrorAlert(t('health_tracker.add_doctor_first'));
        }
    };

    const [reminderEnabled, setReminderEnabled] = useState<boolean>(
        appointment?.hasreminder ?? appointment?.hasReminder ?? false,
    );
    const [photoUrl, setPhotoUrl] = useState<string[]>(
        Array.isArray(appointment?.photourl || appointment?.photoUrl)
            ? (appointment?.photourl || appointment?.photoUrl)
            : ((appointment?.photourl || appointment?.photoUrl) ? [appointment?.photourl || appointment?.photoUrl] : [])
    );

    const parseExistingDate = (dateStr: string | null | undefined): Date | null => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const parseTimeString = (timeStr: string | null | undefined): Date | null => {
        if (!timeStr) return null;
        if (timeStr.includes('T') || timeStr.includes('-')) {
            return parseExistingDate(timeStr);
        }
        const parts = timeStr.split(':');
        if (parts.length < 2) return null;
        const base = new Date();
        base.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parts[2] ? parseInt(parts[2], 10) : 0, 0);
        return isNaN(base.getTime()) ? null : base;
    };

    const initialValues = {
        startDate: parseExistingDate(appointment?.appointmentdate || appointment?.appointmentDate) as Date | string | null,
        time: parseTimeString(appointment?.appointmenttime || appointment?.appointmentTime) as Date | string | null,
        selectDoctor: appointment?.doctorid?.toString() || appointment?.doctorId?.toString() || '',
        location: appointment?.location || '',
        reason: appointment?.reason || '',
        outcome: appointment?.outcome || '',
        task: appointment?.nextsteps || appointment?.nextSteps || appointment?.tasks || '',
        dueDate: parseExistingDate(appointment?.taskduedate || appointment?.taskDueDate) as Date | string | null,
        name: appointment?.appointeename || appointment?.appointeeName || '',
        phone: appointment?.appointeephone || appointment?.appointeePhone || '',
        email: appointment?.appointeeemail || appointment?.appointeeEmail || '',
        username: appointment?.appointeeusername || appointment?.appointeeUsername || '',
    };

    const handleDoctorSelect = (value: string | string[] | null, setFieldValue: any) => {
        if (typeof value === 'string') {
            setFieldValue('selectDoctor', value);
        } else if (value === null) {
            setFieldValue('selectDoctor', '');
        }
    };

    const handleSubmit = (values: any) => {
        if (!childId || !appointmentId) {
            showErrorAlert(t('common.error') || 'Missing appointment data');
            return;
        }

        const formatDateToISO = (date: Date | string | null): string | undefined => {
            if (!date) return undefined;
            try {
                if (date instanceof Date) return date.toISOString();
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
                ? values.time instanceof Date
                    ? values.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    : values.time
                : undefined,
            location: values.location || undefined,
            doctorName: values.selectDoctor
                ? doctorOptions.find((d: any) => d.value === values.selectDoctor)?.label
                : undefined,
            doctorId: values.selectDoctor ? parseInt(values.selectDoctor) : undefined,
            reason: values.reason || undefined,
            outcome: values.outcome || undefined,
            // notes: values.outcome || undefined,
            // nextSteps: values.task || undefined,
            tasks: values.task || undefined,
            taskDueDate: formatDateToISO(values.dueDate),
            hasReminder: reminderEnabled,
            photoUrl: photoUrl,
        };

        dispatch(updateChildAppointmentAsync({ childId, appointmentId, appointmentData })).then((a: any) => saveLinksAfter(links, a, appointmentId, undefined, recordNotes));
    };

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
                    title={t('health_tracker.edit_appointment')}
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
                    enableReinitialize={true}
                >
                    {({ values, errors, touched, handleChange, setFieldValue, handleSubmit: formikHandleSubmit }) => (
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
                                                onChange={(date) => setFieldValue('startDate', date)}
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
                                                onChange={(date) => setFieldValue('time', date)}
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
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            {errors.startDate && touched.startDate && (
                                                <Text style={styles.errorTextRow}>{errors.startDate as string}</Text>
                                            )}
                                        </View>
                                        <View style={styles.halfInput}>
                                            {errors.time && touched.time && (
                                                <Text style={styles.errorTextRow}>{errors.time as string}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Select Doctor */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('health_tracker.select_doctor')}
                                        </Text>
                                        <View style={styles.doctorDropdownWrapper}>
                                            <View pointerEvents={doctorOptions.length === 0 ? 'none' : 'auto'}>
                                                <CustomDropDown
                                                    options={doctorOptions}
                                                    value={values.selectDoctor}
                                                    onSelect={(value) => handleDoctorSelect(value, setFieldValue)}
                                                    placeholder={doctorOptions.length === 0 ? t('health_tracker.no_doctors_added') : t('common.select')}
                                                    search={doctorOptions.length > 3}
                                                    leftIcon={true}
                                                    style={styles.dropdown}
                                                />
                                            </View>
                                            {doctorOptions.length === 0 && (
                                                <TouchableOpacity
                                                    style={StyleSheet.absoluteFillObject}
                                                    activeOpacity={1}
                                                    onPress={handleDoctorDropdownOpen}
                                                />
                                            )}
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
                                        <Text style={styles.errorTextLocation}>{errors.location as string}</Text>
                                    )}

                                    {/* Reason and Outcome Row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
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
                                        <View style={styles.halfInput}>
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

                                    {/* Divider */}
                                    <View style={styles.divider} />

                                    {/* Next Steps / Tasks */}
                                    <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>
                                        {t('health_tracker.next_steps_tasks')}
                                    </Text>

                                    <CustomInput
                                        label={t('health_tracker.task')}
                                        placeholder={t('health_tracker.task')}
                                        value={values.task}
                                        onChangeText={handleChange('task')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                    />

                                    <CustomDateTimePicker
                                        label={t('health_tracker.due_date')}
                                        placeholder={t('common.select')}
                                        value={values.dueDate}
                                        onChange={(date) => setFieldValue('dueDate', date)}
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
                                    title={isLoading ? t('common.loading') : t('common.save_changes')}
                                    onPress={formikHandleSubmit}
                                    buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                                    disabled={isLoading}
                                    loading={isLoading}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditAppointment;
