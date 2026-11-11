import React, { useState, useEffect, useRef, FC, useMemo } from 'react';
import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Keyboard,
} from 'react-native';
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

import { makeAddWarrantiesStyles } from './AddWarranties.styles';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import BillingFrequencyField from '../../../../../../components/common/BillingFrequencyField';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { addRealStateWarrantiesAsync, updateRealStateWarrantiesAsync } from '../../../../../../redux/services/assetsService';
import { setAddRealStateWarrantiesStatus, setUpdateRealStateWarrantiesStatus } from '../../../../../../redux/slices/assetsSlice';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import FONTS from '../../../../../../utils/fonts';
import Feather from 'react-native-vector-icons/Feather';
import type {
    WarrantyFormData,
    AddWarrantiesScreenProps,
    AddWarrantiesRouteParams,
} from './AddWarranties.types';
import { useNavigation } from '@react-navigation/native';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../../utils/helpers';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeSharedStyles } from '../RealState.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';


const AddWarranties: FC<AddWarrantiesScreenProps> = ({ route }) => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const routeParams = (route?.params as AddWarrantiesRouteParams) || {};
    const { warranty, isEdit = false, fromRealEstate = false, realEstateId, addNew = false } = routeParams;
    const ownerUserId = (route?.params as any)?.ownerUserId;
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeAddWarrantiesStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness();
    const formikRef = useRef<any>(null);
    const dispatch = useDispatch<AppDispatch>();

    // single warranty entry
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const {
        add_real_state_warranties_status,
        update_real_state_warranties_status,
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
        add_real_state_warranties_status === ASYNC_STATUS.LOADING ||
        update_real_state_warranties_status === ASYNC_STATUS.LOADING;

    const initialValues: WarrantyFormData = {
        itemName: warranty?.itemName ?? (warranty as any)?.itemname ?? '',
        warrantyProvider:
            warranty?.warrantyProvider ?? (warranty as any)?.warrantyprovider ?? '',
        warrantyNumber: (warranty as any)?.warrantynumber ?? (warranty as any)?.warrantyNumber ?? '',
        cost: (warranty as any)?.cost !== undefined && (warranty as any)?.cost !== null ? String((warranty as any).cost) : '',
        billingFrequency: (warranty as any)?.billingfrequency || (warranty as any)?.billingFrequency || '',
        expiration: warranty?.expiration || null,
        startDate: warranty?.startDate ?? (warranty as any)?.startdate ?? null,
        notes: warranty?.notes ?? (warranty as any)?.notes ?? '',
        website: warranty?.website ?? (warranty as any)?.website ?? '',
        uploadAttachments:
            warranty?.uploadAttachments ?? (warranty as any)?.uploadattachments ?? '',
        realEstateId:
            warranty?.realEstateId || realEstateId || add_real_state_overview_data?.id || null,
    };

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const handleSubmitData = (values: any) => {
        let expirationISO = null;
        if (values.expiration) {
            if (values.expiration instanceof Date) expirationISO = values.expiration.toISOString();
            else if (typeof values.expiration === 'string') expirationISO = values.expiration;
        }
        let startDateISO = null;
        if (values.startDate) {
            if (values.startDate instanceof Date) startDateISO = values.startDate.toISOString();
            else if (typeof values.startDate === 'string') startDateISO = values.startDate;
        }

        const payload: any = {
            itemName: values.itemName,
            warrantyProvider: values.warrantyProvider,
            ...(values.warrantyNumber ? { warrantyNumber: values.warrantyNumber } : {}),
            ...(values.cost ? { cost: parseFloat(values.cost) } : {}),
            ...(values.billingFrequency ? { billingFrequency: values.billingFrequency } : {}),
            expiration: expirationISO,
            startDate: startDateISO,
            notes: values.notes,
            website: values.website,
            uploadAttachments: docIds.length > 0 ? docIds : [],
            realEstateId:
                values.realEstateId ||
                realEstateId ||
                (warranty as any)?.realestateid ||
                add_real_state_overview_data?.id ||
                null,
        };

        if (isBusinessRole()) {
            payload.businessId = selectedBusinessId;
        }

        if (isEdit && warranty?.id) {
            dispatch(updateRealStateWarrantiesAsync({ id: warranty.id, data: payload } as any));
        } else {
            dispatch(addRealStateWarrantiesAsync({ warranties: [{ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }] } as any));
        }
    };

    const handleSkip = (): void => {
        navigation.navigate('AddPersonalPropertyAtAddress', { realEstateId: realEstateId });
    };


    // prefill when editing
    useEffect(() => {
        if (warranty && formikRef.current) {
            // reuse initialValues mapping so casing mismatches are handled
            const uploadUrl = (warranty as any).uploadattachments ||
                (warranty as any).uploadAttachments;
            if (uploadUrl) {
                const existing = Array.isArray(uploadUrl) ? uploadUrl : [uploadUrl as string];
                setDocIds(existing);
            }
            formikRef.current.setValues({
                ...initialValues,
                uploadAttachments: '',
                realEstateId: realEstateId,
            });
        }
    }, [warranty, realEstateId, add_real_state_overview_data]);

    useEffect(() => {
        if (
            add_real_state_warranties_status === ASYNC_STATUS.SUCCEEDED ||
            update_real_state_warranties_status === ASYNC_STATUS.SUCCEEDED
        ) {
            if (add_real_state_warranties_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddRealStateWarrantiesStatus());
            }
            if (update_real_state_warranties_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateRealStateWarrantiesStatus());
            }

            if (isEdit || fromRealEstate || addNew) {
                navigation.goBack();
            } else {
                navigation.navigate('AddPersonalPropertyAtAddress', { realEstateId: realEstateId });
            }
            setDocIds([]);
        }
    }, [
        add_real_state_warranties_status,
        update_real_state_warranties_status,
    ]);

    return (

        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <AuthHeader
                    title={isEdit ? t('real_estate.edit_warranties') : t('real_estate.your_property')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                    backButtonStyle={styles.backButton}
                    titleStyle={[styles.headerTitle, { marginTop: 20, }]}
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
                    <Text style={styles.activeTabText}>
                        {t('real_estate.warranties')}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: isKeyboardVisible ? keyboardHeight - 30 : 20 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* no list needed for single warranty */}
                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validationSchema={validationSchema('real_state_warranty')}
                    onSubmit={handleSubmitData}
                    validateOnChange={true}
                    validateOnBlur={true}
                >
                    {({ handleChange, handleBlur, handleSubmit, setFieldValue, setFieldTouched, validateForm, values, errors, touched }) => (
                        <View style={styles.formContainer}>
                            {/* Item Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {t('real_estate.item_name')} *
                                </Text>
                                <CustomInput
                                    placeholder={t('real_estate.item_name_warranty_placeholder')}
                                    value={values.itemName}
                                    onChangeText={handleChange('itemName')}
                                    onBlur={handleBlur('itemName')}
                                    containerStyle={styles.inputContainer}
                                    error={touched.itemName && errors.itemName ? String(errors.itemName) : undefined}
                                />

                            </View>

                            {/* Warranty Provider */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {t('real_estate.warranty_provider')} *
                                </Text>
                                <VendorAutocompleteInput
                                    category="warranty_provider_real_estate"
                                    placeholder={t('real_estate.warranty_provider_placeholder')}
                                    value={values.warrantyProvider}
                                    onChangeText={handleChange('warrantyProvider')}
                                    onBlur={handleBlur('warrantyProvider')}
                                    containerStyle={styles.inputContainer}
                                    error={touched.warrantyProvider && errors.warrantyProvider ? String(errors.warrantyProvider) : undefined}
                                />

                            </View>

                            {/* Warranty Number & Cost */}
                            <View style={styles.datesRow}>
                                {/* Warranty Number */}
                                <View style={styles.dateColumn}>
                                    <Text style={styles.label}>
                                        {t('warranties.warranty_number') || 'Warranty #'}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('warranties.warranty_number') || 'Warranty #'}
                                        value={values.warrantyNumber}
                                        onChangeText={handleChange('warrantyNumber')}
                                        onBlur={handleBlur('warrantyNumber')}
                                        containerStyle={{ marginBottom: 0 }}
                                    />
                                </View>

                                {/* Cost */}
                                <View style={styles.dateColumn}>
                                    <Text style={styles.label}>
                                        {t('real_estate.cost')}
                                    </Text>
                                    <CustomInput
                                        placeholder="0.00"
                                        value={values.cost}
                                        onChangeText={handleChange('cost')}
                                        onBlur={handleBlur('cost')}
                                        keyboardType="decimal-pad"
                                        containerStyle={{ marginBottom: 0 }}
                                    />
                                </View>
                            </View>

                            {/* Billing frequency of the cost (as on the website) */}
                            <BillingFrequencyField
                              value={values.billingFrequency}
                              onChange={(v) => setFieldValue('billingFrequency', v)}
                            />

                            {/* Dates Row */}
                            <View style={styles.datesRow}>
                                {/* Start Date */}
                                <View style={styles.dateColumn}>
                                    <Text style={styles.label}>
                                        {t('real_estate.start_date')}
                                    </Text>
                                    <CustomDateTimePicker
                                        placeholder={t('real_estate.select')}
                                        value={values.startDate}
                                        onChange={(val: any) => {
                                            setFieldValue('startDate', val).then(() => {
                                                setFieldTouched('expiration', true, false);
                                                validateForm();
                                            });
                                        }}
                                        mode="date"
                                        displayFormat="MM/DD/YYYY"
                                        suffixIcon={
                                            <Feather name="calendar" size={20} color={colors.gray} />
                                        }
                                    />
                                    {touched.startDate && errors.startDate && (
                                        <Text style={styles.errorText}>{String(errors.startDate)}</Text>
                                    )}
                                </View>

                                {/* Expiration */}
                                <View style={styles.dateColumn}>
                                    <Text style={styles.label}>
                                        {t('real_estate.expiration')}
                                    </Text>
                                    <CustomDateTimePicker
                                        placeholder={t('real_estate.select')}
                                        value={values.expiration}
                                        onChange={(val: any) => {
                                            setFieldValue('expiration', val);
                                            setFieldTouched('expiration', true);
                                        }}
                                        mode="date"
                                        displayFormat="MM/DD/YYYY"
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
                                <Text style={styles.label}>
                                    {t('real_estate.notes')}
                                </Text>
                                <CustomInput
                                    placeholder={t('real_estate.notes')}
                                    value={values.notes}
                                    onChangeText={handleChange('notes')}
                                    onBlur={handleBlur('notes')}
                                    containerStyle={styles.inputContainer}
                                    inputContainerStyle={styles.notesInput}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    inputStyle={styles.notesInput}
                                />
                            </View>

                            {/* Website (optional) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {t('real_estate.website_optional')}
                                </Text>
                                <CustomInput
                                    placeholder={t('common.website_placeholder')}
                                    value={values.website}
                                    onChangeText={handleChange('website')}
                                    onBlur={handleBlur('website')}
                                    containerStyle={styles.inputContainer}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    error={touched.website && errors.website ? String(errors.website) : undefined}
                                />

                            </View>

                            {/* Upload Attachments */}
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

                            {/* Submit and continue */}
                            <OfflineChainGuard isWizardMode={!isEdit && !addNew}>
                                <PrimaryButton
                                    title={isEdit ? t('common.update') : addNew ? t('common.add') : t('common.continue')}
                                    onPress={handleSubmit}
                                    buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                                    loading={isLoading}
                                />
                            </OfflineChainGuard>
                        </View>

                    )}
                </Formik>
            </ScrollView>
        </SafeAreaView>

    );
};

export default AddWarranties;
