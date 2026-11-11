import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
    AuthHeader,
    CustomDateTimePicker,
    CustomDropDown,
    CustomInput,
    MixedMediaUploader,
    PrimaryButton,
    ScheduleTypeInfoModal,
    VendorAutocompleteInput,
} from '../../../../../../components/common';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { getDropdownOptionsAsync, getMedicationTypesAsync } from '../../../../../../redux/services/authService';
import { getChildByIdAsync, getChildDoctorsAsync, updateChildMedicationAsync } from '../../../../../../redux/services/essentialsService';
import { AppDispatch } from '../../../../../../redux/store';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import colors from '../../../../../../utils/colors';
import { isIOS } from '../../../../../../utils/helpers';
import { SCHEDULE_TYPE_OPTIONS } from '../AddMedication/AddMedication.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeEditMedicationStyles } from './EditMedication.styles';
import { EditMedicationRouteParams } from './EditMedication.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

// Define route params type
type EditMedicationRouteProp = RouteProp<{ EditMedication: EditMedicationRouteParams }, 'EditMedication'>;

const WEEKDAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const EditMedication: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditMedicationRouteProp>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeEditMedicationStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
    const { update_child_medication_status, get_child_doctors_status, get_child_doctors_data } = useSelector((state: any) => state.essentials_slice);
    const isLoading = update_child_medication_status === ASYNC_STATUS.LOADING;

    // Get medication data from route params if available
    const medicationData = route.params?.medication || {};
    const childId = route.params?.childId || String(medicationData.childid || '');
    const medicationId = medicationData.id || 0;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Medication,
        recordId: medicationId ? Number(medicationId) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Medication, recordId: medicationId ? Number(medicationId) : null, enabled: links.enabled });

    // Parse dosage (e.g., "10 Mg" -> dose: "10", doseUnit: "Mg")
    // const parseDosage = (dosage?: string) => {
    //     if (!dosage) return { dose: '', doseUnit: '' };
    //     const parts = dosage.split(' ');
    //     return { dose: parts[0] || '', doseUnit: parts[1] || '' };
    // };

    // const { dose: parsedDose, doseUnit: parsedDoseUnit } = parseDosage(medicationData.dosage);

    const [medicationName, setMedicationName] = useState<string>(medicationData.medicationname || medicationData.name || '');
    const [typeForm, setTypeForm] = useState<string>(medicationData.medicationtype || medicationData.typeForm || '');
    const [dose, setDose] = useState<string>(medicationData.dosage || '');
    const [doseUnit, setDoseUnit] = useState<string>(medicationData.doseunit || '');
    const [scheduleType, setScheduleType] = useState<string>(medicationData.scheduletype || medicationData.scheduleType || '');
    // Parse specifictimes: API returns array ["11:42 AM", "11:43 PM"]
    const parseSpecificTimes = (val: any): string[] => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.length > 0) return val.split(',').map((s: string) => s.trim());
        return [];
    };
    const [scheduledTimes, setScheduledTimes] = useState<string[]>(parseSpecificTimes(medicationData.specifictimes || medicationData.times));
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
    const [timePickerKey, setTimePickerKey] = useState<number>(0);
    const initialScheduleType = medicationData.scheduletype || medicationData.scheduleType || '';
    const initialIntervalFrequency = medicationData.intervalfrequency || medicationData.intervalFrequency || '';
    const initialIntervalDate = medicationData.intervaldate || medicationData.intervalDate || '';
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
    const [startDate, setStartDate] = useState<Date | string | null>(medicationData.startdate || medicationData.startDate || null);
    const [endDate, setEndDate] = useState<Date | string | null>(medicationData.enddate || medicationData.endDate || null);
    const [rxNumber, setRxNumber] = useState<string>(medicationData.prescriptionnumber || medicationData.rxNumber || '');
    const [refillDate, setRefillDate] = useState<Date | string | null>(medicationData.refilldate || medicationData.refillDate || null);
    const [prescriber, setPrescriber] = useState<string | null>(medicationData.prescribedbydoctorid != null ? String(medicationData.prescribedbydoctorid) : medicationData.prescriber || null);
    const [prescriberOffice, setPrescriberOffice] = useState<string>(medicationData.prescriberoffice || medicationData.prescriberOffice || '');
    const [pharmacyName, setPharmacyName] = useState<string>(medicationData.pharmacyname || medicationData.pharmacyName || '');
    const [pharmacyPhone, setPharmacyPhone] = useState<string>(medicationData.pharmacyphone || medicationData.pharmacyPhone || '');
    const [pharmacyAddress, setPharmacyAddress] = useState<string>(medicationData.pharmacyaddress || medicationData.pharmacyAddress || '');
    const [sideEffects, setSideEffects] = useState<string>(medicationData.sideeffects || medicationData.sideEffects || '');
    const [reminderEnabled, setReminderEnabled] = useState<boolean>(medicationData.hasreminders ?? medicationData.reminderEnabled ?? false);
    const [showScheduleGuide, setShowScheduleGuide] = useState<boolean>(false);
    const [startDateKey, setStartDateKey] = useState<number>(0);
    const [endDateKey, setEndDateKey] = useState<number>(0);

    // Multi-image setup
    const [imageIds, setImageIds] = useState<string[]>(Array.isArray(medicationData.photourl) ? medicationData.photourl : (medicationData.photourl ? [medicationData.photourl] : []));

    // Fetch doctors on mount
    useEffect(() => {
        if (childId) {
            dispatch(getChildDoctorsAsync(childId));
        }
    }, [childId]);

    // Fetch dropdown data (medication types, dose units)
    useFocusEffect(
        useCallback(() => {
            dispatch(getMedicationTypesAsync());
            dispatch(getDropdownOptionsAsync('MedicationDoseUnit'));
        }, [dispatch]),
    );

    // Get doctor options from API data
    const rawDoctors = get_child_doctors_data?.doctors || get_child_doctors_data || [];
    const prescriberOptions = (Array.isArray(rawDoctors) ? rawDoctors : []).map((doctor: any) => ({
        label: doctor.name,
        value: doctor.id.toString(),
    }));

    // Dynamic dropdowns from Redux (like AddMedication)
    const { get_dropdown_options_data, get_medication_types_data } = useSelector((state: any) => state.user_auth);

    // Wrapper functions for dropdown handlers
    const handleTypeFormSelect = (value: string | string[] | null) => {
        if (typeof value === 'string') setTypeForm(value);
        else if (value === null) setTypeForm('');
    };

    const handleDoseUnitSelect = (value: string | string[] | null) => {
        if (typeof value === 'string') setDoseUnit(value);
        else if (value === null) setDoseUnit('');
    };

    const handleScheduleTypeSelect = (value: string | string[] | null) => {
        if (typeof value === 'string') {
            setScheduleType(value);
            setScheduledTimes([]);
            setTimePickerKey(k => k + 1);
            setSelectedWeekdays([]);
            setSelectedMonthDays([]);
            setEveryXDaysValue('');
        }
        else if (value === null) {
            setScheduleType('');
            setScheduledTimes([]);
            setSelectedWeekdays([]);
            setSelectedMonthDays([]);
            setEveryXDaysValue('');
        }
    };

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

    const handlePrescriberSelect = (value: string | string[] | null) => {
        if (typeof value === 'string') {
            setPrescriber(value);
        }
        else if (value === null) setPrescriber('');
    };

    const toDate = (val: Date | string): Date => {
        if (val instanceof Date) return val;
        return new Date(val);
    };

    // Wrapper functions for date picker handlers
    const handleStartDateChange = (date: Date | string) => {
        const selected = toDate(date);
        if (endDate) {
            const end = toDate(endDate);
            const selectedDay = new Date(
                selected.getFullYear(),
                selected.getMonth(),
                selected.getDate(),
            );
            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            if (selectedDay >= endDay) {
                setEndDate(null);
                setEndDateKey(k => k + 1);
                showErrorAlert(t('health_tracker.start_before_end'));
            }
        }
        setStartDate(date);
    };

    const handleEndDateChange = (date: Date | string) => {
        const selected = toDate(date);
        if (startDate) {
            const start = toDate(startDate);
            const selectedDay = new Date(
                selected.getFullYear(),
                selected.getMonth(),
                selected.getDate(),
            );
            const startDay = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate(),
            );
            if (selectedDay <= startDay) {
                setEndDateKey(k => k + 1);
                showErrorAlert(t('health_tracker.end_after_start'));
                return;
            }
        }
        setEndDate(date);
    };

    const handleRefillDateChange = (date: Date | string) => {
        setRefillDate(date);
    };

    const formatDateToISO = (date: Date | string | null): string | undefined => {
        if (!date) return undefined;
        if (typeof date === 'string') {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;
        }
        return date.toISOString();
    };

    const handleSaveChanges = () => {
        if (!childId || !medicationId) {
            console.error('Missing childId or medicationId');
            return;
        }


        const isAsNeeded = scheduleType === 'As Needed';
        const isOneTime = scheduleType === 'One Time';

        const updatedMedicationData = {
            medicationName: medicationName,
            medicationType: typeForm || undefined,
            dosage: dose,
            doseUnit: doseUnit,
            instructions: undefined,
            frequency: undefined,
            scheduleType: scheduleType || undefined,
            specificTimes: !isAsNeeded && scheduledTimes.length > 0 ? scheduledTimes : undefined,
            intervalFrequency:
                scheduleType === 'Weekly'
                    ? selectedWeekdays.join(',')
                    : scheduleType === 'Every X Days'
                        ? everyXDaysValue
                        : undefined,
            intervalDate: scheduleType === 'Monthly' ? selectedMonthDays.join(',') : undefined,
            startDate: formatDateToISO(startDate),
            endDate: isOneTime ? undefined : formatDateToISO(endDate),
            prescriptionNumber: rxNumber || undefined,
            refillDate: formatDateToISO(refillDate),
            prescribedbyDoctorId: prescriber || null,
            prescriberOffice: prescriberOffice || null,
            pharmacyName: pharmacyName || undefined,
            pharmacyPhone: pharmacyPhone || undefined,
            pharmacyAddress: pharmacyAddress || undefined,
            notes: undefined,
            sideEffects: sideEffects || undefined,
            hasReminders: isAsNeeded ? false : reminderEnabled,
            photoUrl: imageIds,
        };


        dispatch(updateChildMedicationAsync({
            childId,
            medicationId: Number(medicationId),
            medicationData: updatedMedicationData
        })).then((action: any) => {
            saveLinksAfter(links, action, medicationId, undefined, recordNotes);
            if (action.type === updateChildMedicationAsync.fulfilled.type) {
                // Refresh child data
                dispatch(getChildByIdAsync({ childId: childId.toString() }));
                navigation.goBack();
            }
        });
    };

    // No-op handlers for multi-image mode

    return (
        <SafeAreaView style={commonStyles.safeArea}>
            <KeyboardAvoidingView
                style={commonStyles.container}
                behavior={isIOS ? 'padding' : 'height'}
            >
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                    title={t('health_tracker.edit_medication')}
                    subtitle={t('health_tracker.track_doses_refills')}
                    titleStyle={styles.HeaderTitle}
                    backButtonIconStyle={{ tintColor: themeColors.textSecondary }}
                />

                <ScrollView
                    style={commonStyles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* <Text style={[styles.title, { textAlign: 'left' }]}>
                        {t('health_tracker.edit_medication')}
                    </Text>
                    <Text style={[styles.subtitle, { textAlign: 'left' }]}>
                        {t('health_tracker.track_doses_refills')}
                    </Text> */}

                    <View style={commonStyles.formContainer}>
                        {/* Medication Name */}
                        <CustomInput
                            label={`${t('health_tracker.medication_name')} *`}
                            placeholder={`${t('health_tracker.medication_name')} *`}
                            value={medicationName}
                            onChangeText={setMedicationName}
                            containerStyle={styles.inputContainer}
                            labelStyle={{ textAlign: 'left' }}
                            inputStyle={{ textAlign: 'left' }}
                        />

                        {/* Type/Form Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                {t('health_tracker.type_form')}
                            </Text>
                            <CustomDropDown
                                options={get_medication_types_data}
                                value={typeForm}
                                onSelect={handleTypeFormSelect}
                                placeholder={t('common.select')}
                                search={true}
                                leftIcon={true}
                                style={styles.dropdown}
                            />
                        </View>

                        {/* Dose and Schedule Types Row */}
                        <View style={styles.rowContainer}>
                            <View style={styles.smallInput}>
                                <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                    {t('health_tracker.dose')}
                                </Text>
                                <CustomInput
                                    placeholder="10"
                                    value={dose}
                                    onChangeText={setDose}
                                    keyboardType="numeric"
                                    containerStyle={styles.inputContainerNoMargin}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                            <View style={{ flex: 0.9 }}>
                                <Text style={commonStyles.label}> </Text>
                                <CustomDropDown
                                    options={get_dropdown_options_data}
                                    value={doseUnit}
                                    onSelect={handleDoseUnitSelect}
                                    placeholder={t('common.mg_placeholder')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={styles.labelRow}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                        {t('health_tracker.schedule_type')}
                                    </Text>
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
                                    options={SCHEDULE_TYPE_OPTIONS}
                                    value={scheduleType}
                                    onSelect={handleScheduleTypeSelect}
                                    placeholder={t('common.select')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />
                            </View>
                        </View>

                        {/* Weekday multi-select — Weekly only */}
                        {scheduleType === 'Weekly' && (
                            <View style={styles.inputGroup}>
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
                        {scheduleType === 'Monthly' && (
                            <View style={styles.inputGroup}>
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
                        {scheduleType === 'Every X Days' && (
                            <View style={styles.inputGroup}>
                                <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                    {t('health_tracker.every_x_days_label', { defaultValue: 'Every how many days?' })}
                                </Text>
                                <CustomInput
                                    value={everyXDaysValue}
                                    onChangeText={setEveryXDaysValue}
                                    placeholder="3"
                                    keyboardType="numeric"
                                    containerStyle={styles.inputContainerNoMargin}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                        )}

                        {/* Scheduled Times — shown for every schedule type except As Needed */}
                        {scheduleType !== '' && scheduleType !== 'As Needed' && (
                            <View style={styles.inputGroup}>
                                <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                    {scheduleType === 'With Meals'
                                        ? t('health_tracker.meal_times', { defaultValue: 'Meal Times' })
                                        : t('health_tracker.times')}
                                </Text>

                                {/* Added times list */}
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
                                            labelStyle={{ textAlign: 'left' }}
                                            suffixIcon={
                                                <MaterialCommunityIcons
                                                    name="clock-outline"
                                                    size={20}
                                                    color={colors.black}
                                                />
                                            }
                                        />
                                    </View>
                                )}

                                {/* Add Time button — One Time allows only a single time */}
                                {(scheduleType !== 'One Time' || scheduledTimes.length === 0) && (
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
                        <View style={styles.rowContainer}>
                            <View style={styles.halfInput}>
                                <CustomDateTimePicker
                                    key={`start-${startDateKey}`}
                                    label={
                                        scheduleType === 'One Time'
                                            ? t('health_tracker.date', { defaultValue: 'Date' })
                                            : t('health_tracker.start_date')
                                    }
                                    placeholder={t('common.select')}
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    mode="date"
                                    displayFormat="MM/DD/YYYY"
                                    labelStyle={{ textAlign: 'left' }}
                                    maximumDate={
                                        endDate ? new Date(endDate as string) : undefined
                                    }
                                    suffixIcon={
                                        <MaterialCommunityIcons
                                            name="calendar-blank-outline"
                                            size={20}
                                            color={themeColors.textSecondary}
                                        />
                                    }
                                />
                            </View>
                            {scheduleType !== 'One Time' && (
                                <View style={styles.halfInput}>
                                    <CustomDateTimePicker
                                        key={`end-${endDateKey}`}
                                        label={t('health_tracker.end_date')}
                                        placeholder={t('common.select')}
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        mode="date"
                                        displayFormat="MM/DD/YYYY"
                                        labelStyle={{ textAlign: 'left' }}
                                        minimumDate={
                                            startDate ? new Date(startDate as string) : undefined
                                        }
                                        suffixIcon={
                                            <MaterialCommunityIcons
                                                name="calendar-blank-outline"
                                                size={20}
                                                color={themeColors.textSecondary}
                                            />
                                        }
                                    />
                                </View>
                            )}
                        </View>

                        {/* RX # and Refill Date Row */}
                        <View style={styles.rowContainer}>
                            <View style={styles.halfInput}>
                                <CustomInput
                                    label={t('health_tracker.rx_number')}
                                    placeholder={t('health_tracker.rx_number')}
                                    value={rxNumber}
                                    onChangeText={setRxNumber}
                                    containerStyle={styles.inputContainerNoMargin}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <CustomDateTimePicker
                                    label={t('health_tracker.refill_date')}
                                    placeholder={t('common.select')}
                                    value={refillDate}
                                    onChange={handleRefillDateChange}
                                    mode="date"
                                    displayFormat="MM/DD/YYYY"
                                    labelStyle={{ textAlign: 'left' }}
                                    suffixIcon={
                                        <MaterialCommunityIcons
                                            name="calendar-blank-outline"
                                            size={20}
                                            color={colors.black}
                                        />
                                    }
                                />
                            </View>
                        </View>

                        {/* Prescriber and Prescriber Office Row */}
                        <View style={styles.rowContainer}>
                            <View style={styles.halfInput}>
                                <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                    {`${t('health_tracker.prescriber')} `}
                                </Text>
                                <CustomDropDown
                                    options={prescriberOptions}
                                    value={prescriber}
                                    onSelect={handlePrescriberSelect}
                                    placeholder={t('common.select')}
                                    search={prescriberOptions.length > 3}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <CustomInput
                                    label={t('health_tracker.prescriber_office')}
                                    placeholder={t('health_tracker.prescriber_office')}
                                    value={prescriberOffice}
                                    onChangeText={setPrescriberOffice}
                                    containerStyle={styles.inputContainerNoMargin}
                                    inputContainerStyle={styles.highlightedInput}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                        </View>

                        {/* Pharmacy Name and Phone Row */}
                        <View style={styles.rowContainer}>
                            <View style={styles.halfInput}>
                                <VendorAutocompleteInput category="pharmacy_name"
                                    label={t('health_tracker.pharmacy_name')}
                                    placeholder={t('health_tracker.pharmacy_name')}
                                    value={pharmacyName}
                                    onChangeText={setPharmacyName}
                                    containerStyle={styles.inputContainerNoMargin}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <CustomInput
                                    label={t('health_tracker.pharmacy_phone')}
                                    placeholder={t('health_tracker.pharmacy_phone')}
                                    value={pharmacyPhone}
                                    onChangeText={setPharmacyPhone}
                                    keyboardType="phone-pad"
                                    containerStyle={styles.inputContainerNoMargin}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                        </View>

                        {/* Pharmacy Address */}
                        <CustomInput
                            label={t('health_tracker.pharmacy_address')}
                            placeholder={t('health_tracker.pharmacy_address')}
                            value={pharmacyAddress}
                            onChangeText={setPharmacyAddress}
                            containerStyle={styles.inputContainer}
                            labelStyle={{ textAlign: 'left' }}
                            inputStyle={{ textAlign: 'left' }}
                        />

                        {/* Side Effects / Notes */}
                        <CustomInput
                            label={t('health_tracker.side_effects_notes')}
                            placeholder={t('health_tracker.side_effects_notes')}
                            value={sideEffects}
                            onChangeText={setSideEffects}
                            multiline={true}
                            numberOfLines={3}
                            textAlignVertical="top"
                            containerStyle={styles.inputContainer}
                            inputContainerStyle={styles.textAreaContainer}
                            inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                            labelStyle={{ textAlign: 'left' }}
                        />

                        {/* Reminders — hidden for As Needed, no reminders are ever created for that type */}
                        {scheduleType !== 'As Needed' && (
                            <View style={styles.reminderContainer}>
                                <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                    {t('health_tracker.reminders')}
                                </Text>
                                <TouchableOpacity
                                    style={styles.reminderRow}
                                    onPress={() => setReminderEnabled(!reminderEnabled)}
                                >
                                    <Feather name="bell" size={20} color={themeColors.textPrimary} />
                                    <Text style={[styles.reminderText, { textAlign: 'left' }]}>
                                        {t('health_tracker.medication_reminder')}
                                    </Text>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            reminderEnabled && {
                                                backgroundColor: themeColors.primary,
                                                borderColor: themeColors.primary
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

                        {/* Upload Photo */}
                        <View style={styles.uploadContainer}>
                            <MixedMediaUploader
                                label={t('health_tracker.upload_photo')}
                                mediaIds={imageIds}
                                onMediaChange={(ids: string[]) => setImageIds(ids)}
                                uploadType="box"
                                autoUpload={true}
                                maxItems={5}
                                removable={true}
                                containerStyle={{ marginBottom: 0 }}
                            />
                        </View>
                    </View>
                <RecordNotesField notes={recordNotes} />
                <RecordLinksField links={links} />
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title={isLoading ? t('common.loading') : t('common.save_changes')}
                        onPress={handleSaveChanges}
                        buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                        disabled={isLoading}
                    />
                </View>
            </KeyboardAvoidingView>

            <ScheduleTypeInfoModal
                visible={showScheduleGuide}
                onClose={() => setShowScheduleGuide(false)}
            />
        </SafeAreaView>
    );
};

export default EditMedication;
