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
    setBusinessLifeSelections,
    setBusinessCurrentStep,
} from '../../../../../redux/slices/businessOnboardingSlice';
import { useUserRole } from '../../../../../hooks/useUserRole';
import colors from '../../../../../utils/colors';
import { AuthHeader } from '../../../../../components/common';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppDispatch } from '../../../../../types/store.types';
import { submitOnboardingAsync } from '../../../../../redux/services/onboardingService';
import { buildBusinessPayload } from '../../../../../utils/onboardingTransforms';
import { makeCommonStyles } from '../../../OnBoardingScreen.styles';
import { makeBusinessStep01Styles, ITEM_WIDTH } from './BusinessStep01.styles';
import { LifeOption } from './BusinessStep01.types';

const BusinessStep01: React.FC<{
    onContinue: () => void;
    onBack: () => void;
}> = ({ onContinue, onBack }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors), [themeColors]);
    const styles = useMemo(() => makeBusinessStep01Styles(themeColors), [themeColors]);

    const lifeSelections = useSelector(
        (state: any) => state.businessOnboarding_slice?.lifeSelections || []
    );

    const options: LifeOption[] = [
        {
            id: 'own-house',
            title: 'Own a house',
            subtitle: 'Mortgage, utilities, property records',
            icon: require('../../../../../assets/images/icons/real-estate.png'),
        },
        {
            id: 'own-vehicle',
            title: 'Own a vehicle',
            subtitle: 'Registration, service, insurance',
            icon: require('../../../../../assets/images/icons/vehicle.png'),
        },
        {
            id: 'cards-loans',
            title: 'Cards / loans',
            subtitle: 'Payments, due dates, accounts',
            icon: require('../../../../../assets/images/icons/wallet.png'),
        },
        {
            id: 'documents',
            title: 'Documents',
            subtitle: 'Upload multiple legal documents',
            icon: require('../../../../../assets/images/icons/notes_icons.png'),
        },
        {
            id: 'projects',
            title: 'Projects',
            subtitle: 'Manage multiple projects & link to client',
            icon: require('../../../../../assets/images/icons/projects_icon.png'),
        },
        {
            id: 'business-contacts',
            title: 'Business Contacts',
            subtitle: 'Licenses, subscriptions, compliance',
            icon: require('../../../../../assets/images/icons/business_contact.png'),
        },
    ];

    const handleToggleOption = useCallback((id: string) => {
        const newSelections = lifeSelections.includes(id)
            ? lifeSelections.filter((s: string) => s !== id)
            : [...lifeSelections, id];
        dispatch(setBusinessLifeSelections(newSelections));
    }, [lifeSelections, dispatch]);

    const handleContinue = useCallback(() => {
        if (lifeSelections.length > 0) {
            const payload = buildBusinessPayload(lifeSelections, [], []);
            dispatch(submitOnboardingAsync(payload)).catch(() => {});
            dispatch(setBusinessCurrentStep(2));
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
                        Business
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
                                <Image
                                    source={option.icon}
                                    style={{ width: 32, height: 32, tintColor: themeColors.secondary + '95' }}
                                    resizeMode="contain"
                                />
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
                        lifeSelections.length > 0
                            ? { backgroundColor: themeColors.primary }
                            : { backgroundColor: colors.placeholder + '50' },
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

export default BusinessStep01;
