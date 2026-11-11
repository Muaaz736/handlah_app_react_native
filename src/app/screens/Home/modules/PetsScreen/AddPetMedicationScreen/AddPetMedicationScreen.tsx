import { useFocusEffect } from '@react-navigation/native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import React, { useRef, useState, useMemo, useCallback } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { CustomInput, CustomDropDown, CustomDateTimePicker, PrimaryButton, MixedMediaUploader, AuthHeader, OfflineChainGuard, ScheduleTypeInfoModal } from '../../../../../../components/common';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { AddPetMedicationScreenProps } from './addPetMedicationScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { addPetMedicationAsync, editPetMedicationAsync } from '../../../../../../redux/services/essentialsService';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../PetsScreen.styles';
import { makeAddPetMedicationScreenStyles } from './AddPetMedicationScreen.styles';
import colors from '../../../../../../utils/colors';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const WEEKDAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const AddPetMedicationScreen: React.FC<AddPetMedicationScreenProps> = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddPetMedicationScreenStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();

    const petData = route?.params?.petData || {};
    const petId = route?.params?.petId || petData?.id;
    const isEdit = route?.params?.isEdit || false;
    const medication = route?.params?.medication || null;
    const fromPetsScreen = route?.params?.fromPetsScreen || false;
    const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.PetMedication,
        recordId: isEdit && medication?.id ? Number(medication.id) : null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.PetMedication, recordId: isEdit && medication?.id ? Number(medication.id) : null, enabled: links.enabled, choiceOnly: true });

    const { add_pet_medication_status, edit_pet_medication_status } = useSelector((state: any) => state.essentials_slice);
    const isLoading = add_pet_medication_status === ASYNC_STATUS.LOADING || edit_pet_medication_status === ASYNC_STATUS.LOADING;

    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(
        useCallback(() => {
            dispatch(getDropdownOptionsAsync('MedicationDoseUnit'));
        }, [dispatch]),
    );

    const formikRef = useRef<FormikProps<any>>(null);

    // Time chip state (mirrors AddMedication)
    const [scheduledTimes, setScheduledTimes] = useState<string[]>(() => {
        if (isEdit && medication?.times) {
            if (Array.isArray(medication.times)) return medication.times;
            return String(medication.times).split(',').map((t: string) => t.trim()).filter(Boolean);
        }
        return [];
    });
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
    const [timePickerKey, setTimePickerKey] = useState<number>(0);

    const initialScheduleType = (isEdit && medication?.scheduletype) || 'One Time';
    const initialIntervalFrequency = (isEdit && medication?.intervalfrequency) || '';
    const initialIntervalDate = (isEdit && medication?.intervaldate) || '';
    const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(
        initialScheduleType === 'Weekly' && initialIntervalFrequency
            ? String(initialIntervalFrequency).split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
    );
    const [selectedMonthDays, setSelectedMonthDays] = useState<string[]>(
        initialScheduleType === 'Monthly' && initialIntervalDate
            ? String(initialIntervalDate).split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
    );
    const [everyXDaysValue, setEveryXDaysValue] = useState<string>(
        initialScheduleType === 'Every X Days' ? String(initialIntervalFrequency || '') : '',
    );
    const [reminderEnabled, setReminderEnabled] = useState<boolean>(
        isEdit && medication ? medication.hasreminders ?? true : true,
    );
    const [showScheduleGuide, setShowScheduleGuide] = useState<boolean>(false);

    const toggleWeekday = (day: string) => {
        setSelectedWeekdays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
    };

    const toggleMonthDay = (day: string) => {
        setSelectedMonthDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
    };

    const handleAddTime = (date: Date | string) => {
        const d = date instanceof Date ? date : new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 === 0 ? 12 : hours % 12;
        const formatted = `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
        setScheduledTimes(prev => [...prev, formatted]);
        setShowTimePicker(false);
        setTimePickerKey(k => k + 1);
    };

    const handleRemoveTime = (index: number) => {
        setScheduledTimes(prev => prev.filter((_, i) => i !== index));
    };

    const scheduleTypeOptions = [
        { label: 'One Time', value: 'One Time' },
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Every X Days', value: 'Every X Days' },
        { label: 'As Needed', value: 'As Needed' },
        { label: 'With Meals', value: 'With Meals' },
    ];

    const initialValues = {
        name: isEdit && medication ? medication.name : '',
        dose: isEdit && medication ? medication.dose?.toString() || '' : '',
        doseUnit: isEdit && medication ? medication.doseunit || '' : '',
        scheduleType: initialScheduleType,
        times: '',
        startDate: isEdit && medication ? medication.startdate || '' : '',
        endDate: isEdit && medication ? medication.enddate || '' : '',
        notes: isEdit && medication ? medication.notes || '' : '',
        photoUrls: (() => {
            const raw = isEdit && medication ? medication.photourl : null;
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            return [raw];
        })(),
    };

    // Handlers
    const handleAddMedication = (values: typeof initialValues) => {
        if (values.name && values.dose && petId) {
            const isAsNeeded = values.scheduleType === 'As Needed';
            const isOneTime = values.scheduleType === 'One Time';
            const medicationPayload = {
                name: values.name,
                dose: values.dose,
                doseUnit: values.doseUnit,
                scheduleType: values.scheduleType,
                times: !isAsNeeded && scheduledTimes.length > 0 ? scheduledTimes : undefined,
                intervalFrequency:
                    values.scheduleType === 'Weekly'
                        ? selectedWeekdays.join(',')
                        : values.scheduleType === 'Every X Days'
                            ? everyXDaysValue
                            : undefined,
                intervalDate: values.scheduleType === 'Monthly' ? selectedMonthDays.join(',') : undefined,
                startDate: values.startDate || undefined,
                endDate: isOneTime ? undefined : values.endDate || undefined,
                notes: values.notes || undefined,
                hasReminders: isAsNeeded ? false : reminderEnabled,
                photoUrl: values.photoUrls.length > 0 ? values.photoUrls : undefined,
            };


            if (isEdit && medication?.id) {
                dispatch(editPetMedicationAsync({ petId, medicationId: medication.id, data: medicationPayload })).then((action: any) => {
            saveLinksAfter(links, action, medication.id, undefined, recordNotes);
                    if (action.type === editPetMedicationAsync.fulfilled.type) {
                        navigation.goBack();
                    }
                });
            } else {
                dispatch(addPetMedicationAsync({ petId, data: { ...medicationPayload, ...(ownerUserId ? { ownerUserId } : {}) } })).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
                    if (action.type === addPetMedicationAsync.fulfilled.type) {
                        if (fromPetsScreen) navigation.goBack();
                        else (navigation as any).navigate('AddPetVetAppointments', { petData, petId });
                    }
                });
            }
        }
    };

    const handleSkip = () => {
        if (fromPetsScreen) navigation.goBack();
        else (navigation as any).navigate('AddPetVetAppointments', { petData, petId });
    };

    return (
        <SafeAreaView style={commonStyles.container}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
            }}>

                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.header}
                    title={isEdit ? t('pets.update_medication') : t('pets.medications')}
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
                <ScrollView style={commonStyles.scrollView} contentContainerStyle={commonStyles.scrollContent}>
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema('pet_medication')}
                        onSubmit={handleAddMedication}
                    >
                        {({ handleChange, handleSubmit, setFieldValue, values, touched, errors }) => (
                            <>
                                {/* Medication Input */}
                                <View style={commonStyles.inputGroup}>
                                    <CustomInput
                                        value={values.name}
                                        onChangeText={handleChange('name')}
                                        placeholder={t('common.eg_apoquel')}
                                        label={`${t('pets.medication_name')} *`}
                                        labelStyle={{ textAlign: 'left' }}
                                        error={touched.name && errors.name ? String(errors.name) : undefined}
                                    />
                                </View>

                                {/* Dose and Schedule Types Row */}
                                <View style={commonStyles.datesRow}>
                                    <View style={styles.smallInput}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('pets.dose')} *</Text>
                                        <CustomInput
                                            value={values.dose}
                                            onChangeText={handleChange('dose')}
                                            placeholder="5"
                                            keyboardType="numeric"
                                            error={touched.dose && errors.dose ? String(errors.dose) : undefined}
                                        />
                                    </View>
                                    <View style={{ flex: 0.9 }}>
                                        <Text style={commonStyles.label}> </Text>
                                        <CustomDropDown
                                            options={get_dropdown_options_data}
                                            value={values.doseUnit}
                                            onSelect={(val: any) => setFieldValue('doseUnit', val)}
                                            placeholder={t('common.mg_placeholder')}
                                            search={true}
                                            leftIcon={true}
                                        />
                                    </View>
                                    <View style={styles.scheduleContainer}>
                                        <View style={styles.labelRow}>
                                            <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('pets.schedule')} *</Text>
                                            <TouchableOpacity
                                                style={styles.infoIconButton}
                                                onPress={() => setShowScheduleGuide(true)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                accessibilityLabel={t('schedule_guide.icon_label')}
                                            >
                                                <Feather name="info" size={16} color={themeColors.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                        <CustomDropDown
                                            options={scheduleTypeOptions}
                                            value={values.scheduleType}
                                            onSelect={(val: any) => {
                                                if (val !== null) {
                                                    setFieldValue('scheduleType', val);
                                                    setScheduledTimes([]);
                                                    setTimePickerKey(k => k + 1);
                                                    setSelectedWeekdays([]);
                                                    setSelectedMonthDays([]);
                                                    setEveryXDaysValue('');
                                                }
                                            }}
                                            placeholder={t('common.select')}
                                            search={true}
                                            leftIcon={true}
                                        />
                                    </View>
                                </View>

                                {/* Weekday multi-select — Weekly only */}
                                {values.scheduleType === 'Weekly' && (
                                    <View style={commonStyles.inputGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('health_tracker.select_days', { defaultValue: 'Select Days' })}
                                        </Text>
                                        <View style={styles.daysGrid}>
                                            {WEEKDAY_OPTIONS.map(day => {
                                                const isActive = selectedWeekdays.includes(day);
                                                return (
                                                    <TouchableOpacity
                                                        key={day}
                                                        style={[
                                                            styles.dayChip,
                                                            isActive && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                                                        ]}
                                                        onPress={() => toggleWeekday(day)}
                                                    >
                                                        <Text style={[styles.dayChipText, isActive && { color: colors.white }]}>
                                                            {day.slice(0, 3)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {/* Day-of-month multi-select — Monthly only */}
                                {values.scheduleType === 'Monthly' && (
                                    <View style={commonStyles.inputGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('health_tracker.select_dates', { defaultValue: 'Select Days of Month' })}
                                        </Text>
                                        <View style={styles.monthGrid}>
                                            {MONTH_DAYS.map(day => {
                                                const isActive = selectedMonthDays.includes(day);
                                                return (
                                                    <TouchableOpacity
                                                        key={day}
                                                        style={[
                                                            styles.monthChip,
                                                            isActive && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                                                        ]}
                                                        onPress={() => toggleMonthDay(day)}
                                                    >
                                                        <Text style={[styles.monthChipText, isActive && { color: colors.white }]}>
                                                            {day}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {/* Every X Days number input */}
                                {values.scheduleType === 'Every X Days' && (
                                    <View style={commonStyles.inputGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('health_tracker.every_x_days_label', { defaultValue: 'Every how many days?' })}
                                        </Text>
                                        <CustomInput
                                            value={everyXDaysValue}
                                            onChangeText={setEveryXDaysValue}
                                            placeholder="3"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                )}

                                {/* Times — shown for every schedule type except As Needed */}
                                {values.scheduleType !== 'As Needed' && (
                                    <View style={commonStyles.inputGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {values.scheduleType === 'With Meals'
                                                ? t('health_tracker.meal_times', { defaultValue: 'Meal Times' })
                                                : t('pets.times')}
                                        </Text>

                                        {/* Added time chips */}
                                        {scheduledTimes.map((time, index) => (
                                            <View key={index} style={styles.timeChip}>
                                                <MaterialCommunityIcons
                                                    name="clock-outline"
                                                    size={16}
                                                    color={themeColors.primary}
                                                />
                                                <Text style={[styles.timeChipText, { color: themeColors.primary }]}>
                                                    {time}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => handleRemoveTime(index)}
                                                    style={styles.timeChipRemove}
                                                >
                                                    <Feather name="x" size={14} color={colors.error} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}

                                        {/* Inline time picker */}
                                        {showTimePicker && (
                                            <View style={styles.inlineTimePicker}>
                                                <CustomDateTimePicker
                                                    key={`time-${timePickerKey}`}
                                                    placeholder={t('common.select')}
                                                    value={null}
                                                    onChange={handleAddTime}
                                                    mode="time"
                                                    is24Hour={false}
                                                    suffixIcon={
                                                        <MaterialCommunityIcons
                                                            name="clock-outline"
                                                            size={20}
                                                            color={themeColors.textSecondary}
                                                        />
                                                    }
                                                />
                                            </View>
                                        )}

                                        {/* Add Time button — One Time allows only a single time */}
                                        {(values.scheduleType !== 'One Time' || scheduledTimes.length === 0) && (
                                            <TouchableOpacity
                                                style={[styles.addTimeButton, { borderColor: themeColors.primary }]}
                                                onPress={() => setShowTimePicker(true)}
                                            >
                                                <Feather name="plus" size={16} color={themeColors.primary} />
                                                <Text style={[styles.addTimeButtonText, { color: themeColors.primary }]}>
                                                    {t('health_tracker.add_time')}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                                {/* Start Date and End Date Row — End Date hidden for One Time, which shows a single Date field */}
                                <View style={commonStyles.datesRow}>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {values.scheduleType === 'One Time'
                                                ? t('pets.date', { defaultValue: 'Date' })
                                                : t('pets.start_date')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.startDate}
                                            onChange={(val: any) => setFieldValue('startDate', val)}
                                            placeholder={t('common.select')}
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={themeColors.textSecondary}
                                                />
                                            }
                                            error={touched.startDate && errors.startDate ? String(errors.startDate) : undefined}
                                        />
                                    </View>
                                    {values.scheduleType !== 'One Time' && (
                                        <View style={commonStyles.dateGroup}>
                                            <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('pets.end_date')}</Text>
                                            <CustomDateTimePicker
                                                value={values.endDate}
                                                suffixIcon={
                                                    <Ionicons
                                                        name="calendar-outline"
                                                        size={20}
                                                        color={themeColors.textSecondary}
                                                    />
                                                }
                                                onChange={(val: any) => setFieldValue('endDate', val)}
                                                placeholder={t('common.select')}
                                                displayFormat="MM/DD/YYYY"
                                                error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Reminders — hidden for As Needed, no reminders are ever created for that type */}
                                {values.scheduleType !== 'As Needed' && (
                                    <View style={styles.reminderContainer}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('health_tracker.reminders')}</Text>
                                        <TouchableOpacity
                                            style={styles.reminderRow}
                                            onPress={() => setReminderEnabled(!reminderEnabled)}
                                        >
                                            <Feather name="bell" size={20} color={themeColors.textSecondary} />
                                            <Text style={[styles.reminderText, { textAlign: 'left' }]}>
                                                {t('health_tracker.medication_reminder')}
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
                                    </View>
                                )}

                                {/* Upload Section */}
                                <View style={styles.uploadSection}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('pets.upload_photo')}</Text>
                                    <MixedMediaUploader
                                        mediaIds={values.photoUrls}
                                        onMediaChange={(ids: string[]) => setFieldValue('photoUrls', ids)}
                                        uploadType="box"
                                        maxItems={5}
                                        autoUpload={true}
                                        removable={true}
                                    />
                                </View>

                                {/* Side Effects Input */}
                                <View style={commonStyles.inputGroup}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>{t('pets.side_effects')}</Text>
                                    <TextInput
                                        value={values.notes}
                                        onChangeText={handleChange('notes')}
                                        placeholder={t('common.any_reaction_instructions')}
                                        placeholderTextColor="#AAAAAA"
                                        multiline
                                        numberOfLines={4}
                                        style={[commonStyles.textArea, { textAlign: 'left' }]}
                                    />
                                </View>
                            </>
                        )
                        }
                    </Formik>
                <RecordNotesEncryptRow notes={recordNotes} />
                <RecordLinksField links={links} />
                </ScrollView>


                {/* Footer Buttons */}
                <View style={styles.footer}>
                    {isEdit ? (
                        <PrimaryButton
                            title={t('common.update')}
                            onPress={() => formikRef.current?.handleSubmit()}
                            loading={isLoading}
                            disabled={isLoading}
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

            <ScheduleTypeInfoModal
                visible={showScheduleGuide}
                onClose={() => setShowScheduleGuide(false)}
            />
        </SafeAreaView>
    );
};

export default AddPetMedicationScreen;
