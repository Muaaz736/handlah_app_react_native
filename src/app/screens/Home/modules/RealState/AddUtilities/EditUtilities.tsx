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
    CustomDropDown,
    DocumentPicker,
    VendorAutocompleteInput,
} from '../../../../../../components/common';
import { Formik, FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { getRealStateUtilitiesByIdAsync, updateRealStateUtilitiesAsync } from '../../../../../../redux/services/assetsService';
import { setUpdateRealStateUtilitiesStatus } from '../../../../../../redux/slices/assetsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { UtilityFormData, UtilityType, EditUtilitiesRouteParams, EditUtilitiesProps } from './addUtilities.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';
import { makeEditUtilitiesStyles } from './EditUtilities.styles';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const BILLING_FREQUENCY_OPTIONS = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annually', value: 'annually' },
];

const EditUtilities: React.FC<EditUtilitiesProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const route = useRoute();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const formikRef = useRef<FormikProps<UtilityFormData> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditUtilitiesStyles(themeColors as RoleTheme), [themeColors]);

    const { utilityId } = (route?.params as EditUtilitiesRouteParams) || {};

    const dispatch = useDispatch<AppDispatch>();
    const {
        update_real_state_utilities_status,
        get_real_state_utilities_by_id_data,
        get_real_state_utilities_by_id_status
    } = useSelector((state: any) => state?.assets_slice);

    const isLoading = update_real_state_utilities_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_real_state_utilities_by_id_status === ASYNC_STATUS.LOADING;

    const utilityTypes: UtilityType[] = [
        { label: 'Electric', value: 'electric' },
        { label: 'Gas', value: 'gas' },
        { label: 'Water', value: 'water' },
        { label: 'Internet', value: 'internet' },
        { label: 'Cable/TV', value: 'cable_tv' },
        { label: 'Trash', value: 'trash' },
        { label: 'Other', value: 'other' },
    ];

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

    // Fetch utility data by ID
    useEffect(() => {
        if (utilityId) {
            dispatch(getRealStateUtilitiesByIdAsync(utilityId as any));
        }
    }, [utilityId, dispatch]);

    // Populate form when data is loaded
    useEffect(() => {
        if (get_real_state_utilities_by_id_data?.utilities && utilityId) {
            const utility = get_real_state_utilities_by_id_data.utilities.find((u: any) => u.id === utilityId);
            if (utility && formikRef.current) {
                // Parse dates from ISO strings
                let endDateValue = null;
                if (utility.enddate) {
                    endDateValue = typeof utility.enddate === 'string' ? new Date(utility.enddate) : utility.enddate;
                }
                let startDateValue = null;
                if (utility.startdate || utility.startDate) {
                    const raw = utility.startdate || utility.startDate;
                    startDateValue = typeof raw === 'string' ? new Date(raw) : raw;
                }

                // Restore doc IDs for multi-doc picker
                if (utility.uploadattachments) {
                    const existing = Array.isArray(utility.uploadattachments)
                        ? utility.uploadattachments
                        : [utility.uploadattachments as string];
                    setDocIds(existing);
                }

                formikRef.current.setValues({
                    utilityType: utility.utilitytype || '',
                    vendor: utility.vendor || '',
                    averageMonthlyAmount: utility.averagemonthlyamount !== undefined ? String(utility.averagemonthlyamount) : '',
                    billingFrequency: utility.billingfrequency || utility.billingFrequency || '',
                    startDate: startDateValue,
                    endDate: endDateValue,
                    accountNumber: utility.accountnumber || '',
                    dueDay: utility.dueday !== undefined ? String(utility.dueday) : '',
                    phoneNumber: utility.phonenumber || '',
                    website: utility.website || '',
                    notes: utility.notes || '',
                    uploadAttachments: '',
                    realEstateId: utility.realestateid || null,
                });
            }
        }
    }, [get_real_state_utilities_by_id_data, utilityId]);

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const initialValues: UtilityFormData = {
        utilityType: '',
        vendor: '',
        averageMonthlyAmount: '',
        billingFrequency: '',
        startDate: null,
        endDate: null,
        accountNumber: '',
        dueDay: '',
        phoneNumber: '',
        website: '',
        notes: '',
        uploadAttachments: '',
        realEstateId: null,
    };

    const handleSubmitData = (values: UtilityFormData) => {
        // Convert date to ISO string if it's a Date object, otherwise use as is
        let endDateISO: any = null;
        if (values.endDate) {
            if (values.endDate instanceof Date) {
                endDateISO = values.endDate.toISOString();
            } else if (typeof values.endDate === 'string') {
                endDateISO = values.endDate;
            }
        }

        let startDateISO: any = null;
        if (values.startDate) {
            if (values.startDate instanceof Date) {
                startDateISO = values.startDate.toISOString();
            } else if (typeof values.startDate === 'string') {
                startDateISO = values.startDate;
            }
        }

        const payload: any = {
            utilityType: values.utilityType,
            vendor: values.vendor,
            averageMonthlyAmount: values.averageMonthlyAmount !== '' ? Number(values.averageMonthlyAmount) : 0,
            ...(values.billingFrequency ? { billingFrequency: values.billingFrequency } : {}),
            startDate: startDateISO,
            endDate: endDateISO,
            accountNumber: values.accountNumber,
            dueDay: values.dueDay !== '' ? Number(values.dueDay) : 0,
            phoneNumber: values.phoneNumber,
            website: values.website,
            notes: values.notes || '',
            uploadAttachments: docIds.length > 0 ? docIds : [],
            realEstateId: values.realEstateId,
        };


        dispatch(updateRealStateUtilitiesAsync({ id: utilityId, data: payload }));
    };

    useEffect(() => {
        if (update_real_state_utilities_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setUpdateRealStateUtilitiesStatus());
            navigation.goBack();
        }
    }, [update_real_state_utilities_status, dispatch, navigation]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('real_estate.edit_utility')}
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
                title={t('real_estate.edit_utility')}
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
                    {t('real_estate.utilities')}
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
                        validationSchema={validationSchema('real_state_utility')}
                        onSubmit={handleSubmitData}
                        enableReinitialize
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                            <>
                                {/* Utility Type */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.utility_type')} *
                                    </Text>
                                    <CustomDropDown
                                        options={utilityTypes}
                                        value={values.utilityType}
                                        onSelect={(val: any) => setFieldValue('utilityType', val as string)}
                                        placeholder={t('real_estate.select')}
                                        leftIcon={true}
                                        search={true}
                                        error={touched.utilityType && errors.utilityType ? true : false}
                                    />
                                    {touched.utilityType && errors.utilityType && (
                                        <Text style={styles.errorText}>{String(errors.utilityType)}</Text>
                                    )}
                                </View>

                                {/* Vendor and Average Monthly Amount */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.vendor')} *
                                        </Text>
                                        <VendorAutocompleteInput
                                            category="utility_vendor_real_estate"
                                            placeholder={t('real_estate.vendor_placeholder')}
                                            value={values.vendor}
                                            onChangeText={handleChange('vendor')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            error={touched.vendor && errors.vendor ? String(errors.vendor) : undefined}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.average_monthly_amount')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="0.00"
                                            value={values.averageMonthlyAmount}
                                            onChangeText={handleChange('averageMonthlyAmount')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.averageMonthlyAmount && errors.averageMonthlyAmount ? String(errors.averageMonthlyAmount) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Billing Frequency */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('utilities.billing_frequency')}
                                    </Text>
                                    <CustomDropDown
                                        options={BILLING_FREQUENCY_OPTIONS}
                                        value={values.billingFrequency}
                                        onSelect={(val: any) => setFieldValue('billingFrequency', (val as string) || '')}
                                        placeholder={t('utilities.billing_frequency_placeholder')}
                                        leftIcon={true}
                                        search={false}
                                    />
                                </View>

                                {/* Start Date */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('utilities.start_date')}
                                    </Text>
                                    <CustomDateTimePicker
                                        value={values.startDate}
                                        onChange={(val: any) => {
                                            setFieldValue('startDate', val);
                                            // If existing endDate is before new startDate, clear it
                                            if (values.endDate) {
                                                const sel = new Date(new Date(val).setHours(0, 0, 0, 0));
                                                const end = new Date(new Date(values.endDate as any).setHours(0, 0, 0, 0));
                                                if (sel >= end) {
                                                    setFieldValue('endDate', null);
                                                }
                                            }
                                        }}
                                        placeholder={t('real_estate.select_date')}
                                        displayFormat="MM/DD/YYYY"
                                        containerStyle={styles.inputContainer}
                                        maximumDate={values.endDate ? new Date(values.endDate as any) : undefined}
                                        suffixIcon={
                                            <Feather name="calendar" size={20} color={colors.gray} />
                                        }
                                    />
                                </View>

                                {/* End Date */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.end_date')} *
                                    </Text>
                                    <CustomDateTimePicker
                                        value={values.endDate}
                                        onChange={(date: string | Date) => setFieldValue('endDate', date)}
                                        placeholder={t('real_estate.select_date')}
                                        displayFormat="MM/DD/YYYY"
                                        containerStyle={styles.inputContainer}
                                        suffixIcon={
                                            <Feather name="calendar" size={20} color={colors.gray} />
                                        }
                                        error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                    />
                                </View>

                                {/* Account Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.account_optional')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.account_number')}
                                        value={values.accountNumber}
                                        onChangeText={handleChange('accountNumber')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.accountNumber && errors.accountNumber ? String(errors.accountNumber) : undefined}
                                    />
                                </View>

                                {/* Due Day and Phone Number */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.due_day_optional')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="2"
                                            value={values.dueDay}
                                            onChangeText={handleChange('dueDay')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.phone_optional')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="(621)-111 1111"
                                            value={values.phoneNumber}
                                            onChangeText={handleChange('phoneNumber')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="phone-pad"
                                            error={touched.phoneNumber && errors.phoneNumber ? String(errors.phoneNumber) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Website */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.website_optional')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={t('common.website_placeholder')}
                                        value={values.website}
                                        onChangeText={handleChange('website')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="url"
                                        error={touched.website && errors.website ? String(errors.website) : undefined}
                                    />
                                </View>

                                {/* Document Upload */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.upload_attachments')} *
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

export default EditUtilities;
