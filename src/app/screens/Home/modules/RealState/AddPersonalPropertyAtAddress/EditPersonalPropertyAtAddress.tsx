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
} from '../../../../../../components/common';
import { Formik, FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { getRealStatePersonalPropertyByIdAsync, updateRealStatePersonalPropertyAsync } from '../../../../../../redux/services/assetsService';
import { setUpdateRealStatePersonalPropertyStatus } from '../../../../../../redux/slices/assetsSlice';
import { validationSchema } from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import type { PersonalPropertyFormData, EditPersonalPropertyAtAddressRouteParams, EditPersonalPropertyAtAddressProps, CategoryOption } from './addPersonalProperty.types';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import FONTS from '../../../../../../utils/fonts';
import { isIOS } from '../../../../../../utils/helpers';
import Feather from 'react-native-vector-icons/Feather';

import { makeEditPersonalPropertyAtAddressStyles } from './EditPersonalPropertyAtAddress.styles';
import { AppDispatch } from '../../../../../../types/store.types';

const EditPersonalPropertyAtAddress: React.FC<EditPersonalPropertyAtAddressProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const route = useRoute();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [docIds, setDocIds] = useState<string[]>([]);

    const formikRef = useRef<FormikProps<PersonalPropertyFormData> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditPersonalPropertyAtAddressStyles(themeColors), [themeColors]);

    const { propertyId } = (route?.params as EditPersonalPropertyAtAddressRouteParams) || {};

    const dispatch = useDispatch<AppDispatch>();
    const {
        update_real_state_personal_property_status,
        get_real_state_personal_property_by_id_data,
        get_real_state_personal_property_by_id_status
    } = useSelector((state: any) => state?.assets_slice);

    const isLoading = update_real_state_personal_property_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_real_state_personal_property_by_id_status === ASYNC_STATUS.LOADING;

    const categoryOptions: CategoryOption[] = [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Appliances', value: 'Appliances' },
        { label: 'Jewelry', value: 'Jewelry' },
        { label: 'Art', value: 'Art' },
        { label: 'Other', value: 'Other' },
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

    // Fetch personal property data by ID
    useEffect(() => {
        if (propertyId) {
            dispatch(getRealStatePersonalPropertyByIdAsync(propertyId as any));
        }
    }, [propertyId, dispatch]);

    // Populate form when data is loaded
    useEffect(() => {
        if (get_real_state_personal_property_by_id_data && propertyId) {
            const property = get_real_state_personal_property_by_id_data;
            if (property && formikRef.current) {
                // Parse dates from ISO strings
                let purchaseDateValue = null;
                if (property.purchasedate || property.purchaseDate) {
                    const purchaseDateStr = property.purchasedate || property.purchaseDate;
                    purchaseDateValue = typeof purchaseDateStr === 'string' ? new Date(purchaseDateStr) : purchaseDateStr;
                }

                let dateSoldDiscardedValue = null;
                if (property.datesolddiscarded || property.dateSoldDiscarded) {
                    const soldDateStr = property.datesolddiscarded || property.dateSoldDiscarded;
                    dateSoldDiscardedValue = typeof soldDateStr === 'string' ? new Date(soldDateStr) : soldDateStr;
                }

                // Restore doc IDs for multi-doc picker
                if (property.attachment) {
                    const existing = Array.isArray(property.attachment)
                        ? property.attachment
                        : [property.attachment as string];
                    setDocIds(existing);
                }

                formikRef.current.setValues({
                    name: property.name || '',
                    category: property.category || '',
                    attachment: '',
                    modelSerial: property.modelserial || property.modelSerial || '',
                    purchaseDate: purchaseDateValue,
                    price: property.price !== undefined ? String(property.price) : '',
                    dateSoldDiscarded: dateSoldDiscardedValue,
                    realEstateId: property.realestateid || property.realEstateId || null,
                });
            }
        }
    }, [get_real_state_personal_property_by_id_data, propertyId]);

    const handleRemoveDocument = () => {
        setDocIds([]);
    };

    const initialValues: PersonalPropertyFormData = {
        name: '',
        category: '',
        attachment: '',
        modelSerial: '',
        purchaseDate: null,
        price: '',
        dateSoldDiscarded: null,
        realEstateId: null,
    };

    const handleSubmitData = (values: PersonalPropertyFormData) => {
        // Convert dates to ISO string if they're Date objects, otherwise use as is
        let purchaseDateISO: any = null;
        if (values.purchaseDate) {
            if (values.purchaseDate instanceof Date) {
                purchaseDateISO = values.purchaseDate.toISOString();
            } else if (typeof values.purchaseDate === 'string') {
                purchaseDateISO = values.purchaseDate;
            }
        }

        let dateSoldDiscardedISO: any = null;
        if (values.dateSoldDiscarded) {
            if (values.dateSoldDiscarded instanceof Date) {
                dateSoldDiscardedISO = values.dateSoldDiscarded.toISOString();
            } else if (typeof values.dateSoldDiscarded === 'string') {
                dateSoldDiscardedISO = values.dateSoldDiscarded;
            }
        }

        const payload: any = {
            name: values.name,
            category: values.category,
            attachment: docIds.length > 0 ? docIds : [],
            modelSerial: values.modelSerial,
            purchaseDate: purchaseDateISO,
            price: values.price !== '' ? Number(values.price) : 0,
            dateSoldDiscarded: dateSoldDiscardedISO,
            realEstateId: values.realEstateId,
        };


        dispatch(updateRealStatePersonalPropertyAsync({ id: propertyId, data: payload }));
    };

    useEffect(() => {
        if (update_real_state_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setUpdateRealStatePersonalPropertyStatus());
            navigation.goBack();
        }
    }, [update_real_state_personal_property_status, dispatch, navigation]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('real_estate.edit_personal_property_at_address')}
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
                title={t('real_estate.edit_personal_property_at_address')}
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
                    {t('real_estate.personal_property_at_address')}
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
                        validationSchema={validationSchema('real_state_personal_property')}
                        onSubmit={handleSubmitData}
                        enableReinitialize
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                            <>
                                {/* Item Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.item_name')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.item_name_placeholder')}
                                        value={values.name}
                                        onChangeText={handleChange('name')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.name && errors.name ? String(errors.name) : undefined}
                                    />
                                </View>

                                {/* Category */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.category')} *
                                    </Text>
                                    <CustomDropDown
                                        options={categoryOptions}
                                        value={values.category}
                                        onSelect={(val: any) => setFieldValue('category', val as string)}
                                        placeholder={t('add_personal_property.select_category')}
                                        leftIcon={true}
                                        search={false}
                                    />
                                    {touched.category && errors.category && (
                                        <Text style={styles.errorText}>{String(errors.category)}</Text>
                                    )}
                                </View>

                                {/* Model/Serial */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.model_serial_optional')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.model_serial_placeholder')}
                                        value={values.modelSerial}
                                        onChangeText={handleChange('modelSerial')}
                                        containerStyle={styles.inputContainer}
                                        error={touched.modelSerial && errors.modelSerial ? String(errors.modelSerial) : undefined}
                                    />
                                </View>

                                {/* Purchase Date and Price */}
                                <View style={styles.rowContainer}>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.purchase_date')}
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.purchaseDate}
                                            onChange={(date: string | Date) => setFieldValue('purchaseDate', date)}
                                            placeholder={t('real_estate.select_date')}
                                            displayFormat="MM/DD/YYYY"
                                            containerStyle={styles.inputContainerNoMargin}
                                            suffixIcon={
                                                <Feather name="calendar" size={20} color={colors.gray} />
                                            }
                                        />
                                        {touched.purchaseDate && errors.purchaseDate && (
                                            <Text style={styles.errorText}>{String(errors.purchaseDate)}</Text>
                                        )}
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t('real_estate.price')}
                                        </Text>
                                        <CustomInput
                                            placeholder="0.00"
                                            value={values.price}
                                            onChangeText={handleChange('price')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            error={touched.price && errors.price ? String(errors.price) : undefined}
                                        />
                                    </View>
                                </View>

                                {/* Date Sold/Discarded */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('real_estate.date_sold_discarded_optional')}
                                    </Text>
                                    <CustomDateTimePicker
                                        value={values.dateSoldDiscarded}
                                        onChange={(date: string | Date) => setFieldValue('dateSoldDiscarded', date)}
                                        placeholder={t('real_estate.select_date')}
                                        displayFormat="MM/DD/YYYY"
                                        containerStyle={styles.inputContainer}
                                        suffixIcon={
                                            <Feather name="calendar" size={20} color={colors.gray} />
                                        }
                                    />
                                    {touched.dateSoldDiscarded && errors.dateSoldDiscarded && (
                                        <Text style={styles.errorText}>{String(errors.dateSoldDiscarded)}</Text>
                                    )}
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

export default EditPersonalPropertyAtAddress;
