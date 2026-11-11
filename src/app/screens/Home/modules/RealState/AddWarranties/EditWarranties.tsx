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
import { getRealStateWarrantiesByIdAsync, updateRealStateWarrantiesAsync } from '../../../../../../redux/services/assetsService';
import { setUpdateRealStateWarrantiesStatus } from '../../../../../../redux/slices/assetsSlice';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { WarrantyFormData, EditWarrantiesRouteParams, EditWarrantiesProps } from './AddWarranties.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';

import { makeEditWarrantiesStyles } from './EditWarranties.styles';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const EditWarranties: React.FC<EditWarrantiesProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const route = useRoute();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const formikRef = useRef<FormikProps<WarrantyFormData> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditWarrantiesStyles(themeColors as RoleTheme), [themeColors]);

    const { warrantyId } = (route?.params as EditWarrantiesRouteParams) || {};

    const dispatch = useDispatch<AppDispatch>();
    const {
        update_real_state_warranties_status,
        get_real_state_warranties_by_id_data,
        get_real_state_warranties_by_id_status
    } = useSelector((state: any) => state?.assets_slice);

    const isLoading = update_real_state_warranties_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_real_state_warranties_by_id_status === ASYNC_STATUS.LOADING;

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

    // Fetch warranty data by ID
    useEffect(() => {
        if (warrantyId) {
            dispatch(getRealStateWarrantiesByIdAsync(warrantyId as any));
        }
    }, [warrantyId, dispatch]);

    // Populate form when data is loaded
    useEffect(() => {
        if (get_real_state_warranties_by_id_data?.warranties && warrantyId) {
            const warranty = get_real_state_warranties_by_id_data.warranties.find((w: any) => w.id === warrantyId);
            if (warranty && formikRef.current) {
                // Parse dates from ISO strings
                let expirationValue = null;
                if (warranty.expiration) {
                    expirationValue = typeof warranty.expiration === 'string' ? new Date(warranty.expiration) : warranty.expiration;
                }

                let startDateValue = null;
                if (warranty.startdate || warranty.startDate) {
                    const startDateStr = warranty.startdate || warranty.startDate;
                    startDateValue = typeof startDateStr === 'string' ? new Date(startDateStr) : startDateStr;
                }

                // Restore doc IDs for multi-doc picker
                if (warranty.uploadattachments || warranty.uploadAttachments) {
                    const docUrl = warranty.uploadattachments || warranty.uploadAttachments;
                    const existing = Array.isArray(docUrl) ? docUrl : [docUrl as string];
                    setDocIds(existing);
                }

                formikRef.current.setValues({
                    itemName: warranty.itemname || warranty.itemName || '',
                    warrantyProvider: warranty.warrantyprovider || warranty.warrantyProvider || '',
                    expiration: expirationValue,
                    startDate: startDateValue,
                    notes: warranty.notes || '',
                    website: warranty.website || '',
                    uploadAttachments: '',
                    realEstateId: warranty.realestateid || warranty.realEstateId || null,
                });
            }
        }
    }, [get_real_state_warranties_by_id_data, warrantyId]);

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const initialValues: WarrantyFormData = {
        itemName: '',
        warrantyProvider: '',
        expiration: null,
        startDate: null,
        notes: '',
        website: '',
        uploadAttachments: '',
        realEstateId: null,
    };

    const handleSubmitData = (values: WarrantyFormData) => {
        // Convert dates to ISO string if they're Date objects, otherwise use as is
        let expirationISO: any = null;
        if (values.expiration) {
            if (values.expiration instanceof Date) {
                expirationISO = values.expiration.toISOString();
            } else if (typeof values.expiration === 'string') {
                expirationISO = values.expiration;
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
            itemName: values.itemName,
            warrantyProvider: values.warrantyProvider,
            expiration: expirationISO,
            startDate: startDateISO,
            notes: values.notes,
            website: values.website,
            uploadAttachments: docIds.length > 0 ? docIds : [],
            realEstateId: values.realEstateId,
        };


        dispatch(updateRealStateWarrantiesAsync({ id: warrantyId, data: payload }));
    };

    useEffect(() => {
        if (update_real_state_warranties_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setUpdateRealStateWarrantiesStatus());
            navigation.goBack();
        }
    }, [update_real_state_warranties_status, dispatch, navigation]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('real_estate.edit_warranties')}
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
                title={t('real_estate.edit_warranties')}
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
                    {t('real_estate.warranties')}
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
                        validationSchema={validationSchema('real_state_warranty')}
                        onSubmit={handleSubmitData}
                        enableReinitialize
                        validateOnChange={true}
                        validateOnBlur={true}
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, setFieldTouched, validateForm, touched, errors }) => (
                            <>
                                {/* Item Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.item_name')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.item_name_placeholder')}
                                        value={values.itemName}
                                        onChangeText={handleChange('itemName')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.itemName && errors.itemName ? String(errors.itemName) : undefined}
                                    />
                                </View>

                                {/* Warranty Provider */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.warranty_provider')} *
                                    </Text>
                                    <VendorAutocompleteInput
                                        category="warranty_provider_real_estate"
                                        placeholder={t('real_estate.warranty_provider_placeholder')}
                                        value={values.warrantyProvider}
                                        onChangeText={handleChange('warrantyProvider')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.warrantyProvider && errors.warrantyProvider ? String(errors.warrantyProvider) : undefined}
                                    />
                                </View>

                                {/* Start Date and Expiration */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.start_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.startDate}
                                            onChange={(date: string | Date) => {
                                                setFieldValue('startDate', date).then(() => {
                                                    setFieldTouched('expiration', true, false);
                                                    validateForm();
                                                });
                                            }}
                                            placeholder={t('real_estate.select_date')}
                                            displayFormat="MM/DD/YYYY"
                                            containerStyle={styles.inputContainerNoMargin}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                        />
                                        {touched.startDate && errors.startDate && (
                                            <Text style={styles.errorText}>{String(errors.startDate)}</Text>
                                        )}
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.expiration')}
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.expiration}
                                            onChange={(date: string | Date) => {
                                                setFieldValue('expiration', date);
                                                setFieldTouched('expiration', true);
                                            }}
                                            placeholder={t('real_estate.select_date')}
                                            displayFormat="MM/DD/YYYY"
                                            containerStyle={styles.inputContainerNoMargin}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                        />
                                        {(touched.expiration || !!values.startDate) && errors.expiration && (
                                            <Text style={styles.errorText}>{String(errors.expiration)}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Notes */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.notes')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.notes_placeholder')}
                                        value={values.notes}
                                        onChangeText={handleChange('notes')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ height: 100, alignItems: 'flex-start', paddingTop: 8 }}
                                        multiline
                                        numberOfLines={4}
                                        error={touched.notes && errors.notes ? String(errors.notes) : undefined}
                                    />
                                </View>

                                {/* Website */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
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

export default EditWarranties;
