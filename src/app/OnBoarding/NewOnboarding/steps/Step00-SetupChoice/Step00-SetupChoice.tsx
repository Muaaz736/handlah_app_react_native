import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setSetupChoice, setCurrentStep } from '../../../../../redux/slices/newOnboardingSlice';
import { useUserRole } from '../../../../../hooks/useUserRole';
import colors from '../../../../../utils/colors';
import Feather from 'react-native-vector-icons/Feather';
import { AuthHeader } from '../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppDispatch } from '../../../../../types/store.types';
import { makeStep00SetupChoiceStyles } from './Step00-SetupChoice.styles';
import { SetupChoiceOption } from './Step00-SetupChoice.types';
import { makeCommonStyles } from '../../../OnBoardingScreen.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';

const NewOnboardingStep00: React.FC<{
    onContinue: () => void;
}> = ({ onContinue }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeStep00SetupChoiceStyles(themeColors as RoleTheme), [themeColors]);
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const navigation = useNavigation<any>();

    const setupChoice = useSelector((state: any) => state.newOnboarding_slice?.setupChoice);
    const { personalComplete, businessComplete } = useSelector((state: any) => state.onboarding_slice);

    const options: SetupChoiceOption[] = [];

    if (!personalComplete) {
        options.push({
            id: 'personal',
            title: t('onboarding.setup.personal'),
            description: t('onboarding.setup.personal_desc'),
        });
    }

    if (!businessComplete) {
        options.push({
            id: 'business',
            title: t('onboarding.setup.business'),
            description: t('onboarding.setup.business_desc'),
        });
    }

    if (!personalComplete && !businessComplete) {
        options.push({
            id: 'both',
            title: t('onboarding.setup.both'),
            description: t('onboarding.setup.both_desc'),
        });
    }

    const handleSelectOption = useCallback((option: 'personal' | 'business' | 'both') => {
        dispatch(setSetupChoice(option));
    }, [dispatch]);

    const handleContinue = useCallback(() => {
        if (setupChoice) {
            if (setupChoice === 'business') {
                // Business-only: jump straight to business onboarding flow
                navigation.navigate('BusinessOnboarding');
            } else {
                // Personal or Both: start personal steps first
                dispatch(setCurrentStep(1));
                onContinue();
            }
        }
    }, [setupChoice, dispatch, onContinue, navigation]);

    return (
        <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <AuthHeader
                    onBackPress={() => navigation.goBack()}
                    backButtonIconStyle={{ tintColor: colors.black }}
                />

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={[styles.mainTitle, { color: colors.text }]}>
                        {t('onboarding.setup.title')}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.text }]}>
                        {t('onboarding.setup.subtitle') || ''}
                    </Text>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionCard,
                                setupChoice === option.id && {
                                    borderColor: themeColors.primary,
                                    borderWidth: 2,
                                    backgroundColor: themeColors.primary + '10',
                                },
                            ]}
                            onPress={() => handleSelectOption(option.id)}
                        >
                            <View style={styles.optionHeader}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {option.title}
                                </Text>
                            </View>
                            <Text style={[styles.optionDescription, { color: colors.text }]}>
                                {option.description}
                            </Text>
                            {setupChoice === option.id && (
                                <View
                                    style={[
                                        styles.checkmark,
                                        { backgroundColor: themeColors.primary },
                                    ]}
                                >
                                    <Feather
                                        name="check"
                                        size={16}
                                        color={colors.background}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        setupChoice && { backgroundColor: themeColors.primary },
                        !setupChoice && { backgroundColor: colors.placeholder + '50' },
                    ]}
                    onPress={handleContinue}
                    disabled={!setupChoice}
                >
                    <Text style={styles.buttonText}>
                        {t('common.continue') || 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default NewOnboardingStep00;
