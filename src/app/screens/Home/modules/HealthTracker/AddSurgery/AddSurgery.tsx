import React, { useMemo, useRef, useState } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik, FormikProps } from 'formik';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {
    AuthHeader,
    CustomDateTimePicker,
    CustomDropDown,
    CustomInput,
    MixedMediaUploader,
    PrimaryButton,
} from '../../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import validationSchema from '../../../../../../utils/validationSchemas';
import {
    addChildSurgeryAsync,
    getChildrenAsync,
    updateChildSurgeryAsync,
    addChildDoctorAsync,
    getChildDoctorsAsync,
    addChildIllnessAsync,
    getChildByIdAsync,
} from '../../../../../../redux/services/essentialsService';
import { AddSurgeryFormData, ADMISSION_TYPE_OPTIONS, OUTCOME_STATUS_OPTIONS, PATIENT_TYPE_OPTIONS, REHAB_REQUIRED_OPTIONS, SURGERY_STATUS_OPTIONS } from './AddSurgery.types';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { TextInput } from 'react-native';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeAddSurgeryStyles } from './AddSurgery.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

type RouteParams = {
    AddSurgery: {
        childId: string;
        ownerUserId?: number;
        surgery?: any;
        isEdit?: boolean;
    };
};

const AddSurgery: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'AddSurgery'>>();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddSurgeryStyles(themeColors as RoleTheme), [themeColors]);
    const formikRef = useRef<FormikProps<AddSurgeryFormData> | null>(null);

    const childId = route.params?.childId;
    const ownerUserId = route.params?.ownerUserId;
    const surgery = route.params?.surgery;
    const isEdit = route.params?.isEdit || false;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Surgery,
        recordId: isEdit && surgery?.id ? Number(surgery.id) : null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Surgery, recordId: isEdit && surgery?.id ? Number(surgery.id) : null, enabled: links.enabled, choiceOnly: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { get_child_by_id_data } = useSelector((state: any) => state.essentials_slice);
    const { add_child_doctor_status } = useSelector((state: any) => state.essentials_slice);
    const isAddingDoctor = add_child_doctor_status === 'loading';

    const medicationOptions = useMemo(() => {
        const meds = get_child_by_id_data?.medications || [];
        return meds.map((item: any) => ({
            label: item.medicationname,
            value: String(item.id),
        }));
    }, [get_child_by_id_data?.medications]);

    const doctorOptions = useMemo(() => {
        const doctors = get_child_by_id_data?.doctors || [];
        return doctors.map((item: any) => ({
            label: item.name,
            value: String(item.id),
        }));
    }, [get_child_by_id_data?.doctors]);

    const diagnosisOptions = useMemo(() => {
        const illnesses = get_child_by_id_data?.illnesses || [];
        return illnesses.map((item: any) => ({
            label: item.conditionName || item.conditionname || item.name,
            value: String(item.id),
        }));
    }, [get_child_by_id_data?.illnesses]);

    // fetch doctors for dropdowns (keep in sync with other modules)
    React.useEffect(() => {
        if (childId) dispatch(getChildDoctorsAsync(childId));
    }, [childId]);

    const [showQuickAddDoctor, setShowQuickAddDoctor] = useState(false);
    const [showQuickAddSurgeon, setShowQuickAddSurgeon] = useState(false);
    const [quickDoctorName, setQuickDoctorName] = useState('');

    const [showQuickAddDiagnosis, setShowQuickAddDiagnosis] = useState(false);
    const [quickDiagnosisName, setQuickDiagnosisName] = useState('');
    const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);

    const refreshChildData = () => {
        if (!childId) return;
        dispatch(
            getChildByIdAsync({
                childId: String(childId),
                ...(ownerUserId ? { ownerUserId } : {}),
            }),
        );
    };

    const handleQuickAddDiagnosis = () => {
        const name = quickDiagnosisName.trim();
        if (!name) {
            showErrorAlert('Condition / Diagnosis name is required');
            return;
        }
        if (!childId) return;
        setIsAddingDiagnosis(true);
        dispatch(
            addChildIllnessAsync({
                childId: String(childId),
                illnessData: {
                    conditionName: name,
                    ...(ownerUserId ? { ownerUserId } : {}),
                },
            }),
        )
            .then((action: any) => {
                if (action.type === addChildIllnessAsync.fulfilled.type) {
                    setQuickDiagnosisName('');
                    setShowQuickAddDiagnosis(false);
                    refreshChildData();
                }
            })
            .finally(() => setIsAddingDiagnosis(false));
    };

    const handleQuickAddDoctor = () => {
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
            }
        });
    };

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

    const initialValues: AddSurgeryFormData = {
        procedureName: getField(surgery, 'procedureName', 'procedurename', 'name'),
        reason: getField(surgery, 'reason'),
        bodySite: getField(surgery, 'bodySite', 'bodysite'),
        status: getField(surgery, 'status') || 'Active',

        scheduledDate: getDateField(surgery, 'scheduledDate', 'scheduleddate'),
        performedDate: getDateField(surgery, 'performedDate', 'performeddate'),
        admissionType: getField(surgery, 'admissionType', 'admissiontype') || 'Emergency',
        patientType: getField(surgery, 'patientType', 'patienttype') || 'Inpatient',
        dischargeDate: getDateField(surgery, 'dischargeDate', 'dischargedate'),
        followUpDate: getDateField(surgery, 'followUpDate', 'followupdate'),

        surgeonProvider: getField(surgery, 'surgeonProvider', 'surgeonprovider'),
        assistingProviders: getField(surgery, 'assistingProviders', 'assistingproviders'),
        facility: getField(surgery, 'facility'),
        department: getField(surgery, 'department'),

        cptCode: getField(surgery, 'cptCode', 'cptcode'),
        hcpcsCode: getField(surgery, 'hcpcsCode', 'hcpcscode'),
        icd10pcsCode: getField(surgery, 'icd10pcsCode', 'icd10pcscode'),
        outcomeStatus: getField(surgery, 'outcomeStatus', 'outcomestatus') || 'Recovered',
        linkedDiagnosis: getDropdownValue(surgery, 'linkedDiagnosis', 'linkeddiagnosis'),
        complications: getField(surgery, 'complications'),
        pathologySummary: getField(surgery, 'pathologySummary', 'pathologysummary'),
        linkedMedication: getDropdownValue(surgery, 'linkedMedication', 'linkedmedication'),
        linkedDoctor: getDropdownValue(surgery, 'linkedDoctor', 'linkeddoctor'),
        recoveryNotes: getField(surgery, 'recoveryNotes', 'recoverynotes'),
        restrictions: getField(surgery, 'restrictions'),
        rehabRequired: getField(surgery, 'rehabRequired', 'rehabrequired') || 'No',
        followUpProvider: getDropdownValue(surgery, 'followUpProvider', 'followupprovider'),
        notes: getField(surgery, 'notes'),
        photoUrls: getPhotoUrls(surgery),
    };

    const toISOStringOrUndefined = (value: string | Date | null | undefined) => {
        if (!value) return undefined;
        try {
            if (value instanceof Date) return value.toISOString();
            return new Date(value).toISOString();
        } catch {
            return undefined;
        }
    };

    const toNumberOrUndefined = (value: string | null | undefined) => {
        if (!value) return undefined;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    const handleSubmit = async (values: AddSurgeryFormData) => {
        if (!childId || isSubmitting) return;

        const payload = {
            procedureName: values.procedureName,
            reason: values.reason || undefined,
            bodySite: values.bodySite || undefined,
            status: values.status || undefined,

            scheduledDate: toISOStringOrUndefined(values.scheduledDate),
            performedDate: toISOStringOrUndefined(values.performedDate),
            admissionType: values.admissionType || undefined,
            patientType: values.patientType || undefined,
            dischargeDate: toISOStringOrUndefined(values.dischargeDate),
            followUpDate: toISOStringOrUndefined(values.followUpDate),

            surgeonProvider: values.surgeonProvider || undefined,
            assistingProviders: values.assistingProviders || undefined,
            facility: values.facility || undefined,
            department: values.department || undefined,

            cptCode: values.cptCode || undefined,
            hcpcsCode: values.hcpcsCode || undefined,
            icd10pcsCode: values.icd10pcsCode || undefined,
            outcomeStatus: values.outcomeStatus || undefined,
            linkedDiagnosis: values.linkedDiagnosis || undefined,
            complications: values.complications || undefined,
            pathologySummary: values.pathologySummary || undefined,
            linkedMedication: toNumberOrUndefined(values.linkedMedication),
            linkedDoctor: toNumberOrUndefined(values.linkedDoctor),
            recoveryNotes: values.recoveryNotes || undefined,
            restrictions: values.restrictions || undefined,
            rehabRequired: values.rehabRequired || undefined,
            followUpProvider: values.followUpProvider || undefined,
            notes: values.notes || undefined,
            photoUrls: values.photoUrls?.length ? values.photoUrls : undefined,
            ...(ownerUserId ? { ownerUserId } : {}),
        };

        try {
            setIsSubmitting(true);

            if (isEdit && surgery?.id) {
                const action = await dispatch(
                    updateChildSurgeryAsync({
                        childId,
                        surgeryId: surgery.id,
                        surgeryData: payload,
                    }),
                );
                saveLinksAfter(links, action, surgery.id, undefined, recordNotes);

                if (action.type === updateChildSurgeryAsync.fulfilled.type) {
                    navigation.goBack();
                }
            } else {
                const action = await dispatch(
                    addChildSurgeryAsync({
                        childId,
                        surgeryData: payload,
                    }),
                );
                saveLinksAfter(links, action, undefined, undefined, recordNotes);

                if (action.type === addChildSurgeryAsync.fulfilled.type) {
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
            <KeyboardAvoidingView style={commonStyles.container} behavior={isIOS ? 'padding' : 'height'}>
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                    title={isEdit ? t('health_tracker.update_surgery') : t('health_tracker.add_surgery')}
                    subtitle={t('health_tracker.surgery_subtitle')}
                    titleStyle={styles.headerTitle}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />

                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema('child_surgery')}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                        <>
                            <ScrollView
                                style={commonStyles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Core Information</Text>

                                <CustomInput
                                    label="Procedure / Surgery Name*"
                                    placeholder="Appendectomy"
                                    value={values.procedureName}
                                    onChangeText={handleChange('procedureName')}
                                    onBlur={handleBlur('procedureName')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                    error={
                                        touched.procedureName && errors.procedureName
                                            ? String(errors.procedureName)
                                            : undefined
                                    }
                                />

                                <CustomInput
                                    label="Reason / Indication"
                                    placeholder="Acute"
                                    value={values.reason}
                                    onChangeText={handleChange('reason')}
                                    onBlur={handleBlur('reason')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="Body Site"
                                            placeholder="Appendix"
                                            value={values.bodySite}
                                            onChangeText={handleChange('bodySite')}
                                            onBlur={handleBlur('bodySite')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>

                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Status</Text>
                                        <CustomDropDown
                                            options={SURGERY_STATUS_OPTIONS}
                                            value={values.status}
                                            onSelect={(value) => setFieldValue('status', typeof value === 'string' ? value : '')}
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
                                            label="Scheduled Date"
                                            placeholder={t('common.select')}
                                            value={values.scheduledDate}
                                            onChange={(value) => setFieldValue('scheduledDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Date Performed"
                                            placeholder={t('common.select')}
                                            value={values.performedDate}
                                            onChange={(value) => setFieldValue('performedDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                </View>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Admission Type</Text>
                                        <CustomDropDown
                                            options={ADMISSION_TYPE_OPTIONS}
                                            value={values.admissionType}
                                            onSelect={(value) => setFieldValue('admissionType', typeof value === 'string' ? value : '')}
                                            placeholder={t('common.select')}
                                            search={false}
                                            leftIcon={true}
                                            style={styles.dropdown}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={styles.label}>Inpatient / Outpatient</Text>
                                        <CustomDropDown
                                            options={PATIENT_TYPE_OPTIONS}
                                            value={values.patientType}
                                            onSelect={(value) => setFieldValue('patientType', typeof value === 'string' ? value : '')}
                                            placeholder={t('common.select')}
                                            search={false}
                                            leftIcon={true}
                                            style={styles.dropdown}
                                        />
                                    </View>
                                </View>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Discharge Date"
                                            placeholder={t('common.select')}
                                            value={values.dischargeDate}
                                            onChange={(value) => setFieldValue('dischargeDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomDateTimePicker
                                            label="Follow-Up Date"
                                            placeholder={t('common.select')}
                                            value={values.followUpDate}
                                            onChange={(value) => setFieldValue('followUpDate', value)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            suffixIcon={<Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Provider & Facility</Text>

                                <View style={styles.quickLabelRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={styles.label}>Surgeon / Provider</Text>
                                        <TouchableOpacity
                                            style={[styles.quickAddButton, { borderColor: themeColors.primary }]}
                                            onPress={() => setShowQuickAddSurgeon(!showQuickAddSurgeon)}
                                        >
                                            <Feather
                                                name={showQuickAddSurgeon ? 'minus' : 'plus'}
                                                size={13}
                                                color={themeColors.primary}
                                            />
                                            <Text style={[styles.quickAddText, { color: themeColors.primary }]}>Quick Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {showQuickAddSurgeon && (
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
                                    options={[...doctorOptions]}
                                    value={values.surgeonProvider}
                                    onSelect={(value) => setFieldValue('surgeonProvider', typeof value === 'string' ? value : '')}
                                    placeholder={t('common.select')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />

                                <CustomInput
                                    label="Assisting Provider(s)"
                                    placeholder="Optional"
                                    value={values.assistingProviders}
                                    onChangeText={handleChange('assistingProviders')}
                                    onBlur={handleBlur('assistingProviders')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="Facility / Hospital"
                                            placeholder="General Hospital"
                                            value={values.facility}
                                            onChangeText={handleChange('facility')}
                                            onBlur={handleBlur('facility')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="Department"
                                            placeholder="General Surgery"
                                            value={values.department}
                                            onChangeText={handleChange('department')}
                                            onBlur={handleBlur('department')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.sectionTitle, { color: themeColors.secondary }]}>Clinical Details & Recovery</Text>

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="CPT Code"
                                            placeholder="Dr.Adam Lawe"
                                            value={values.cptCode}
                                            onChangeText={handleChange('cptCode')}
                                            onBlur={handleBlur('cptCode')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <CustomInput
                                            label="HCPCS Code"
                                            placeholder="Optional"
                                            value={values.hcpcsCode}
                                            onChangeText={handleChange('hcpcsCode')}
                                            onBlur={handleBlur('hcpcsCode')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                </View>

                                <CustomInput
                                    label="ICD-10-PCS Code"
                                    placeholder="General Hospital"
                                    value={values.icd10pcsCode}
                                    onChangeText={handleChange('icd10pcsCode')}
                                    onBlur={handleBlur('icd10pcsCode')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Outcome Status</Text>
                                    <CustomDropDown
                                        options={OUTCOME_STATUS_OPTIONS}
                                        value={values.outcomeStatus}
                                        onSelect={(value) => setFieldValue('outcomeStatus', typeof value === 'string' ? value : '')}
                                        placeholder={t('common.select')}
                                        search={false}
                                        leftIcon={true}
                                        style={styles.dropdown}
                                    />
                                </View>

                                <View style={styles.quickLabelRow}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <Text style={styles.label}>Linked Diagnosis</Text>
                                        <TouchableOpacity
                                            style={[styles.quickAddButton, { borderColor: themeColors.primary }]}
                                            onPress={() => setShowQuickAddDiagnosis(!showQuickAddDiagnosis)}
                                        >
                                            <Feather
                                                name={showQuickAddDiagnosis ? 'minus' : 'plus'}
                                                size={13}
                                                color={themeColors.primary}
                                            />
                                            <Text style={[styles.quickAddText, { color: themeColors.primary }]}>Quick Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {showQuickAddDiagnosis && (
                                        <View style={styles.quickAddDoctorForm}>
                                            <TextInput
                                                style={styles.quickAddDoctorInput}
                                                placeholder={'Condition / Diagnosis Name'}
                                                placeholderTextColor={colors.gray}
                                                value={quickDiagnosisName}
                                                onChangeText={setQuickDiagnosisName}
                                                editable={!isAddingDiagnosis}
                                            />
                                            <TouchableOpacity
                                                style={[
                                                    styles.quickAddDoctorSaveBtn,
                                                    { backgroundColor: themeColors.primary },
                                                ]}
                                                onPress={handleQuickAddDiagnosis}
                                                disabled={isAddingDiagnosis}
                                            >
                                                {isAddingDiagnosis ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color={colors.white}
                                                    />
                                                ) : (
                                                    <Text style={styles.quickAddDoctorSaveBtnText}>
                                                        Add
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                <CustomDropDown
                                    options={diagnosisOptions}
                                    value={values.linkedDiagnosis}
                                    onSelect={(value) => setFieldValue('linkedDiagnosis', typeof value === 'string' ? value : '')}
                                    placeholder={t('common.select')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />

                                <CustomInput
                                    label="Complications"
                                    placeholder="ASD"
                                    value={values.complications}
                                    onChangeText={handleChange('complications')}
                                    onBlur={handleBlur('complications')}
                                    multiline={true}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputContainerStyle={styles.textAreaContainer}
                                    inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                />

                                <CustomInput
                                    label="Pathology / Result Summary"
                                    placeholder="ASD"
                                    value={values.pathologySummary}
                                    onChangeText={handleChange('pathologySummary')}
                                    onBlur={handleBlur('pathologySummary')}
                                    multiline={true}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputContainerStyle={styles.textAreaContainer}
                                    inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                />

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Linked Medications</Text>
                                    <CustomDropDown
                                        options={medicationOptions}
                                        value={values.linkedMedication}
                                        onSelect={(value) => setFieldValue('linkedMedication', typeof value === 'string' ? value : '')}
                                        placeholder={t('common.select')}
                                        search={true}
                                        leftIcon={true}
                                        style={styles.dropdown}
                                    />
                                </View>

                                <View style={styles.quickLabelRow}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <Text style={styles.label}>Linked Doctors</Text>
                                        <TouchableOpacity
                                            style={[styles.quickAddButton, { borderColor: themeColors.primary }]}
                                            onPress={() => setShowQuickAddDoctor(!showQuickAddDoctor)}
                                        >
                                            <Feather
                                                name={showQuickAddDoctor ? 'minus' : 'plus'}
                                                size={13}
                                                color={themeColors.primary}
                                            />
                                            <Text style={[styles.quickAddText, { color: themeColors.primary }]}>Quick Add</Text>
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
                                    onSelect={(value) => setFieldValue('linkedDoctor', typeof value === 'string' ? value : '')}
                                    placeholder={t('common.select')}
                                    search={true}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                />

                                <CustomInput
                                    label="Recovery Notes"
                                    placeholder="ASD"
                                    value={values.recoveryNotes}
                                    onChangeText={handleChange('recoveryNotes')}
                                    onBlur={handleBlur('recoveryNotes')}
                                    multiline={true}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputContainerStyle={styles.textAreaContainer}
                                    inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                />

                                <CustomInput
                                    label="Restrictions"
                                    placeholder="Optional"
                                    value={values.restrictions}
                                    onChangeText={handleChange('restrictions')}
                                    onBlur={handleBlur('restrictions')}
                                    containerStyle={styles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Rehab / PT Required</Text>
                                    <CustomDropDown
                                        options={REHAB_REQUIRED_OPTIONS}
                                        value={values.rehabRequired}
                                        onSelect={(value) => setFieldValue('rehabRequired', typeof value === 'string' ? value : '')}
                                        placeholder={t('common.select')}
                                        search={false}
                                        leftIcon={true}
                                        style={styles.dropdown}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Follow-Up Provider</Text>
                                    <CustomDropDown
                                        options={doctorOptions}
                                        value={values.followUpProvider}
                                        onSelect={(value) => setFieldValue('followUpProvider', typeof value === 'string' ? value : '')}
                                        placeholder={t('common.select')}
                                        search={true}
                                        leftIcon={true}
                                        style={styles.dropdown}
                                    />
                                </View>

                                <CustomInput
                                    label={t('pets.notes')}
                                    placeholder="ASD"
                                    value={values.notes}
                                    onChangeText={handleChange('notes')}
                                    onBlur={handleBlur('notes')}
                                    multiline={true}
                                    numberOfLines={3}
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
                                    title={isEdit ? t('health_tracker.update_surgery') : t('health_tracker.add_surgery')}
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

export default AddSurgery;
