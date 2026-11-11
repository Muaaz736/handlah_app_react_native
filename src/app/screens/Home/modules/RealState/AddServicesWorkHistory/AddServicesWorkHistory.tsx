import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    Keyboard,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useState, useRef, useEffect, FC, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import FONTS from '../../../../../../utils/fonts';
import Feather from 'react-native-vector-icons/Feather';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { addRealStateServiceWorkHistoryAsync, updateRealStateServiceWorkHistoryAsync } from '../../../../../../redux/services/assetsService';
import { setAddRealStateServiceWorkHistoryStatus, setUpdateRealStateServiceWorkHistoryStatus } from '../../../../../../redux/slices/assetsSlice';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { makeAddServicesWorkHistoryStyles } from './AddServicesWorkHistory.styles';
import type {
    ServiceFormData,
    AddServicesRouteParams,
    AddServicesScreenProps,
} from './addServicesWorkHistory.types';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeSharedStyles } from '../RealState.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';
import CustomDropDown from '../../../../../../components/common/CustomDropDown';

/** Same choices and stored values as the website. */
const PAYMENT_METHODS = [
    { value: 'Cash', key: 'cash' },
    { value: 'Credit Card', key: 'credit_card' },
    { value: 'Debit Card', key: 'debit_card' },
    { value: 'Check', key: 'check' },
    { value: 'Bank Transfer', key: 'bank_transfer' },
    { value: 'Other', key: 'other' },
];


const AddServicesWorkHistory: FC<AddServicesScreenProps> = ({ route }) => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const routeParams = (route?.params as AddServicesRouteParams) || {};
    const { service, isEdit = false, realEstateId, addNew = false } = routeParams;
    const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.RealEstateService,
        recordId: isEdit && service?.id ? Number(service.id) : null,
        businessId: 'auto',
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.RealEstateService, recordId: isEdit && service?.id ? Number(service.id) : null, enabled: links.enabled });
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeAddServicesWorkHistoryStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const formikRef = useRef<any>(null);
    const dispatch = useDispatch<AppDispatch>();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const {
        add_real_state_service_work_history_status,
        update_real_state_service_work_history_status,
        add_real_state_overview_data,
    } = useSelector((state: any) => state?.assets_slice);

    const isLoading =
        add_real_state_service_work_history_status === ASYNC_STATUS.LOADING ||
        update_real_state_service_work_history_status === ASYNC_STATUS.LOADING;

    const initialValues: ServiceFormData = {
        date: service?.date || null,
        vendorContractor:
            service?.vendorContractor ?? (service as any)?.vendorcontractor ?? '',
        cost:
            service?.cost !== undefined
                ? String(service.cost)
                : (service as any)?.cost
                    ? String((service as any).cost)
                    : '',
        tags: service?.tags ?? (service as any)?.tags ?? '',
        description: service?.description ?? (service as any)?.description ?? '',
        paymentMethod: service?.paymentMethod ?? (service as any)?.paymentmethod ?? '',
        attachment:
            service?.attachment ?? (service as any)?.attachment ?? '',
        realEstateId: realEstateId || add_real_state_overview_data?.id,
    };


    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const handleSubmitData = (values: ServiceFormData) => {
        let dateISO = '';
        if (values.date) {
            if (values.date instanceof Date) dateISO = values.date.toISOString();
            else if (typeof values.date === 'string') dateISO = values.date;
        }

        const payload: ServiceFormData = {
            date: dateISO,
            vendorContractor: values.vendorContractor,
            cost: values.cost,
            tags: values.tags,
            description: values.description,
            ...(values.paymentMethod ? { paymentMethod: values.paymentMethod } : {}),
            attachment: docIds.length > 0 ? docIds : [],
            realEstateId:
                values.realEstateId ||
                realEstateId ||
                (service as any)?.realestateid ||
                add_real_state_overview_data?.id ||
                null,
        };

        if (isEdit && service?.id) {
            dispatch(updateRealStateServiceWorkHistoryAsync({ id: service.id, data: payload } as any)).then((a: any) => saveLinksAfter(links, a, service.id, undefined, recordNotes));
        } else {
            dispatch(addRealStateServiceWorkHistoryAsync({ serviceWorkHistories: [{ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }] } as any)).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
        }
    };

    const handleSkip = (): void => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'Dashboard' },
                    { name: 'RealEstate' }
                ],
            })
        );
    };

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

    useEffect(() => {
        if (service && formikRef.current) {
            // mirror initialValues logic so we don't duplicate casing conversions
            const uploadUrl = (service as any).attachment || service.attachment;
            if (uploadUrl) {
                const existing = Array.isArray(uploadUrl) ? uploadUrl : [uploadUrl as string];
                setDocIds(existing);
            }
            formikRef.current.setValues({
                ...initialValues,
                attachment: '',
                realEstateId: realEstateId || add_real_state_overview_data?.id || null,
            });
        }
    }, [service, add_real_state_overview_data]);

    useEffect(() => {
        if (
            add_real_state_service_work_history_status === ASYNC_STATUS.SUCCEEDED ||
            update_real_state_service_work_history_status === ASYNC_STATUS.SUCCEEDED
        ) {
            if (add_real_state_service_work_history_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddRealStateServiceWorkHistoryStatus());
            }
            if (update_real_state_service_work_history_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateRealStateServiceWorkHistoryStatus());
            }

            if (isEdit || addNew) {
                navigation.goBack();
            } else {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 1,
                        routes: [
                            { name: 'Dashboard' },
                            { name: 'RealEstate' }
                        ],
                    })
                );
            }
        }
    }, [
        add_real_state_service_work_history_status,
        update_real_state_service_work_history_status,
    ]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <AuthHeader
                        title={isEdit ? t('real_estate.edit_services_work_history') : t('real_estate.your_property')}
                        onBackPress={() => navigation.goBack()}
                        containerStyle={{ paddingHorizontal: 16, marginBottom: 0 }}
                        backButtonStyle={{ marginBottom: 0 }}
                        titleStyle={{
                            marginBottom: 0,
                            marginTop: 20,
                            textAlign: 'left',
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
                        <Text style={[styles.activeTabText, { textAlign: 'left' }]}>
                            {t('real_estate.services_work_history')}
                        </Text>
                    </View>
                </View>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: isKeyboardVisible ? keyboardHeight - 30 : 30 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* services list removed - single entry mode */}

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Formik
                            innerRef={formikRef}
                            initialValues={initialValues}
                            enableReinitialize={true}
                            validationSchema={validationSchema('real_state_services')}
                            onSubmit={handleSubmitData}
                        >
                            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                                <>
                                    {/* Date and Vendor/Contractor */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.date')} *
                                            </Text>
                                            <CustomDateTimePicker
                                                placeholder={t('real_estate.select')}
                                                value={values.date}
                                                onChange={(val: any) => setFieldValue('date', val)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                labelStyle={{ textAlign: 'left' }}
                                                suffixIcon={
                                                    <Feather name="calendar" size={20} color={colors.gray} />
                                                }
                                                error={touched.date && errors.date ? String(errors.date) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.vendor_contractor')} *
                                            </Text>
                                            <VendorAutocompleteInput
                                                category="real_estate_service_vendor"
                                                placeholder={t('common.vendor_contractor')}
                                                value={values.vendorContractor}
                                                onChangeText={handleChange('vendorContractor')}
                                                onBlur={handleBlur('vendorContractor')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.vendorContractor && errors.vendorContractor ? String(errors.vendorContractor) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Cost and Tags */}
                                    <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.cost')} *
                                            </Text>
                                            <CustomInput
                                                placeholder={t('common.price_dollar')}
                                                value={values.cost}
                                                onChangeText={handleChange('cost')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                keyboardType="numeric"
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.cost && errors.cost ? String(errors.cost) : undefined}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.tags')}
                                            </Text>
                                            <CustomInput
                                                placeholder={t('common.tags')}
                                                value={values.tags}
                                                onChangeText={handleChange('tags')}
                                                onBlur={handleBlur('tags')}
                                                containerStyle={styles.inputContainerNoMargin}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                error={touched.tags && errors.tags ? String(errors.tags) : undefined}
                                            />
                                        </View>
                                    </View>

                                    {/* Description */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.description')}
                                        </Text>

                                        <CustomInput
                                            placeholder={"What Was Done ?"}
                                            value={values.description}
                                            onChangeText={handleChange('description')}
                                            containerStyle={styles.inputContainer}
                                            inputContainerStyle={styles.descriptionInput}
                                            multiline={true}
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            inputStyle={styles.descriptionInput}
                                        />
                                    </View>

                                    {/* Payment Method (as on the website) */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.payment_method')}
                                        </Text>
                                        <CustomDropDown
                                            options={PAYMENT_METHODS.map(m => ({ label: t(`real_estate.payment_methods.${m.key}`), value: m.value }))}
                                            value={values.paymentMethod || ''}
                                            onSelect={(v) => setFieldValue('paymentMethod', (v as string) || '')}
                                            placeholder={t('subscriptions.payment_method_placeholder')}
                                            search={false}
                                            leftIcon
                                        />
                                    </View>

                                    {/* Upload Attachment */}
                                    <View style={styles.inputGroup}>
                                        <MixedMediaUploader
                                            mediaIds={docIds}
                                            onMediaChange={(ids: any) => setDocIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                                            label={t('real_estate.upload_documents')}
                                            placeholder={t('real_estate.upload_documents')}
                                            uploadType="box"
                                            maxItems={5}
                                            removable={true}
                                            autoUpload={true}
                                        />
                                    </View>

                                    {/* Submit + continue */}
                                    <OfflineChainGuard isWizardMode={!isEdit && !addNew}>
                                        <PrimaryButton
                                            title={isEdit ? t('common.update') : addNew ? t('common.add') : t('common.continue')}
                                            onPress={handleSubmit}
                                            buttonStyle={[styles.addPropertyButton, { backgroundColor: themeColors.primary }]}
                                            loading={isLoading}
                                            disabled={isLoading}
                                        />
                                    </OfflineChainGuard>
                                </>
                            )}
                        </Formik>
                    </View>
                <RecordNotesField notes={recordNotes} />
                <RecordLinksField links={links} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default AddServicesWorkHistory;
