import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
    AuthHeader,
    CustomDateTimePicker,
    CustomInput,
    PrimaryButton,
} from '../../../../../../components/common';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { EditDoctorFormData, EditDoctorRouteParams } from './EditDoctor.types';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { getChildDoctorByIdAsync, updateChildDoctorAsync, getChildByIdAsync } from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { setEditDoctoreStatus } from '../../../../../../redux/slices/essentialsSlice';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeEditDoctorStyles } from './EditDoctor.styles';
import validationSchema from '../../../../../../utils/validationSchemas';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { VendorAutocompleteInput } from '../../../../../../components/common';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

// Define route params type
type EditDoctorRouteProp = RouteProp<{ EditDoctor: EditDoctorRouteParams }, 'EditDoctor'>;

// Validation schema
// const validationSchema = Yup.object().shape({
//     name: Yup.string().required('Doctor name is required'),
//     speciality: Yup.string().required('Speciality is required'),
//     npiId: Yup.string().required('NPI / Physician ID is required'),
//     officeClinic: Yup.string().required('Office / Clinic is required'),
//     phone: Yup.string()
//         .matches(/^[+\d\s\-().]*$/, 'Invalid phone number')
//         .required('Phone number is required'),
//     website: Yup.string()
//         .matches(
//             /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\S*)$/,
//             'Invalid URL',
//         )
//         .required('Website is required'),
//     email: Yup.string().email('Invalid email format').required('Email is required'),
//     address: Yup.string().required('Address is required'),
//     startDate: Yup.mixed().nullable().optional(),
//     endDate: Yup.mixed()
//         .nullable()
//         .optional()
//         .test('end-after-start', 'End date must be after start date', function (value) {
//             const { startDate } = this.parent;
//             if (!value || !startDate) return true;
//             return new Date(value as any) > new Date(startDate as any);
//         }),
//     dependentEndDate: Yup.mixed()
//         .nullable()
//         .optional()
//         .test('dep-end-after-start', 'Dependent end date must be after start date', function (value) {
//             const { startDate } = this.parent;
//             if (!value || !startDate) return true;
//             return new Date(value as any) > new Date(startDate as any);
//         }),
// });

const EditDoctor: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditDoctorRouteProp>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeEditDoctorStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();
    const formikRef = useRef<FormikProps<any> | null>(null);

    const [startDateKey, setStartDateKey] = useState(0);
    const [endDateKey, setEndDateKey] = useState(0);
    const [dependentEndDateKey, setDependentEndDateKey] = useState(0);

    // Get params from route
    const { doctor } = route.params as any;

    const { childid: childId, id: doctorId } = doctor || {};
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Doctor,
        recordId: doctorId ? Number(doctorId) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Doctor, recordId: doctorId ? Number(doctorId) : null, enabled: links.enabled });

    // Redux selectors
    const { update_child_doctor_status, get_child_doctor_by_id_status, get_child_doctor_by_id_data } = useSelector((state: any) => state.essentials_slice);
    const isLoading = update_child_doctor_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_child_doctor_by_id_status === ASYNC_STATUS.LOADING;

    // Fetch doctor data by ID
    useEffect(() => {
        if (childId && doctorId) {
            dispatch(getChildDoctorByIdAsync({ childId, doctorId }));
        }
    }, [childId, doctorId, dispatch]);

    // Get current doctor data from API or route params
    const currentDoctor = get_child_doctor_by_id_data?.doctor || doctor;

    const initialValues = {
        name: currentDoctor?.name || '',
        speciality: currentDoctor?.specialization || '',
        npiId: currentDoctor?.npiphysicianid || '',
        officeClinic: currentDoctor?.officeclinic || '',
        phone: currentDoctor?.phonenumber || '',
        website: currentDoctor?.website || '',
        email: currentDoctor?.emailaddress || '',
        address: currentDoctor?.address || '',
        startDate: currentDoctor?.startdate || currentDoctor?.startDate || '',
        endDate: currentDoctor?.enddate || currentDoctor?.endDate || '',
        dependentEndDate: currentDoctor?.dependentenddate || currentDoctor?.dependentEndDate || '',
    };

    const handleSubmit = (values: any) => {
        if (!childId || !doctorId) {
            return;
        }

        const doctorData = {
            name: values.name,
            specialization: values.speciality || undefined,
            npiPhysicianId: values.npiId || undefined,
            phoneNumber: values.phone || undefined,
            emailAddress: values.email || undefined,
            address: values.address || undefined,
            officeClinic: values.officeClinic || undefined,
            website: values.website || undefined,
            handlahUsername: undefined,
            startDate: values.startDate || undefined,
            endDate: values.endDate || undefined,
            dependentEndDate: values.dependentEndDate || undefined,
        };

        dispatch(updateChildDoctorAsync({ childId, doctorId, doctorData })).then((a: any) => saveLinksAfter(links, a, doctorId, undefined, recordNotes));
    };

    useEffect(() => {
        if (update_child_doctor_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(getChildByIdAsync({ childId: childId.toString() }));
            navigation.goBack();
            dispatch(setEditDoctoreStatus());
        }
    }, [update_child_doctor_status]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={commonStyles.safeArea}>
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <Text style={styles.loadingText}>{t('common.loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={commonStyles.safeArea}>
            <KeyboardAvoidingView
                style={commonStyles.container}
                behavior={isIOS ? 'padding' : 'height'}
            >
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                    title={t('health_tracker.edit_doctor')}
                    subtitle={t('health_tracker.contacts_offices')}
                    titleStyle={styles.HeaderTitle}
                    backButtonIconStyle={{ tintColor: themeColors.textSecondary }}
                />

                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema('doctor')}
                    onSubmit={handleSubmit}
                    validateOnChange={false}
                    validateOnBlur={false}
                    enableReinitialize={true}
                >
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit: formikHandleSubmit }) => {
                        const nameError = typeof errors.name === 'string' ? errors.name : '';
                        const emailError = typeof errors.email === 'string' ? errors.email : '';

                        return (
                            <>
                                <ScrollView
                                    style={commonStyles.scrollView}
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {/* <Text style={[styles.title, { textAlign: 'left' }]}>
                                    {t('health_tracker.edit_doctor')}
                                </Text>
                                <Text style={[styles.subtitle, { textAlign: 'left' }]}>
                                    {t('health_tracker.contacts_offices')}
                                </Text> */}

                                    <View style={commonStyles.formContainer}>
                                        {/* Name */}
                                        <CustomInput
                                            label={`${t('health_tracker.name')} *`}
                                            placeholder={`${t('health_tracker.name')} *`}
                                            value={values.name}
                                            onChangeText={handleChange('name')}
                                            onBlur={handleBlur('name')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={nameError && touched.name ? nameError : undefined}
                                        />

                                        {/* Speciality */}
                                        <CustomInput
                                            label={`${t('health_tracker.speciality')} *`}
                                            placeholder={t('health_tracker.speciality')}
                                            value={values.speciality}
                                            onChangeText={handleChange('speciality')}
                                            onBlur={handleBlur('speciality')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.speciality && errors.speciality ? String(errors.speciality) : undefined}
                                        />

                                        {/* National Provider Identifier (NPI)/ Physician ID */}
                                        <CustomInput
                                            label={`${t('health_tracker.npi_id')}`}
                                            placeholder={t('health_tracker.npi_id')}
                                            value={values.npiId}
                                            onChangeText={handleChange('npiId')}
                                            onBlur={handleBlur('npiId')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.npiId && errors.npiId ? String(errors.npiId) : undefined}
                                        />

                                        {/* Office/Clinic and Phone # Row */}
                                        <View style={styles.rowContainer}>
                                            <View style={styles.halfInput}>
                                                <VendorAutocompleteInput category="health_office_clinic_doctor"
                                                    label={`${t('health_tracker.office_clinic')} *`}
                                                    placeholder={t('health_tracker.office_clinic')}
                                                    value={values.officeClinic}
                                                    onChangeText={handleChange('officeClinic')}
                                                    onBlur={handleBlur('officeClinic')}
                                                    containerStyle={styles.inputContainerNoMargin}
                                                    labelStyle={{ textAlign: 'left' }}
                                                    inputStyle={{ textAlign: 'left' }}
                                                    error={touched.officeClinic && errors.officeClinic ? String(errors.officeClinic) : undefined}
                                                />
                                            </View>
                                            <View style={styles.halfInput}>
                                                <CustomInput
                                                    label={`${t('health_tracker.phone')} `}
                                                    placeholder={t('health_tracker.phone')}
                                                    value={values.phone}
                                                    onChangeText={handleChange('phone')}
                                                    onBlur={handleBlur('phone')}
                                                    keyboardType="phone-pad"
                                                    containerStyle={styles.inputContainerNoMargin}
                                                    labelStyle={{ textAlign: 'left' }}
                                                    inputStyle={{ textAlign: 'left' }}
                                                    error={touched.phone && errors.phone ? String(errors.phone) : undefined}
                                                />
                                            </View>
                                        </View>

                                        {/* Website and Email Row */}
                                        <View style={styles.rowContainer}>
                                            <View style={styles.halfInput}>
                                                <CustomInput
                                                    label={`${t('health_tracker.website')} `}
                                                    placeholder={t('common.www_placeholder')}
                                                    value={values.website}
                                                    onChangeText={handleChange('website')}
                                                    onBlur={handleBlur('website')}
                                                    autoCapitalize="none"
                                                    containerStyle={styles.inputContainerNoMargin}
                                                    labelStyle={{ textAlign: 'left' }}
                                                    inputStyle={{ textAlign: 'left' }}
                                                    error={touched.website && errors.website ? String(errors.website) : undefined}
                                                />
                                            </View>
                                            <View style={styles.halfInput}>
                                                <CustomInput
                                                    label={`${t('health_tracker.email')} `}
                                                    placeholder={t('health_tracker.email')}
                                                    value={values.email}
                                                    onChangeText={handleChange('email')}
                                                    onBlur={handleBlur('email')}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    containerStyle={styles.inputContainerNoMargin}
                                                    labelStyle={{ textAlign: 'left' }}
                                                    inputStyle={{ textAlign: 'left' }}
                                                    error={touched.email && errors.email ? String(errors.email) : undefined}
                                                />
                                            </View>
                                        </View>

                                        {/* Address */}
                                        <CustomInput
                                            label={`${t('health_tracker.address')} `}
                                            placeholder={t('health_tracker.address')}
                                            value={values.address}
                                            onChangeText={handleChange('address')}
                                            onBlur={handleBlur('address')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.address && errors.address ? String(errors.address) : undefined}
                                        />

                                        {/* Start Date and End Date Row */}
                                        <View style={styles.rowContainer}>
                                            <View style={styles.halfInput}>
                                                <CustomDateTimePicker
                                                    key={`start-${startDateKey}`}
                                                    label={t('health_tracker.start_date')}
                                                    placeholder={t('common.select')}
                                                    value={values.startDate}
                                                    onChange={(val: any) => {
                                                        if (values.endDate) {
                                                            const selDay = new Date(new Date(val).setHours(0, 0, 0, 0));
                                                            const endDay = new Date(new Date(values.endDate).setHours(0, 0, 0, 0));
                                                            if (selDay >= endDay) {
                                                                setFieldValue('endDate', '');
                                                                setEndDateKey(k => k + 1);
                                                                showErrorAlert(t('health_tracker.start_before_end'));
                                                            }
                                                        }
                                                        setFieldValue('startDate', val);
                                                    }}
                                                    mode="date"
                                                    displayFormat="MM/DD/YYYY"
                                                    labelStyle={{ textAlign: 'left' }}
                                                    maximumDate={values.endDate ? new Date(values.endDate) : undefined}
                                                    suffixIcon={
                                                        <Ionicons name="calendar-outline" size={20} color={colors.black} />
                                                    }
                                                />
                                            </View>
                                            <View style={styles.halfInput}>
                                                <CustomDateTimePicker
                                                    key={`end-${endDateKey}`}
                                                    label={t('health_tracker.end_date')}
                                                    placeholder={t('common.select')}
                                                    value={values.endDate}
                                                    onChange={(val: any) => {
                                                        if (values.startDate) {
                                                            const selDay = new Date(new Date(val).setHours(0, 0, 0, 0));
                                                            const startDay = new Date(new Date(values.startDate).setHours(0, 0, 0, 0));
                                                            if (selDay <= startDay) {
                                                                setEndDateKey(k => k + 1);
                                                                showErrorAlert(t('health_tracker.end_after_start'));
                                                                return;
                                                            }
                                                        }
                                                        setFieldValue('endDate', val);
                                                    }}
                                                    mode="date"
                                                    displayFormat="MM/DD/YYYY"
                                                    labelStyle={{ textAlign: 'left' }}
                                                    minimumDate={values.startDate ? new Date(values.startDate) : undefined}
                                                    suffixIcon={
                                                        <Ionicons name="calendar-outline" size={20} color={colors.black} />
                                                    }
                                                />
                                            </View>
                                        </View>

                                        {/* Dependent End Date */}
                                        <View style={styles.rowContainer}>
                                            {/* <View style={styles.halfInput}>
                                            <CustomDateTimePicker
                                                key={`dep-end-${dependentEndDateKey}`}
                                                label={t('health_tracker.dependent_end_date')}
                                                placeholder={t('common.select')}
                                                value={values.dependentEndDate}
                                                onChange={(val: any) => {
                                                    if (values.startDate) {
                                                        const selDay = new Date(new Date(val).setHours(0, 0, 0, 0));
                                                        const startDay = new Date(new Date(values.startDate).setHours(0, 0, 0, 0));
                                                        if (selDay <= startDay) {
                                                            setDependentEndDateKey(k => k + 1);
                                                            showErrorAlert(t('health_tracker.end_after_start'));
                                                            return;
                                                        }
                                                    }
                                                    setFieldValue('dependentEndDate', val);
                                                }}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                minimumDate={values.startDate ? new Date(values.startDate) : undefined}
                                                suffixIcon={
                                                    <Ionicons name="calendar-outline" size={20} color={colors.black} />
                                                }
                                            />
                                        </View> */}
                                            <View style={styles.halfInput} />
                                        </View>
                                    </View>
                                <RecordNotesField notes={recordNotes} />
                                <RecordLinksField links={links} />
                                </ScrollView>

                                <View style={styles.buttonContainer}>
                                    <PrimaryButton
                                        title={t('common.save_changes')}
                                        onPress={formikHandleSubmit}
                                        buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                                        loading={isLoading}
                                        disabled={isLoading}
                                    />
                                </View>
                            </>
                        );
                    }}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditDoctor;
