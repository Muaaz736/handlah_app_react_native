import React, { useMemo, useRef, useState } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
    Text,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikProps } from 'formik';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import {
    AuthHeader,
    CustomDateTimePicker,
    CustomDropDown,
    CustomInput,
    MixedMediaUploader,
    PrimaryButton,
} from '../../../../../../components/common';
import {
    addChildIllnessAsync,
    updateChildIllnessAsync,
    getChildrenAsync,
    addChildDoctorAsync,
    getChildDoctorsAsync,
} from '../../../../../../redux/services/essentialsService';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { formatDropdoenOption } from '../../../../../../utils/helpers';
import validationSchema from '../../../../../../utils/validationSchemas';
import {
    AddIllnessFormData,
    CHRONIC_OPTIONS,
    MONITORING_FREQUENCY_OPTIONS,
    STATUS_OPTIONS,
} from './AddIllness.types';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeAddIllnessStyles } from './AddIllness.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

type RouteParams = {
    AddIllness: {
        childId: string;
        ownerUserId?: number;
        illness?: any;
        isEdit?: boolean;
    };
};

const AddIllness: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'AddIllness'>>();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddIllnessStyles(themeColors as RoleTheme), [themeColors]);
    const formikRef = useRef<FormikProps<AddIllnessFormData> | null>(null);

    const childId = route.params?.childId;
    const ownerUserId = route.params?.ownerUserId;
    const isEdit = route.params?.isEdit || false;
    const illness = route.params?.illness;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Illness,
        recordId: isEdit && illness?.id ? Number(illness.id) : null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Illness, recordId: isEdit && illness?.id ? Number(illness.id) : null, enabled: links.enabled, choiceOnly: true });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [illnessCategoryOptions, setIllnessCategoryOptions] = useState<any[]>([]);
    const [illnessSeverityOptions, setIllnessSeverityOptions] = useState<any[]>([]);
    const [showQuickAddDoctor, setShowQuickAddDoctor] = useState(false);
    const [quickDoctorName, setQuickDoctorName] = useState('');
    const [isAddingDoctor, setIsAddingDoctor] = useState(false);

    const { get_child_by_id_data, get_child_doctors_data, add_child_doctor_status } = useSelector(
        (state: any) => state.essentials_slice,
    );

    const medicationOptions = useMemo(() => {
        const meds = get_child_by_id_data?.medications || [];
        return meds.map((item: any) => ({
            label: item.medicationname,
            value: String(item.id),
        }));
    }, [get_child_by_id_data?.medications]);

    const doctorOptions = useMemo(() => {
        const rawDoctors = get_child_doctors_data?.doctors || get_child_doctors_data || [];
        return Array.isArray(rawDoctors)
            ? rawDoctors.map((item: any) => ({
                label: item.name,
                value: String(item.id),
            }))
            : [];
    }, [get_child_doctors_data]);

    useFocusEffect(
        React.useCallback(() => {
            let mounted = true;

            const fetchIllnessDropdowns = async () => {
                try {
                    const [categoryResult, severityResult] = await Promise.all([
                        dispatch(getDropdownOptionsAsync('ChildIllnessCategory')),
                        dispatch(getDropdownOptionsAsync('ChildIllnessSeverity')),
                    ]);

                    const categoryOptions = formatDropdoenOption(categoryResult?.payload?.options || []);
                    const severityOptions = formatDropdoenOption(severityResult?.payload?.options || []);

                    if (mounted) {
                        setIllnessCategoryOptions(categoryOptions);
                        setIllnessSeverityOptions(severityOptions);
                    }
                } catch {
                    if (mounted) {
                        setIllnessCategoryOptions([]);
                        setIllnessSeverityOptions([]);
                    }
                }
            };

            fetchIllnessDropdowns();

            return () => {
                mounted = false;
            };
        }, [dispatch]),
    );

    React.useEffect(() => {
        if (childId) dispatch(getChildDoctorsAsync(childId));
    }, [childId, add_child_doctor_status]);

    // Helper to get value from multiple possible keys
    const getField = (obj: any, ...keys: string[]) => {
        for (const key of keys) {
            if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
        }
        return '';
    };

    // Helper for date fields (null/undefined/empty string)
    const getDateField = (obj: any, ...keys: string[]) => {
        for (const key of keys) {
            if (obj && obj[key]) return obj[key];
        }
        return null;
    };

    // Helper for photoUrls/photourls/photoUrl
    const getPhotoUrls = (obj: any) => {
        if (Array.isArray(obj?.photoUrls)) return obj.photoUrls;
        if (Array.isArray(obj?.photourls)) return obj.photourls;
        if (obj?.photoUrls) return [obj.photoUrls];
        if (obj?.photourls) return [obj.photourls];
        if (Array.isArray(obj?.photoUrl)) return obj.photoUrl;
        if (obj?.photoUrl) return [obj.photoUrl];
        return [];
    };

    // Helper for dropdowns (string/number/null)
    const getDropdownValue = (obj: any, ...keys: string[]) => {
        for (const key of keys) {
            if (obj && obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
        }
        return '';
    };

    const initialValues: AddIllnessFormData = {
        conditionName: getField(illness, 'conditionName', 'conditionname', 'name'),
        alternateName: getField(illness, 'alternateName', 'alternatename'),
        category: getDropdownValue(illness, 'category'),
        severity: getDropdownValue(illness, 'severity'),
        status: getField(illness, 'status') || 'Active',
        chronic: getField(illness, 'chronic') || 'No',
        onsetDate: getDateField(illness, 'onsetDate', 'onsetdate'),
        diagnosisDate: getDateField(illness, 'diagnosisDate', 'diagnosisdate'),
        resolvedDate: getDateField(illness, 'resolvedDate', 'resolveddate'),
        lastFlareUp: getDateField(illness, 'lastFlareUp', 'lastflareup'),
        nextReviewDate: getDateField(illness, 'nextReviewDate', 'nextreviewdate'),
        diagnosingProvider: getField(illness, 'diagnosingProvider', 'diagnosingprovider'),
        facility: getField(illness, 'facility'),
        icd10Code: getField(illness, 'icd10Code', 'icd10code'),
        snomedCode: getField(illness, 'snomedCode', 'snomedcode'),
        symptoms: getField(illness, 'symptoms'),
        triggerFactors: getField(illness, 'triggerFactors', 'triggerfactors'),
        familyHistory: getField(illness, 'familyHistory', 'familyhistory'),
        linkedMedication: getDropdownValue(illness, 'linkedMedication', 'linkedmedication'),
        linkedDoctor: getDropdownValue(illness, 'linkedDoctor', 'linkeddoctor'),
        linkedAllergies: getField(illness, 'linkedAllergies', 'linkedallergies'),
        treatmentPlan: getField(illness, 'treatmentPlan', 'treatmentplan'),
        monitoringFrequency: getDropdownValue(illness, 'monitoringFrequency', 'monitoringfrequency'),
        notes: getField(illness, 'notes'),
        photoUrls: getPhotoUrls(illness),
    };

    const toISOStringOrUndefined = (value: string | Date | null | undefined) => {
        if (!value) return undefined;
        try {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return new Date(value).toISOString();
        } catch {
            return undefined;
        }
    };

    const handleQuickAddDoctor = () => {
        setIsAddingDoctor(true);
        const name = quickDoctorName.trim();
        if (!name) {
            showErrorAlert('Name is required');
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
                setIsAddingDoctor(false);
            }
        });
    };

    const toNumberOrUndefined = (value: string | null | undefined) => {
        if (!value) return undefined;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    const handleSubmit = async (values: AddIllnessFormData) => {
        if (!childId || isSubmitting) return;

        const payload = {
            conditionName: values.conditionName,
            alternateName: values.alternateName || undefined,
            category: values.category || undefined,
            severity: values.severity || undefined,
            status: values.status || undefined,
            chronic: values.chronic || undefined,
            onsetDate: toISOStringOrUndefined(values.onsetDate),
            diagnosisDate: toISOStringOrUndefined(values.diagnosisDate),
            resolvedDate: toISOStringOrUndefined(values.resolvedDate),
            lastFlareUp: toISOStringOrUndefined(values.lastFlareUp),
            nextReviewDate: toISOStringOrUndefined(values.nextReviewDate),
            diagnosingProvider: values.diagnosingProvider || undefined,
            facility: values.facility || undefined,
            icd10Code: values.icd10Code || undefined,
            snomedCode: values.snomedCode || undefined,
            symptoms: values.symptoms || undefined,
            triggerFactors: values.triggerFactors || undefined,
            familyHistory: values.familyHistory || undefined,
            linkedMedication: toNumberOrUndefined(values.linkedMedication),
            linkedDoctor: toNumberOrUndefined(values.linkedDoctor),
            linkedAllergies: values.linkedAllergies || undefined,
            treatmentPlan: values.treatmentPlan || undefined,
            monitoringFrequency: values.monitoringFrequency || undefined,
            notes: values.notes || undefined,
            photoUrls: values.photoUrls?.length ? values.photoUrls : undefined,
            ...(ownerUserId ? { ownerUserId } : {}),
        };

        try {
            setIsSubmitting(true);

            if (isEdit && illness?.id) {
                const action = await dispatch(
                    updateChildIllnessAsync({
                        childId,
                        illnessId: illness.id,
                        illnessData: payload,
                    }),
                );
                saveLinksAfter(links, action, illness.id, undefined, recordNotes);
                if (action.type === updateChildIllnessAsync.fulfilled.type) {
                    navigation.goBack();
                }
            } else {
                const action = await dispatch(
                    addChildIllnessAsync({
                        childId,
                        illnessData: payload,
                    }),
                );
                saveLinksAfter(links, action, undefined, undefined, recordNotes);

                if (action.type === addChildIllnessAsync.fulfilled.type) {
                    dispatch(getChildrenAsync({}));
                    navigation.goBack();
                }
            }
        } finally {
            setIsSubmitting(false);
        }
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
                    title={isEdit ? t('health_tracker.update_illness_diagnosis') : t('health_tracker.add_illness_diagnosis')}
                    subtitle={t('health_tracker.illness_diagnosis_subtitle')}
                    titleStyle={styles.headerTitle}
                    backButtonIconStyle={{tintColor: themeColors.textPrimary}}
                />

                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema('child_illness')}
                    onSubmit={handleSubmit}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                    }) => (
                        <>
                            <ScrollView
                                style={commonStyles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Core Information</Text>

                                <CustomInput
                                    label={'Condition / Diagnosis Name*'}
                                    placeholder="Asthma"
                                    value={values.conditionName}
                                    onChangeText={handleChange('conditionName')}
                                    onBlur={handleBlur('conditionName')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                    error={
                                        touched.conditionName && errors.conditionName
                                            ? String(errors.conditionName)
                                            : undefined
                                    }
                                />

                                <CustomInput
                                    label="Alternate Name"
                                    placeholder="Reactive Airway Disease"
                                    value={values.alternateName}
                                    onChangeText={handleChange('alternateName')}
                                    onBlur={handleBlur('alternateName')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Category</Text>
                                        <CustomDropDown
                                            options={illnessCategoryOptions}
                                            value={values.category}
                                            onSelect={(value) =>
                                                setFieldValue('category', typeof value === 'string' ? value : '')
                                            }
                                            placeholder={t('common.select')}
                                            search={true}
                                            leftIcon={true}
                                            style={styles.dropdown}
                                        />
                                    </View>

                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Severity</Text>
                                        <CustomDropDown
                                            options={illnessSeverityOptions}
                                            value={values.severity}
                                            onSelect={(value) =>
                                                setFieldValue('severity', typeof value === 'string' ? value : '')
                                            }
                                            placeholder={t('common.select')}
                                            search={true}
                                            leftIcon={true}
                                            style={styles.dropdown}
                                        />
                                    </View>
                                </View>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Status</Text>
                                        <CustomDropDown
                                            options={STATUS_OPTIONS}
                                            value={values.status}
                                            onSelect={(value) =>
                                                setFieldValue('status', typeof value === 'string' ? value : '')
                                            }
                                            placeholder={t('common.select')}
                                            search={false}
                                            leftIcon={true}
                                            style={styles.dropdown}
                                        />
                                    </View>

                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Chronic</Text>
                                        <CustomDropDown
                                            options={CHRONIC_OPTIONS}
                                            value={values.chronic}
                                            onSelect={(value) =>
                                                setFieldValue('chronic', typeof value === 'string' ? value : '')
                                            }
                                            placeholder={t('common.select')}
                                            search={false}
                                            leftIcon={true}
                                            style={styles.dropdown}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Timeline</Text>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Onset Date"
                                            placeholder={t('common.select')}
                                            value={values.onsetDate}
                                            onChange={(value) => setFieldValue('onsetDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Diagnosis Date"
                                            placeholder={t('common.select')}
                                            value={values.diagnosisDate}
                                            onChange={(value) => setFieldValue('diagnosisDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                </View>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Resolved Date"
                                            placeholder={t('common.select')}
                                            value={values.resolvedDate}
                                            onChange={(value) => setFieldValue('resolvedDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Last Flare-Up"
                                            placeholder={t('common.select')}
                                            value={values.lastFlareUp}
                                            onChange={(value) => setFieldValue('lastFlareUp', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                </View>

                                <CustomDateTimePicker
                                    label="Next Review Date"
                                    placeholder={t('common.select')}
                                    value={values.nextReviewDate}
                                    onChange={(value) => setFieldValue('nextReviewDate', value)}
                                    mode="date"
                                    displayFormat="MM/DD/YYYY"
                                    suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                />

                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Clinical Details</Text>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="Diagnosing Provider"
                                            placeholder="Dr. Smith"
                                            value={values.diagnosingProvider}
                                            onChangeText={handleChange('diagnosingProvider')}
                                            onBlur={handleBlur('diagnosingProvider')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="Facility"
                                            placeholder="Mass General"
                                            value={values.facility}
                                            onChangeText={handleChange('facility')}
                                            onBlur={handleBlur('facility')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                </View>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="ICD-10 Code"
                                            placeholder="J45.909"
                                            value={values.icd10Code}
                                            onChangeText={handleChange('icd10Code')}
                                            onBlur={handleBlur('icd10Code')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="SNOMED Code"
                                            placeholder="Optional"
                                            value={values.snomedCode}
                                            onChangeText={handleChange('snomedCode')}
                                            onBlur={handleBlur('snomedCode')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                </View>

                                <CustomInput
                                    label="Symptoms"
                                    placeholder="Wheezing, Coughing"
                                    value={values.symptoms}
                                    onChangeText={handleChange('symptoms')}
                                    onBlur={handleBlur('symptoms')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <CustomInput
                                    label="Trigger Factors"
                                    placeholder="Dust"
                                    value={values.triggerFactors}
                                    onChangeText={handleChange('triggerFactors')}
                                    onBlur={handleBlur('triggerFactors')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <CustomInput
                                    label="Family History"
                                    placeholder="Notes On Family History"
                                    value={values.familyHistory}
                                    onChangeText={handleChange('familyHistory')}
                                    onBlur={handleBlur('familyHistory')}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputContainerStyle={styles.textAreaContainer}
                                    inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                />

                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Management & Relationships</Text>

                                <View style={styles.quickLabelRow}>
                                    <Text style={styles.label}>Linked Medications</Text>
                                    <TouchableOpacity
                                        style={[styles.quickAddButton, { borderColor: themeColors.secondary }]}
                                        onPress={() =>
                                            childId &&
                                            (navigation as any).navigate('AddMedication', {
                                                childId,
                                                ...(ownerUserId ? { ownerUserId } : {}),
                                            })
                                        }
                                    >
                                        <Text style={[styles.quickAddText, { color: themeColors.secondary }]}>Quick Add</Text>
                                    </TouchableOpacity>
                                </View>
                                <CustomDropDown
                                    options={medicationOptions}
                                    value={values.linkedMedication}
                                    onSelect={(value) =>
                                        setFieldValue('linkedMedication', typeof value === 'string' ? value : '')
                                    }
                                    placeholder={t('common.select')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />

                                <View>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={styles.label}>Linked Doctor</Text>
                                        <TouchableOpacity
                                            style={[styles.quickAddButton, { borderColor: themeColors.secondary }]}
                                            onPress={() => setShowQuickAddDoctor(!showQuickAddDoctor)}
                                        >
                                            <Text style={[styles.quickAddText, { color: themeColors.secondary }]}>Quick Add</Text>
                                        </TouchableOpacity>
                                    </View>
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
                                </View>
                                <CustomDropDown
                                    options={doctorOptions}
                                    value={values.linkedDoctor}
                                    onSelect={(value) =>
                                        setFieldValue('linkedDoctor', typeof value === 'string' ? value : '')
                                    }
                                    placeholder={t('common.select')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />

                                <CustomInput
                                    label="Linked Allergies"
                                    placeholder="Seasonal Allergies"
                                    value={values.linkedAllergies}
                                    onChangeText={handleChange('linkedAllergies')}
                                    onBlur={handleBlur('linkedAllergies')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <CustomInput
                                    label="Treatment Plan"
                                    placeholder="Describe Treatment Plan"
                                    value={values.treatmentPlan}
                                    onChangeText={handleChange('treatmentPlan')}
                                    onBlur={handleBlur('treatmentPlan')}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputContainerStyle={styles.textAreaContainer}
                                    inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                />

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Monitoring Frequency</Text>
                                    <CustomDropDown
                                        options={MONITORING_FREQUENCY_OPTIONS}
                                        value={values.monitoringFrequency}
                                        onSelect={(value) =>
                                            setFieldValue('monitoringFrequency', typeof value === 'string' ? value : '')
                                        }
                                        placeholder={t('common.select')}
                                        search={false}
                                        leftIcon={true}
                                        style={styles.dropdown}
                                    />
                                </View>

                                <CustomInput
                                    label={t('pets.notes')}
                                    placeholder={t('pets.notes_placeholder')}
                                    value={values.notes}
                                    onChangeText={handleChange('notes')}
                                    onBlur={handleBlur('notes')}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputContainerStyle={styles.textAreaContainer}
                                    inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                />

                                <View style={styles.uploadSection}>
                                    <Text style={styles.label}>Upload Attachments</Text>
                                    <MixedMediaUploader
                                        mediaIds={values.photoUrls}
                                        onMediaChange={(ids: string[]) => setFieldValue('photoUrls', ids)}
                                        uploadType="box"
                                        maxItems={5}
                                        autoUpload={true}
                                        removable={true}
                                    />
                                </View>
                            <RecordNotesEncryptRow notes={recordNotes} />
                            <RecordLinksField links={links} />
                            </ScrollView>

                            <View style={styles.footer}>
                                <PrimaryButton
                                    title={isEdit ? t('health_tracker.update_illness_diagnosis') : t('health_tracker.add_illness_diagnosis')}
                                    onPress={() => formikRef.current?.handleSubmit()}
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                    buttonStyle={[styles.submitButton, { backgroundColor: themeColors.primary }]}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddIllness;
