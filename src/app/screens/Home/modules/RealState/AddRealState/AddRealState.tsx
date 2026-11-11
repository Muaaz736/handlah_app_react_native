import {
    ScrollView,
    Text,
    View,
    Keyboard,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesEncryptRow } from '../../../../../../components/notes/RecordNotesField';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    CustomInput,
    PrimaryButton,
    CustomDropDown,
    CustomDateTimePicker,
    DocumentPicker,
    ImageUploader,
    showInfoToast,
    MixedMediaUploader,
} from '../../../../../../components/common';

import { makeAddRealStateStyles } from './AddRealState.styles';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../../../../utils/colors';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import FONTS from '../../../../../../utils/fonts';
import Feather from 'react-native-vector-icons/Feather';
import { isIOS, findDefaultCountry } from '../../../../../../utils/helpers';
import {
    AddRealEstateScreenProps,
    RealStateFormValues,
} from './addRealstate.types';
import { Formik, FormikProps } from 'formik'
import { useDispatch, useSelector } from 'react-redux';
import { addRealStateOverviewAsync, updateRealStateOverviewAsync, } from '../../../../../../redux/services/assetsService';
import { setAddRealStateOverviewStatus, setUpdateRealStateOverviewStatus } from '../../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import validationSchema from '../../../../../../utils/validationSchemas';
import { propertyTypes } from '../../../../../../utils/staticData';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { RealEstateProperty } from '../realstate.types';
import { getDropdownOptionsAsync, countriesAsync, statesAsync } from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { makeSharedStyles } from '../RealState.styles';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

interface RouteParams {
    property?: RealEstateProperty;
    isEdit?: boolean;
}

const AddRealEstate: React.FC<AddRealEstateScreenProps> = () => {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { property, isEdit, ownerUserId, from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } = (route.params as any) || {};

    const [attachmentIds, setAttachmentIds] = useState<string[]>(() => {
        if (isEdit && property?.attachmenturl) {
            return Array.isArray(property.attachmenturl)
                ? property.attachmenturl
                : [property.attachmenturl as string];
        }
        return [];
    });
    const [documentIds, setDocumentIds] = useState<string[]>(() => {
        if (isEdit && property?.documenturl) {
            return Array.isArray(property.documenturl)
                ? property.documenturl
                : [property.documenturl as string];
        }
        return [];
    });

    const formikRef = useRef<FormikProps<RealStateFormValues> | null>(null);
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeAddRealStateStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness();
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.RealEstate,
        recordId: isEdit && property?.id ? Number(property.id) : null,
        businessId: isBusinessRole() ? selectedBusinessId ?? null : null,
        enabled: !ownerUserId && !accessLevel,
    });
    // Notes' "Encrypt notes" choice (the text is saved with the record); saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.RealEstate, recordId: isEdit && property?.id ? Number(property.id) : null, enabled: links.enabled, choiceOnly: true });

    const dispatch = useDispatch<AppDispatch>();
    const { add_real_state_overview_status, update_real_state_overview_status, add_real_state_overview_data } = useSelector((state: any) => state?.assets_slice);

    const isLoading = add_real_state_overview_status === ASYNC_STATUS.LOADING || update_real_state_overview_status === ASYNC_STATUS.LOADING;

    const { get_dropdown_options_data, countries_data, states_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('RealEstatePropertyType'));
    }, [dispatch]));

    // Load countries on mount; if editing an existing property, also load the
    // states for its saved country so the State dropdown can prefill by id.
    useEffect(() => {
        dispatch(countriesAsync());
        const existingCountryId = property?.country?.toString();
        if (existingCountryId) {
            dispatch(statesAsync(existingCountryId as any));
        }
    }, [dispatch]);

    useEffect(() => {
        if (formikRef.current?.values.country) return;
        const usCountry = findDefaultCountry(countries_data);
        if (usCountry) {
            formikRef.current?.setFieldValue('country', usCountry.id.toString());
            formikRef.current?.setFieldValue('state', '');
            dispatch(statesAsync(usCountry.id.toString() as any));
        }
    }, [countries_data, dispatch]);

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



    const initialValues: RealStateFormValues = {
        nickname: property?.nickname || '',
        type: property?.type || '',
        streetAddress: property?.streetaddress || '',
        aptSuite: property?.aptsuite || '',
        city: property?.city || '',
        // state & country hold backend IDs (stateId / countryId) as strings.
        state: property?.state != null && property?.state !== '' ? String(property.state) : '',
        zip: property?.zip || '',
        country: property?.country != null && property?.country !== '' ? String(property.country) : '',
        purchaseDate: property?.purchasedate || null,
        purchasePrice: property?.purchaseprice ? String(property.purchaseprice) : '',
        endSellDate: property?.endselldate || null,
        estCurrentValue: property?.estcurrentvalue ? String(property.estcurrentvalue) : '',
        attachmentUrl: '',
        notes: (property as any)?.notes || '',
    }

    const handleSubmitData = (values: RealStateFormValues) => {
        // Attachments/documents: on edit, only send them when they actually
        // changed. Echoing the stored value when untouched prevents a false
        // "Document URL: Not Set -> Removed" entry in the edit history.
        const normalizeIds = (v: any): string[] =>
            !v ? [] : Array.isArray(v) ? v.map(String) : [String(v)];
        const sameIds = (a: string[], b: string[]): boolean => {
            if (a.length !== b.length) return false;
            const sa = [...a].sort();
            const sb = [...b].sort();
            return sa.every((x, i) => x === sb[i]);
        };
        const attachmentsChanged = !sameIds(attachmentIds, normalizeIds(property?.attachmenturl));
        const documentsChanged = !sameIds(documentIds, normalizeIds(property?.documenturl));

        const payload: RealStateFormValues = {
            ...values,
            // Send state/country as backend ID strings (stateId / countryId).
            state: values.state || null,
            country: values.country || null,
            purchaseDate: values.purchaseDate,
            endSellDate: values.endSellDate,
            purchasePrice: values.purchasePrice !== '' ? Number(values.purchasePrice) : 0,
            estCurrentValue: values.estCurrentValue !== '' ? Number(values.estCurrentValue) : 0,
            attachmentUrl: isEdit
                ? (attachmentsChanged ? attachmentIds : (property?.attachmenturl ?? null))
                : (attachmentIds.length > 0 ? attachmentIds : []),
            documentUrl: isEdit
                ? (documentsChanged ? documentIds : (property?.documenturl ?? null))
                : (documentIds.length > 0 ? documentIds : []),
            notes: values.notes,
        } as any;
        if (isBusinessRole()) {
            payload.businessId = selectedBusinessId;
        }

        if (isEdit) {
            dispatch(updateRealStateOverviewAsync({
                id: property?.id,
                data: payload as any,
            })).then((a: any) => saveLinksAfter(links, a, property?.id, undefined, recordNotes));
        } else {
            dispatch(addRealStateOverviewAsync({ ...payload, ...(ownerUserId ? { ownerUserId } : {}) } as any)).then((a: any) => saveLinksAfter(links, a, undefined, undefined, recordNotes));
        }
    }

    const handleRemoveImage = () => {
        setAttachmentIds([]);
    }

    useEffect(() => {
        if (isEdit) {
            if (update_real_state_overview_status === ASYNC_STATUS.SUCCEEDED) {
                dispatch(setUpdateRealStateOverviewStatus());
                navigation.goBack();
            }
        } else {
            if (add_real_state_overview_status === ASYNC_STATUS.SUCCEEDED) {
                formikRef?.current?.resetForm();
                handleRemoveImage();
                dispatch(setAddRealStateOverviewStatus());

                // When the form was queued offline, the response has no server ID.
                // Skip navigating to child forms — user must come back online first.
                if (add_real_state_overview_data?._offlineQueued) {
                    showInfoToast(
                        t('offline.parent_queued_toast'),
                        t('common.info'),
                    );
                    navigation.goBack();
                }
                if (ownerUserId) {
                    (navigation as any).navigate('RealEstate', { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType });
                } else {
                    navigation.navigate('AddLoanMortgage', { realEstateId: property?.id });
                }
            }
        }
    }, [add_real_state_overview_status, update_real_state_overview_status]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader
                title={t('real_estate.your_property')}
                onBackPress={() => navigation.goBack()}
                containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                backButtonStyle={{ marginBottom: 0 }}
                titleStyle={{
                    marginBottom: 0,
                    marginTop: 20,
                    textAlign: 'left',
                }}
                backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
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
                                        options={get_dropdown_options_data}
                                        value={values.type}
                                        onSelect={(val: any) => setFieldValue('type', val)}
                                        placeholder={t('real_estate.select_type')}
                                        leftIcon={true}
                                        search={true}
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
                                            suffixIcon={<Feather name="calendar" size={20} color={themeColors.textSecondary} />}
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
                                            suffixIcon={<Feather name="calendar" size={20} color={themeColors.textSecondary} />}

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
                                        removable={true}
                                    />
                                </View>

                                {/* Upload Documents */}
                                <View style={styles.inputGroup}>
                                    <MixedMediaUploader
                                        mediaIds={documentIds}
                                        onMediaChange={(ids: any) => setDocumentIds(Array.isArray(ids) ? ids : ids ? [ids] : [])}
                                        label={t('real_estate.upload_documents')}
                                        placeholder={t('real_estate.upload_documents')}
                                        uploadType="box"
                                        maxItems={5}
                                        removable={true}
                                        autoUpload={true}
                                    />
                                </View>

                                {/* Continue Button */}
                                <RecordNotesEncryptRow notes={recordNotes} />
                                <RecordLinksField links={links} />
                                <PrimaryButton
                                    title={isEdit ? t('common.update') : t('common.continue')}
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

export default AddRealEstate;
