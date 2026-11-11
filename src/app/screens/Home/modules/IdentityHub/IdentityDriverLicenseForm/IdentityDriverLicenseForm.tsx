import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Switch,
    Modal,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTutorialContext } from '../../../../../../tutorial/TutorialContext';
import { makeTutorialHintStyles } from '../IdentityPassportForm/IdentityPassportForm.styles';
import ScreenWrapper from '../../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, PrimaryButton, MixedMediaUploader, CustomInput, CustomDateTimePicker, CustomDropDown, CustomReminderPicker } from '../../../../../../components/common';
import colors from '../../../../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useDispatch, useSelector } from 'react-redux';
import { updateDriverLicenseAsync, driverLicenseAsync, identityHubAsync, getDropdownOptionsAsync, countriesAsync, statesAsync } from '../../../../../../redux/services/authService';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { IdentityDriverLicenseRouteParams } from './IdentityDriverLicenseForm.types';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../IdentityHub.styles';
import { makeIdentityDriverLicenseFormStyles } from './IdentityDriverLicenseForm.styles';
import { findDefaultCountry } from '../../../../../../utils/helpers';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

interface DriversLicenseFormValues {
    licenseNumber: string;
    state: string;
    expirationDate: string | Date;
    classType: string;
    country: string;
    remindBefore: string;
    licenseMediaIds: string[];
    isAddedInWallet: boolean;
}

const driverLicenseCountryKey = (id: number | string) => `driver_license_country_${id}`;

const IdentityDriverLicenseForm = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const tutorialHintStyles = useMemo(() => makeTutorialHintStyles(themeColors as RoleTheme), [themeColors]);
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeIdentityDriverLicenseFormStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute();

    // Tutorial
    const { step: tutorialStep, nextStep: nextTutorialStep } = useTutorialContext();
    const [showTutorialHint, setShowTutorialHint] = useState(
        tutorialStep === 'passport_form_hint',
    );
    // End tutorial

    const params = (route?.params ?? {}) as IdentityDriverLicenseRouteParams;


    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('DriverLicenseClass'));
        dispatch(countriesAsync());
    }, [dispatch]));


    const { mode, entityId, fromDashboard, dashboardParams } = params || {};
    const [resolvedLicenseData, setResolvedLicenseData] = useState<any>(params.licenseData || null);
    const [isFetchingEntity, setIsFetchingEntity] = useState(false);
    const licenseData = resolvedLicenseData;
    const isEditMode = mode === 'edit';
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.DriverLicense,
        recordId: isEditMode && licenseData?.id ? Number(licenseData.id) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.DriverLicense, recordId: isEditMode && licenseData?.id ? Number(licenseData.id) : null, enabled: links.enabled });

    useEffect(() => {
        if (isEditMode && entityId && !params.licenseData) {
            setIsFetchingEntity(true);
            dispatch(identityHubAsync({}))
                .unwrap()
                .then((data: any) => {
                    const licenses = Array.isArray(data?.driverlicenses) ? data.driverlicenses : [];
                    const found = licenses.find((l: any) => l.id === entityId);
                    if (found) {
                        const mapped = {
                            id: found.id,
                            licenseNumber: found.licensenumber,
                            state: found.state,
                            country: found.countryname,
                            expirationDate: found.expirationdate,
                            classType: found.class,
                            licenseImageId: Array.isArray(found.imageurl) ? found.imageurl[0] ?? '' : found.imageurl,
                            licenseImageIds: Array.isArray(found.imageurl) ? found.imageurl : found.imageurl ? [found.imageurl] : [],
                            remindBefore: found.reminderdaysbefore || 14,
                            isAddedInWallet: found.isaddedinwallet,
                        };
                        setResolvedLicenseData(mapped);
                        setSelectedCountryName(mapped.country || '');
                    }
                })
                .catch(() => {})
                .finally(() => setIsFetchingEntity(false));
        }
    }, [isEditMode, entityId, params.licenseData, dispatch]);

    const { driver_license_status, get_dropdown_options_data, countries_data, states_data } = useSelector((state: any) => state.user_auth);

    const isLoading = driver_license_status === ASYNC_STATUS.LOADING || isFetchingEntity;

    const formikRef = useRef<FormikProps<DriversLicenseFormValues>>(null);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [selectedCountryName, setSelectedCountryName] = useState<string>(params.licenseData?.country || '');

    const fetchStatesForCountry = useCallback((countryName: string) => {
        const match = countries_data?.find((c: any) => c.countryname === countryName);
        if (match?.id != null) dispatch(statesAsync(String(match.id) as any));
    }, [countries_data, dispatch]);

    useEffect(() => {
        if (selectedCountryName && countries_data) fetchStatesForCountry(selectedCountryName);
    }, [selectedCountryName, countries_data, fetchStatesForCountry]);

    const resolveInitialImageIds = (): string[] => {
        if (licenseData?.licenseImageIds?.length) {
            return licenseData.licenseImageIds;
        }
        // Backwards-compat: if only a single ID was stored previously
        if (licenseData?.licenseImageId) {
            return [licenseData.licenseImageId];
        }
        return [];
    };

    const initialValues: DriversLicenseFormValues = {
        licenseNumber: licenseData?.licenseNumber || '',
        state: licenseData?.state || '',
        expirationDate: licenseData?.expirationDate || '',
        classType: licenseData?.classType || get_dropdown_options_data?.[0]?.value || '',
        country: licenseData?.country || '',
        remindBefore: licenseData?.remindBefore ? `${licenseData.remindBefore}` : '90',
        licenseMediaIds: resolveInitialImageIds(),
        isAddedInWallet: licenseData?.isAddedInWallet ?? false,
    };

  
    const countryResolvedRef = useRef(false);
    useEffect(() => {
        if (!isEditMode || !licenseData?.id || countryResolvedRef.current) return;
        if (licenseData.country) {
            countryResolvedRef.current = true;
            return;
        }
        let cancelled = false;

        const resolveCountry = async () => {
            const stored = await AsyncStorage.getItem(driverLicenseCountryKey(licenseData.id));
            if (cancelled) return;
            if (stored) {
                countryResolvedRef.current = true;
                formikRef.current?.setFieldValue('country', stored);
                setSelectedCountryName(stored);
                return;
            }

            if (!licenseData.state || !countries_data?.length) return;

            for (const country of countries_data) {
                if (cancelled) return;
                try {
                    const action: any = await dispatch(statesAsync(String(country.id) as any));
                    const countryStates = action?.payload?.states || [];
                    if (countryStates.some((s: any) => String(s.id) === String(licenseData.state))) {
                        if (!cancelled) {
                            countryResolvedRef.current = true;
                            formikRef.current?.setFieldValue('country', country.countryname);
                            setSelectedCountryName(country.countryname);
                        }
                        return;
                    }
                } catch {
                    // Keep trying the remaining countries.
                }
            }
        };

        resolveCountry();
        return () => { cancelled = true; };
    }, [isEditMode, licenseData?.id, licenseData?.state, countries_data, dispatch]);

    useEffect(() => {
        if (isEditMode || selectedCountryName) return;
        const usCountry = findDefaultCountry(countries_data);
        if (usCountry) {
            formikRef.current?.setFieldValue('country', usCountry.countryname);
            setSelectedCountryName(usCountry.countryname);
        }
    }, [isEditMode, selectedCountryName, countries_data]);

    useEffect(() => {
        if (!resolvedLicenseData || !formikRef.current || params.licenseData) return;
        const imgIds = Array.isArray(resolvedLicenseData.licenseImageIds) && resolvedLicenseData.licenseImageIds.length
            ? resolvedLicenseData.licenseImageIds
            : resolvedLicenseData.licenseImageId ? [resolvedLicenseData.licenseImageId] : [];
        formikRef.current.setValues({
            licenseNumber: resolvedLicenseData.licenseNumber || '',
            state: resolvedLicenseData.state || '',
            expirationDate: resolvedLicenseData.expirationDate || '',
            classType: resolvedLicenseData.classType || get_dropdown_options_data?.[0]?.value || '',
            country: resolvedLicenseData.country || '',
            remindBefore: resolvedLicenseData.remindBefore ? `${resolvedLicenseData.remindBefore}` : '90',
            licenseMediaIds: imgIds,
            isAddedInWallet: resolvedLicenseData.isAddedInWallet ?? false,
        });
    }, [resolvedLicenseData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClassSelect = (classType: string): void => {
        formikRef.current?.setFieldValue('classType', classType);
        setShowClassPicker(false);
    };


    const handleMediaChange = (ids: string[]) => {
        formikRef.current?.setFieldValue('licenseMediaIds', ids);
    };

    const handleContinue = async (values: DriversLicenseFormValues) => {
        let formattedDate = null;
        if (values.expirationDate) {
            if (typeof values.expirationDate === 'string') {
                formattedDate = values.expirationDate;
            } else if (values.expirationDate instanceof Date) {
                formattedDate = values.expirationDate.toISOString();
            }
        }

        try {
            const payload = {
                licenseNumber: values.licenseNumber,
                state: String(values.state),
                class: values.classType,
                expirationDate: formattedDate,
                isAddedInWallet: values.isAddedInWallet,
                reminderDaysBefore: parseInt(values.remindBefore, 10) || 90,
            } as any;

            payload.imageUrl = values.licenseMediaIds.length > 0 ? values.licenseMediaIds : [];

            let savedId: number | string | undefined = licenseData?.id;
            if (isEditMode && licenseData?.id) {
                await dispatch(updateDriverLicenseAsync({ id: licenseData?.id, data: payload })).unwrap();
            } else {
                const res: any = await dispatch(driverLicenseAsync(payload)).unwrap();
                savedId = res?.id ?? res?.data?.id;
            }
            if (savedId) await links.saveOrWarn(Number(savedId));
            if (savedId) await recordNotes.saveOrWarn(Number(savedId));

            if (savedId) {
                if (values.country) {
                    await AsyncStorage.setItem(driverLicenseCountryKey(savedId), values.country);
                } else {
                    await AsyncStorage.removeItem(driverLicenseCountryKey(savedId));
                }
            }

            await dispatch(identityHubAsync({})).unwrap();
            if (tutorialStep === 'passport_form_hint') {
                nextTutorialStep(); // congratulations
                navigation.goBack();
                return;
            }
            Alert.alert(
                t('common.success'),
                (isEditMode && licenseData?.id)
                    ? t('identity_hub.drivers_license_updated')
                    : t('identity_hub.drivers_license_saved'),
                [{
                    text: t('common.ok'), onPress: () => {
                        if (fromDashboard) {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 1,
                                    routes: [
                                        { name: 'Dashboard' },
                                        {
                                            name: 'AIDashboard',
                                            params: {
                                                spaceType: dashboardParams?.spaceType ?? 'Personal',
                                                businessId: dashboardParams?.businessId ?? null,
                                            },
                                        },
                                    ],
                                })
                            );
                            return;
                        }
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 1,
                                routes: [
                                    { name: 'Dashboard' },
                                    { name: 'IdentityHub' },
                                ],
                            })
                        );
                    }
                }],
            );
        } catch (error) {
            // Error already shown by Redux
        }
    };

    const handleSkip = () => {
        navigation.navigate('IdentityHub' as never);
    };

    return (
        <ScreenWrapper scrollable={false} showShadow={false}>
            <AuthHeader
                title={t('identity_hub.your_identity_hub')}
                subtitle={t('identity_hub.verify_details')}
                onBackPress={() => navigation.goBack()}
                containerStyle={{ paddingHorizontal: 16, marginBottom: 0 }}
                backButtonIconStyle={{tintColor: themeColors.textPrimary}}
            />

            {/* Tutorial hint overlay */}
            {showTutorialHint && tutorialStep === 'passport_form_hint' && (
                <View style={tutorialHintStyles.overlay}>
                    <View style={tutorialHintStyles.card}>
                        <Text style={tutorialHintStyles.title}>Fill out the form</Text>
                        <Text style={tutorialHintStyles.body}>
                            Once you fill the form tap ‘Add Driver’s License’ to save it.
                        </Text>
                        <TouchableOpacity
                            style={[tutorialHintStyles.btn, { backgroundColor: themeColors.primary }]}
                            onPress={() => setShowTutorialHint(false)}
                        >
                            <Text style={tutorialHintStyles.btnText}>Start Filling</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={validationSchema('drivers_license')}
                onSubmit={handleContinue}
            >
                {({ handleChange, handleSubmit, values, setFieldValue, touched, errors }) => (
                    <>
                        <ScrollView
                            style={commonStyles.scrollView}
                            contentContainerStyle={commonStyles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Driver's License Section */}
                            <View style={commonStyles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { textAlign: "left" }]}>{t('identity_hub.drivers_license')}</Text>
                                <View style={styles.sectionCard}>
                                    {/* License Number */}
                                    <CustomInput
                                        label={`${t('identity_hub.license_number')} *`}
                                        placeholder={t('common.license_number_placeholder')}
                                        value={values.licenseNumber}
                                        onChangeText={handleChange('licenseNumber')}
                                        containerStyle={commonStyles.inputContainer}
                                        labelStyle={{ textAlign: "left" }}
                                        inputStyle={{ textAlign: "left" }}
                                        error={touched.licenseNumber && errors.licenseNumber}
                                    />

                                    {/* Country */}
                                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                                        {t('identity_hub.country')}
                                    </Text>
                                    <CustomDropDown
                                        options={
                                            countries_data?.map((country: any) => ({
                                                label: country.countryname,
                                                value: country.countryname,
                                            })) || []
                                        }
                                        value={values.country}
                                        onSelect={(value: any) => {
                                            const v = String(value);
                                            setFieldValue('country', v);
                                            setFieldValue('state', '');
                                            setSelectedCountryName(v);
                                        }}
                                        placeholder={t('passport.country_placeholder')}
                                        search={true}
                                        searchPlaceholder={t('common.search_country')}
                                        maxHeight={300}
                                        style={styles.dropdown}
                                        leftIcon={true}
                                    />

                                    {/* State */}
                                    <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                                        {`${t('identity_hub.state')} *`}
                                    </Text>
                                    <CustomDropDown
                                        options={
                                            states_data?.map((s: any) => ({
                                                label: s.description,
                                                value: String(s.id),
                                            })) || []
                                        }
                                        value={values.state}
                                        onSelect={(value: any) => setFieldValue('state', String(value))}
                                        placeholder={t('common.select')}
                                        search={true}
                                        searchPlaceholder={t('identity_hub.state')}
                                        maxHeight={300}
                                        style={styles.dropdown}
                                        leftIcon={true}
                                    />
                                    {touched.state && errors.state && (
                                        <Text style={styles.errorText}>{errors.state}</Text>
                                    )}

                                    {/* Expiration Date & Class */}
                                    <View style={[commonStyles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.halfWidth}>
                                            <Text style={[styles.inputLabel, { textAlign: "left" }]}>{`${t('identity_hub.expiration_date')} *`}</Text>
                                            <CustomDateTimePicker
                                                placeholder={t('common.select')}
                                                value={values.expirationDate}
                                                onChange={value => setFieldValue('expirationDate', value)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                                containerStyle={commonStyles.inputContainer}
                                                suffixIcon={
                                                    <Ionicons
                                                        name="calendar-outline"
                                                        size={20}
                                                        color={themeColors.textSecondary}
                                                    />
                                                }
                                            />
                                            {touched.expirationDate && errors.expirationDate && (
                                                <Text style={styles.errorText}>{errors.expirationDate}</Text>
                                            )}
                                        </View>
                                        <View style={styles.halfWidth}>
                                            <Text style={[styles.inputLabel, { textAlign: "left" }]}>{`${t('identity_hub.class')} *`}</Text>
                                            <TouchableOpacity
                                                style={styles.classInput}
                                                onPress={() => setShowClassPicker(true)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.classInputText, { color: values.classType ? themeColors.textPrimary : themeColors.placeholder }]}>
                                                    {get_dropdown_options_data?.find((option: any) => option.value === values.classType)?.label || ''}
                                                </Text>
                                                <Ionicons
                                                    name="chevron-down-outline"
                                                    size={20}
                                                    color={themeColors.textSecondary}
                                                />
                                            </TouchableOpacity>
                                            {touched.classType && errors.classType && (
                                                <Text style={styles.errorText}>{errors.classType}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Add to Wallet Toggle */}
                                    <View style={[styles.walletRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <Text style={[styles.walletText, { textAlign: "left" }]}>
                                            {t('identity_hub.add_to_wallet')}
                                        </Text>
                                        <Switch
                                            value={values.isAddedInWallet}
                                            onValueChange={(value) => { setFieldValue('isAddedInWallet', value); }}
                                            trackColor={{ false: colors.border, true: themeColors.primary }}
                                            thumbColor={colors.white}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Remind Me Before Expiration */}
                            <CustomReminderPicker
                                value={values.remindBefore}
                                onChange={(value) => setFieldValue('remindBefore', value)}
                                label={t('identity_hub.remind_before_expiration')}
                                modalTitle={t('common.enter_number_of_days')}
                                modalPlaceholder={t('common.enter_days_placeholder')}
                            />

                            {/* Upload Driver's License */}
                            <MixedMediaUploader
                                mediaIds={values.licenseMediaIds}
                                onMediaChange={handleMediaChange}
                                label={t('identity_hub.upload_license')}
                                uploadType="box"
                                autoUpload={true}
                                maxItems={5}
                                removable={true}
                            />

                            {/* Continue Button */}
                            <PrimaryButton
                                title={isEditMode ? t('common.update') : t('common.continue')}
                                onPress={handleSubmit}
                                loading={isLoading}
                                disabled={isLoading}
                                buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                            />
                        <RecordNotesField notes={recordNotes} />
                        <RecordLinksField links={links} />
                        </ScrollView>

                        {/* Class Picker Modal */}
                        <Modal
                            visible={showClassPicker}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowClassPicker(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowClassPicker(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>
                                        {t('identity_hub.select_class')}
                                    </Text>
                                    <View style={styles.classOptionsContainer}>
                                        {get_dropdown_options_data?.length > 0 && get_dropdown_options_data.map((option: any) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.classOption,
                                                    values.classType === option.value && styles.classOptionSelected,
                                                ]}
                                                onPress={() => handleClassSelect(option.value)}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    style={[
                                                        styles.classOptionText,
                                                        values.classType === option.value &&
                                                        styles.classOptionTextSelected,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.modalCloseButton}
                                        onPress={() => setShowClassPicker(false)}
                                    >
                                        <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </>
                )}
            </Formik>
        </ScreenWrapper>
    );
};

export default IdentityDriverLicenseForm;
