import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Keyboard,
} from 'react-native';
import React, { useState, useRef, useEffect, FC, useMemo } from 'react';
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
} from '../../../../../../components/common';

import { makeAddPersonalPropertyAtAddressStyles } from './AddPersonalPropertyAtAddress.styles';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { addRealStatePersonalPropertyAsync, updateRealStatePersonalPropertyAsync } from '../../../../../../redux/services/assetsService';
import { setAddRealStatePersonalPropertyStatus, setUpdateRealStatePersonalPropertyStatus } from '../../../../../../redux/slices/assetsSlice';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';

import type {
    CategoryOption,
    PersonalPropertyFormData,
    AddPersonalPropertyRouteParams,
    AddPersonalPropertyProps,
} from './addPersonalProperty.types';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeSharedStyles } from '../RealState.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';


const AddPersonalPropertyAtAddress: FC<AddPersonalPropertyProps> = ({ route }) => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const routeParams = (route?.params as AddPersonalPropertyRouteParams) || {};
    const { property, isEdit = false, addNew = false, realEstateId } = routeParams;
    const ownerUserId = (route?.params as any)?.ownerUserId;
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeAddPersonalPropertyAtAddressStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness();
    const isRTL = i18n.language === 'ar';
    const formikRef = useRef<any>(null);
    const dispatch = useDispatch<AppDispatch>();

    // single item allowed now
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const { add_real_state_personal_property_status, update_real_state_personal_property_status, add_real_state_overview_data } = useSelector((state: any) => state?.assets_slice);


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
        add_real_state_personal_property_status === ASYNC_STATUS.LOADING ||
        update_real_state_personal_property_status === ASYNC_STATUS.LOADING;

    const categoryOptions: CategoryOption[] = [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Appliances', value: 'Appliances' },
        { label: 'Jewelry', value: 'Jewelry' },
        { label: 'Art', value: 'Art' },
        { label: 'Other', value: 'Other' },
    ];

    const initialValues: PersonalPropertyFormData = {
        name: property?.name ?? (property as any)?.name ?? '',
        category: property?.category ?? (property as any)?.category ?? '',
        attachment:
            property?.attachment ?? (property as any)?.attachment ?? '',
        modelSerial:
            property?.modelSerial ?? (property as any)?.modelserial ?? '',
        purchaseDate:
            property?.purchaseDate || (property as any)?.purchasedate || null,
        price:
            property?.price !== undefined
                ? String(property.price)
                : (property as any)?.price
                    ? String((property as any).price)
                    : '',
        dateSoldDiscarded:
            property?.dateSoldDiscarded || (property as any)?.datesolddiscarded || null,
        realEstateId:
            realEstateId ??
            (property as any)?.realestateid ??
            add_real_state_overview_data?.id ??
            null,
    };

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const handleSubmitData = (values: PersonalPropertyFormData) => {
        let purchaseDateISO: any = null;
        if (values.purchaseDate) {
            if (values.purchaseDate instanceof Date) purchaseDateISO = values.purchaseDate.toISOString();
            else if (typeof values.purchaseDate === 'string') purchaseDateISO = values.purchaseDate;
        }
        let dateSoldDiscardedISO: any = null;
        if (values.dateSoldDiscarded) {
            if (values.dateSoldDiscarded instanceof Date) dateSoldDiscardedISO = values.dateSoldDiscarded.toISOString();
            else if (typeof values.dateSoldDiscarded === 'string') dateSoldDiscardedISO = values.dateSoldDiscarded;
        }

        const payload: any = {
            name: values.name,
            category: values.category,
            attachment: docIds.length > 0 ? docIds : [],
            modelSerial: values.modelSerial,
            purchaseDate: purchaseDateISO,
            price: values.price !== '' ? values.price : '0',
            dateSoldDiscarded: dateSoldDiscardedISO,
            realEstateId:
                values.realEstateId ||
                realEstateId ||
                (property as any)?.realestateid ||
                add_real_state_overview_data?.id ||
                null,
        };

        if (isBusinessRole()) {
            payload.businessId = selectedBusinessId;
        }

        if (isEdit && property?.id) {
            dispatch(updateRealStatePersonalPropertyAsync({ id: property.id, data: payload } as any));
        } else {
            dispatch(addRealStatePersonalPropertyAsync({ properties: [{ ...payload, ...(ownerUserId ? { ownerUserId } : {}) }] } as any));
        }
    };

    const handleSkip = (): void => {
        navigation.navigate('AddServicesWorkHistory', { realEstateId: realEstateId });
    };


    useEffect(() => {
        if (property && formikRef.current) {
            const uploadUrl = (property as any).attachment || property.attachment;
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
    }, [property, add_real_state_overview_data, realEstateId]);

    useEffect(() => {
        if (
            add_real_state_personal_property_status === ASYNC_STATUS.SUCCEEDED ||
            update_real_state_personal_property_status === ASYNC_STATUS.SUCCEEDED
        ) {
            if (add_real_state_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setAddRealStatePersonalPropertyStatus());
            }
            if (update_real_state_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateRealStatePersonalPropertyStatus());
            }

            if (isEdit || addNew) {
                navigation.goBack();
            } else {
                navigation.navigate('AddServicesWorkHistory', { realEstateId: realEstateId });
            }
            setDocIds([]);
        }
    }, [
        add_real_state_personal_property_status,
        update_real_state_personal_property_status,
    ]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <AuthHeader
                    title={isEdit ? t('real_estate.edit_personal_property_at_address') : t('real_estate.your_property')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{
                        marginBottom: 0,
                        marginTop: 10,
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
                        {t('real_estate.personal_property_at_address')}
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
            >

                {/* Form */}
                <View style={styles.formContainer}>
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        enableReinitialize={true}
                        validationSchema={validationSchema('real_state_personal_property')}
                        onSubmit={handleSubmitData}
                    >
                        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                            <>
                                {/* Item Name and Category */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.item_name')} *
                                        </Text>
                                        <CustomInput
                                            placeholder={t('common.item_name_required')}
                                            value={values.name}
                                            onChangeText={handleChange('name')}
                                            onBlur={handleBlur('name')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.name && errors.name ? String(errors.name) : undefined}
                                        />

                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.category')} *
                                        </Text>
                                        <CustomDropDown
                                            options={categoryOptions}
                                            value={values.category}
                                            onSelect={(val: any) => setFieldValue('category', val as string)}
                                            placeholder={t('real_estate.select')}
                                            search={false}
                                            leftIcon={true}
                                        />
                                        {touched.category && errors.category && (
                                            <Text style={styles.errorText}>{String(errors.category)}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Model/Serial # (optional) */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('real_estate.model_serial_optional')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('common.serial_hash')}
                                        value={values.modelSerial}
                                        onChangeText={handleChange('modelSerial')}
                                        onBlur={handleBlur('modelSerial')}
                                        containerStyle={styles.inputContainer}
                                    />
                                </View>

                                {/* Purchase/Own Date and Price */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.purchase_own_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            placeholder={t('real_estate.select')}
                                            value={values.purchaseDate}
                                            onChange={(val: any) => setFieldValue('purchaseDate', val)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            labelStyle={{ textAlign: 'left' }}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>
                                            {t('real_estate.price')}
                                        </Text>
                                        <CustomInput
                                            placeholder={t('common.price_dollar')}
                                            value={values.price}
                                            onChangeText={handleChange('price')}
                                            onBlur={handleBlur('price')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                </View>

                                {/* End/Sell Date */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('real_estate.end_sell_date')}
                                    </Text>
                                    <CustomDateTimePicker
                                        placeholder={t('real_estate.select')}
                                        value={values.dateSoldDiscarded}
                                        onChange={(val: any) => setFieldValue('dateSoldDiscarded', val)}
                                        mode="date"
                                        displayFormat="MM/DD/YYYY"
                                        labelStyle={{ textAlign: 'left' }}
                                        suffixIcon={
                                            <Feather name="calendar" size={20} color={colors.gray} />
                                        }
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

                                {/* Submit + continue */}
                                <OfflineChainGuard isWizardMode={!isEdit && !addNew}>
                                    <PrimaryButton
                                        title={isEdit ? t('common.update') : addNew ? t('common.add') : t('common.continue')}
                                        onPress={handleSubmit}
                                        buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                                        loading={isLoading}
                                    />
                                </OfflineChainGuard>
                            </>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddPersonalPropertyAtAddress;
