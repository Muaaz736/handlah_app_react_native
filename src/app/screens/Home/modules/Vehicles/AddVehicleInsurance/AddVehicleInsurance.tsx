import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeAddVehicleInsuranceStyles } from './AddVehicleInsurance.styles';

import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDateTimePicker,
    OfflineChainGuard,
    MixedMediaUploader,
    VendorAutocompleteInput,
} from '../../../../../../components/common';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import BillingFrequencyField from '../../../../../../components/common/BillingFrequencyField';
import { insuranceFrequency } from '../../../../../../utils/billingFrequency';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { InsurancePayload } from './AddVehicleInsurance.types';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { useDispatch, useSelector } from 'react-redux';
import { addInsuranceAsync, updateInsuranceAsync } from '../../../../../../redux/services/liabilitiesService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { setAddInsuranceStatus, setUpdateInsuranceStatus } from '../../../../../../redux/slices/liabilitiesSlice';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

interface RouteParams {
    vehicleId?: string | number;
    editInsurance?: any;
    addNew?: boolean;
}
const AddVehicleInsurance = (): React.ReactElement => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeCommonStyles(themeColors as RoleTheme),
            ...makeAddVehicleInsuranceStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const dispatch = useDispatch<AppDispatch>();

    const { selectedBusinessId } = useSelectedBusiness();

    // Redux selectors
    const { add_insurance_status, update_insurance_status } = useSelector((state: any) => state.liabilities_slice);

    // Get vehicleId and editInsurance from route params
    const { vehicleId, editInsurance, addNew } = (route?.params as RouteParams) || {};
    const ownerUserId = (route?.params as any)?.ownerUserId;

    // Formik ref and initial values
    const formikRef = React.useRef<any>(null);

    const formikInitialValues = {
        itemName: '',
        agentEmail: '',
        insuranceCarrier: '',
        policyNumber: '',
        annualPremium: '',
        startDate: null,
        renewalDate: null,
        endDate: null,
        dueDay: '',
        agent: '',
        agentPhone: '',
        isPaidAnnually: false,
        billingFrequency: '',
        uploadAttachments: null as any,
    };

    // States for attachment
    const [docIds, setDocIds] = useState<string[]>(() => {
        const existing = editInsurance?.uploadattachments;
        return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
    });

    const isLoading = add_insurance_status === ASYNC_STATUS.LOADING || update_insurance_status === ASYNC_STATUS.LOADING;

    // Prefill form when editing from modal
    useEffect(() => {
        if (editInsurance) {
            formikRef.current?.setValues({
                itemName: editInsurance.itemname || '',
                agentEmail: editInsurance.agentemail || '',
                insuranceCarrier: editInsurance.insurancecarrier || '',
                policyNumber: editInsurance.policynumber || '',
                annualPremium: editInsurance.annualpremium?.toString() || '',
                startDate: editInsurance.startdate || null,
                renewalDate: editInsurance.renewaldate || null,
                endDate: editInsurance.enddate || null,
                dueDay: editInsurance.dueday?.toString() || '',
                agent: editInsurance.agent || '',
                agentPhone: editInsurance.agentphone || '',
                isPaidAnnually: editInsurance.ispaidannually ?? editInsurance.isPaidAnnually ?? false,
                billingFrequency: insuranceFrequency(editInsurance),
                uploadAttachments: '',
            });
        }
    }, [editInsurance]);

    // Reset statuses on mount to prevent stale SUCCEEDED
    useEffect(() => {
        dispatch(setAddInsuranceStatus());
        dispatch(setUpdateInsuranceStatus());
    }, []);

    // Handle success navigation
    useEffect(() => {
        if (editInsurance) {
            if (update_insurance_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateInsuranceStatus());
                navigation.goBack();
            }
        } else {
            if (add_insurance_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddInsuranceStatus());
                formikRef.current?.resetForm();
                setDocIds([]);
                addNew ? navigation.goBack() :
                    (navigation as any).navigate('AddVehicleWarranty', { vehicleId });
            }
        }
    }, [add_insurance_status, update_insurance_status, navigation, vehicleId, addNew, editInsurance]);

    const handleAddVehicle = (values: any): void => {
        if (!vehicleId) {
            // Skip if no insurances
            (navigation as any).navigate('AddVehicleWarranty', { vehicleId });
            return;
        }

        // Convert insurances to API format
        const insurancesPayload: InsurancePayload = {
            itemName: values.itemName || '',
            agentEmail: values.agentEmail ?? '',
            insuranceCarrier: values.insuranceCarrier || '',
            policyNumber: values.policyNumber || '',
            annualPremium: parseFloat(values.annualPremium || '0') || 0,
            startDate: values.startDate || '',
            renewalDate: values.renewalDate || '',
            endDate: values.endDate || null,
            agent: values.agent || '',
            agentPhone: values.agentPhone || '',
            uploadAttachments: docIds.length > 0 ? docIds : [],
            vehicleId: Number(vehicleId),
            isPaidAnnually: values.isPaidAnnually || false,
        billingFrequency: values.billingFrequency || undefined,
        };

        // Only include dueDay when not paid annually
        if (!values.isPaidAnnually) {
            insurancesPayload.dueDay = parseInt(values.dueDay || '0') || 0;
        }

        if (isBusinessRole()) {
            insurancesPayload.businessId = selectedBusinessId;
        }
        if (editInsurance) {
            // Update existing insurance
            dispatch(updateInsuranceAsync({ id: editInsurance.id, data: insurancesPayload }));
        } else {
            // Add new insurance
            dispatch(addInsuranceAsync({ ...insurancesPayload, ...(ownerUserId ? { ownerUserId } : {}) }));
        }
    };

    const handleSkip = (): void => {
        // Navigate to Warranty screen
        (navigation as any).navigate('AddVehicleWarranty', { vehicleId });
    };


    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <AuthHeader
                        title={t('vehicles.vehicle')}
                        onBackPress={() => navigation.goBack()}
                        containerStyle={{
                            paddingHorizontal: 16,
                            marginBottom: 0,
                            paddingTop: isIOS ? 0 : 20,
                        }}
                        backButtonStyle={{ marginBottom: 0 }}
                        titleStyle={{
                            marginBottom: 0,
                            marginTop: 20,
                            textAlign: 'left',
                        }}
                        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                    />
                    {!editInsurance && !addNew && (
                        <TouchableOpacity
                            style={[
                                styles.skipButton,
                                {
                                    borderColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary,
                                    backgroundColor: themeColors?.isDark ? themeColors.primary + '10' : themeColors.secondary + '10',
                                },
                            ]}
                            onPress={handleSkip}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.skipButtonText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('common.skip_this')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* Tab */}
                <View style={styles.tabContainer}>
                    <View style={styles.activeTab}>
                        <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
                            {t('vehicles.insurance_tab')}
                        </Text>
                    </View>
                </View>
                <KeyboardAvoidingView
                    behavior={isIOS ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Form with Formik */}
                        <Formik
                            innerRef={formikRef}
                            initialValues={formikInitialValues}
                            onSubmit={handleAddVehicle}
                            validationSchema={validationSchema('vehicle_insurance')}
                            validateOnChange={true}
                            validateOnBlur={true}
                            enableReinitialize={true}
                        >
                            {({ values, handleChange, handleSubmit, setFieldValue, touched, errors, handleBlur, setFieldTouched }) => (
                                <View style={styles.formContainer}>
                                    {/* Item name */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.item_name')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="(e.g, Home, iPhone, Camera)"
                                            value={values.itemName}
                                            onChangeText={handleChange('itemName')}
                                            onBlur={handleBlur('itemName')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.itemName && errors.itemName ? String(errors.itemName) : undefined}
                                        />
                                    </View>


                                    {/* Insurance carrier */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.insurance_carrier')} *
                                        </Text>
                                       <VendorAutocompleteInput
                                            category="insurance_carrier_vehicle"
                                            placeholder={t('common.eg_state_farm')}
                                            value={values.insuranceCarrier}
                                            onChangeText={handleChange('insuranceCarrier')}
                                            onBlur={handleBlur('insuranceCarrier')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.insuranceCarrier && errors.insuranceCarrier ? String(errors.insuranceCarrier) : undefined}
                                        />
                                    </View>

                                    {/* Policy # */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.policy')}# *
                                        </Text>
                                        <CustomInput
                                            placeholder={t('common.policy_hash_placeholder')}
                                            value={values.policyNumber}
                                            onChangeText={handleChange('policyNumber')}
                                            onBlur={handleBlur('policyNumber')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.policyNumber && errors.policyNumber ? String(errors.policyNumber) : undefined}
                                        />
                                    </View>

                                    {/* Annual premium */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.annual_premium')}
                                        </Text>
                                        <CustomInput
                                            placeholder="0.00"
                                            value={values.annualPremium}
                                            onChangeText={handleChange('annualPremium')}
                                            onBlur={handleBlur('annualPremium')}
                                            containerStyle={styles.inputContainer}
                                            keyboardType="decimal-pad"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.annualPremium && errors.annualPremium ? String(errors.annualPremium) : undefined}
                                        />
                                    </View>

                                    {/* Billing frequency (as on the website); "Annually" also sets the older Paid Annually flag. */}
                                    <BillingFrequencyField
                                      value={values.billingFrequency}
                                      onChange={(v) => {
                                        setFieldValue('billingFrequency', v);
                                        setFieldValue('isPaidAnnually', v === 'annually');
                                        if (v === 'annually') setFieldValue('dueDay', '');
                                      }}
                                    />

                                    {/* Start Date and Renewal Date */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('vehicles.start_date')} *
                                            </Text>
                                            <CustomDateTimePicker
                                                placeholder={t('real_estate.select')}
                                                value={values.startDate}
                                                onChange={(selectedDate: any) => {
                                                    setFieldValue('startDate', selectedDate);
                                                    setFieldTouched('startDate', true);
                                                    setFieldTouched('renewalDate', true);
                                                    setFieldTouched('endDate', true);
                                                }}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                suffixIcon={
                                                    <Feather name="calendar" size={20} color={colors.gray} />
                                                }
                                                error={touched.startDate && errors.startDate ? String(errors.startDate) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('vehicles.renewal_date')} *
                                            </Text>
                                            <CustomDateTimePicker
                                                placeholder={t('real_estate.select')}
                                                value={values.renewalDate}
                                                onChange={(selectedDate: any) => {
                                                    setFieldValue('renewalDate', selectedDate);
                                                    setFieldTouched('renewalDate', true);
                                                }}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                suffixIcon={
                                                    <Feather name="calendar" size={20} color={colors.gray} />
                                                }
                                                error={touched.renewalDate && errors.renewalDate ? String(errors.renewalDate) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* End Date and Due Day(1-31) */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('vehicles.end_date')}
                                            </Text>
                                            <CustomDateTimePicker
                                                placeholder={t('real_estate.select')}
                                                value={values.endDate}
                                                onChange={(selectedDate: any) => {
                                                    setFieldValue('endDate', selectedDate);
                                                    setFieldTouched('endDate', true);
                                                }}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                suffixIcon={
                                                    <Feather name="calendar" size={20} color={colors.gray} />
                                                }
                                                clearable
                                                error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                            />
                                        </View>
                                        {!values.isPaidAnnually && (
                                            <View style={styles.halfInput}>
                                                <Text style={[styles.label, { textAlign: 'left' }]}>
                                                    {t('vehicles.due_day_range')}
                                                </Text>
                                                <CustomInput
                                                    placeholder={t('common.eg_4_placeholder')}
                                                    value={values.dueDay}
                                                    onChangeText={handleChange('dueDay')}
                                                    onBlur={handleBlur('dueDay')}
                                                    containerStyle={styles.inputContainerNoMargin}
                                                    keyboardType="numeric"
                                                    labelStyle={{ textAlign: 'left' }}
                                                    inputStyle={{ textAlign: 'left' }}
                                                    error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    {/* Agent(Optional) and Agent phone(optional) */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('vehicles.agent_optional')}
                                            </Text>
                                            <CustomInput
                                                placeholder={t('common.agent_label')}
                                                value={values.agent}
                                                onChangeText={handleChange('agent')}
                                                onBlur={handleBlur('agent')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.agent && errors.agent ? String(errors.agent) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('vehicles.agent_phone_optional')}
                                            </Text>
                                            <CustomInput
                                                placeholder={t('common.agent_hash')}
                                                value={values.agentPhone}
                                                onChangeText={handleChange('agentPhone')}
                                                onBlur={handleBlur('agentPhone')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="phone-pad"
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.agentPhone && errors.agentPhone ? String(errors.agentPhone) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Agent Email */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.agent_email')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('common.agent_email')}
                                            value={values.agentEmail}
                                            onChangeText={handleChange('agentEmail')}
                                            onBlur={handleBlur('agentEmail')}
                                            containerStyle={styles.inputContainer}
                                            keyboardType="email-address"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.agentEmail && errors.agentEmail ? String(errors.agentEmail) : undefined}
                                        />
                                    </View>

                                    {/* Upload Attachments */}
                                    <View style={styles.inputGroup}>
                                        <MixedMediaUploader
                                            mediaIds={docIds}
                                            onMediaChange={(ids: any) => setDocIds(ids)}
                                            label={t('real_estate.upload_attachments')}
                                            uploadType="box"
                                            maxItems={5}
                                            removable={true}
                                            autoUpload={true}
                                        />
                                    </View>

                                    {/* Continue Button */}
                                    <OfflineChainGuard isWizardMode={!editInsurance && !addNew}>
                                        <PrimaryButton
                                            title={`${editInsurance ? t('common.update') : t('common.add')} ${t('insurance.title')}`}
                                            onPress={handleSubmit}
                                            buttonStyle={[styles.addVehicleButton, { backgroundColor: themeColors.primary }]}
                                            loading={isLoading}
                                            disabled={isLoading}
                                        />
                                    </OfflineChainGuard>
                                </View>
                            )}
                        </Formik>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default AddVehicleInsurance;
