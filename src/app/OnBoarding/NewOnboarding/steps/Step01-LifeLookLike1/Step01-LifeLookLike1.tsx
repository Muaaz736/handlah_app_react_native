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
import { makeStep01LifeLookLike1Styles, ITEM_WIDTH } from './Step01-LifeLookLike1.styles';
import { LifeOption } from './Step01-LifeLookLike1.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const NewOnboardingStep01: React.FC<{
    onContinue: () => void;
    onBack: () => void;
}> = ({ onContinue, onBack }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeStep01LifeLookLike1Styles(themeColors as RoleTheme), [themeColors]);

    const lifeSelections = useSelector(
        (state: any) => state.newOnboarding_slice?.lifeSelections || []
    );

    const options: LifeOption[] = [
        {
            id: 'own-house',
            title: t('onboarding.life.own_house'),
            subtitle: t('onboarding.life.own_house_desc'),
            icon: require('../../../../../assets/images/icons/real-estate.png'),
        },
        {
            id: 'own-vehicle',
            title: t('onboarding.life.own_vehicle'),
            subtitle: t('onboarding.life.own_vehicle_desc'),
            icon: require('../../../../../assets/images/icons/vehicle.png'),
        },
        {
            id: 'cards-loans',
            title: t('onboarding.life.cards_loans'),
            subtitle: t('onboarding.life.cards_loans_desc'),
            icon: require('../../../../../assets/images/icons/wallet.png'),
        },
        {
            id: 'health-records',
            title: t('onboarding.life.health_records'),
            subtitle: t('onboarding.life.health_records_desc'),
            icon: require('../../../../../assets/images/icons/health_tracker.png'),
        },
        {
            id: 'own-pet',
            title: t('onboarding.life.own_pet'),
            subtitle: t('onboarding.life.own_pet_desc'),
            icon: require('../../../../../assets/images/icons/pets.png'),
        },
        {
            id: 'business',
            title: t('onboarding.life.business'),
            subtitle: t('onboarding.life.business_desc'),
            icon: require('../../../../../assets/images/icons/business.png'),
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
            dispatch(setCurrentStep(2));
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
                            Step 01 of 05
                        </Text>
                    </View>
                </View>
                <View style={commonStyles.progressBar}>
                    <View style={[commonStyles.progressFill, { width: '20%', backgroundColor: themeColors.primary }]} />
                </View>

                {/* Title */}
                <View style={commonStyles.titleSection}>
                    <Text style={[commonStyles.mainTitle, { color: colors.text }]}>
                        {t('onboarding.life.title')}
                    </Text>
                    <Text style={[commonStyles.subtitle, { color: colors.placeholder }]}>
                        {t('onboarding.life.subtitle')}
                    </Text>
                </View>

                {/* Options Grid */}
                <View style={styles.gridContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionCard,
                                lifeSelections.includes(option.id) && {
                                    borderColor: themeColors.secondary + '60',
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
                            <Text style={[styles.optionSubtitle, { color: colors.text }]}>
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
                        styles.continueButton,
                        lifeSelections.length > 0 && { backgroundColor: themeColors.primary },
                        lifeSelections.length === 0 && { backgroundColor: colors.placeholder + '50' },
                    ]}
                    onPress={handleContinue}
                    disabled={lifeSelections.length === 0}
                >
                    <Text style={styles.buttonText}>
                        {t('common.continue')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default NewOnboardingStep01;
