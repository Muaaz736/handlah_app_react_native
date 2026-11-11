import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { AuthHeader, CustomDateTimePicker, CustomInput, PrimaryButton, ProfileAvatar } from '../../../../../../components/common';
import { addChildCaregiverAsync, getChildrenAsync } from '../../../../../../redux/services/essentialsService';
import { getConnectedUsersAsync } from '../../../../../../redux/services/connectionService';
import { ConnectedUser } from '../../../../../../types/reduxTypes/connectionSlice.types';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { Formik, FormikProps } from 'formik';
import validationSchema from '../../../../../../utils/validationSchemas';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeStyles, makeDropdownStyles } from './AddCaregiver.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../../../utils/colors';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { useRecordLinkSelection, saveLinksAfter } from '../../../../../../hooks/useRecordLinkSelection';
import { RecordLinksField } from '../../../../../../components/recordLinks/RecordLinksField';
import { RECORD_LINK_MODULE } from '../../../../../../constants/recordLinkModules';

type RouteParams = {
    AddCaregiver: { childId: string; ownerUserId?: number };
};

const AddCaregiver = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'AddCaregiver'>>();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeStyles(themeColors as RoleTheme), [themeColors]);
    const dropdownStyles = useMemo(() => makeDropdownStyles(themeColors as RoleTheme), [themeColors]);
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);

    const childId = route.params?.childId;
    const ownerUserId = route.params?.ownerUserId;
    // "Select Records to Link" (as on the web): saved after the record itself.
    const links = useRecordLinkSelection({
        moduleKey: RECORD_LINK_MODULE.Caregiver,
        recordId: null,
        businessId: null,
        enabled: !ownerUserId,
    });
    // Notes' "Encrypt notes" choice; saved after the record, like its links.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.Caregiver, recordId: null, enabled: links.enabled });

    const { add_child_caregiver_status } = useSelector((state: any) => state.essentials_slice);
    const isLoading = add_child_caregiver_status === ASYNC_STATUS.LOADING;

    // Connections dropdown state
    const { get_connected_users_data, get_connected_users_status } = useSelector(
        (state: any) => state.connection_slice,
    );
    const [userSearch, setUserSearch] = useState<string>('');
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
        // Pre-populate fields from connected user data
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
            // Clear pre-populated fields when user manually changes the username
            formikRef.current?.setFieldValue('name', '');
            formikRef.current?.setFieldValue('email', '');
            formikRef.current?.setFieldValue('phone', '');
            setDropdownOpen(value.length > 0);
        },
        [],
    );

    const handleUsernameFocus = useCallback(() => {
        if (userSearch.length > 0) {
            setDropdownOpen(true);
        }
        if (get_connected_users_status === ASYNC_STATUS.IDLE) {
            fetchConnections();
        }
    }, [userSearch, get_connected_users_status, fetchConnections]);

    const handleUsernameBlur = useCallback(() => {
        // Delay so item tap can fire before the dropdown closes
        setTimeout(() => setDropdownOpen(false), 150);
    }, []);

    const initialValues = {
        name: '',
        relation: '',
        phone: '',
        email: '',
        username: '',
        startDate: null as string | Date | null,
        endDate: null as string | Date | null,
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

    const handleAddCaregiver = (values: typeof initialValues) => {
        if (!childId) {
            showErrorAlert(t('common.error') || 'No child selected');
            return;
        }

        const resolvedUserId =
            selectedUser?.userid ??
            connectedUsers.find(
                user =>
                    user.username?.toLowerCase() === values.username.trim().toLowerCase(),
            )?.userid;

        const caregiverData = {
            name: values.name,
            relation: values.relation || undefined,
            phoneNumber: values.phone || undefined,
            emailAddress: values.email || undefined,
            handlahUserId: resolvedUserId || undefined,
            startDate: toISOStringOrUndefined(values.startDate),
            endDate: toISOStringOrUndefined(values.endDate),
        };

        dispatch(addChildCaregiverAsync({ childId, caregiverData, ...(ownerUserId ? { ownerUserId } : {}) })).then((action: any) => {
            saveLinksAfter(links, action, undefined, undefined, recordNotes);
            if (action.type === addChildCaregiverAsync.fulfilled.type) {
                dispatch(getChildrenAsync({}));
                navigation.goBack();
            }
        });

    };

    return (
        <SafeAreaView style={commonStyles.safeArea}>
            <KeyboardAvoidingView
                style={commonStyles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    containerStyle={styles.headerContainer}
                    titleStyle={styles.HeaderTitle}
                    title={t('health_tracker.add_caregiver')}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
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
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema('caregiver')}
                        onSubmit={handleAddCaregiver}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, touched, errors, setFieldValue }) => (
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
                                            onBlur={handleUsernameBlur}
                                            autoCapitalize="none"
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
                                        error={touched.name && errors.name ? String(errors.name) : undefined}
                                    />

                                    {/* Relation */}
                                    <CustomInput
                                        label={t('health_tracker.relation')}
                                        placeholder={t('health_tracker.relation')}
                                        value={values.relation}
                                        onChangeText={handleChange('relation')}
                                        containerStyle={styles.inputContainer}
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
                                            />
                                        </View>
                                        <View style={styles.halfInput}>
                                            <CustomInput
                                                label={t('health_tracker.email')}
                                                placeholder={t('health_tracker.email')}
                                                value={values.email}
                                                onChangeText={handleChange('email')}
                                                onBlur={handleBlur('email')}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                containerStyle={styles.inputContainerNoMargin}
                                                error={touched.email && errors.email ? String(errors.email) : undefined}
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
                                                suffixIcon={
                                                    <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
                                                }
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
                                                suffixIcon={
                                                    <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <PrimaryButton
                                        title={isLoading ? t('common.loading') : t('health_tracker.add_caregiver')}
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

export default AddCaregiver;
