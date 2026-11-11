import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    TextInput,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeAddVehicleWarrantyStyles } from './AddVehicleWarranty.styles';

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
import BillingFrequencyField from '../../../../../../components/common/BillingFrequencyField';
import Feather from 'react-native-vector-icons/Feather';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { WarrantyPayload } from './AddVehicleWarranty.types';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { useDispatch, useSelector } from 'react-redux';
import { addWarrantyAsync, updateWarrantyAsync } from '../../../../../../redux/services/liabilitiesService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { setAddWarrantyStatus, setUpdateWarrantyStatus } from '../../../../../../redux/slices/liabilitiesSlice';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

interface RouteParams {
    vehicleId?: string | number;
    editWarranty?: any;
    addNew?: boolean;
}

const AddVehicleWarranty = (): React.ReactElement => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeCommonStyles(themeColors as RoleTheme),
            ...makeAddVehicleWarrantyStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness()
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
    const { add_warranty_status, update_warranty_status } = useSelector((state: any) => state.liabilities_slice);

    // Get vehicleId and editWarranty from route params
    const { vehicleId, editWarranty, addNew } = (route?.params as RouteParams) || {};
    const ownerUserId = (route?.params as any)?.ownerUserId;

    // Formik ref and initial values
    const formikRef = React.useRef<any>(null);

    const formikInitialValues = {
        itemName: '',
        warrantyProvider: '',
        expiration: null,
        startDate: null,
        notes: '',
        website: '',
        warrantyNumber: '',
        cost: '',
        billingFrequency: '',
        uploadAttachments: null as any,
    };

    // State for attachment
    const [docIds, setDocIds] = useState<string[]>(() => {
        const existing = editWarranty?.uploadattachments;
        return Array.isArray(existing) ? existing : existing ? [existing as string] : [];
    });

    const isLoading = add_warranty_status === ASYNC_STATUS.LOADING || update_warranty_status === ASYNC_STATUS.LOADING;

    // Prefill form when editing from modal
    useEffect(() => {
        if (editWarranty) {
            formikRef.current?.setValues({
                itemName: editWarranty.itemname || '',
                warrantyProvider: editWarranty.warrantyprovider || '',
                expiration: editWarranty.expiration || null,
                startDate: editWarranty.startdate || null,
                notes: editWarranty.notes || '',
                website: editWarranty.website || '',
                warrantyNumber: editWarranty.warrantynumber || editWarranty.warrantyNumber || '',
                cost: editWarranty.cost !== undefined && editWarranty.cost !== null ? String(editWarranty.cost) : '',
                billingFrequency: (editWarranty as any)?.billingfrequency || (editWarranty as any)?.billingFrequency || '',
                uploadAttachments: '',
            });
        }
    }, [editWarranty]);

    // Reset statuses on mount to prevent stale SUCCEEDED
    useEffect(() => {
        dispatch(setAddWarrantyStatus());
        dispatch(setUpdateWarrantyStatus());
    }, []);

    // Handle success navigation
    useEffect(() => {
        if (editWarranty) {
            if (update_warranty_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateWarrantyStatus());
                navigation.goBack();
            }
        } else {
            if (add_warranty_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddWarrantyStatus());
                formikRef.current?.resetForm();
                setDocIds([]);
                addNew ? navigation.goBack() :
                    (navigation as any).navigate('AddServiceRecords', { vehicleId });
            }
        }
    }, [add_warranty_status, update_warranty_status, navigation, vehicleId, addNew, editWarranty]);


    const handleAddVehicle = (values: any): void => {
        if (!vehicleId) {
            // Skip if no warranties
            navigation.navigate('AddServiceRecords' as never);
            return;
        }

        // Convert warranties to API format
        const warrantiesPayload: WarrantyPayload = {
            itemName: values.itemName ?? '',
            warrantyProvider: values.warrantyProvider ?? '',
            expiration: values.expiration || null,
            startDate: values.startDate ?? '',
            notes: values.notes ?? '',
            website: values.website ?? '',
            ...(values.warrantyNumber ? { warrantyNumber: values.warrantyNumber } : {}),
            ...(values.cost ? { cost: parseFloat(values.cost) } : {}),
            ...(values.billingFrequency ? { billingFrequency: values.billingFrequency } : {}),
            uploadAttachments: docIds.length > 0 ? docIds : [],
            vehicleId: parseInt(vehicleId as string),
        };

        if (isBusinessRole()) {
            warrantiesPayload.businessId = selectedBusinessId;
        }

        if (editWarranty) {
            dispatch(updateWarrantyAsync({
                id: editWarranty.id,
                data: warrantiesPayload,
            }));
        } else {
            dispatch(addWarrantyAsync({ ...warrantiesPayload, ...(ownerUserId ? { ownerUserId } : {}) }));
        }
    };

    const handleSkip = (): void => {
        // Navigate to Service Records
        navigation.navigate('AddServiceRecords', { vehicleId });
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
                    {!editWarranty && !addNew && (
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
                            {t('vehicles.warranty_tab')}
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
                            validationSchema={validationSchema('vehicle_warranty')}
                            validateOnChange={true}
                            validateOnBlur={true}
                            enableReinitialize={true}
                        >
                            {({ values, handleChange, handleSubmit, setFieldValue, touched, errors, handleBlur, setFieldTouched, validateForm }) => (
                                <View style={styles.formContainer}>
                                    {/* Item name */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.item_name')} *
                                        </Text>
                                        <CustomInput
                                            placeholder="(e.g., Home, iPhone, Camera)"
                                            value={values.itemName}
                                            onChangeText={handleChange('itemName')}
                                            onBlur={handleBlur('itemName')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.itemName && errors.itemName ? String(errors.itemName) : undefined}
                                        />
                                    </View>

                                    {/* Warranty provider */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.warranty_provider')} *
                                        </Text>
                                        <VendorAutocompleteInput
                                            category="warranty_provider_vehicle"
                                            placeholder={t('common.eg_applecare')}
                                            value={values.warrantyProvider}
                                            onChangeText={handleChange('warrantyProvider')}
                                            onBlur={handleBlur('warrantyProvider')}
                                            containerStyle={styles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.warrantyProvider && errors.warrantyProvider ? String(errors.warrantyProvider) : undefined}
                                        />
                                    </View>

                                    {/* Warranty Number & Cost */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('warranties.warranty_number') || 'Warranty #'}
                                            </Text>
                                            <CustomInput
                                                placeholder={t('warranties.warranty_number') || 'Warranty #'}
                                                value={values.warrantyNumber}
                                                onChangeText={handleChange('warrantyNumber')}
                                                onBlur={handleBlur('warrantyNumber')}
                                                containerStyle={{ marginBottom: 0 }}
                                                inputStyle={{ textAlign: 'left' }}
                                            />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={[styles.label, { textAlign: 'left' }]}>
                                                {t('real_estate.cost')}
                                            </Text>
                                            <CustomInput
                                                placeholder="0.00"
                                                value={values.cost}
                                                onChangeText={handleChange('cost')}
                                                onBlur={handleBlur('cost')}
                                                containerStyle={{ marginBottom: 0 }}
                                                keyboardType="decimal-pad"
                                                inputStyle={{ textAlign: 'left' }}
                                            />
                                        </View>
                                    </View>

                                    {/* Billing frequency of the cost (as on the website) */}
                                    <BillingFrequencyField
                                      value={values.billingFrequency}
                                      onChange={(v) => setFieldValue('billingFrequency', v)}
                                    />

                                    {/* Start Date */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.start_date')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
                                            value={values.startDate}
                                            onChange={(selectedDate: any) => {
                                                setFieldValue('startDate', selectedDate).then(() => {
                                                    setFieldTouched('expiration', true, false);
                                                    validateForm();
                                                });
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

                                    {/* Expiration */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.expiration')}
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
                                            value={values.expiration}
                                            onChange={(selectedDate: any) => {
                                                setFieldValue('expiration', selectedDate).then(() => {
                                                    setFieldTouched('expiration', true, false);
                                                    validateForm();
                                                });
                                            }}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            labelStyle={{ textAlign: 'left' }}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                            clearable
                                            error={touched.expiration && errors.expiration ? String(errors.expiration) : undefined}
                                        />
                                    </View>

                                    {/* Notes */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.notes')}
                                        </Text>
                                        <TextInput
                                            placeholder={t('common.notes')}
                                            placeholderTextColor={colors.gray}
                                            value={values.notes}
                                            onChangeText={handleChange('notes')}
                                            onBlur={handleBlur('notes')}
                                            multiline={true}
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            style={{
                                                borderWidth: 1,
                                                borderColor: themeColors.border,
                                                borderRadius: 8,
                                                backgroundColor: themeColors.surface,
                                                paddingHorizontal: 14,
                                                paddingVertical: 12,
                                                minHeight: 100,
                                                fontSize: 14,
                                                color: themeColors.textPrimary,
                                                textAlign: 'left',
                                            }}
                                        />
                                    </View>

                                    {/* Website (optional) */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('vehicles.website_optional')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('common.website_placeholder')}
                                            value={values.website}
                                            onChangeText={handleChange('website')}
                                            onBlur={handleBlur('website')}
                                            containerStyle={styles.inputContainer}
                                            keyboardType="url"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.website && errors.website ? String(errors.website) : undefined}
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

                                    {/* Add Vehicle Button */}
                                    <OfflineChainGuard isWizardMode={!editWarranty && !addNew}>
                                        <PrimaryButton
                                            title={`${editWarranty ? t('common.update') : t('common.add')} ${t('personal_property.warranty')}`}
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

export default AddVehicleWarranty;


