import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Keyboard,
} from 'react-native';
import React, { FC, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDateTimePicker,
    CustomDropDown,
    DocumentPicker,
    OfflineChainGuard,
    MixedMediaUploader,
    VendorAutocompleteInput,
} from '../../../../../../components/common';

import { makeAddUtilitiesStyles } from './AddUtilities.styles';
import { useNavigation, NavigationProp, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { addRealStateUtilitiesAsync, updateRealStateUtilitiesAsync } from '../../../../../../redux/services/assetsService';
import { setAddRealStateUtilitiesStatus, setUpdateRealStateUtilitiesStatus } from '../../../../../../redux/slices/assetsSlice';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';
import {
    UtilityFormData,
    UtilityType,
    AddUtilitiesRouteParams,
} from './addUtilities.types';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeSharedStyles } from '../RealState.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { billingFrequencyOptions } from '../../../../../../utils/billingFrequency';
import { groupedExpenseTypeOptions } from '../../../../../../utils/expenseTypes';



const AddUtilities: FC = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const route = useRoute<RouteProp<{ params: AddUtilitiesRouteParams }, 'params'>>();
    const params = route?.params || {};
    const { utility, isEdit = false, realEstateId, addNew = false } = params;
    const ownerUserId = (route?.params as any)?.ownerUserId;

    const { t, i18n } = useTranslation();
    const isRTL: boolean = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeAddUtilitiesStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness();
    const formikRef = useRef<any>(null);
    const dispatch = useDispatch<AppDispatch>();


    // single utility entry only
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const {
        add_real_state_utilities_status,
        update_real_state_utilities_status,
        add_real_state_overview_data,
    } = useSelector((state: any) => state?.assets_slice);



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


    const isLoading =
        add_real_state_utilities_status === ASYNC_STATUS.LOADING ||
        update_real_state_utilities_status === ASYNC_STATUS.LOADING;


    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('UtilityType'));
    }, [dispatch]));

    const initialValues: UtilityFormData = {
        utilityType: utility?.utilitytype || '',
        vendor: utility?.vendor || '',
        averageMonthlyAmount: utility?.averagemonthlyamount?.toString() || '',
        billingFrequency: utility?.billingfrequency || (utility as any)?.billingFrequency || '',
        startDate: utility?.startdate || utility?.startDate || null,
        endDate: utility?.enddate || null,
        accountNumber: utility?.accountnumber || '',
        dueDay: utility?.dueday != null ? utility.dueday.toString() : '',
        phoneNumber: utility?.phonenumber || '',
        website: utility?.website || '',
        notes: utility?.notes || '',
        uploadAttachments: utility?.uploadattachments || '',
        realEstateId:
            utility?.realestateid || realEstateId || add_real_state_overview_data?.id || null,
    };

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const handleSubmitData = (values: any) => {
        let endDateISO = null;
        if (values.endDate) {
            if (values.endDate instanceof Date) endDateISO = values.endDate.toISOString();
            else if (typeof values.endDate === 'string') endDateISO = values.endDate;
        }

        let startDateISO = null;
        if (values.startDate) {
            if (values.startDate instanceof Date) startDateISO = values.startDate.toISOString();
            else if (typeof values.startDate === 'string') startDateISO = values.startDate;
        }

        const payload: any = {
            utilityType: values.utilityType,
            vendor: values.vendor,
            averageMonthlyAmount: values.averageMonthlyAmount !== '' ? Number(values.averageMonthlyAmount) : 0,
            ...(values.billingFrequency ? { billingFrequency: values.billingFrequency } : {}),
            startDate: startDateISO,
            endDate: endDateISO,
            accountNumber: values.accountNumber,
            ...(values.dueDay !== '' ? { dueDay: Number(values.dueDay) } : {}),
            phoneNumber: values.phoneNumber,
            website: values.website,
            notes: values.notes || '',
            uploadAttachments: docIds.length > 0 ? docIds : [],
            realEstateId:
                values.realEstateId ||
                realEstateId ||
                (utility as any)?.realestateid ||
                add_real_state_overview_data?.id ||
                null,
        };

        if (isBusinessRole()) {
            payload.businessId = selectedBusinessId;
        }

        if (isEdit && utility?.id) {
            dispatch(updateRealStateUtilitiesAsync({ id: utility.id, data: payload } as any));
        } else {
            dispatch(addRealStateUtilitiesAsync({ utilities: [{ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }] } as any));
        }
    };

    const handleSkip = (): void => {
        navigation.navigate('AddInsurance', { realEstateId: realEstateId });
    };

    // populate form when editing existing utility
    useEffect(() => {
        if (utility && formikRef.current) {
            let endDateValue = null;
            if (utility.enddate) {
                endDateValue = typeof utility.enddate === 'string' ? new Date(utility.enddate) : utility.enddate;
            }
            let startDateValue = null;
            if (utility.startdate || utility.startDate) {
                const raw = utility.startdate || utility.startDate;
                startDateValue = typeof raw === 'string' ? new Date(raw) : raw;
            }
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
                notes: utility.notes || '',
                accountNumber: utility.accountnumber || '',
                dueDay: utility.dueday != null ? String(utility.dueday) : '',
                phoneNumber: utility.phonenumber || '',
                website: utility.website || '',
                uploadAttachments: '',
                realEstateId:
                    realEstateId || add_real_state_overview_data?.id || null,
            });
        }
    }, [utility, realEstateId, add_real_state_overview_data]);

    // handle success for both add and update
    useEffect(() => {
        if (
            add_real_state_utilities_status === ASYNC_STATUS.SUCCEEDED ||
            update_real_state_utilities_status === ASYNC_STATUS.SUCCEEDED
        ) {
            if (add_real_state_utilities_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddRealStateUtilitiesStatus());
            }
            if (update_real_state_utilities_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateRealStateUtilitiesStatus());
            }

            if (isEdit || addNew) {
                navigation.goBack();
            } else {
                navigation.navigate('AddInsurance', { realEstateId: realEstateId });
            }
            setDocIds([]);
        }
    }, [
        add_real_state_utilities_status,
        update_real_state_utilities_status,
    ]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <AuthHeader
                        title={isEdit ? t('real_estate.edit_utility') : t('real_estate.your_property')}
                        onBackPress={() => navigation.goBack()}
                        containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                        backButtonStyle={{ marginBottom: 0 }}
                        titleStyle={{
                            marginBottom: 0,
                            marginTop: 20,
                            textAlign: 'left',
                        }}
                        backButtonIconStyle={{ tintColor: themeColors.textPrimary}}
                    />
                    {!isEdit && !addNew && (
                        <TouchableOpacity
                            style={[
                                styles.skipButton,
                                {
                                    borderColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary,
                                    backgroundColor: themeColors?.isDark ? themeColors.primary +'10' : themeColors.secondary + '10',
                                },
                            ]}
                            onPress={handleSkip}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.skipButtonText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('common.skip_this')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.tabContainer}>
                    <View style={styles.activeTab}>
                        <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
                            {t('real_estate.utilities')}
                        </Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, {
                        paddingBottom: isKeyboardVisible
                            ? keyboardHeight - 30
                            : 0,
                    }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* single-entry mode: no list displayed */}

                    <View style={styles.formContainer}>
                        <Formik
                            innerRef={formikRef}
                            initialValues={initialValues}
                            enableReinitialize={true}
                            validationSchema={validationSchema('real_state_utility')}
                            onSubmit={handleSubmitData}
                        >
                            {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.utility_type')} *
                                        </Text>
                                        <CustomDropDown
                                            options={groupedExpenseTypeOptions(get_dropdown_options_data)}
                                            value={values.utilityType}
                                            onSelect={(val: any) => setFieldValue('utilityType', val as string)}
                                            placeholder={t('real_estate.select')}
                                            leftIcon={true}
                                            search={false}
                                            error={touched.utilityType && errors.utilityType ? true : false}
                                        />
                                        {touched.utilityType && errors.utilityType && <Text style={styles.errorText}>{String(errors.utilityType)}</Text>}
                                    </View>

                                    {/* Vendor and Average Monthly Amount */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.vendor')} *
                                            </Text>
                                            <VendorAutocompleteInput
                                                category="utility_vendor_real_estate"
                                                placeholder={t('real_estate.vendor_placeholder')}
                                                value={values.vendor}
                                                onChangeText={handleChange('vendor')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.vendor && errors.vendor ? String(errors.vendor) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.average_monthly_amount')}
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.averageMonthlyAmount}
                                                onChangeText={handleChange('averageMonthlyAmount')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.averageMonthlyAmount && errors.averageMonthlyAmount ? String(errors.averageMonthlyAmount) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Billing Frequency */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('utilities.billing_frequency')}
                                        </Text>
                                        <CustomDropDown
                                            options={billingFrequencyOptions()}
                                            value={values.billingFrequency}
                                            onSelect={(val: any) => setFieldValue('billingFrequency', (val as string) || '')}
                                            placeholder={t('utilities.billing_frequency_placeholder')}
                                            leftIcon={true}
                                            search={false}
                                        />
                                    </View>

                                    {/* Start Date */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('utilities.start_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
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
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            labelStyle={{ textAlign: 'left' }}
                                            maximumDate={values.endDate ? new Date(values.endDate as any) : undefined}
                                            containerStyle={{ width: 'auto' }}
                                            inputContainerStyle={{ borderRadius: 12 }}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                        />
                                    </View>

                                    {/* End Date */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.end_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
                                            value={values.endDate}
                                            onChange={(val: any) => setFieldValue('endDate', val as Date)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            labelStyle={{ textAlign: 'left' }}
                                            containerStyle={{ width: 'auto' }}
                                            inputContainerStyle={{ borderRadius: 12 }}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                            error={touched.endDate && errors.endDate ? String(errors.endDate) : undefined}
                                        />
                                    </View>

                                    {/* Account # */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.account_optional')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('real_estate.account_number')}
                                            value={values.accountNumber}
                                            onChangeText={handleChange('accountNumber')}
                                            containerStyle={styles.inputContainer}
                                            error={touched.accountNumber && errors.accountNumber ? String(errors.accountNumber) : undefined}
                                        />
                                    </View>

                                    {/* Due day and Phone# */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.due_day_optional')}
                                            </Text>
                                            <CustomInput
                                                placeholder="2"
                                                value={values.dueDay}
                                                onChangeText={handleChange('dueDay')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.dueDay && errors.dueDay ? String(errors.dueDay) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.phone_optional')}
                                            </Text>
                                            <CustomInput
                                                placeholder="(621)-111 1111"
                                                value={values.phoneNumber}
                                                onChangeText={handleChange('phoneNumber')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="phone-pad"
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.phoneNumber && errors.phoneNumber ? String(errors.phoneNumber) : undefined}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.notesSection}>
                                        <CustomInput
                                            label={t('request_access_data.notes_optional')}
                                            placeholder={t('request_access_data.notes_placeholder')}
                                            value={values.notes}
                                            onChangeText={handleChange('notes')}
                                            multiline
                                            numberOfLines={4}
                                            inputStyle={styles.notesInput}
                                            inputContainerStyle={styles.notesInputContainer}
                                        />
                                    </View>

                                    {/* Website */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.website_optional')}
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



                                    {/* Upload Attachments */}
                                    <View style={styles.inputGroup}>
                                        <MixedMediaUploader
                                            mediaIds={docIds}
                                            onMediaChange={(ids: any) => setDocIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                                            label={t('legal.upload_document')}
                                            uploadType="box"
                                            maxItems={5}
                                            removable={true}
                                            autoUpload={true}
                                        />
                                        {touched.uploadAttachments && errors.uploadAttachments && <Text style={styles.errorText}>{String(errors.uploadAttachments)}</Text>}
                                    </View>

                                    {/* Submit and continue */}
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

export default AddUtilities;
