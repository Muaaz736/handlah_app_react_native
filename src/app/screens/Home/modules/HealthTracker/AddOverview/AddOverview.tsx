import React, { useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    KeyboardAvoidingView,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useUserRole } from '../../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../../utils/helpers';
import { AuthHeader, CustomDropDown, CustomInput, PrimaryButton } from '../../../../../../components/common';
import colors from '../../../../../../utils/colors';
import FONTS from '../../../../../../utils/fonts';
import { AddOverviewFormData, BLOOD_TYPE_OPTIONS } from './AddOverview.types';

const AddOverview: React.FC = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { themeColors } = useUserRole();

    const [bloodType, setBloodType] = useState<string>('');
    const [keyDiagnosis, setKeyDiagnosis] = useState<string>('');
    const [allergies, setAllergies] = useState<string>('');
    const [recentSurgeries, setRecentSurgeries] = useState<string>('');

    // Wrapper function for dropdown handler
    const handleBloodTypeSelect = (value: string | string[] | null) => {
        if (typeof value === 'string') {
            setBloodType(value);
        } else if (value === null) {
            setBloodType('');
        }
    };

    const handleAddOverview = () => {
        const overviewData: AddOverviewFormData = {
            bloodType,
            keyDiagnosis,
            allergies,
            recentSurgeries,
        };
        navigation.goBack();
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
                />

                <ScrollView
                    style={commonStyles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={[styles.title, { textAlign: 'left' }]}>
                        {t('health_tracker.add_overview')}
                    </Text>

                    <View style={commonStyles.formContainer}>
                        {/* Blood Type Dropdown */}
                        <View style={styles.inputGroup}>
                            <Text style={[commonStyles.label, { textAlign: 'left' }]}>
                                {t('health_tracker.blood_type')}
                            </Text>
                            <CustomDropDown
                                options={BLOOD_TYPE_OPTIONS}
                                value={bloodType}
                                onSelect={handleBloodTypeSelect}
                                placeholder={t('health_tracker.select_blood_type')}
                                search={false}
                                leftIcon={true}
                                style={styles.dropdown}
                            />
                        </View>

                        {/* Key Diagnosis */}
                        <CustomInput
                            label={t('health_tracker.key_diagnosis')}
                            placeholder={t('health_tracker.key_diagnosis_placeholder')}
                            value={keyDiagnosis}
                            onChangeText={setKeyDiagnosis}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            containerStyle={styles.inputContainer}
                            inputContainerStyle={styles.textAreaContainer}
                            inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                            labelStyle={{ textAlign: 'left' }}
                        />

                        {/* Allergies */}
                        <CustomInput
                            label={t('health_tracker.allergies')}
                            placeholder={t('health_tracker.allergies_placeholder')}
                            value={allergies}
                            onChangeText={setAllergies}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            containerStyle={styles.inputContainer}
                            inputContainerStyle={styles.textAreaContainer}
                            inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                            labelStyle={{ textAlign: 'left' }}
                        />

                        {/* Recent Surgeries */}
                        <CustomInput
                            label={t('health_tracker.recent_surgeries')}
                            placeholder={t('health_tracker.recent_surgeries_placeholder')}
                            value={recentSurgeries}
                            onChangeText={setRecentSurgeries}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            containerStyle={styles.inputContainer}
                            inputContainerStyle={styles.textAreaContainer}
                            inputStyle={[styles.textAreaInput, { textAlign: 'left' }]}
                            labelStyle={{ textAlign: 'left' }}
                        />
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title={t('common.continue')}
                        onPress={handleAddOverview}
                        buttonStyle={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddOverview;
