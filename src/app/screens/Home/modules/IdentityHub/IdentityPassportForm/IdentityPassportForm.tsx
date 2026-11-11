import {
    ScrollView,
    Text,
    View,
    Alert,
    Switch,
    TouchableOpacity,
} from 'react-native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTutorialContext } from '../../../../../../tutorial/TutorialContext';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '../../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, MixedMediaUploader, PrimaryButton, CustomInput, CustomDateTimePicker, CustomDropDown, CustomReminderPicker } from '../../../../../../components/common';
import colors from '../../../../../../utils/colors';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import {
    IdentityPassportFormNavigationProp,
} from './IdentityPassportForm.types';
import { identityHubAsync, passportAsync, updatePassportAsync, countriesAsync, getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../IdentityHub.styles';
import { makeIdentityPassportFormStyles, makeTutorialHintStyles } from './IdentityPassportForm.styles';
import { findDefaultCountry } from '../../../../../../utils/helpers';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const IdentityPassportForm: React.FC = () => {
    const navigation = useNavigation<IdentityPassportFormNavigationProp>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeIdentityPassportFormStyles(themeColors as RoleTheme), [themeColors]);
    const tutorialHintStyles = useMemo(() => makeTutorialHintStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute()

    // Tutorial
    const { step: tutorialStep, nextStep: nextTutorialStep } = useTutorialContext();
    const [showTutorialHint, setShowTutorialHint] = useState(
        tutorialStep === 'passport_form_hint',
    );
    // End tutorial


    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('PassportType'));
    }, [dispatch]));

    const { mode, passportData, entityId, fromDashboard, dashboardParams } = (route?.params as any) || {};
    const isEditMode = mode === 'edit';
    const [resolvedPassportData, setResolvedPassportData] = useState<any>(passportData || null);
    const [isFetchingEntity, setIsFetchingEntity] = useState(false);

    useEffect(() => {
        if (isEditMode && entityId && !passportData) {
            setIsFetchingEntity(true);
            dispatch(identityHubAsync({}))
                .unwrap()
                .then((data: any) => {
                    const passports = Array.isArray(data?.passports) ? data.passports : [];
                    const found = passports.find((p: any) => p.id === entityId);
                    if (found) {
                        setResolvedPassportData({
                            id: found.id,
                            name: found.name ?? '',
                            passportNumber: found.passportnumber,
                            countryId: found.countryid,
                            countryName: found.country?.countryname,
                            expirationDate: found.expirationdate,
                            passportType: found.passporttype,
                            passportImageId: Array.isArray(found.imageurl) ? found.imageurl[0] ?? '' : found.imageurl,
                            passportImageIds: Array.isArray(found.imageurl) ? found.imageurl : found.imageurl ? [found.imageurl] : [],
                            remindBefore: found.reminderdaysbefore || 14,
                            isAddedInWallet: found.isaddedinwallet,
                        });
                    }
                })
                .catch(() => {})
                .finally(() => setIsFetchingEntity(false));
        }
    }, [isEditMode, entityId, passportData, dispatch]);

    const effectivePassportData = resolvedPassportData;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Passport,
        recordId: isEditMode && effectivePassportData?.id ? Number(effectivePassportData.id) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Passport, recordId: isEditMode && effectivePassportData?.id ? Number(effectivePassportData.id) : null, enabled: links.enabled });

    const { passport_status, countries_data } = useSelector((state: any) => state.user_auth);
    const isLoading = passport_status === ASYNC_STATUS.LOADING || isFetchingEntity;

    // Form State - Pre-fill if edit mode
    const [formData, setFormData] = useState({
        name: effectivePassportData?.name || '',
        passportNumber: effectivePassportData?.passportNumber || '',
        country: effectivePassportData?.countryName || '',
        countryId: effectivePassportData?.countryId ? effectivePassportData.countryId.toString() : '',
        expirationDate: effectivePassportData?.expirationDate ? new Date(effectivePassportData.expirationDate) : null,
        type: effectivePassportData?.passportType || '',
        addToWallet: effectivePassportData?.isAddedInWallet ?? true,
        remindBefore: effectivePassportData?.remindBefore ? `${effectivePassportData.remindBefore}d` : '90d',
    });
    const resolveInitialImageIds = (): string[] => {
        if (effectivePassportData?.passportImageIds?.length) return effectivePassportData.passportImageIds;
        if (effectivePassportData?.passportImageId) return [effectivePassportData.passportImageId];
        return [];
    };
    const [passportMediaIds, setPassportMediaIds] = useState<string[]>(resolveInitialImageIds);

    // Re-populate form when auto-fetched data arrives
    useEffect(() => {
        if (!resolvedPassportData || passportData) return;
        const imgIds = Array.isArray(resolvedPassportData.passportImageIds) && resolvedPassportData.passportImageIds.length
            ? resolvedPassportData.passportImageIds
            : resolvedPassportData.passportImageId ? [resolvedPassportData.passportImageId] : [];
        setFormData({
            name: resolvedPassportData.name || '',
            passportNumber: resolvedPassportData.passportNumber || '',
            country: resolvedPassportData.countryName || '',
            countryId: resolvedPassportData.countryId ? resolvedPassportData.countryId.toString() : '',
            expirationDate: resolvedPassportData.expirationDate ? new Date(resolvedPassportData.expirationDate) : null,
            type: resolvedPassportData.passportType || '',
            addToWallet: resolvedPassportData.isAddedInWallet ?? true,
            remindBefore: resolvedPassportData.remindBefore ? `${resolvedPassportData.remindBefore}d` : '90d',
        });
        setPassportMediaIds(imgIds);
    }, [resolvedPassportData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleInputChange = (field: string, value: string | Date | null | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCountryChange = (value: any) => {
        const selectedCountry = countries_data?.find(
            (c: any) => c.id.toString() === value,
        );

        setFormData(prev => ({
            ...prev,
            countryId: value,
            country: selectedCountry?.countryname || '',
        }));
    };

    useEffect(() => {
        dispatch(countriesAsync());
    }, []);

    useEffect(() => {
        if (isEditMode || formData.countryId) return;
        const usCountry = findDefaultCountry(countries_data);
        if (usCountry) {
            handleCountryChange(usCountry.id.toString());
        }
    }, [countries_data, isEditMode]);


    const handleContinue = async () => {
        if (!formData.passportNumber || !formData.countryId || !formData.expirationDate || !formData.type) {
            Alert.alert(t('common.error'), t('common.fill_all_required_fields'));
            return;
        }

        try {
            const payload = {
                // The passport's own name; sent even when blank so clearing it on edit sticks.
                name: (formData.name || '').trim(),
                passportNumber: formData.passportNumber,
                countryId: parseInt(formData.countryId),
                expirationDate: formData.expirationDate.toISOString(),
                passportType: formData.type,
                isAddedInWallet: formData.addToWallet,
                imageUrl: passportMediaIds,
                reminderDaysBefore: parseInt(formData.remindBefore.replace('d', '')) || 90,
            } as any;

            // Call correct API based on mode
            if (isEditMode && effectivePassportData?.id) {
                await dispatch(updatePassportAsync({ id: effectivePassportData.id, data: payload })).unwrap();
                await links.saveOrWarn(Number(effectivePassportData.id));
            } else {
                const created = await dispatch(passportAsync(payload)).unwrap();
                saveLinksAfter(links, { meta: { requestStatus: 'fulfilled' }, payload: created }, undefined, undefined, recordNotes);
            }

            await dispatch(identityHubAsync({})).unwrap();
            // Tutorial: skip success alert, go back to IdentityHub which shows congrats
            if (tutorialStep === 'passport_form_hint') {
                nextTutorialStep(); // congratulations
                navigation.goBack();
                return;
            }
            const isEdit = isEditMode && effectivePassportData?.id;
            Alert.alert(t('common.success'), isEdit ? t('identity_hub.passport_updated') : t('identity_hub.passport_saved'), [
                {
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
                        } else {
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
                    }
                },
            ]);
        } catch (error) {
            // Error already shown by Redux
        }
    };

    const handleSkip = () => {
        navigation.goBack()
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

            {/* Tutorial hint overlay – shown only during passport_form_hint step */}
            {showTutorialHint && tutorialStep === 'passport_form_hint' && (
                <View style={tutorialHintStyles.overlay}>
                    <View style={tutorialHintStyles.card}>
                        <Text style={tutorialHintStyles.title}>Fill out the form</Text>
                        <Text style={tutorialHintStyles.body}>
                            Once you fill the form you need to tap on ‘Add Passport’.
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

            <ScrollView
                style={commonStyles.scrollView}
                contentContainerStyle={commonStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Passport Section */}
                <View style={commonStyles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { textAlign: "left" }]}>{t('passport.section_title')}</Text>
                    <View style={styles.sectionCard}>
                        {/* Passport name */}
                        <CustomInput
                            label={t('identity_hub.passport_name', { defaultValue: 'Passport name' })}
                            placeholder={t('passport.name_placeholder', { defaultValue: "e.g. Dad's US passport" })}
                            value={formData.name}
                            onChangeText={value => handleInputChange('name', value)}
                            containerStyle={commonStyles.inputContainer}
                            labelStyle={{ textAlign: "left" }}
                            inputStyle={{ textAlign: "left" }}
                            maxLength={200}
                        />

                        {/* Passport Number */}
                        <CustomInput
                            label={t('identity_hub.passport_number')}
                            placeholder={t('passport.passport_placeholder')}
                            value={formData.passportNumber}
                            onChangeText={value => handleInputChange('passportNumber', value)}
                            containerStyle={commonStyles.inputContainer}
                            labelStyle={{ textAlign: "left" }}
                            inputStyle={{ textAlign: "left" }}
                        />

                        {/* Country */}
                        <View style={commonStyles.inputContainer}>
                            <Text style={[styles.inputLabel, { textAlign: "left" }]}>{t('identity_hub.country')}</Text>
                            <CustomDropDown
                                options={
                                    countries_data?.map((country: any) => ({
                                        label: country.countryname,
                                        value: country.id.toString(),
                                    })) || []
                                }
                                value={formData.countryId}
                                onSelect={handleCountryChange}
                                placeholder={t('passport.country_placeholder')}
                                search={true}
                                searchPlaceholder={t('common.search_country')}
                                maxHeight={300}
                                style={styles.dropdown}
                                leftIcon={true}
                            />
                        </View>

                        {/* Expiration Date & Type */}
                        <View style={[commonStyles.rowContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={styles.halfWidth}>
                                <CustomDateTimePicker
                                    label={t('identity_hub.expiration_date')}
                                    placeholder={t('common.select')}
                                    value={formData.expirationDate}
                                    onChange={value => handleInputChange('expirationDate', value)}
                                    mode="date"
                                    displayFormat="MM/DD/YYYY"
                                    containerStyle={commonStyles.inputContainer}
                                    labelStyle={{ textAlign: "left" }}
                                    suffixIcon={
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color={themeColors.textSecondary}
                                        />}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <View style={commonStyles.inputContainer}>
                                    <Text style={[styles.inputLabel, { textAlign: "left" }]}>{t('identity_hub.type')}</Text>
                                    <CustomDropDown
                                        options={get_dropdown_options_data}
                                        value={formData.type}
                                        onSelect={(value: any) => handleInputChange('type', value)}
                                        placeholder={t('identity_hub.book')}
                                        style={styles.dropdown}
                                        leftIcon={true}
                                        search={true}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Add to Wallet Toggle */}
                        <View style={[styles.walletRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.walletText, { textAlign: "left" }]}>
                                {t('identity_hub.add_to_wallet')}
                            </Text>
                            <Switch
                                value={formData.addToWallet}
                                onValueChange={value => handleInputChange('addToWallet', value)}
                                trackColor={{ false: colors.border, true: themeColors.primary }}
                                thumbColor={colors.white}
                            />
                        </View>
                    </View>
                </View>

                {/* Remind Me Before Expiration */}
                <CustomReminderPicker
                    value={formData.remindBefore}
                    onChange={(value) => handleInputChange('remindBefore', value)}
                    label={t('identity_hub.remind_before_expiration')}
                    modalTitle={t('common.enter_number_of_days')}
                    modalPlaceholder={t('common.enter_days_placeholder')}
                />

                {/* Upload Passport */}
                <MixedMediaUploader
                    mediaIds={passportMediaIds}
                    onMediaChange={(ids) => setPassportMediaIds(ids)}
                    label={t('identity_hub.upload_passport')}
                    uploadType="box"
                    autoUpload={true}
                    maxItems={5}
                    removable={true}
                />

                {/* Continue Button */}
                <PrimaryButton
                    title={isEditMode ? t('common.update') : t('common.continue')}
                    onPress={handleContinue}
                    loading={isLoading}
                    disabled={isLoading}
                    buttonStyle={[styles.continueButton, { backgroundColor: themeColors.primary }]}
                />
                {!isEditMode && (
                    <PrimaryButton
                        title={t('common.skip_finish_later')}
                        onPress={handleSkip}
                        buttonStyle={{ backgroundColor: 'transparent' }}
                        textStyle={{ color: colors.secondary }}
                        variant="transparent"
                    />
                )}
            <RecordNotesField notes={recordNotes} />
            <RecordLinksField links={links} />
            </ScrollView>
        </ScreenWrapper>
    );
};

export default IdentityPassportForm;
