import React, { useCallback, useState, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    CustomInput,
    CustomDropDown,
    CustomDateTimePicker,
    PrimaryButton,
    MixedMediaUploader,
    AuthHeader,
    showInfoToast,
    ImageUploader,
} from '../../../../../../components/common';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import {
    AddPetScreenProps,
    PetTypeOption,
    SexOption,
} from './addPetScreen.types';
import { Formik } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { useDispatch, useSelector } from 'react-redux';
import {
    addPetAsync,
    editPetAsync,
} from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { isIOS, isOtherSelected } from '../../../../../../utils/helpers';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { useFocusEffect } from '@react-navigation/native';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../PetsScreen.styles';
import { makeAddPetScreenStyles } from './AddPetScreen.styles';
import colors from '../../../../../../utils/colors';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

const AddPetScreen: React.FC<AddPetScreenProps> = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeAddPetScreenStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();

    const isEdit: boolean = route?.params?.isEdit || false;
    const existingPet: any = route?.params?.pet || null;
    const ownerUserId = (route?.params as any)?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Pet,
        recordId: isEdit && existingPet?.id ? Number(existingPet.id) : null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Pet, recordId: isEdit && existingPet?.id ? Number(existingPet.id) : null, enabled: links.enabled });
    const {
        from,
        connectionTabSource,
        sharedWithUserId,
        ownerId,
        accessLevel,
        accessType,
    } = (route?.params as any) || {};

    const { add_pet_status, edit_pet_status } = useSelector(
        (state: any) => state.essentials_slice,
    );
    const isLoading = isEdit
        ? edit_pet_status === ASYNC_STATUS.LOADING
        : add_pet_status === ASYNC_STATUS.LOADING;

    // Microchipped toggle (managed outside Formik for checkbox UX)
    const [microchipped, setMicrochipped] = useState(
        existingPet?.ismicrochipped || existingPet?.microchipped || false,
    );

    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('PetType'));
    }, [dispatch]));


    const sexOptions: SexOption[] = [
        { label: t('pets.sex_options.male'), value: 'Male' },
        { label: t('pets.sex_options.female'), value: 'Female' },
    ];

    const initialValues = {
        name: existingPet?.name || '',
        type: existingPet?.type || '',
        breed: existingPet?.breed || '',
        birthday: existingPet?.birthday || '',
        dateOfAdoption:
            existingPet?.dateofadoption || existingPet?.adoptionDate || '',
        sex: existingPet?.sex || '',
        food: existingPet?.food || '',
        allergies: existingPet?.allergies || '',
        microchipId: existingPet?.microchipid || existingPet?.chipNumber || '',
        microchipRegistry:
            existingPet?.microchipregistry || existingPet?.homeAgain || '',
        registrationId:
            existingPet?.registrationid || existingPet?.registrationId || '',
        registrationNumber: existingPet?.registrationnumber || '',
        registeredOn: existingPet?.registeredon || existingPet?.registeredOn || '',
        renewalDate: existingPet?.renewaldate || existingPet?.renewalDate || '',
        issuingAuthority:
            existingPet?.issuingauthority || existingPet?.issuingAuthority || '',
        endDate: existingPet?.enddate || existingPet?.endDate || '',
        photoUrls: (() => {
            const raw = existingPet?.photourl;
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            return [raw];
        })(),
        typeOther: existingPet?.typeOther || existingPet?.typeother || '',
    };

    const handleSubmitPet = (values: typeof initialValues) => {
        const petPayload = {
            name: values.name,
            type: values.type,
            breed: values.breed,
            birthday: values.birthday || undefined,
            dateOfAdoption: values.dateOfAdoption || undefined,
            sex: values.sex,
            food: values.food || undefined,
            allergies: values.allergies || undefined,
            isMicrochipped: microchipped,
            microchipId: microchipped ? values.microchipId : undefined,
            microchipRegistry: microchipped ? values.microchipRegistry : undefined,
            registrationId: values.registrationId || undefined,
            registrationNumber: values.registrationNumber || undefined,
            registeredOn: values.registeredOn || undefined,
            renewalDate: values.renewalDate || undefined,
            issuingAuthority: values.issuingAuthority || undefined,
            endDate: values.endDate || undefined,
            photoUrl: values.photoUrls.length > 0 ? values.photoUrls : undefined,
            typeOther: undefined as string | undefined,
        };

        if (isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === values.type)?.label)) {
            if (!values.typeOther) {
                showInfoToast('Please Specify Pet type');
                return;
            }
            petPayload.typeOther = values.typeOther;
        }

        if (isEdit && existingPet?.id) {
            dispatch(editPetAsync({ id: existingPet.id, data: petPayload })).then(
                (action: any) => {
            saveLinksAfter(links, action, existingPet.id, undefined, recordNotes);
                    if (action.type === editPetAsync.fulfilled.type) {
                        navigation.goBack();
                    }
                },
            );
        } else {
            dispatch(
                addPetAsync({ ...petPayload, ...(ownerUserId ? { ownerUserId } : {}) }),
            ).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
                if (action.type === addPetAsync.fulfilled.type) {
                    if (action.payload?._offlineQueued) {
                        showInfoToast(t('offline.parent_queued_toast'), t('common.info'));
                        navigation.goBack();
                    }
                    if (ownerUserId) {
                        (navigation as any).navigate('Pets', {
                            from,
                            connectionTabSource,
                            sharedWithUserId,
                            ownerId,
                            accessLevel,
                            accessType,
                        });
                    } else {
                        const petId = action.payload?.pet?.id;
                        (navigation as any).navigate('AddPetVaccination', {
                            petData: { ...petPayload, id: petId },
                            petId,
                        });
                    }
                }
            });
        }
    };

    return (
        <SafeAreaView style={commonStyles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={isIOS ? 'padding' : 'height'}
            >
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.header}
                    title={isEdit ? t('pets.edit_pet') : t('pets.add_your_pet')}
                    subtitle={t('pets.subtitle')}
                    titleStyle={commonStyles.HeaderTitle}
                    backButtonIconStyle={{tintColor: themeColors.textPrimary}}
                />

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema('pet')}
                    onSubmit={handleSubmitPet}
                >
                    {({
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                        values,
                        touched,
                        errors,
                    }) => (
                        <>
                            <ScrollView
                                style={commonStyles.scrollView}
                                contentContainerStyle={commonStyles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >

                                {/* Pet Name Input */}
                                <View style={commonStyles.inputGroup}>
                                    <CustomInput
                                        value={values.name}
                                        onChangeText={handleChange('name')}
                                        placeholder={t('pets.pet_name_placeholder')}
                                        label={`${t('pets.pet_name')} *`}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={
                                            touched.name && errors.name
                                                ? String(errors.name)
                                                : undefined
                                        }
                                    />
                                </View>

                                {/* Pet Type Dropdown */}
                                <View style={commonStyles.inputGroup}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                        {t('pets.pet_type')} *
                                    </Text>
                                    <CustomDropDown
                                        options={get_dropdown_options_data}
                                        value={values.type}
                                        onSelect={(val: any) => {
                                            setFieldValue('type', val);
                                            // Clear typeOther when switching away from Other
                                            if (!isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === val)?.label)) {
                                                setFieldValue('typeOther', '');
                                            }
                                        }}
                                        placeholder={t('pets.select_type')}
                                        search={true}
                                        leftIcon={true}
                                    />
                                    {touched.type && errors.type && (
                                        <Text style={commonStyles.errorText}>{String(errors.type)}</Text>
                                    )}

                                    {/* Other field — only visible when Other is selected */}
                                    {isOtherSelected(get_dropdown_options_data?.find((item: any) => item.value === values.type)?.label) && (
                                        <View style={{ marginTop: 12 }}>
                                            <CustomInput
                                                value={values.typeOther}
                                                onChangeText={handleChange('typeOther')}
                                                placeholder={t('common.other_type_placeholder') || 'Please specify...'}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Breed and Birthday Row */}
                                <View style={commonStyles.datesRow}>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('pets.breed')} *
                                        </Text>
                                        <CustomInput
                                            value={values.breed}
                                            onChangeText={handleChange('breed')}
                                            placeholder={t('pets.breed_placeholder')}
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                            error={
                                                touched.breed && errors.breed
                                                    ? String(errors.breed)
                                                    : undefined
                                            }
                                        />
                                    </View>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('pets.birthday')}
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.birthday}
                                            onChange={(val: any) => setFieldValue('birthday', val)}
                                            placeholder={t('pets.date_placeholder')}
                                            displayFormat="MM/DD/YYYY"
                                            error={
                                                touched.birthday && errors.birthday
                                                    ? String(errors.birthday)
                                                    : undefined
                                            }
                                            suffixIcon={
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={themeColors.textSecondary}
                                                />
                                            }
                                        />
                                    </View>
                                </View>

                                {/* Date of Adoption and Sex Row */}
                                <View style={commonStyles.datesRow}>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('pets.date_of_adoption')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.dateOfAdoption}
                                            onChange={(val: any) =>
                                                setFieldValue('dateOfAdoption', val)
                                            }
                                            placeholder={t('pets.date_placeholder')}
                                            displayFormat="MM/DD/YYYY"
                                            error={
                                                touched.dateOfAdoption && errors.dateOfAdoption
                                                    ? String(errors.dateOfAdoption)
                                                    : undefined
                                            }
                                            suffixIcon={
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={themeColors.textSecondary}
                                                />
                                            }
                                        />
                                    </View>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('pets.sex')}
                                        </Text>
                                        <CustomDropDown
                                            options={sexOptions}
                                            value={values.sex}
                                            onSelect={(val: any) => setFieldValue('sex', val)}
                                            placeholder={t('pets.select_sex')}
                                            search={false}
                                            leftIcon={true}
                                        />
                                        {touched.sex && errors.sex && (
                                            <Text style={commonStyles.errorText}>{String(errors.sex)}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* End Date */}
                                <View style={commonStyles.inputGroup}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                        {t('pets.end_date')}
                                    </Text>
                                    <CustomDateTimePicker
                                        value={values.endDate}
                                        onChange={(val: any) => setFieldValue('endDate', val)}
                                        placeholder={t('pets.date_placeholder')}
                                        displayFormat="MM/DD/YYYY"
                                        maximumDate={values.dateOfAdoption ? new Date(values.dateOfAdoption) : undefined}
                                        error={
                                            touched.endDate && errors.endDate
                                                ? String(errors.endDate)
                                                : undefined
                                        }
                                        suffixIcon={
                                            <Ionicons
                                                name="calendar-outline"
                                                size={20}
                                                color={themeColors.textSecondary}
                                            />
                                        }
                                    />
                                </View>

                                {/* Food Input */}
                                <View style={commonStyles.inputGroup}>
                                    <CustomInput
                                        value={values.food}
                                        onChangeText={handleChange('food')}
                                        placeholder={t('pets.food_placeholder')}
                                        label={t('pets.food_brand')}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                    />
                                </View>

                                {/* Allergies Input */}
                                <View style={commonStyles.inputGroup}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                        {t('pets.allergies')}
                                    </Text>
                                    <TextInput
                                        value={values.allergies}
                                        onChangeText={handleChange('allergies')}
                                        placeholder={t('pets.allergies_placeholder')}
                                        placeholderTextColor="#999999"
                                        multiline
                                        numberOfLines={4}
                                        style={[commonStyles.textArea, { textAlign: 'left' }]}
                                    />
                                </View>

                                {/* Microchipped Section */}
                                <View style={commonStyles.inputGroup}>
                                    <TouchableOpacity
                                        style={styles.microchipHeader}
                                        onPress={() => setMicrochipped(!microchipped)}
                                    >
                                        <Text style={[styles.microchipText, { textAlign: 'left' }]}>
                                            {t('pets.microchipped')}
                                        </Text>
                                        <View
                                            style={[
                                                styles.checkbox,
                                                microchipped && styles.checkboxChecked,
                                            ]}
                                        >
                                            {microchipped && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={18}
                                                    color={colors.white}
                                                />
                                            )}
                                        </View>
                                    </TouchableOpacity>

                                    {microchipped && (
                                        <View style={styles.microchipFields}>
                                            <CustomInput
                                                value={values.microchipId}
                                                onChangeText={handleChange('microchipId')}
                                                label={t('pets.microchip_id') || 'Microchip ID'}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                placeholder="985123456789000"
                                                keyboardType="numbers-and-punctuation"
                                            />
                                            <CustomInput
                                                value={values.microchipRegistry}
                                                onChangeText={handleChange('microchipRegistry')}
                                                label={t('pets.microchip_registry') || 'Microchip Registry'}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                                placeholder={t('common.microchip_company_placeholder')}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Registration ID */}
                                <View style={commonStyles.inputGroup}>
                                    <CustomInput
                                        value={values.registrationId}
                                        onChangeText={handleChange('registrationId')}
                                        placeholder={t('common.microchip_number_placeholder')}
                                        label={t('pets.registration_id')}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                    />
                                </View>

                                {/* Registered on and Renewal date Row */}
                                <View style={commonStyles.datesRow}>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('pets.registered_on')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.registeredOn}
                                            onChange={(val: any) =>
                                                setFieldValue('registeredOn', val)
                                            }
                                            placeholder={t('pets.date_placeholder')}
                                            displayFormat="MM/DD/YYYY"
                                            error={
                                                touched.registeredOn && errors.registeredOn
                                                    ? String(errors.registeredOn)
                                                    : undefined
                                            }
                                            suffixIcon={
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={themeColors.textSecondary}
                                                />
                                            }
                                        />
                                    </View>
                                    <View style={commonStyles.dateGroup}>
                                        <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                            {t('pets.renewal_date')} *
                                        </Text>
                                        <CustomDateTimePicker
                                            value={values.renewalDate}
                                            onChange={(val: any) => setFieldValue('renewalDate', val)}
                                            placeholder={t('pets.date_placeholder')}
                                            displayFormat="MM/DD/YYYY"
                                            error={
                                                touched.renewalDate && errors.renewalDate
                                                    ? String(errors.renewalDate)
                                                    : undefined
                                            }
                                            suffixIcon={
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={themeColors.textSecondary}
                                                />
                                            }
                                        />
                                    </View>
                                </View>

                                {/* Issuing authority */}
                                <View style={commonStyles.inputGroup}>
                                    <CustomInput
                                        value={values.issuingAuthority}
                                        onChangeText={handleChange('issuingAuthority')}
                                        placeholder={t('common.license_location_placeholder')}
                                        label={t('pets.issuing_authority')}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                    />
                                </View>

                                {/* Upload Section */}
                                <View style={commonStyles.uploadSection}>
                                    <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                        {t('pets.upload_photo')}
                                    </Text>
                                    <ImageUploader
                                        multiple={true}
                                        maxImages={5}
                                        imageIds={values.photoUrls}
                                        onImageSelect={() => { }}
                                        onImageUploaded={(ids: string[]) => setFieldValue('photoUrls', ids)}
                                        uploadType="box"
                                        iconType="ionicons"
                                        iconName="cloud-upload-outline"
                                        iconSize={24}
                                        iconColor={colors.gray}
                                        autoUpload={true}
                                        containerStyle={{ marginBottom: 0 }}
                                        removable={true}
                                        onRemove={() => { }}
                                    />
                                </View>
                            <RecordNotesField notes={recordNotes} />
                            <RecordLinksField links={links} />
                            </ScrollView>

                            {/* Footer Button */}
                            <View style={commonStyles.footer}>
                                <PrimaryButton
                                    title={
                                        isLoading
                                            ? t('common.loading') || 'Loading...'
                                            : isEdit
                                                ? t('pets.edit_pet') || 'Update Pet'
                                                : t('pets.continue') || 'Add Pet'
                                    }
                                    onPress={handleSubmit}
                                    buttonStyle={{ backgroundColor: themeColors.primary }}
                                    disabled={isLoading}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddPetScreen;
