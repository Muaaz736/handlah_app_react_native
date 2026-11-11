import {
    ScrollView,
    Text,
    View,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDropDown,
    CustomDateTimePicker,
    DocumentPicker,
    ImageUploader,
} from '../../../../../../components/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import FONTS from '../../../../../../utils/fonts';
import Feather from 'react-native-vector-icons/Feather';

import { makeEditRealStateStyles } from './EditRealState.styles';
import { isIOS, findDefaultCountry } from '../../../../../../utils/helpers';
import {
    PropertyTypeOption,
    EditRealEstateScreenProps,
    RealStateFormValues,
} from './addRealstate.types';
import { Formik, FormikProps } from 'formik'
import { useDispatch, useSelector } from 'react-redux';
import { getRealStateOverviewAsync, updateRealStateOverviewAsync } from '../../../../../../redux/services/assetsService';
import { countriesAsync, statesAsync } from '../../../../../../redux/services/authService';
import { setUpdateRealStateOverviewStatus } from '../../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import validationSchema from '../../../../../../utils/validationSchemas';
import { propertyTypes } from '../../../../../../utils/staticData';
import { AppDispatch } from '../../../../../../types/store.types';

const EditRealState: React.FC<EditRealEstateScreenProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const route = useRoute();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
    const [documentIds, setDocumentIds] = useState<string[]>([]);

    const formikRef = useRef<FormikProps<RealStateFormValues> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditRealStateStyles(themeColors), [themeColors]);

    const { propertyId } = route?.params as any || {};

    const dispatch = useDispatch<AppDispatch>();
    const { update_real_state_overview_status, get_real_state_overview_data, get_real_state_overview_status } = useSelector((state: any) => state?.assets_slice);
    const { countries_data, states_data } = useSelector((state: any) => state.user_auth);

    // Load countries for the Country dropdown.
    useEffect(() => {
        dispatch(countriesAsync());
    }, [dispatch]);

    const isLoading = update_real_state_overview_status === ASYNC_STATUS.LOADING;
    const getDataLoading = get_real_state_overview_status === ASYNC_STATUS.LOADING;

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

    // Fetch property data by ID
    useEffect(() => {

        if (propertyId) {
            dispatch(getRealStateOverviewAsync());
        }
    }, [propertyId, dispatch]);

    // Populate form when data is loaded
    useEffect(() => {
        if (get_real_state_overview_data?.realestates && propertyId) {
            const property = get_real_state_overview_data.realestates.find((p: any) => p.id === propertyId);
            if (property && formikRef.current) {
                // Parse dates from ISO strings
                let purchaseDateValue = null;
                if (property.purchasedate) {
                    purchaseDateValue = typeof property.purchasedate === 'string' ? new Date(property.purchasedate) : property.purchasedate;
                }

                let endSellDateValue = null;
                if (property.endselldate) {
                    endSellDateValue = typeof property.endselldate === 'string' ? new Date(property.endselldate) : property.endselldate;
                }

                // Restore photo IDs from existing property
                if (property.attachmenturl) {
                    const existing = Array.isArray(property.attachmenturl)
                        ? property.attachmenturl
                        : [property.attachmenturl as string];
                    setAttachmentIds(existing);
                }

                // Restore document IDs from existing property
                if (property.documenturl) {
                    const existingDocs = Array.isArray(property.documenturl)
                        ? property.documenturl
                        : [property.documenturl as string];
                    setDocumentIds(existingDocs);
                }

                // Load states for the saved country so the State dropdown prefills.
                if (property.country != null && property.country !== '') {
                    dispatch(statesAsync(String(property.country) as any));
                }

                formikRef.current.setValues({
                    nickname: property.nickname || '',
                    type: property.type || '',
                    streetAddress: property.streetaddress || '',
                    aptSuite: property.aptsuite || '',
                    city: property.city || '',
                    // state & country hold backend IDs (stateId / countryId) as strings.
                    state: property.state != null && property.state !== '' ? String(property.state) : '',
                    zip: property.zip || '',
                    country: property.country != null && property.country !== '' ? String(property.country) : '',
                    purchaseDate: purchaseDateValue,
                    purchasePrice: property.purchaseprice !== undefined ? String(property.purchaseprice) : '',
                    endSellDate: endSellDateValue,
                    estCurrentValue: property.estcurrentvalue !== undefined ? String(property.estcurrentvalue) : '',
                    attachmentUrl: '',
                    notes: property.notes || '',
                });
            }
        }
    }, [get_real_state_overview_data, propertyId]);

    useEffect(() => {
        if (get_real_state_overview_status !== ASYNC_STATUS.SUCCEEDED) return;
        if (formikRef.current?.values.country) return;
        const usCountry = findDefaultCountry(countries_data);
        if (usCountry) {
            formikRef.current?.setFieldValue('country', usCountry.id.toString());
            dispatch(statesAsync(usCountry.id.toString() as any));
        }
    }, [countries_data, get_real_state_overview_status, dispatch]);



    const handleRemoveImage = () => {
        setDocumentIds([]);
    };

    const initialValues: RealStateFormValues = {
        nickname: '',
        type: '',
        streetAddress: '',
        aptSuite: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        purchaseDate: null,
        purchasePrice: '',
        endSellDate: null,
        estCurrentValue: '',
        attachmentUrl: '',
        notes: '',
    };

    const handleSubmitData = async (values: RealStateFormValues) => {
        // Convert dates to ISO string if they're Date objects, otherwise use as is
        let purchaseDateISO: any = null;
        if (values.purchaseDate) {
            if (values.purchaseDate instanceof Date) {
                purchaseDateISO = values.purchaseDate.toISOString();
            } else if (typeof values.purchaseDate === 'string') {
                purchaseDateISO = values.purchaseDate;
            }
        }

        let endSellDateISO: any = null;
        if (values.endSellDate) {
            if (values.endSellDate instanceof Date) {
                endSellDateISO = values.endSellDate.toISOString();
            } else if (typeof values.endSellDate === 'string') {
                endSellDateISO = values.endSellDate;
            }
        }

        // Attachments/documents: only send them when they actually changed.
        // Echoing the stored value when untouched prevents a false
        // "Document URL: Not Set -> Removed" entry in the edit history.
        const original = get_real_state_overview_data?.realestates?.find(
            (p: any) => p.id === propertyId,
        );
        const normalizeIds = (v: any): string[] =>
            !v ? [] : Array.isArray(v) ? v.map(String) : [String(v)];
        const sameIds = (a: string[], b: string[]): boolean => {
            if (a.length !== b.length) return false;
            const sa = [...a].sort();
            const sb = [...b].sort();
            return sa.every((x, i) => x === sb[i]);
        };
        const attachmentsChanged = !sameIds(attachmentIds, normalizeIds(original?.attachmenturl));
        const documentsChanged = !sameIds(documentIds, normalizeIds(original?.documenturl));

        // Build a diff payload: only include fields that actually changed so the
        // edit history doesn't log untouched fields as "changes".
        const payload: any = {};

        const addIfChanged = (key: string, newVal: any, origVal: any) => {
            if (String(newVal ?? '') !== String(origVal ?? '')) payload[key] = newVal;
        };

        addIfChanged('nickname', values.nickname, original?.nickname);
        addIfChanged('type', values.type, original?.type);
        addIfChanged('streetAddress', values.streetAddress, original?.streetaddress);
        addIfChanged('aptSuite', values.aptSuite, original?.aptsuite);
        addIfChanged('city', values.city, original?.city);
        addIfChanged('zip', values.zip, original?.zip);
        addIfChanged('notes', values.notes, original?.notes);

        // State / Country are backend ID strings (stateId / countryId).
        const origState = original?.state != null && original?.state !== '' ? String(original.state) : '';
        if ((values.state || '') !== origState) payload.state = values.state || null;
        const origCountry = original?.country != null && original?.country !== '' ? String(original.country) : '';
        if ((values.country || '') !== origCountry) payload.country = values.country || null;

        // Numeric fields.
        const newPurchasePrice = values.purchasePrice !== '' ? Number(values.purchasePrice) : 0;
        const origPurchasePrice = original?.purchaseprice != null ? Number(original.purchaseprice) : 0;
        if (newPurchasePrice !== origPurchasePrice) payload.purchasePrice = newPurchasePrice;

        const newEstValue = values.estCurrentValue !== '' ? Number(values.estCurrentValue) : 0;
        const origEstValue = original?.estcurrentvalue != null ? Number(original.estcurrentvalue) : 0;
        if (newEstValue !== origEstValue) payload.estCurrentValue = newEstValue;

        // Dates — compare by timestamp so format/precision differences don't count.
        const timeOf = (v: any) => (v ? new Date(v).getTime() : null);
        if (timeOf(purchaseDateISO) !== timeOf(original?.purchasedate)) payload.purchaseDate = purchaseDateISO;
        if (timeOf(endSellDateISO) !== timeOf(original?.endselldate)) payload.endSellDate = endSellDateISO;

        // Attachments / documents — only when changed.
        if (attachmentsChanged) payload.attachmentUrl = attachmentIds;
        if (documentsChanged) payload.documentUrl = documentIds;

        // Nothing changed — skip the update so no empty history entry is created.
        if (Object.keys(payload).length === 0) {
            navigation.goBack();
            return;
        }

        await dispatch(updateRealStateOverviewAsync({ id: propertyId, data: payload }));
    };

    useEffect(() => {
        if (update_real_state_overview_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setUpdateRealStateOverviewStatus());
            navigation.goBack();
        }
    }, [update_real_state_overview_status, dispatch, navigation]);

    if (getDataLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('real_estate.edit_property')}
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
                title={t('real_estate.edit_property')}
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
                    {t('real_estate.overview')}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="interactive"
            >
                {/* Form */}
                <View style={styles.formContainer}>
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema('real_state_overview')}
                        onSubmit={handleSubmitData}
                        enableReinitialize
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                            <>
                                {/* Nickname */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('real_estate.nickname')} *
                                    </Text>
                                    <CustomInput
                                        placeholder={`${t('real_estate.nickname')} *`}
                                        value={values.nickname}
                                        onChangeText={handleChange('nickname')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ borderRadius: 12 }}
                                        error={touched.nickname && errors.nickname}
                                    />
                                </View>

                                {/* Type */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('real_estate.type')} *
                                    </Text>
                                    <CustomDropDown
                                        options={propertyTypes}
                                        value={values.type}
                                        onSelect={(val: any) => setFieldValue('type', val)}
                                        placeholder={t('real_estate.select_type')}
                                        leftIcon={true}
                                        search={false}
                                    />
                                    {touched.type && errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                                </View>

                                {/* Address */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}> {t('real_estate.address')} *</Text>
                                    <CustomInput
                                        placeholder={`${t('real_estate.street_address')} *`}
                                        value={values.streetAddress}
                                        onChangeText={handleChange('streetAddress')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ borderRadius: 12 }}
                                        error={touched.streetAddress && errors.streetAddress}
                                    />
                                </View>

                                {/* Apt/Suite and City */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <CustomInput
                                        placeholder={t('real_estate.apt_suite')}
                                        value={values.aptSuite}
                                        onChangeText={handleChange('aptSuite')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ borderRadius: 12 }}
                                        error={touched.aptSuite && errors.aptSuite}
                                    />
                                    <CustomInput
                                        placeholder={`${t('real_estate.city')} *`}
                                        value={values.city}
                                        onChangeText={handleChange('city')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ borderRadius: 12 }}
                                        error={touched.city && errors.city}
                                    />
                                </View>



                                {/* State and Zip */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }]}
                                >
                                    <View style={styles.flexOne}>
                                        <CustomDropDown
                                            options={
                                                states_data?.map((stateItem: any) => ({
                                                    label: stateItem.description,
                                                    value: stateItem.id.toString(),
                                                })) || []
                                            }
                                            value={values.state}
                                            onSelect={(val: any) => setFieldValue('state', val as string)}
                                            placeholder={`${t('real_estate.state')} *`}
                                            search={true}
                                            searchPlaceholder={t('common.search_state')}
                                            maxHeight={300}
                                            leftIcon={true}
                                            error={!!(touched.state && errors.state)}
                                        />
                                    </View>

                                    <CustomInput
                                        placeholder={`${t('real_estate.zip')} *`}
                                        value={values.zip}
                                        onChangeText={handleChange('zip')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ borderRadius: 12 }}
                                        keyboardType="default"
                                        error={touched.zip && errors.zip}
                                    />
                                </View>
                                {/* Country (above State so its states can cascade) */}
                                <View style={styles.inputGroup}>
                                    <CustomDropDown
                                        options={
                                            countries_data?.map((country: any) => ({
                                                label: country.countryname,
                                                value: country.id.toString(),
                                            })) || []
                                        }
                                        value={values.country}
                                        onSelect={(val: any) => {
                                            setFieldValue('country', val as string);
                                            setFieldValue('state', ''); // reset state on country change
                                            if (val) dispatch(statesAsync(val));
                                        }}
                                        placeholder={`${t('real_estate.country')} *`}
                                        search={true}
                                        searchPlaceholder={t('common.search_country')}
                                        maxHeight={300}
                                        leftIcon={true}
                                        error={!!(touched.country && errors.country)}
                                    />
                                </View>
                                {/* Purchase Date and Price */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.flexOne}>
                                        <CustomDateTimePicker
                                            label={t('real_estate.purchase_date')}
                                            placeholder={t('real_estate.select')}
                                            value={values.purchaseDate}
                                            onChange={(val: any) => setFieldValue('purchaseDate', val as Date)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            labelStyle={{ textAlign: 'left' }}
                                            containerStyle={{ flex: 1, width: 'auto' }}
                                            inputContainerStyle={{ borderRadius: 12 }}
                                            suffixIcon={<Feather name="calendar" size={20} color={colors.black} />}
                                        />
                                        {touched.purchaseDate && errors.purchaseDate && <Text style={styles.errorText}>{errors.purchaseDate}</Text>}
                                    </View>
                                    <View style={styles.flexOne}>
                                        <CustomInput
                                            label={t('real_estate.purchase_price')}
                                            placeholder="$0.00"
                                            value={values.purchasePrice as string}
                                            onChangeText={handleChange('purchasePrice')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            inputContainerStyle={{ borderRadius: 12, flex: 1 }}
                                            keyboardType="numeric"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.purchasePrice && errors.purchasePrice}
                                        />
                                    </View>
                                </View>

                                {/* End/Sell Date and Current Value */}
                                <View style={[styles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={styles.flexOne}>
                                        <CustomDateTimePicker
                                            label={t('real_estate.end_sell_date')}
                                            placeholder={t('real_estate.select')}
                                            value={values.endSellDate}
                                            onChange={(val: any) => setFieldValue('endSellDate', val as Date)}
                                            mode="date"
                                            displayFormat="MM/DD/YYYY"
                                            labelStyle={{ textAlign: 'left' }}
                                            containerStyle={{ flex: 1, width: 'auto' }}
                                            inputContainerStyle={{ borderRadius: 12 }}
                                            suffixIcon={<Feather name="calendar" size={20} color={colors.black} />}
                                        />
                                        {touched.endSellDate && errors.endSellDate && <Text style={styles.errorText}>{errors.endSellDate}</Text>}
                                    </View>
                                    <View style={styles.flexOne}>
                                        <CustomInput
                                            label={t('real_estate.est_current_value')}
                                            placeholder="$0.00"
                                            value={values.estCurrentValue as string}
                                            onChangeText={handleChange('estCurrentValue')}
                                            containerStyle={styles.inputContainerNoMargin}
                                            keyboardType="numeric"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={touched.estCurrentValue && errors.estCurrentValue}
                                        />
                                    </View>
                                </View>

                                {/* Notes */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { textAlign: 'left' }]}>
                                        {t('real_estate.notes')}
                                    </Text>
                                    <CustomInput
                                        placeholder={t('real_estate.notes')}
                                        value={values.notes || ''}
                                        onChangeText={handleChange('notes')}
                                        containerStyle={styles.inputContainer}
                                        inputContainerStyle={{ height: 100, alignItems: 'flex-start', paddingTop: 8 }}
                                        multiline={true}
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>

                                {/* Upload Photo */}
                                <View style={styles.inputGroup}>
                                    <ImageUploader
                                        label={t('real_estate.upload_property_photo')}
                                        labelStyle={{ textAlign: 'left' }}
                                        multiple={true}
                                        imageIds={attachmentIds}
                                        onImageSelect={() => { }}
                                        onImageUploaded={(ids: any) => setAttachmentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                                        uploadType="box"
                                        placeholder={t('real_estate.upload_property_photo')}
                                        iconType="ionicons"
                                        iconName="image-outline"
                                        iconSize={24}
                                        iconColor={colors.gray}
                                        autoUpload={true}
                                        containerStyle={{ marginBottom: 0 }}
                                    />
                                </View>

                                {/* Upload Documents */}
                                <View style={styles.inputGroup}>
                                    <DocumentPicker
                                        label={t('real_estate.upload_documents')}
                                        labelStyle={{ textAlign: 'left' }}
                                        multiple={true}
                                        documentIds={documentIds}
                                        onDocumentIdsChange={(ids: string[]) => setDocumentIds(ids)}
                                        uploadType="box"
                                        placeholder={t('real_estate.upload_documents')}
                                        iconType="ionicons"
                                        iconName="document-outline"
                                        iconSize={24}
                                        autoUpload={true}
                                        containerStyle={{ marginBottom: 0 }}
                                    />
                                </View>

                                {/* Save Button */}
                                <PrimaryButton
                                    title={t('common.save_changes')}
                                    onPress={() => handleSubmit()}
                                    buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                                    loading={isLoading}
                                    disabled={isLoading}
                                />
                            </>
                        )}
                    </Formik>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditRealState;
