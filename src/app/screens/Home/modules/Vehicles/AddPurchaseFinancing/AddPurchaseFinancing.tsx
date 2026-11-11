import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeAddPurchaseFinancingStyles } from './AddPurchaseFinancing.styles';

import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDateTimePicker,
    DocumentPicker,
    OfflineChainGuard,
    MixedMediaUploader,
    VendorAutocompleteInput,
} from '../../../../../../components/common';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { LoanFormData, LoanPayload } from './AddPurchaseFinancing.types';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { useDispatch, useSelector } from 'react-redux';
import { addLoanAsync, updateLoanAsync } from '../../../../../../redux/services/liabilitiesService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { setAddLoanStatus, setUpdateLoanStatus } from '../../../../../../redux/slices/liabilitiesSlice';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

interface RouteParams {
    vehicleId?: string | number;
    editLoan?: any;
    addNew?: boolean;
}

const AddPurchaseFinancing = (): React.ReactElement => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeCommonStyles(themeColors as RoleTheme),
            ...makeAddPurchaseFinancingStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness()
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
    const { add_loans_bulk_status, update_loan_status, add_loan_status } = useSelector((state: any) => state.liabilities_slice);

    // Get vehicleId and editLoan from route params
    const { vehicleId, editLoan, addNew } = (route?.params as RouteParams) || {};
    const ownerUserId = (route?.params as any)?.ownerUserId;

    // Formik ref and initial values
    const formikRef = React.useRef<any>(null);

    const formikInitialValues = {
        lenderProvider: '',
        lenderLocation: '',
        lenderPhoneNumber: '',
        lenderEmail: '',
        accountNumber: '',
        balance: '',
        estBalance: '',
        monthlyPayment: '',
        startDate: null,
        endDate: null,
        dueDay: '',
        ratePercent: '',
        bestName: '',
        uploadAttachments: null as any,
    };

    // States for attachment
    const [docIds, setDocIds] = useState<string[]>(() => {
        const existing = editLoan?.uploadattachments;
        return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
    });

    const isLoading = add_loans_bulk_status === ASYNC_STATUS.LOADING || update_loan_status === ASYNC_STATUS.LOADING;


    // Prefill form when editing from modal
    useEffect(() => {
        if (editLoan) {
            formikRef.current?.setValues({
                lenderProvider: editLoan.lenderprovider || '',
                lenderLocation: editLoan.lenderlocation || '',
                lenderPhoneNumber: editLoan.lenderphonenumber || '',
                lenderEmail: editLoan.lenderemail || '',
                accountNumber: editLoan.accountnumber || '',
                bestName: editLoan.bestname || '',
                monthlyPayment: editLoan.monthlypayment?.toString() || '',
                ratePercent: editLoan.ratepercent?.toString() || '',
                balance: editLoan.balance?.toString() || '',
                estBalance: editLoan.estbalance?.toString(),
                startDate: editLoan.startdate || null,
                endDate: editLoan.enddate || null,
                dueDay: editLoan.dueday?.toString() || '',
                uploadAttachments: '',
            });
        }
    }, [editLoan]);

    const handleAddVehicle = (values: any): void => {
        if (!vehicleId) {
            // Skip if no loans
            (navigation as any).navigate('AddVehicleInsurance', { vehicleId });
            return;
        }

        // Convert loans to API format
        const loanPayload: LoanPayload = {
            vehicleId: Number(vehicleId),
            lenderProvider: values.lenderProvider,
            lenderLocation: values.lenderLocation,
            lenderPhoneNumber: values.lenderPhoneNumber,
            lenderEmail: values.lenderEmail,
            accountNumber: values.accountNumber,
            balance: parseFloat(values.balance),
            estBalance: parseFloat(values.estBalance),
            monthlyPayment: parseFloat(values.monthlyPayment),
            startDate: values.startDate || '',
            endDate: values.endDate || null,
            dueDay: parseInt(values.dueDay),
            ratePercent: parseFloat(values.ratePercent),
            bestName: values.bestName,
            uploadAttachments: docIds.length > 0 ? docIds : [],
        };

        if (isBusinessRole()) {
            loanPayload.businessId = selectedBusinessId;
        }

        if (editLoan) {
            dispatch(updateLoanAsync({
                id: editLoan.id,
                data: loanPayload,
            })).then((action: any) => {
                if (action.type === updateLoanAsync.fulfilled.type) {
                    dispatch(setUpdateLoanStatus());
                    navigation.goBack();
                }
            });
        } else {
            // Dispatch API call
            dispatch(addLoanAsync({ ...loanPayload, ...(ownerUserId ? { ownerUserId } : {}) })).then((action: any) => {
                if (action.type === addLoanAsync.fulfilled.type) {
                    dispatch(setAddLoanStatus());
                    if (addNew) {
                        navigation.goBack();
                    } else {
                        (navigation as any).navigate('AddVehicleInsurance', { vehicleId });
                    }
                }
            });
        }
    };

    const handleSkip = (): void => {
        // Navigate to Insurance screen
        (navigation as any).navigate('AddVehicleInsurance', { vehicleId });
    };

    return (
        // <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <AuthHeader
                    title={t('vehicles.vehicle')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{
                        marginBottom: 0,
                        marginTop: 20,
                        textAlign: 'left',
                    }}
                    backButtonIconStyle={{ tintColor: themeColors?.textPrimary }}
                />
                {!editLoan && !addNew && (
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
                        {t('vehicles.purchase_financing_tab')}
                    </Text>
                </View>
            </View>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >

                    {/* Form with Formik */}
                    <Formik
                        innerRef={formikRef}
                        initialValues={formikInitialValues}
                        onSubmit={handleAddVehicle}
                        validationSchema={validationSchema('loan')}
                        validateOnChange={true}
                        validateOnBlur={true}
                        enableReinitialize={true}
                    >
                        {({ values, handleChange, handleSubmit, setFieldValue, touched, errors, handleBlur, setFieldTouched }) => (
                            <View style={styles.formContainer}>
                                {/* Item Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('loans.best_name')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('loans.best_name') || 'Item Name...'}
                                        value={values.bestName}
                                        onChangeText={handleChange('bestName')}
                                        onBlur={handleBlur('bestName')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.bestName && errors.bestName ? String(errors.bestName) : undefined}
                                    />
                                </View>
                                {/* Lender/Provider */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.lender_provider')} *
                                    </Text>
                                    <VendorAutocompleteInput
                                        category="lender_provider_vehicle"
                                        placeholder={t('vehicles.lender_placeholder') || 'Lender'}
                                        value={values.lenderProvider}
                                        onChangeText={handleChange('lenderProvider')}
                                        onBlur={handleBlur('lenderProvider')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.lenderProvider && errors.lenderProvider ? String(errors.lenderProvider) : undefined}
                                    />
                                </View>

                                {/* Lender Location */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.lender_location')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('vehicles.lender_location_placeholder') || 'Lender Location'}
                                        value={values.lenderLocation}
                                        onChangeText={handleChange('lenderLocation')}
                                        onBlur={handleBlur('lenderLocation')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.lenderLocation && errors.lenderLocation ? String(errors.lenderLocation) : undefined}
                                    />
                                </View>

                                {/* Lender Phone Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.lender_phone')} 
                                    </Text>
                                    <CustomInput
                                        placeholder={t('vehicles.lender_phone_placeholder') || 'Lender Phone Number'}
                                        value={values.lenderPhoneNumber}
                                        onChangeText={handleChange('lenderPhoneNumber')}
                                        onBlur={handleBlur('lenderPhoneNumber')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="phone-pad"
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.lenderPhoneNumber && errors.lenderPhoneNumber ? String(errors.lenderPhoneNumber) : undefined}
                                    />
                                </View>

                                {/* Lender Email */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.lender_email')} 
                                    </Text>
                                    <CustomInput
                                        placeholder={t('vehicles.lender_email_placeholder') || 'Lender Email'}
                                        value={values.lenderEmail}
                                        onChangeText={handleChange('lenderEmail')}
                                        onBlur={handleBlur('lenderEmail')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="email-address"
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.lenderEmail && errors.lenderEmail ? String(errors.lenderEmail) : undefined}
                                    />
                                </View>

                                {/* Account Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.account_number')} 
                                    </Text>
                                    <CustomInput
                                        placeholder={t('vehicles.account_number_placeholder') || 'Account Number'}
                                        value={values.accountNumber}
                                        onChangeText={handleChange('accountNumber')}
                                        onBlur={handleBlur('accountNumber')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.accountNumber && errors.accountNumber ? String(errors.accountNumber) : undefined}
                                    />
                                </View>

                                {/* Balance and EST Balance */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.balance')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="0.00"
                                            value={values.balance}
                                            onChangeText={handleChange('balance')}
                                            onBlur={handleBlur('balance')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.balance && errors.balance ? String(errors.balance) : undefined}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.est_balance')}
                                        </Text>
                                        <CustomInput
                                            placeholder="0.00"
                                            value={values.estBalance}
                                            onChangeText={handleChange('estBalance')}
                                            onBlur={handleBlur('estBalance')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.estBalance && errors.estBalance ? String(errors.estBalance) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Monthly Payment */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.monthly_payment')} *
                                    </Text>
                                    <CustomInput
                                        placeholder="0.00"
                                        value={values.monthlyPayment}
                                        onChangeText={handleChange('monthlyPayment')}
                                        onBlur={handleBlur('monthlyPayment')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="numeric"
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.monthlyPayment && errors.monthlyPayment ? String(errors.monthlyPayment) : undefined}
                                    />
                                </View>

                                {/* Start Date and End Date */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.start_date')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
                                            value={values.startDate}
                                            onChange={(date) => {
                                                setFieldValue('startDate', date as string);
                                                setFieldTouched('startDate', true);
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
                                            {t('vehicles.end_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
                                            value={values.endDate}
                                            onChange={(date) => {
                                                setFieldValue('endDate', date as string | null);
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
                                </View>

                                {/* Due Day */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.due_day')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={t('vehicles.due_day_placeholder') || 'E.G 4'}
                                        value={values.dueDay}
                                        onChangeText={handleChange('dueDay')}
                                        onBlur={handleBlur('dueDay')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="numeric"
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                    />
                                </View>

                                {/* Rate % */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('vehicles.rate_percentage')} 
                                    </Text>
                                    <CustomInput
                                        placeholder={t('vehicles.rate_percentage_placeholder') || 'Rate Percentage'}
                                        value={values.ratePercent}
                                        onChangeText={handleChange('ratePercent')}
                                        onBlur={handleBlur('ratePercent')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="numeric"
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.ratePercent && errors.ratePercent ? String(errors.ratePercent) : undefined}
                                    />
                                </View>

                                {/* Upload Attachments */}
                                <View style={styles.inputGroup}>
                                    <MixedMediaUploader
                                        mediaIds={docIds}
                                        onMediaChange={(ids: any) => setDocIds(ids)}
                                        label={t('real_estate.upload_attachments') || 'Upload Attachments'}
                                        uploadType="box"
                                        maxItems={5}
                                        removable={true}
                                        autoUpload={true}
                                    />
                                </View>

                                {/* Continue Button */}
                                <OfflineChainGuard isWizardMode={!editLoan && !addNew}>
                                    <PrimaryButton
                                        title={`${editLoan ? t('common.update') : t('common.add')} ${t('banking_finance.loan')}`}
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
        // </View>
    );
};

export default AddPurchaseFinancing;
