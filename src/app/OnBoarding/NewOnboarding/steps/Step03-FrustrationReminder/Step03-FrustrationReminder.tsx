import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    setFrustrationSelections,
    setReminderPreferences,
    setCurrentStep,
} from '../../../../../redux/slices/newOnboardingSlice';
import { useUserRole } from '../../../../../hooks/useUserRole';
import colors from '../../../../../utils/colors';
import { AuthHeader } from '../../../../../components/common';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppDispatch } from '../../../../../types/store.types';
import { submitOnboardingAsync } from '../../../../../redux/services/onboardingService';
import { buildPersonalPayload } from '../../../../../utils/onboardingTransforms';
import { makeCommonStyles } from '../../../OnBoardingScreen.styles';
import { makeStep03FrustrationReminderStyles } from './Step03-FrustrationReminder.styles';
import { SelectionOption } from './Step03-FrustrationReminder.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const NewOnboardingStep03: React.FC<{
    onContinue: () => void;
    onBack: () => void;
}> = ({ onContinue, onBack }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeStep03FrustrationReminderStyles(themeColors as RoleTheme), [themeColors]);

    const frustrations = useSelector(
        (state: any) => state.newOnboarding_slice?.frustrationSelections || []
    );
    const reminderPrefs = useSelector(
        (state: any) => state.newOnboarding_slice?.reminderPreferences || []
    );
    const lifeSelections = useSelector(
        (state: any) => state.newOnboarding_slice?.lifeSelections || []
    );

    const frustrationOptions: SelectionOption[] = [
        {
            id: 'missing-dates',
            title: t('onboarding.frustration.missing_dates'),
            subtitle: t('onboarding.frustration.missing_dates_desc'),
            icon: require('../../../../../assets/images/icons/clock.png'),
        },
        {
            id: 'finding-things',
            title: t('onboarding.frustration.finding_things'),
            subtitle: t('onboarding.frustration.finding_things_desc'),
            icon: require('../../../../../assets/images/icons/search.png'),
        },
        {
            id: 'too-many-systems',
            title: t('onboarding.frustration.too_many'),
            subtitle: t('onboarding.frustration.too_many_desc'),
            icon: require('../../../../../assets/images/icons/too_many_systems.png'),
        },
        {
            id: 'no-emergency-ready',
            title: t('onboarding.frustration.emergency'),
            subtitle: t('onboarding.frustration.emergency_desc'),
            icon: require('../../../../../assets/images/icons/emergency.png'),
        },
        {
            id: 'family-admin',
            title: t('onboarding.frustration.family'),
            subtitle: t('onboarding.frustration.family_desc'),
            icon: require('../../../../../assets/images/icons/family.png'),
        },
        {
            id: 'business-stress',
            title: t('onboarding.frustration.business'),
            subtitle: t('onboarding.frustration.business_desc'),
            icon: require('../../../../../assets/images/icons/business.png'),
        },
    ];

    const reminderOptions: SelectionOption[] = [
        {
            id: 'aggressive',
            title: t('onboarding.reminder.aggressive'),
            subtitle: t('onboarding.reminder.aggressive_desc'),
            icon: require('../../../../../assets/images/icons/aggressive.png'),
        },
        {
            id: 'balanced',
            title: t('onboarding.reminder.balanced'),
            subtitle: t('onboarding.reminder.balanced_desc'),
            icon: require('../../../../../assets/images/icons/balance.png'),
        },
        {
            id: 'minimal',
            title: t('onboarding.reminder.minimal'),
            subtitle: t('onboarding.reminder.minimal_desc'),
            icon: require('../../../../../assets/images/icons/layers.png'),
        },
        {
            id: 'silent',
            title: t('onboarding.reminder.silent'),
            subtitle: t('onboarding.reminder.silent_desc'),
            icon: require('../../../../../assets/images/icons/silent.png'),
        },
    ];

    const handleToggleFrustration = useCallback((id: string) => {
        const newFrustrations = frustrations.includes(id)
            ? frustrations.filter((s: string) => s !== id)
            : [...frustrations, id];
        dispatch(setFrustrationSelections(newFrustrations));
    }, [frustrations, dispatch]);

    const handleToggleReminder = useCallback((id: string) => {
        const newReminders = reminderPrefs.includes(id)
            ? reminderPrefs.filter((s: string) => s !== id)
            : [...reminderPrefs, id];
        dispatch(setReminderPreferences(newReminders));
    }, [reminderPrefs, dispatch]);

    const handleContinue = useCallback(() => {
        if (frustrations.length > 0 && reminderPrefs.length > 0) {
            const payload = buildPersonalPayload(lifeSelections, frustrations, reminderPrefs);
            dispatch(submitOnboardingAsync(payload)).catch(() => {});
            dispatch(setCurrentStep(4));
            onContinue();
        }
    }, [lifeSelections, frustrations, reminderPrefs, dispatch, onContinue]);

    return (
        <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[commonStyles.scrollContent, { paddingBottom: 0 }]}
                showsVerticalScrollIndicator={false}
            >
                <AuthHeader
                    onBackPress={onBack}
                    backButtonIconStyle={{ tintColor: colors.black }}
                    containerStyle={{ marginBottom: -30 }}
                />
                {/* Header */}
                <View style={commonStyles.header}>
                    <Text style={commonStyles.pageTitle}>
                        Personal
                    </Text>
                    <View style={[commonStyles.progressBadge, { backgroundColor: themeColors.primary }]}>
                        <Text style={[commonStyles.progressText, { color: colors.background }]}>
                            Step 03 of 05
                        </Text>
                    </View>
                </View>
                <View style={commonStyles.progressBar}>
                    <View style={[commonStyles.progressFill, { width: '60%', backgroundColor: themeColors.primary }]} />
                </View>

                {/* Title */}
                <View style={commonStyles.titleSection}>
                    <Text style={[commonStyles.mainTitle, { color: colors.text }]}>
                        {t('onboarding.life.title')}
                    </Text>
                    <Text style={[commonStyles.subtitle, { color: colors.text }]}>
                        {t('onboarding.life.subtitle')}
                    </Text>
                </View>

                {/* Frustrations Section */}
                <View style={[styles.section, styles.sectionCard]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('onboarding.frustration.title')}
                    </Text>
                    <View style={styles.gridContainer}>
                        {frustrationOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionCard,
                                    frustrations.includes(option.id) && {
                                        borderColor: themeColors.primary,
                                        borderWidth: 2,
                                        backgroundColor: themeColors.primary + '10',
                                    },
                                ]}
                                onPress={() => handleToggleFrustration(option.id)}
                            >
                                <View style={styles.iconContainer}>
                                    <Image source={option.icon} style={{ width: 32, height: 32, tintColor: themeColors.secondary + "95" }} resizeMode="contain" />
                                </View>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {option.title}
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.text }]}>
                                    {option.subtitle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reminders Section */}
                <View style={[styles.section, styles.sectionCard, { marginTop: 32 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('onboarding.reminder.title')}
                    </Text>
                    <View style={styles.gridContainer}>
                        {reminderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionCard,
                                    reminderPrefs.includes(option.id) && {
                                        borderColor: themeColors.primary,
                                        borderWidth: 2,
                                        backgroundColor: themeColors.primary + '10',
                                    },
                                ]}
                                onPress={() => handleToggleReminder(option.id)}
                            >
                                <View style={styles.iconContainer}>
                                    <Image source={option.icon} style={{ width: 36, height: 36, tintColor: themeColors.secondary + "95" }} resizeMode="contain" />
                                </View>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {option.title}
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.text }]}>
                                    {option.subtitle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.backButtonFooter,
                        { borderColor: colors.border || '#e0e0e0' },
                    ]}
                    onPress={onBack}
                >
                    <Text style={[commonStyles.backButtonText, { color: colors.text }]}>
                        {t('common.back') || 'Back'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        frustrations.length > 0 && reminderPrefs.length > 0 && { backgroundColor: themeColors.primary },
                        (frustrations.length === 0 || reminderPrefs.length === 0) && { backgroundColor: colors.placeholder + '50' },
                    ]}
                    onPress={handleContinue}
                    disabled={frustrations.length === 0 || reminderPrefs.length === 0}
                >
                    <Text style={styles.buttonText}>
                        {t('common.continue') || 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default NewOnboardingStep03;
