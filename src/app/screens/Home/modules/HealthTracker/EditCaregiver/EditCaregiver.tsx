import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { EditCaregiverRouteParams } from './EditCaregiver.types';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { AuthHeader, CustomDateTimePicker, CustomInput, PrimaryButton, ProfileAvatar } from '../../../../../../components/common';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { updateChildCaregiverAsync, getChildByIdAsync } from '../../../../../../redux/services/essentialsService';
import { getConnectedUsersAsync } from '../../../../../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { ConnectedUser } from '../../../../../../types/reduxTypes/connectionSlice.types';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeEditCaregiverStyles, makeDropdownStyles } from './EditCaregiver.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

// Define route params type
type EditCaregiverRouteProp = RouteProp<{ EditCaregiver: EditCaregiverRouteParams }, 'EditCaregiver'>;

type EditCaregiverData = NonNullable<EditCaregiverRouteParams['caregiver']> & {
    handlahuserid?: number;
    handlahuser?: {
        id?: number;
        username?: string;
        firstname?: string;
        lastname?: string;
        fullname?: string;
        email?: string;
        phonenumber?: string;
    };
};

const EditCaregiver: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditCaregiverRouteProp>();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeEditCaregiverStyles(themeColors as RoleTheme), [themeColors]);
    const dropdownStyles = useMemo(() => makeDropdownStyles(themeColors as RoleTheme), [themeColors]);

    // Redux state
    const { update_child_caregiver_status } = useSelector((state: any) => state.essentials_slice);
    const isLoading = update_child_caregiver_status === ASYNC_STATUS.LOADING;

    // Get caregiver data from route params if available
    const caregiverData = (route.params?.caregiver || {}) as EditCaregiverData;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Caregiver,
        recordId: caregiverData?.id ? Number(caregiverData.id) : null,
        businessId: null,
        enabled: true,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Caregiver, recordId: caregiverData?.id ? Number(caregiverData.id) : null, enabled: links.enabled });

    // Connections dropdown state
    const { get_connected_users_data, get_connected_users_status } = useSelector(
        (state: any) => state.connection_slice,
    );
    const existingUsername =
        caregiverData.handlahuser?.username ||
        caregiverData.handlahusername ||
        caregiverData.username ||
        '';
    const existingHandlahUserId =
        caregiverData.handlahuserid || caregiverData.handlahuser?.id;
    const [userSearch, setUserSearch] = useState<string>(existingUsername);
    const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const formikRef = useRef<FormikProps<typeof initialValues>>(null);

    const connectedUsers: ConnectedUser[] = get_connected_users_data ?? [];
    const filteredUsers = userSearch.trim()
        ? connectedUsers.filter(u =>
              `${u.firstname} ${u.lastname}`.toLowerCase().includes(userSearch.toLowerCase()) ||
              u.username.toLowerCase().includes(userSearch.toLowerCase()),
          )
        : connectedUsers;
    const isUsersLoading = get_connected_users_status === ASYNC_STATUS.LOADING;

    const fetchConnections = useCallback(() => {
        dispatch(getConnectedUsersAsync());
    }, [dispatch]);

    const handleUserSelect = useCallback((user: ConnectedUser) => {
        setSelectedUser(user);
        setUserSearch(user.username);
        formikRef.current?.setFieldValue('username', user.username);
        formikRef.current?.setFieldValue('name', `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim());
        formikRef.current?.setFieldValue('email', user.email ?? '');
        formikRef.current?.setFieldValue('phone', user.phonenumber ?? '');
        setDropdownOpen(false);
        Keyboard.dismiss();
    }, []);

    const handleUsernameChange = useCallback(
        (value: string) => {
            setUserSearch(value);
            setSelectedUser(null);
            formikRef.current?.setFieldValue('username', value);
            formikRef.current?.setFieldValue('name', '');
            formikRef.current?.setFieldValue('email', '');
            formikRef.current?.setFieldValue('phone', '');
            if (!dropdownOpen) setDropdownOpen(true);
        },
        [dropdownOpen],
    );

    const handleUsernameFocus = useCallback(() => {
        setDropdownOpen(true);
        if (get_connected_users_status === ASYNC_STATUS.IDLE) {
            fetchConnections();
        }
    }, [get_connected_users_status, fetchConnections]);

    const initialValues = {
        name: caregiverData.name || '',
        relation: caregiverData.relation || '',
        phone: caregiverData.phonenumber || caregiverData.phone || '',
        email: caregiverData.emailaddress || caregiverData.email || '',
        username: existingUsername,
        startDate: caregiverData.startdate || caregiverData.startDate || null,
        endDate: caregiverData.enddate || caregiverData.endDate || null,
    };

    const toISOStringOrUndefined = (value: string | Date | null | undefined) => {
        if (!value) return undefined;
        try {
            if (value instanceof Date) return value.toISOString();
            return new Date(value).toISOString();
        } catch {
            return undefined;
        }
    };

    const handleSaveChanges = (values: typeof initialValues) => {
        const childId = caregiverData.childid;
        const caregiverId = caregiverData.id;

        if (!childId || !caregiverId) {
            showErrorAlert(t('common.error') || 'Missing caregiver information');
            return;
        }

        const resolvedUserId =
            selectedUser?.userid ??
            connectedUsers.find(
                user =>
                    user.username?.toLowerCase() === values.username.trim().toLowerCase(),
            )?.userid ??
            existingHandlahUserId;

        const updatedData = {
            name: values.name,
            relation: values.relation || undefined,
            phoneNumber: values.phone || undefined,
            emailAddress: values.email || undefined,
            handlahUserId: resolvedUserId || undefined,
            startDate: toISOStringOrUndefined(values.startDate),
            endDate: toISOStringOrUndefined(values.endDate),
        };

        dispatch(updateChildCaregiverAsync({ 
            childId: childId.toString(), 
            caregiverId: Number(caregiverId),
            caregiverData: updatedData 
        })).then((action: any) => {
            saveLinksAfter(links, action, caregiverData.id, undefined, recordNotes);
            if (action.type === updateChildCaregiverAsync.fulfilled.type) {
                dispatch(getChildByIdAsync({ childId: childId.toString() }));
                navigation.goBack();
            }
        });
    };

    return (
        <SafeAreaView style={commonStyles.safeArea}>
            <KeyboardAvoidingView
                style={commonStyles.container}
                behavior={isIOS ? 'padding' : 'height'}
            >
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                    title={t('health_tracker.edit_caregiver')}
                    titleStyle={styles.HeaderTitle}
                    backButtonIconStyle={{ tintColor: themeColors.textSecondary }}
                />

                <View style={styles.subtitleRow}>
                    <Text style={styles.subtitle}>
                        {t('health_tracker.people_you_share_with')}
                    </Text>
                </View>

                <ScrollView
                    style={commonStyles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* <Text style={[styles.title, { textAlign: 'left' }]}>
                        {t('health_tracker.edit_caregiver')}
                    </Text>
                    <Text style={[styles.subtitle, { textAlign: 'left' }]}>
                        {t('health_tracker.people_you_share_with')}
                    </Text> */}

                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema('caregiver')}
                        onSubmit={handleSaveChanges}
                        enableReinitialize
                    >
                        {({ handleChange, handleSubmit, values, touched, errors, setFieldValue }) => (
                            <>
                                <View style={commonStyles.formContainer}>
                                    {/* Important note banner */}
                                    <View style={styles.noteBanner}>
                                        <Text style={styles.noteBannerText}>
                                            {t('health_tracker.important_note')}
                                        </Text>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <CustomInput
                                            label={t('health_tracker.username')}
                                            placeholder="@Username"
                                            value={userSearch}
                                            onChangeText={handleUsernameChange}
                                            onFocus={handleUsernameFocus}
                                            autoCapitalize="none"
                                            labelStyle={{ textAlign: 'left' }}
                                            inputStyle={{ textAlign: 'left' }}
                                        />
                                        {dropdownOpen && (
                                            <>
                                                <Pressable
                                                    style={dropdownStyles.backdrop}
                                                    onPress={() => {
                                                        setDropdownOpen(false);
                                                        Keyboard.dismiss();
                                                    }}
                                                />
                                                <View style={dropdownStyles.list}>
                                                    {isUsersLoading && filteredUsers.length === 0 ? (
                                                        <View style={dropdownStyles.loaderContainer}>
                                                            <ActivityIndicator
                                                                size="small"
                                                                color={themeColors.primary}
                                                            />
                                                        </View>
                                                    ) : filteredUsers.length === 0 ? (
                                                        <View style={dropdownStyles.emptyContainer}>
                                                            <Text style={dropdownStyles.emptyText}>
                                                                {t('common.no_users_found')}
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <FlatList
                                                            data={filteredUsers}
                                                            keyExtractor={item => String(item.userid)}
                                                            keyboardShouldPersistTaps="handled"
                                                            style={dropdownStyles.flatList}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity
                                                                    style={dropdownStyles.item}
                                                                    onPress={() => handleUserSelect(item)}
                                                                    activeOpacity={0.7}
                                                                >
                                                                    <ProfileAvatar imageId={item.profilepicture} name={item.firstname} size={36} variant="neutral" />
                                                                    <View style={dropdownStyles.itemInfo}>
                                                                        <Text style={dropdownStyles.itemName}>
                                                                            {item.firstname} {item.lastname}
                                                                        </Text>
                                                                        <Text style={dropdownStyles.itemUsername}>
                                                                            @{item.username}
                                                                        </Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                        />
                                                    )}
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    {/* Name */}
                                    <CustomInput
                                        label={`${t('health_tracker.name')} *`}
                                        placeholder={`${t('health_tracker.name')} *`}
                                        value={values.name}
                                        onChangeText={handleChange('name')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                        error={touched.name && errors.name ? String(errors.name) : undefined}
                                    />

                                    {/* Relation */}
                                    <CustomInput
                                        label={t('health_tracker.relation')}
                                        placeholder={t('health_tracker.relation')}
                                        value={values.relation}
                                        onChangeText={handleChange('relation')}
                                        containerStyle={styles.inputContainer}
                                        labelStyle={{ textAlign: 'left' }}
                                        inputStyle={{ textAlign: 'left' }}
                                    />

                                    {/* Phone # and Email Address in a row */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <CustomInput
                                                label={t('health_tracker.phone')}
                                                placeholder={t('health_tracker.phone')}
                                                value={values.phone}
                                                onChangeText={handleChange('phone')}
                                                keyboardType="phone-pad"
                                                containerStyle={styles.inputContainerNoMargin}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <CustomInput
                                                label={t('health_tracker.email')}
                                                placeholder={t('health_tracker.email')}
                                                value={values.email}
                                                onChangeText={handleChange('email')}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                containerStyle={styles.inputContainerNoMargin}
                                                labelStyle={{ textAlign: 'left' }}
                                                inputStyle={{ textAlign: 'left' }}
                                            />
                                        </View>
                                    </View>

                                    {/* Start & End Date */}
                                    <View style={styles.rowContainer}>
                                        <View style={styles.halfInput}>
                                            <CustomDateTimePicker
                                                label={t('health_tracker.start_date')}
                                                placeholder={t('health_tracker.start_date')}
                                                value={values.startDate}
                                                onChange={(value) => setFieldValue('startDate', value)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <CustomDateTimePicker
                                                label={t('health_tracker.end_date')}
                                                placeholder={t('health_tracker.end_date')}
                                                value={values.endDate}
                                                onChange={(value) => setFieldValue('endDate', value)}
                                                mode="date"
                                                displayFormat="MM/DD/YYYY"
                                            />
                                        </View>
                                    </View>

                                </View>

                                <View style={styles.buttonContainer}>
                                    <PrimaryButton
                                        title={isLoading ? t('common.loading') : t('common.save_changes')}
                                        onPress={handleSubmit}
                                        buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                                        disabled={isLoading}
                                    />
                                </View>
                            </>
                        )}
                    </Formik>
                <RecordNotesField notes={recordNotes} />
                <RecordLinksField links={links} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditCaregiver;
