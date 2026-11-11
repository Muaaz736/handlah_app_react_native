import {
    ScrollView,
    Text,
    View,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
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
import { getRealStateServiceWorkHistoryByIdAsync, updateRealStateServiceWorkHistoryAsync } from '../../../../../../redux/services/assetsService';
import { setUpdateRealStateServiceWorkHistoryStatus } from '../../../../../../redux/slices/assetsSlice';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { ServiceFormData, EditServicesWorkHistoryRouteParams, EditServicesWorkHistoryProps } from './addServicesWorkHistory.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';

import { makeEditServicesWorkHistoryStyles } from './EditServicesWorkHistory.styles';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const EditServicesWorkHistory: React.FC<EditServicesWorkHistoryProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const route = useRoute();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const formikRef = useRef<FormikProps<ServiceFormData> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditServicesWorkHistoryStyles(themeColors as RoleTheme), [themeColors]);

    const { serviceId } = (route?.params as EditServicesWorkHistoryRouteParams) || {};
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.RealEstateService,
        recordId: serviceId ? Number(serviceId) : null,
        businessId: 'auto',
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.RealEstateService, recordId: serviceId ? Number(serviceId) : null, enabled: links.enabled });

    const dispatch = useDispatch<AppDispatch>();
    const {
        update_real_state_service_work_history_status,
        get_real_state_service_work_history_by_id_data,
        get_real_state_service_work_history_by_id_status
    } = useSelector((state: any) => state?.assets_slice);

    const isLoading = update_real_state_service_work_history_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_real_state_service_work_history_by_id_status === ASYNC_STATUS.LOADING;

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

    // Fetch service work history data by ID
    useEffect(() => {
        if (serviceId) {
            dispatch(getRealStateServiceWorkHistoryByIdAsync(serviceId as any));
        }
    }, [serviceId, dispatch]);

    // Populate form when data is loaded
    useEffect(() => {
        if (get_real_state_service_work_history_by_id_data?.serviceworkhistories && serviceId) {
            const service = get_real_state_service_work_history_by_id_data.serviceworkhistories.find((s: any) => s.id === serviceId);
            if (service && formikRef.current) {
                // Parse date from ISO strings
                let dateValue = null;
                if (service.date) {
                    dateValue = typeof service.date === 'string' ? new Date(service.date) : service.date;
                }

                // Restore doc IDs for multi-doc picker
                if (service.attachment) {
                    const existing = Array.isArray(service.attachment)
                        ? service.attachment
                        : [service.attachment as string];
                    setDocIds(existing);
                }

                formikRef.current.setValues({
                    date: dateValue,
                    vendorContractor: service.vendorcontractor || service.vendorContractor || '',
                    cost: service.cost !== undefined ? String(service.cost) : '',
                    tags: service.tags || '',
                    description: service.description || '',
                    attachment: '',
                    realEstateId: service.realestateid || service.realEstateId || null,
                });
            }
        }
    }, [get_real_state_service_work_history_by_id_data, serviceId]);

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const initialValues: ServiceFormData = {
        date: null,
        vendorContractor: '',
        cost: '',
        tags: '',
        description: '',
        attachment: '',
        realEstateId: null,
    };

    const handleSubmitData = (values: ServiceFormData) => {
        // Convert date to ISO string if it's a Date object, otherwise use as is
        let dateISO: any = null;
        if (values.date) {
            if (values.date instanceof Date) {
                dateISO = values.date.toISOString();
            } else if (typeof values.date === 'string') {
                dateISO = values.date;
            }
        }

        const payload: any = {
            date: dateISO,
            vendorContractor: values.vendorContractor,
            cost: values.cost !== '' ? Number(values.cost) : 0,
            tags: values.tags,
            description: values.description,
            attachment: docIds.length > 0 ? docIds : [],
            realEstateId: values.realEstateId,
        };


        dispatch(updateRealStateServiceWorkHistoryAsync({ id: serviceId, data: payload })).then((a: any) => saveLinksAfter(links, a, serviceId, undefined, recordNotes));
    };

    useEffect(() => {
        if (update_real_state_service_work_history_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setUpdateRealStateServiceWorkHistoryStatus());
            navigation.goBack();
        }
    }, [update_real_state_service_work_history_status, dispatch, navigation]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('real_estate.edit_services_work_history')}
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
                title={t('real_estate.edit_services_work_history')}
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
                    {t('real_estate.services_work_history')}
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
                        validationSchema={validationSchema('real_state_service_work_history')}
                        onSubmit={handleSubmitData}
                        enableReinitialize
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                            <>
                                {/* Date */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.date')}
                                    </Text>
                                    <CustomDateTimePicker
                                        value={values.date}
                                        onChange={(date: string | Date) => setFieldValue('date', date)}
                                        placeholder={t('real_estate.select_date')}
                                        displayFormat="MM/DD/YYYY"
                                        containerStyle={styles.inputContainer}
                                        suffixIcon={
                                            <Feather name="calendar" size={20} color={colors.gray} />
                                        }
                                    />
                                    {touched.date && errors.date && (
                                        <Text style={styles.errorText}>{String(errors.date)}</Text>
                                    )}
                                </View>

                                {/* Vendor/Contractor */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.vendor_contractor')}
                                    </Text>
                                    <VendorAutocompleteInput
                                        category="real_estate_service_vendor"
                                        placeholder={t('real_estate.vendor_contractor_placeholder')}
                                        value={values.vendorContractor}
                                        onChangeText={handleChange('vendorContractor')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.vendorContractor && errors.vendorContractor ? String(errors.vendorContractor) : undefined}
                                    />
                                </View>

                                {/* Cost */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.cost')}
                                    </Text>
                                    <CustomInput
                                        placeholder="0.00"
                                        value={values.cost}
                                        onChangeText={handleChange('cost')}
                                        containerStyle={styles.inputContainer}
                                        keyboardType="numeric"
                                        error={touched.cost && errors.cost ? String(errors.cost) : undefined}
                                    />
                                </View>

                                {/* Tags */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.tags')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.tags_placeholder')}
                                        value={values.tags}
                                        onChangeText={handleChange('tags')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.tags && errors.tags ? String(errors.tags) : undefined}
                                    />
                                </View>

                                {/* Description */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.description')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.description_placeholder')}
                                        value={values.description}
                                        onChangeText={handleChange('description')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ height: 100, alignItems: 'flex-start', paddingTop: 8 }}
                                        multiline
                                        numberOfLines={4}
                                        error={touched.description && errors.description ? String(errors.description) : undefined}
                                    />
                                </View>

                                {/* Document Upload */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.upload_attachment')}
                                    </Text>
                                    <DocumentPicker
                                        multiple={true}
                                        maxDocuments={5}
                                        documentIds={docIds}
                                        onDocumentIdsChange={(ids) => setDocIds(ids)}
                                        uploadType="box"
                                        autoUpload={true}
                                    />
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
            <RecordNotesField notes={recordNotes} />
            <RecordLinksField links={links} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditServicesWorkHistory;

