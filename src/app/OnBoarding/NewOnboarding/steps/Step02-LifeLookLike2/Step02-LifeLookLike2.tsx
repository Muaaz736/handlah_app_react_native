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
    setLifeSelections,
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
import { makeStep02LifeLookLike2Styles } from './Step02-LifeLookLike2.styles';
import { LifeOption } from './Step02-LifeLookLike2.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const NewOnboardingStep02: React.FC<{
    onContinue: () => void;
    onBack: () => void;
}> = ({ onContinue, onBack }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeStep02LifeLookLike2Styles(themeColors as RoleTheme), [themeColors]);

    const lifeSelections = useSelector(
        (state: any) => state.newOnboarding_slice?.lifeSelections || []
    );

    const step2Options: LifeOption[] = [
        {
            id: 'bills-payments',
            title: t('onboarding.life2.bills'),
            subtitle: t('onboarding.life2.bills_desc'),
            icon: require('../../../../../assets/images/icons/banking_finance.png'),
        },
        {
            id: 'insurance-policies',
            title: t('onboarding.life2.insurance'),
            subtitle: t('onboarding.life2.insurance_desc'),
            icon: require('../../../../../assets/images/icons/insurance.png'),
        },
        {
            id: 'maintenance',
            title: t('onboarding.life2.maintenance'),
            subtitle: t('onboarding.life2.maintenance_desc'),
            icon: require('../../../../../assets/images/icons/tool.png'),
        },
        {
            id: 'medical-records',
            title: t('onboarding.life2.medical'),
            subtitle: t('onboarding.life2.medical_desc'),
            icon: require('../../../../../assets/images/icons/health_tracker.png'),
        },
        {
            id: 'important-docs',
            title: t('onboarding.life2.docs'),
            subtitle: t('onboarding.life2.docs_desc'),
            icon: require('../../../../../assets/images/icons/notes_icons.png'),
        },
        {
            id: 'compliance',
            title: t('onboarding.life2.compliance'),
            subtitle: t('onboarding.life2.compliance_desc'),
            icon: require('../../../../../assets/images/icons/check.png'),
        },
    ];

    const handleToggleOption = useCallback((id: string) => {
        const newSelections = lifeSelections.includes(id)
            ? lifeSelections.filter((s: string) => s !== id)
            : [...lifeSelections, id];
        dispatch(setLifeSelections(newSelections));
    }, [lifeSelections, dispatch]);

    const handleContinue = useCallback(() => {
        if (lifeSelections.length > 0) {
            const payload = buildPersonalPayload(lifeSelections, [], []);
            dispatch(submitOnboardingAsync(payload)).catch(() => {});
            dispatch(setCurrentStep(3));
            onContinue();
        }
    }, [lifeSelections, dispatch, onContinue]);

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
                            Step 02 of 05
                        </Text>
                    </View>
                </View>
                <View style={commonStyles.progressBar}>
                    <View style={[commonStyles.progressFill, { width: '40%', backgroundColor: themeColors.primary }]} />
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

                {/* Options Grid */}
                <View style={styles.gridContainer}>
                    {step2Options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionCard,
                                lifeSelections.includes(option.id) && {
                                    borderColor: themeColors.primary,
                                    borderWidth: 2,
                                    backgroundColor: themeColors.primary + '10',
                                },
                            ]}
                            onPress={() => handleToggleOption(option.id)}
                        >
                            <View style={styles.iconContainer}>
                                <Image source={option.icon} style={{ width: 32, height: 32, tintColor: themeColors.secondary + "95" }} resizeMode="contain" />
                            </View>
                            <Text style={[styles.optionTitle, { color: colors.text }]}>
                                {option.title}
                            </Text>
                            <Text style={[styles.optionSubtitle, { color: colors.placeholder }]}>
                                {option.subtitle}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
                        lifeSelections.length > 0 && { backgroundColor: themeColors.primary },
                        lifeSelections.length === 0 && { backgroundColor: colors.placeholder + '50' },
                    ]}
                    onPress={handleContinue}
                    disabled={lifeSelections.length === 0}
                >
                    <Text style={styles.buttonText}>
                        {t('common.continue') || 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default NewOnboardingStep02;
