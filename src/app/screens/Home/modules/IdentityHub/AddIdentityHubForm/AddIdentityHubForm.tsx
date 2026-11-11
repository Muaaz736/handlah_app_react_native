import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../../../../../components/ScreenWrapper/ScreenWrapper';
import {
    AuthHeader,
    CustomDateTimePicker,
    CustomDropDown,
    CustomInput,
    PrimaryButton,
    ProfilePictureField
} from '../../../../../../components/common';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import {
    countriesAsync,
    identityHubAsync,
    statesAsync,
    updateMeAsync,
} from '../../../../../../redux/services/authService';
import { requestCameraPermission, requestGalleryPermission } from '../../../../../../services/permissions/permissionService';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { AppDispatch } from '../../../../../../types/store.types';
import colors from '../../../../../../utils/colors';
import { isIOS, parseDateOnlyValue, findDefaultCountry } from '../../../../../../utils/helpers';
import { makeCommonStyles } from '../IdentityHub.styles';
import { AddIdentityHubRouteParams } from '../identityHub.types';
import { makeAddIdentityHubFormStyles } from './AddIdentityHubForm.styles';
import { AddIdentityHubFormNavigationProp } from './AddIdentityHubForm.types';

const AddIdentityHubForm: React.FC = () => {
    const navigation = useNavigation<AddIdentityHubFormNavigationProp>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddIdentityHubFormStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute();

    // Extract edit mode data (typed)
    const params = (route?.params ?? {}) as AddIdentityHubRouteParams;

    const { mode, personalData } = params;
    const isEditMode = mode === 'edit';

    // Get loading status and data from Redux
    const { update_me_status, countries_data, states_data } = useSelector(
        (state: any) => state.user_auth,
    );
    const isLoading = update_me_status === ASYNC_STATUS.LOADING;

    // The picture is kept by the id of the uploaded file; '' removes it.
    const [profilePictureId, setProfilePictureId] = useState<string>(personalData?.profilepicture || '');
    const [fullName, setFullName] = useState<string>(
        personalData?.fullname || '',
    );
    const [dateOfBirth, setDateOfBirth] = useState<string | Date | null>(
        parseDateOnlyValue(personalData?.dateofbirth),
    );
    const [phoneNo, setPhoneNo] = useState<string>(
        personalData?.phonenumber || '',
    );
    const [email, setEmail] = useState<string>(personalData?.email || '');
    const [address, setAddress] = useState<string>(personalData?.address1 || '');
    const [stateId, setStateId] = useState<string>(
        personalData?.stateid?.toString() || '',
    );
    const [zip, setZip] = useState<string>(personalData?.zipcode || '');
    const [countryId, setCountryId] = useState(
        personalData?.countryid?.toString() || personalData?.state?.countryid?.toString() || personalData?.state?.country?.id?.toString() || '',
    );
    const [city, setCity] = useState<any>(personalData?.city || '');

    const [passportPhoto, setPassportPhoto] = useState<string | null>(null);

    const countryOptions = [
        { label: 'United States', value: 'United States' },
        { label: 'Canada', value: 'Canada' },
        { label: 'United Kingdom', value: 'United Kingdom' },
        { label: 'Australia', value: 'Australia' },
    ];

    const stateOptions = [
        { label: 'Texas', value: 'Texas' },
        { label: 'California', value: 'California' },
        { label: 'New York', value: 'New York' },
        { label: 'Florida', value: 'Florida' },
    ];

    const passportTypeOptions = [
        { label: 'Book', value: 'Book' },
        { label: 'Card', value: 'Card' },
    ];

    // Handle country change
    const handleCountryChange = (value: any) => {
        setCountryId(value);
        setStateId(''); // Reset state when country changes
        if (value) {
            dispatch(statesAsync(value));
        }
    };

    // Fetch countries on mount, and fetch states if editing with existing country
    useEffect(() => {
        dispatch(countriesAsync());
        const existingCountryId = personalData?.countryid?.toString() || personalData?.state?.countryid?.toString() || personalData?.state?.country?.id?.toString() || '';
        if (existingCountryId) {
            dispatch(statesAsync(existingCountryId as any));
        }
    }, [dispatch]);

    useEffect(() => {
        if (countryId) return;
        const usCountry = findDefaultCountry(countries_data);
        if (usCountry) {
            handleCountryChange(usCountry.id.toString());
        }
    }, [countries_data]);

    const imagePickerOptions: any = {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        includeBase64: false,
    };

    const handleCameraLaunch = async () => {
        const granted = await requestCameraPermission();
        if (!granted) return;
        launchCamera(imagePickerOptions, response => {
            if (response.didCancel) {
                // User cancelled
            } else if (response.errorCode) {
                Alert.alert(t('common.error'), response.errorMessage || t('common.camera_error'));
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setPassportPhoto(selectedImage.uri as string);
            }
        });
    };

    const handleGalleryLaunch = async () => {
        const granted = await requestGalleryPermission();
        if (!granted) return;
        launchImageLibrary(imagePickerOptions, response => {
            if (response.didCancel) {
                // User cancelled
            } else if (response.errorCode) {
                Alert.alert(t('common.error'), response.errorMessage || t('common.gallery_error'));
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setPassportPhoto(selectedImage.uri as string);
            }
        });
    };


    const handleNonEditableFieldPress = () => {
        Alert.alert(
            t('common.info'),
            t('identity_hub.non_editable_field_message'),
            [{ text: t('common.ok') }]
        );
    };

    const handleCancel = () => {
        Alert.alert(t('common.cancel'), t('common.cancel_confirm'), [
            { text: t('common.no'), style: 'cancel' },
            { text: t('common.yes'), onPress: () => navigation.goBack() },
        ]);
    };

    const handleSave = async () => {
        if (!fullName || !email || !phoneNo) {
            Alert.alert(t('common.error'), t('common.fill_required_fields'));
            return;
        }

        try {
            const payload = {
                fullname: fullName,
                dateofbirth: dateOfBirth ? (dateOfBirth as Date).toISOString() : null,
                phonenumber: phoneNo,
                email: email,
                address1: address,
                stateid: stateId ? parseInt(stateId) : null,
                zipcode: zip,
                countryid: countryId ? parseInt(countryId) : null,
                city: city,
                profilepicture: profilePictureId,
            } as any;

            await dispatch(updateMeAsync(payload)).unwrap();
            await dispatch(identityHubAsync({})).unwrap();

            Alert.alert(
                t('common.success'),
                isEditMode
                    ? t('identity_hub.personal_info_updated')
                    : t('identity_hub.personal_info_saved'),
                [{ text: t('common.ok'), onPress: () => navigation.goBack() }],
            );
        } catch (error) {
            // Error already shown by Redux
        }
    };

    return (
        <ScreenWrapper scrollable={false} showShadow={false}>
            <AuthHeader
                title={
                    isEditMode
                        ? t('identity_hub.edit_personal_info') ||
                        'Edit Personal Information'
                        : t('identity_hub.title')
                }
                onBackPress={() => navigation.goBack()}
                containerStyle={{
                    paddingHorizontal: 16,
                    marginBottom: 0,
                    paddingTop: isIOS ? 0 : 20,
                }}
                backButtonIconStyle={{tintColor: themeColors.textPrimary}}
            />

            <ScrollView
                style={commonStyles.scrollView}
                contentContainerStyle={commonStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Personal Information Section */}
                <View style={commonStyles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>
                        {t('identity_hub.personal_information')}
                    </Text>
                    <View style={styles.sectionCard}>
                        <ProfilePictureField imageId={profilePictureId} onChange={setProfilePictureId} />
                        <CustomInput
                            label={`${t('identity_hub.full_name')} *`}
                            placeholder={`${t('identity_hub.full_name')} *`}
                            value={fullName}
                            onChangeText={setFullName}
                            containerStyle={commonStyles.inputContainer}
                            labelStyle={{ textAlign: 'left' }}
                            inputStyle={{ textAlign: 'left' }}
                        />

                        <View
                            style={[
                                commonStyles.rowContainer,
                                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                            ]}
                        >
                            <View style={styles.halfWidth}>
                                <CustomDateTimePicker
                                    label={t('identity_hub.date_of_birth')}
                                    placeholder={t('common.date_format_placeholder')}
                                    value={dateOfBirth}
                                    onChange={setDateOfBirth}
                                    mode="date"
                                    displayFormat="MM/DD/YYYY"
                                    containerStyle={commonStyles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={isEditMode ? handleNonEditableFieldPress : undefined}
                                    disabled={!isEditMode}
                                >
                                    <View pointerEvents={isEditMode ? 'none' : 'auto'}>
                                        <CustomInput
                                            label={t('identity_hub.phone_no')}
                                            placeholder="(000) 000-0000"
                                            value={phoneNo}
                                            onChangeText={setPhoneNo}
                                            keyboardType="phone-pad"
                                            editable={!isEditMode}
                                            containerStyle={commonStyles.inputContainer}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={isEditMode ? handleNonEditableFieldPress : undefined}
                            disabled={!isEditMode}
                        >
                            <View pointerEvents={isEditMode ? 'none' : 'auto'}>
                                <CustomInput
                                    label={t('identity_hub.email_address')}
                                    placeholder={t('identity_hub.email_address')}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isEditMode}
                                    containerStyle={commonStyles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                        </TouchableOpacity>

                        <CustomInput
                            label={t('identity_hub.address')}
                            placeholder={t('identity_hub.address')}
                            value={address}
                            onChangeText={setAddress}
                            containerStyle={commonStyles.inputContainer}
                            labelStyle={{ textAlign: 'left' }}
                            inputStyle={{ textAlign: 'left' }}
                        />

                        <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                            {t('identity_hub.country')}
                        </Text>
                        <CustomDropDown
                            options={
                                countries_data?.map((country: any) => ({
                                    label: country.countryname,
                                    value: country.id.toString(),
                                })) || []
                            }
                            value={countryId}
                            onSelect={handleCountryChange}
                            placeholder={t('common.select')}
                            search={true}
                            searchPlaceholder={t('common.search_country')}
                            maxHeight={300}
                            leftIcon={true}
                            style={styles.dropdown}
                        />

                        <CustomInput
                            label={t('identity_hub.city')}
                            placeholder={t('identity_hub.city')}
                            value={city}
                            onChangeText={setCity}
                            containerStyle={commonStyles.inputContainer}
                            labelStyle={{ textAlign: 'left' }}
                            inputStyle={{ textAlign: 'left' }}
                        />

                        <View
                            style={[
                                commonStyles.rowContainer,
                                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                            ]}
                        >
                            <View style={styles.halfWidth}>
                                <Text style={[styles.inputLabel, { textAlign: 'left' }]}>
                                    {t('identity_hub.state')}
                                </Text>
                                <CustomDropDown
                                    options={
                                        states_data?.map((state: any) => ({
                                            label: state.description,
                                            value: state.id.toString(),
                                        })) || []
                                    }
                                    value={stateId}
                                    onSelect={val => setStateId(val as string)}
                                    placeholder={t('common.select')}
                                    search={true}
                                    searchPlaceholder={t('common.search_state')}
                                    maxHeight={300}
                                    leftIcon={true}
                                    style={styles.dropdown}
                                    containerStyle={styles.stateDropdownContainer}
                                    dropdownPosition="top"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <CustomInput
                                    label={t('identity_hub.zip')}
                                    placeholder={t('common.zip_placeholder')}
                                    value={zip}
                                    onChangeText={setZip}
                                    keyboardType="default"
                                    containerStyle={commonStyles.inputContainer}
                                    labelStyle={{ textAlign: 'left' }}
                                    inputStyle={{ textAlign: 'left' }}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title={t('common.cancel')}
                        onPress={handleCancel}
                        buttonStyle={styles.cancelButton}
                        textStyle={styles.cancelButtonText}
                        variant="outline"
                    />
                    <PrimaryButton
                        title={isEditMode ? t('common.update') : t('common.save')}
                        onPress={handleSave}
                        loading={isLoading}
                        disabled={isLoading}
                        buttonStyle={[
                            styles.saveButton,
                            { backgroundColor: themeColors.primary },
                        ]}
                        textStyle={[styles.cancelButtonText, { color: colors.white }]}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default AddIdentityHubForm;
