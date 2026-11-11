import React, { useState, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { AuthHeader, CustomDateTimePicker, CustomInput, PrimaryButton } from '../../../../../../components/common';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../../../utils/colors';
import { addChildDoctorAsync, getChildrenAsync } from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeStyles } from './AddDoctor.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { VendorAutocompleteInput } from '../../../../../../components/common';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

type RouteParams = {
    AddDoctor: { childId: string };
};

const AddDoctor: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'AddDoctor'>>();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeStyles(themeColors as RoleTheme), [themeColors]);
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);

    const childId = route.params?.childId;
    const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Doctor,
        recordId: null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Doctor, recordId: null, enabled: links.enabled });

    const { add_child_doctor_status } = useSelector((state: any) => state.essentials_slice);
    const isLoading = add_child_doctor_status === ASYNC_STATUS.LOADING;

    const [startDateKey] = useState(0);
    const [endDateKey, setEndDateKey] = useState(0);
    const [dependentEndDateKey, setDependentEndDateKey] = useState(0);

    const initialValues = {
        name: '',
        speciality: '',
        npiId: '',
        officeClinic: '',
        phone: '',
        website: '',
        email: '',
        address: '',
        startDate: '',
        endDate: '',
        dependentEndDate: '',
    };

    const handleAddDoctor = (values: typeof initialValues) => {
        if (!childId) {
            showErrorAlert(t('common.error') || 'No child selected');
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

        dispatch(addChildDoctorAsync({ childId, doctorData, ...(ownerUserId ? { ownerUserId } : {}) })).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
            if (action.type === addChildDoctorAsync.fulfilled.type) {
                dispatch(getChildrenAsync({}));
                navigation.goBack();
            }
        });
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
                    title={t('health_tracker.add_doctor')}
                    subtitle={t('health_tracker.contacts_offices')}
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
                        {t('health_tracker.add_doctor')}
                    </Text>
                    <Text style={[styles.subtitle, { textAlign: 'left' }]}>
                        {t('health_tracker.contacts_offices')}
                    </Text> */}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema('doctor')}
                        onSubmit={handleAddDoctor}
                    >
                        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, touched, errors }) => (
                            <>
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
                                        error={touched.name && errors.name ? String(errors.name) : undefined}
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
                                        label={t('health_tracker.npi_id')}
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
                                                label={t('health_tracker.phone')}
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
                                                label={t('health_tracker.website')}
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
                                                label={t('health_tracker.email')}
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
                                        label={t('health_tracker.address')}
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
                                                    <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
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
                                                    <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
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

                                <View style={styles.buttonContainer}>
                                    <PrimaryButton
                                        title={isLoading ? t('common.loading') : t('health_tracker.add_doctor')}
                                        onPress={handleSubmit}
                                        buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                                        disabled={isLoading}
                                    />
                                </View>
                            </>
                        )}
                    </Formik>
                <RecordNotesField notes={recordNotes} />
                <RecordLinksField links={links} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddDoctor;
