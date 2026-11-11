import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Keyboard,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDateTimePicker,
    OfflineChainGuard,
    MixedMediaUploader,
    VendorAutocompleteInput,
} from '../../../../../../components/common';

import { makeAddLoanMortgageStyles } from './AddLoanMortgage.styles';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
// add and update actions
import { addRealStateLoanMortgageAsync, updateRealStateLoanMortgageAsync } from '../../../../../../redux/services/assetsService';
import { setAddRealStateLoanMortgageStatus, setUpdateRealStateLoanMortgageStatus } from '../../../../../../redux/slices/assetsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { LoanFormValues, AddLoanProps, AddLoanRouteParams, Loan } from './addLoanMortgage.types';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import Feather from 'react-native-vector-icons/Feather';
import { isIOS } from '../../../../../../utils/helpers';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeSharedStyles } from '../RealState.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const AddLoanMortgage: React.FC<AddLoanProps> = ({ route }) => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeAddLoanMortgageStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness();

    // extract route parameters for editing
    const params = (route?.params as AddLoanRouteParams) || {};
    const { loan, isEdit = false, addNew, realEstateId } = params;
    const ownerUserId = (route?.params as any)?.ownerUserId;

    const formikRef = useRef<any>(null);
    const dispatch = useDispatch<AppDispatch>();
    // only a single loan is allowed now
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const { add_real_state_loan_mortgage_status, update_real_state_loan_mortgage_status, add_real_state_overview_data } = useSelector((state: any) => state?.assets_slice);

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

    // show loader while adding or updating
    const isLoading =
        add_real_state_loan_mortgage_status === ASYNC_STATUS.LOADING ||
        update_real_state_loan_mortgage_status === ASYNC_STATUS.LOADING;

    // base form values; may be overridden by `loan` when editing
    const initialValues: LoanFormValues = {
        lenderProvider: loan?.lenderprovider || '',
        lenderLocation: loan?.lenderlocation || '',
        lenderPhoneNumber: loan?.lenderphonenumber || '',
        lenderEmail: loan?.lenderemail || '',
        accountNumber: loan?.accountnumber || '',
        balance: loan?.balance !== undefined ? String(loan.balance) : '',
        estBalance: loan?.estbalance !== undefined ? String(loan.estbalance) : '',
        monthlyPayment: loan?.monthlypayment !== undefined ? String(loan.monthlypayment) : '',
        startDate: loan?.startdate || null,
        endDate: loan?.enddate || null,
        dueDay: loan?.dueday ?? null,
        ratePercent: loan?.ratepercent !== undefined ? String(loan.ratepercent) : '',
        bestName: loan?.bestname || '',
        uploadAttachments: loan?.uploadattachments || '',
        realEstateId: realEstateId,
    };


    const handleSkip = () => {
        navigation.navigate('AddUtilities', { realEstateId: realEstateId });
    };

    const handleRemoveDocument = () => {
        setDocIds([]);
    }
    // handle form submit: enqueue loan or update existing loan
    const handleSubmitData = (values: any) => {

        let startDateISO = null;
        if (values.startDate) {
            if (values.startDate instanceof Date) startDateISO = values.startDate.toISOString();
            else if (typeof values.startDate === 'string') startDateISO = values.startDate;
        }
        let endDateISO = null;
        if (values.endDate) {
            if (values.endDate instanceof Date) endDateISO = values.endDate.toISOString();
            else if (typeof values.endDate === 'string') endDateISO = values.endDate;
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
            realEstateId:
                values.realEstateId || loan?.realestateid || realEstateId || add_real_state_overview_data?.id || null,
        };

        if (isBusinessRole()) {
            payload.businessId = selectedBusinessId;
        }

        if (isEdit) {
            dispatch(updateRealStateLoanMortgageAsync({ id: loan.id, data: payload } as any));
        } else {
            dispatch(addRealStateLoanMortgageAsync({ loans: [{ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }] } as any));
        }
    };

    // pre-populate form values and document preview when editing existing loan
    useEffect(() => {
        if (loan && formikRef.current) {
            // convert dates from ISO/string to Date objects
            let startDateValue = null;
            if (loan.startdate) {
                startDateValue = typeof loan.startdate === 'string' ? new Date(loan.startdate) : loan.startdate;
            }
            let endDateValue = null;
            if (loan.enddate) {
                endDateValue = typeof loan.enddate === 'string' ? new Date(loan.enddate) : loan.enddate;
            }

            // restore doc IDs for multi-doc picker
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
                realEstateId: loan.realestateid || realEstateId || add_real_state_overview_data?.id || null,
            });
        }
    }, [loan, realEstateId, add_real_state_overview_data]);

    // handle both add & update successes
    useEffect(() => {
        if (
            add_real_state_loan_mortgage_status === ASYNC_STATUS.SUCCEEDED ||
            update_real_state_loan_mortgage_status === ASYNC_STATUS.SUCCEEDED
        ) {
            if (add_real_state_loan_mortgage_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddRealStateLoanMortgageStatus());
            }
            if (update_real_state_loan_mortgage_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateRealStateLoanMortgageStatus());
            }

            // navigate based on context
            if (isEdit || addNew) {
                navigation.goBack();
            } else {
                navigation.navigate('AddUtilities', { realEstateId: realEstateId });
            }
            setDocIds([]);
        }
    }, [
        add_real_state_loan_mortgage_status,
        update_real_state_loan_mortgage_status,
    ]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <AuthHeader
                        title={isEdit ? t('real_estate.edit_loan_mortgage') : t('real_estate.your_property')}
                        onBackPress={() => navigation.goBack()}
                        containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                        backButtonStyle={{ marginBottom: 0 }}
                        titleStyle={{
                            marginBottom: 0,
                            marginTop: 20,
                            textAlign: isRTL ? 'right' : 'left',
                        }}
                        backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                    />

                    {!isEdit && !addNew && (
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
                        <Text style={[styles.activeTabText, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('real_estate.loans_mortgages')}
                        </Text>
                    </View>
                </View>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            flexGrow: 1,
                            paddingBottom: isKeyboardVisible
                                ? keyboardHeight + 40
                                : 40,
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Formik
                            innerRef={formikRef}
                            initialValues={initialValues}
                            enableReinitialize={true}
                            validationSchema={validationSchema('real_state_loan')}
                            onSubmit={handleSubmitData}
                        >
                            {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                                <>
                                    {/* Item Name */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('loans.best_name')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('loans.best_name') || 'Item Name...'}
                                            value={values.bestName}
                                            onChangeText={handleChange('bestName')}
                                            containerStyle={styles.inputContainer}
                                            error={touched.bestName && errors.bestName ? String(errors.bestName) : undefined}
                                        />
                                    </View>
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

                                    {/* Balance and EST Balance */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                                {t('real_estate.balance')} *
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={String(values.balance)}
                                                onChangeText={handleChange('balance')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                                                inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                                                error={touched.balance && errors.balance ? String(errors.balance) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                                {t('real_estate.est_balance')}
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={String(values.estBalance)}
                                                onChangeText={handleChange('estBalance')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                                                inputStyle={{ textAlign: isRTL ? 'right' : 'left' }}
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
                                            placeholder="0.00"
                                            value={String(values.monthlyPayment)}
                                            onChangeText={handleChange('monthlyPayment')}
                                            containerStyle={styles.inputContainer}
                                            keyboardType="numeric"
                                            error={touched.monthlyPayment && errors.monthlyPayment ? String(errors.monthlyPayment) : undefined}
                                        />
                                    </View>

                                    {/* Start Date and End Date */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.flexOne}>
                                            <CustomDateTimePicker
                                                label={`${t('real_estate.start_date')} *`}
                                                placeholder={t('real_estate.select')}
                                                value={values.startDate}
                                                onChange={(val: any) => setFieldValue('startDate', val as Date)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                                                containerStyle={{ flex: 1, width: 'auto' }}
                                                inputContainerStyle={{ borderRadius: 12 }}
                                                suffixIcon={<Feather name="calendar" size={20} color={themeColors.textSecondary} />}
                                                error={touched.startDate && errors.startDate ? String(errors.startDate) : undefined}
                                            />
                                        </View>
                                        <View style={styles.flexOne}>
                                            <CustomDateTimePicker
                                                label={t('real_estate.end_date')}
                                                placeholder={t('real_estate.select')}
                                                value={values.endDate}
                                                onChange={(val: any) => setFieldValue('endDate', val as Date)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: isRTL ? 'right' : 'left' }}
                                                containerStyle={{ flex: 1, width: 'auto' }}
                                                inputContainerStyle={{ borderRadius: 12 }}
                                                suffixIcon={<Feather name="calendar" size={20} color={themeColors.textSecondary} />}
                                                error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Due Day */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.due_day_1_31')} *
                                        </Text>
                                        <CustomInput
                                            placeholder={t('common.eg_15_placeholder')}
                                            value={values.dueDay ? String(values.dueDay) : ''}
                                            onChangeText={handleChange('dueDay')}
                                            containerStyle={styles.inputContainer}
                                            keyboardType="numeric"
                                            error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                        />
                                    </View>

                                    {/* Rate % */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.rate_percentage')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('real_estate.rate_percentage_placeholder')}
                                            value={String(values.ratePercent)}
                                            onChangeText={handleChange('ratePercent')}
                                            containerStyle={styles.inputContainer}
                                            keyboardType="numeric"
                                            error={touched.ratePercent && errors.ratePercent ? String(errors.ratePercent) : undefined}
                                        />
                                    </View>

                                    {/* Upload Attachments */}
                                    <View style={styles.inputGroup}>
                                        <MixedMediaUploader
                                            mediaIds={docIds}
                                            onMediaChange={(ids: any) => setDocIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                                            placeholder={t('real_estate.upload')}
                                            label={t('legal.upload_document')}
                                            uploadType="box"
                                            maxItems={5}
                                            removable={true}
                                            autoUpload={true}
                                        />
                                        {touched.uploadAttachments && errors.uploadAttachments && <Text style={styles.errorText}>{String(errors.uploadAttachments)}</Text>}
                                    </View>

                                    {/* Submit + continue */}
                                    <OfflineChainGuard isWizardMode={!isEdit && !addNew}>
                                        <PrimaryButton
                                            title={isEdit ? t('common.update') : addNew ? t('common.add') : t('common.continue')}
                                            onPress={() => handleSubmit()}
                                            loading={isLoading}
                                            buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                                            disabled={isLoading}
                                        />
                                    </OfflineChainGuard>
                                </>
                            )}
                        </Formik>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default AddLoanMortgage;
