import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRecordNotes } from '../../../../../../hooks/useRecordNotes';
import { RecordNotesField } from '../../../../../../components/notes/RecordNotesField';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
    AuthHeader,
    CustomDateTimePicker,
    CustomDropDown,
    CustomInput,
    PrimaryButton,
} from '../../../../../../components/common';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { getChildByIdAsync, updateChildAsync } from '../../../../../../redux/services/essentialsService';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { AppDispatch } from '../../../../../../types/store.types';
import { showErrorAlert } from '../../../../../../utils/AlertHelper';
import { isIOS } from '../../../../../../utils/helpers';
import { makeCommonStyles } from '../HealthTracker.styles';
import { makeEditOverviewStyles } from './EditOverview.styles';
import { EditOverviewRouteParams } from './EditOverView.types';

// Define route params type
type EditOverviewRouteProp = RouteProp<{ EditOverView: EditOverviewRouteParams }, 'EditOverView'>;

const BLOOD_TYPE_OPTIONS = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
];

const EditOverView: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditOverviewRouteProp>();
    const dispatch = useDispatch<AppDispatch>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeEditOverviewStyles(themeColors as RoleTheme), [themeColors]);
    const { user_data } = useSelector((state: any) => state.user_auth);

    // Redux state
    const { update_child_status } = useSelector((state: any) => state.essentials_slice);
    const isLoading = update_child_status === ASYNC_STATUS.LOADING;

    // Get overview data and childId from route params
    const overviewData = (route.params?.overview || {}) as any;
    const childId = route.params?.childId;
    // Overview notes, with the "Encrypt notes" choice; saved after the member.
    const recordNotes = useRecordNotes({ moduleKey: RECORD_LINK_MODULE.HealthMember, recordId: childId ? Number(childId) : null });

    const isMyself = !!overviewData.isMyself;
    if (isMyself && !overviewData.dateofbirth) {
        overviewData.dateOfBirth = user_data?.dateofbirth || '';
    }
    const [name, setName] = useState<string>(overviewData.name || '');
    const [bloodType, setBloodType] = useState<string>(overviewData.bloodType || overviewData.bloodtype || '');
    const [keyDiagnosis, setKeyDiagnosis] = useState<string>(overviewData.keyDiagnosis || overviewData.keydiagnosis || '');
    const [allergies, setAllergies] = useState<string>(overviewData.allergies || '');
    const [recentSurgeries, setRecentSurgeries] = useState<string>(overviewData.recentSurgeries || overviewData.recentsurgeries || '');
    const [endDate, setEndDate] = useState<string>(overviewData.endDate || overviewData.enddate || '');
    const [dateOfBirth, setDateOfBirth] = useState<string>(overviewData.dateOfBirth || overviewData.dateofbirth || '');

    const scrollViewRef = useRef<ScrollView>(null);
    const formContainerY = useRef<number>(0);
    const keyDiagnosisY = useRef<number>(0);
    const allergiesY = useRef<number>(0);
    const recentSurgeriesY = useRef<number>(0);

    const scrollToY = (inputY: number) => {
        scrollViewRef.current?.scrollTo({
            y: formContainerY.current + inputY - 16,
            animated: true,
        });
    };

    // Wrapper function for dropdown handler
    const handleBloodTypeSelect = (value: string | string[] | null) => {
        if (typeof value === 'string') {
            setBloodType(value);
        } else if (value === null) {
            setBloodType('');
        }
    };

    const handleSaveChanges = () => {
        if (!childId) {
            showErrorAlert(t('common.error') || 'No child selected');
            return;
        }

        const updatedData = {
            name: name || '',
            bloodType: bloodType || undefined,
            dateOfBirth: dateOfBirth || undefined,
            keyDiagnosis: keyDiagnosis || undefined,
            allergies: allergies || undefined,
            recentSurgeries: recentSurgeries || undefined,
            ...(isMyself ? {} : { endDate: endDate || undefined }),
        };

        dispatch(updateChildAsync({ id: childId, data: updatedData })).then((action: any) => {
            if (action.type === updateChildAsync.fulfilled.type) {
                void recordNotes.saveOrWarn(Number(childId));
                // Refresh the child data
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
                    title={t('health_tracker.edit_overview')}
                    titleStyle={styles.HeaderTitle}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />

                <ScrollView
                    ref={scrollViewRef}
                    style={commonStyles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* <Text style={[styles.title, { textAlign: 'left' }]}>
                        {t('health_tracker.edit_overview')}
                    </Text> */}

                    <View
                        style={commonStyles.formContainer}
                        onLayout={e => { formContainerY.current = e.nativeEvent.layout.y; }}
                    >
                        {/* Dependent Name */}
                        {!isMyself && (
                            <CustomInput
                                label={t('modals.child_name')}
                                placeholder={t('modals.child_name')}
                                value={name}
                                onChangeText={setName}
                                containerStyle={styles.inputContainer}
                                labelStyle={{ textAlign: 'left' }}
                                inputStyle={{ textAlign: 'left' }}
                            />
                        )}

                        {/* Date of Birth */}
                        <View style={styles.inputGroup}>
                            <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                {t('common.dob') || 'Date of Birth'}
                            </Text>
                            <CustomDateTimePicker
                                value={dateOfBirth}
                                onChange={(date) => setDateOfBirth(date as string)}
                                placeholder={t('common.dob') || 'Select Date of Birth'}
                                mode="date"
                                displayFormat="MM/DD/YYYY"
                                disabled={isMyself}
                            />
                        </View>

                        {/* End Date */}
                        {!isMyself && (
                            <View style={styles.inputGroup}>
                                <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                    {t('health_tracker.dependent_end_date') || 'End Date'}
                                </Text>
                                <CustomDateTimePicker
                                    value={endDate}
                                    onChange={(date) => setEndDate(date as string)}
                                    placeholder={t('health_tracker.dependent_end_date') || 'Select End Date'}
                                    mode="date"
                                    displayFormat="MM/DD/YYYY"
                                />
                            </View>
                        )}

                         {/* Blood Type Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                {t('health_tracker.blood_type')}
                            </Text>
                            <CustomDropDown
                                options={BLOOD_TYPE_OPTIONS}
                                value={bloodType}
                                onSelect={handleBloodTypeSelect}
                                placeholder={t('common.select')}
                                search={true}
                                leftIcon={true}
                                style={styles.dropdown}
                            />
                        </View>

                        {/* Key Diagnosis */}
                        <View onLayout={e => { keyDiagnosisY.current = e.nativeEvent.layout.y; }}>
                            <CustomInput
                                label={t('health_tracker.key_diagnosis')}
                                placeholder={t('health_tracker.key_diagnosis')}
                                value={keyDiagnosis}
                                onChangeText={setKeyDiagnosis}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                containerStyle={styles.inputContainer}
                                inputContainerStyle={styles.textAreaContainer}
                                inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                labelStyle={{ textAlign: 'left' }}
                                onFocus={() => scrollToY(keyDiagnosisY.current)}
                            />
                        </View>

                        {/* Allergies */}
                        <View onLayout={e => { allergiesY.current = e.nativeEvent.layout.y; }}>
                            <CustomInput
                                label={t('health_tracker.allergies')}
                                placeholder={t('health_tracker.allergies')}
                                value={allergies}
                                onChangeText={setAllergies}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                containerStyle={styles.inputContainer}
                                inputContainerStyle={styles.textAreaContainer}
                                inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                labelStyle={{ textAlign: 'left' }}
                                onFocus={() => scrollToY(allergiesY.current)}
                            />
                        </View>

                        {/* Recent Surgeries / Hospitalizations */}
                        <View onLayout={e => { recentSurgeriesY.current = e.nativeEvent.layout.y; }}>
                            <CustomInput
                                label={t('health_tracker.recent_surgeries')}
                                placeholder={t('health_tracker.recent_surgeries')}
                                value={recentSurgeries}
                                onChangeText={setRecentSurgeries}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                containerStyle={styles.inputContainer}
                                inputContainerStyle={styles.textAreaContainer}
                                inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                                labelStyle={{ textAlign: 'left' }}
                                onFocus={() => scrollToY(recentSurgeriesY.current)}
                            />
                        </View>
                        <RecordNotesField notes={recordNotes} />
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title={isLoading ? t('common.loading') : t('common.save_changes')}
                        onPress={handleSaveChanges}
                        buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                        disabled={isLoading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditOverView;
