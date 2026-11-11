import {
    ScrollView,
    Text,
    View,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDateTimePicker,
    DocumentPicker,
    VendorAutocompleteInput,
} from '../../../../../../components/common';
import { Formik, FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { getRealStateLoanMortgageAsync, getRealStateLoanMortgageByIdAsync, updateRealStateLoanMortgageAsync } from '../../../../../../redux/services/assetsService';
import { setUpdateRealStateLoanMortgageStatus } from '../../../../../../redux/slices/assetsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { LoanFormValues, EditLoanProps } from './addLoanMortgage.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';

import { makeEditLoanMortgageStyles } from './EditLoanMortgage.styles';
import { AppDispatch } from '../../../../../../types/store.types';

const EditLoanMortgage: React.FC<EditLoanProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const route = useRoute();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const formikRef = useRef<FormikProps<LoanFormValues> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditLoanMortgageStyles(themeColors), [themeColors]);

    const { loanId } = route?.params as any || {};

    const dispatch = useDispatch<AppDispatch>();
    const { update_real_state_loan_mortgage_status, get_real_state_loan_mortgage_by_id_data, get_real_state_loan_mortgage_by_id_status } = useSelector((state: any) => state?.assets_slice);

    const isLoading = update_real_state_loan_mortgage_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_real_state_loan_mortgage_by_id_status === ASYNC_STATUS.LOADING;

    // Keyboard listeners
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            e => {
                setKeyboardHeight(e.endCoordinates.height);
                setIsKeyboardVisible(true);
            },
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            },
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    // Fetch loan data by ID
    useEffect(() => {
        if (loanId) {
            dispatch(getRealStateLoanMortgageByIdAsync(loanId as any));
        }
    }, [loanId, dispatch]);

    // Populate form when data is loaded
    useEffect(() => {
        if (get_real_state_loan_mortgage_by_id_data?.result?.loans && loanId) {
            const loan = get_real_state_loan_mortgage_by_id_data.result.loans.find((l: any) => l.id === loanId);
            if (loan && formikRef.current) {
                // Parse dates from ISO strings
                let startDateValue = null;
                if (loan.startdate) {
                    startDateValue = typeof loan.startdate === 'string' ? new Date(loan.startdate) : loan.startdate;
                }

                let endDateValue = null;
                if (loan.enddate) {
                    endDateValue = typeof loan.enddate === 'string' ? new Date(loan.enddate) : loan.enddate;
                }

                // Restore doc IDs for multi-doc picker
                if (loan.uploadattachments) {
                    const existing = Array.isArray(loan.uploadattachments)
                        ? loan.uploadattachments
                        : [loan.uploadattachments as string];
                    setDocIds(existing);
                }

                formikRef.current.setValues({
                    lenderProvider: loan.lenderprovider || '',
                    lenderLocation: loan.lenderlocation || '',
                    lenderPhoneNumber: loan.lenderphonenumber || '',
                    lenderEmail: loan.lenderemail || '',
                    accountNumber: loan.accountnumber || '',
                    balance: loan.balance !== undefined ? String(loan.balance) : '',
                    estBalance: loan.estbalance !== undefined ? String(loan.estbalance) : '',
                    monthlyPayment: loan.monthlypayment !== undefined ? String(loan.monthlypayment) : '',
                    startDate: startDateValue,
                    endDate: endDateValue,
                    dueDay: loan.dueday ?? null,
                    ratePercent: loan.ratepercent !== undefined ? String(loan.ratepercent) : '',
                    bestName: loan.bestname || '',
                    uploadAttachments: '',
                    realEstateId: loan.realestateid || null,
                    vehicleId: loan.vehicleid || 0,
                });
            }
        }
    }, [get_real_state_loan_mortgage_by_id_data, loanId]);

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const initialValues: LoanFormValues = {
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
        dueDay: null,
        ratePercent: '',
        bestName: '',
        uploadAttachments: '',
        realEstateId: null,
        vehicleId: 0,
    };

    const handleSubmitData = (values: LoanFormValues) => {
        // Convert dates to ISO string if they're Date objects, otherwise use as is
        let startDateISO: any = null;
        if (values.startDate) {
            if (values.startDate instanceof Date) {
                startDateISO = values.startDate.toISOString();
            } else if (typeof values.startDate === 'string') {
                startDateISO = values.startDate;
            }
        }

        let endDateISO: any = null;
        if (values.endDate) {
            if (values.endDate instanceof Date) {
                endDateISO = values.endDate.toISOString();
            } else if (typeof values.endDate === 'string') {
                endDateISO = values.endDate;
            }
        }

        const payload: any = {
            lenderProvider: values.lenderProvider,
            lenderLocation: values.lenderLocation,
            lenderPhoneNumber: values.lenderPhoneNumber,
            lenderEmail: values.lenderEmail,
            accountNumber: values.accountNumber,
            balance: values.balance !== '' ? Number(values.balance) : 0,
            estBalance: values.estBalance !== '' ? Number(values.estBalance) : 0,
            monthlyPayment: values.monthlyPayment !== '' ? Number(values.monthlyPayment) : 0,
            startDate: startDateISO,
            endDate: endDateISO,
            dueDay: values.dueDay ?? 0,
            ratePercent: values.ratePercent !== '' ? Number(values.ratePercent) : 0,
            bestName: values.bestName,
            uploadAttachments: docIds.length > 0 ? docIds : [],
            realEstateId: values.realEstateId,
        };



        dispatch(updateRealStateLoanMortgageAsync({ id: loanId, data: payload }));
    };

    useEffect(() => {
        if (update_real_state_loan_mortgage_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setUpdateRealStateLoanMortgageStatus());
            navigation.goBack();
        }
    }, [update_real_state_loan_mortgage_status, dispatch, navigation]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('real_estate.edit_loan_mortgage')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{
                        marginBottom: 0,
                        marginTop: 20,
                        textAlign: 'left',
                    }}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <Text style={styles.loadingText}>{t('common.loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader
                title={t('real_estate.edit_loan_mortgage')}
                onBackPress={() => navigation.goBack()}
                containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                backButtonStyle={{ marginBottom: 0 }}
                titleStyle={{
                    marginBottom: 0,
                    marginTop: 10,
                    textAlign: 'left',
                }}
            />
            {/* Tab */}
            <View style={styles.activeTab}>
                <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
                    {t('real_estate.loans_mortgages')}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, {
                    paddingBottom: isKeyboardVisible
                        ? keyboardHeight - 30
                        : 0,
                },]}
                showsVerticalScrollIndicator={false}
            >
                {/* Form */}
                <View style={styles.formContainer}>
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema('real_state_loan')}
                        onSubmit={handleSubmitData}
                        enableReinitialize
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                            <>
                                {/* Lender/Provider */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.lender_provider')} *
                                    </Text>
                                    <VendorAutocompleteInput
                                        category="lender_provider_real_estate"
                                        placeholder={t('real_estate.lender')}
                                        value={values.lenderProvider}
                                        onChangeText={handleChange('lenderProvider')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.lenderProvider && errors.lenderProvider ? String(errors.lenderProvider) : undefined}
                                    />
                                </View>

                                {/* Lender Location */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.lender_location')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.lender_location')}
                                        value={values.lenderLocation}
                                        onChangeText={handleChange('lenderLocation')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.lenderLocation && errors.lenderLocation ? String(errors.lenderLocation) : undefined}
                                    />
                                </View>

                                {/* Lender Phone Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.lender_phone')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.lender_phone')}
                                        value={values.lenderPhoneNumber}
                                        onChangeText={handleChange('lenderPhoneNumber')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="phone-pad"
                                        error={touched.lenderPhoneNumber && errors.lenderPhoneNumber ? String(errors.lenderPhoneNumber) : undefined}
                                    />
                                </View>

                                {/* Lender Email */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.lender_email')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.lender_email')}
                                        value={values.lenderEmail}
                                        onChangeText={handleChange('lenderEmail')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="email-address"
                                        error={touched.lenderEmail && errors.lenderEmail ? String(errors.lenderEmail) : undefined}
                                    />
                                </View>

                                {/* Account Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.account_number')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.account_number')}
                                        value={values.accountNumber}
                                        onChangeText={handleChange('accountNumber')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.accountNumber && errors.accountNumber ? String(errors.accountNumber) : undefined}
                                    />
                                </View>

                                {/* Balance and Est Balance */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.balance')} *
                                        </Text>
                                        <CustomInput
                                            placeholder={t('real_estate.balance')}
                                            value={String(values.balance)}
                                            onChangeText={handleChange('balance')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.balance && errors.balance ? String(errors.balance) : undefined}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.est_balance')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('real_estate.est_balance')}
                                            value={String(values.estBalance)}
                                            onChangeText={handleChange('estBalance')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.estBalance && errors.estBalance ? String(errors.estBalance) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Monthly Payment */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.monthly_payment')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.monthly_payment')}
                                        value={String(values.monthlyPayment)}
                                        onChangeText={handleChange('monthlyPayment')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="numeric"
                                        error={touched.monthlyPayment && errors.monthlyPayment ? String(errors.monthlyPayment) : undefined}
                                    />
                                </View>

                                {/* Start Date and End Date */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.start_date')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.startDate}
                                            onChange={(date: string | Date) => setFieldValue('startDate', date)}
                                            placeholder={t('real_estate.select_date')}
                                            displayFormat="MM/DD/YYYY"
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.startDate && errors.startDate ? String(errors.startDate) : undefined}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.end_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.endDate}
                                            onChange={(date: string | Date) => setFieldValue('endDate', date)}
                                            placeholder={t('real_estate.select_date')}
                                            displayFormat="MM/DD/YYYY"
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Due Day and Rate % */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.due_day')} *
                                        </Text>
                                        <CustomInput
                                            placeholder={t('real_estate.due_day')}
                                            value={values.dueDay !== null ? String(values.dueDay) : ''}
                                            onChangeText={(text) => setFieldValue('dueDay', text ? Number(text) : null)}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.rate_percentage')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('real_estate.rate_percentage_placeholder')}
                                            value={String(values.ratePercent)}
                                            onChangeText={handleChange('ratePercent')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.ratePercent && errors.ratePercent ? String(errors.ratePercent) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Best Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('loans.best_name')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('loans.best_name')}
                                        value={values.bestName}
                                        onChangeText={handleChange('bestName')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.bestName && errors.bestName ? String(errors.bestName) : undefined}
                                    />
                                </View>

                                {/* Document Upload */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.upload_attachments')}
                                    </Text>
                                    <DocumentPicker
                                        multiple={true}
                                        maxDocuments={5}
                                        documentIds={docIds}
                                        onDocumentIdsChange={(ids) => setDocIds(ids)}
                                        uploadType="box"
                                        autoUpload={true}
                                    />
                                    {touched.uploadAttachments && errors.uploadAttachments && <Text style={styles.errorText}>{String(errors.uploadAttachments)}</Text>}
                                </View>

                                {/* Update and Skip Buttons */}
                                <PrimaryButton
                                    title={t('common.update')}
                                    onPress={handleSubmit}
                                    buttonStyle={styles.updateButton}
                                    loading={isLoading}
                                />

                                <PrimaryButton
                                    title={t('common.skip')}
                                    onPress={() => navigation.goBack()}
                                    variant="outline"
                                    buttonStyle={styles.skipButton}
                                />
                            </>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditLoanMortgage;
