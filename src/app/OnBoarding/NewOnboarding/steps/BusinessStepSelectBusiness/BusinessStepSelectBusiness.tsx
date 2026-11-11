import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '../../../../../components/common';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../utils/helpers';
import { ASYNC_STATUS } from '../../../../../config/constants';
import {
    setSelectedBusinessId,
} from '../../../../../redux/slices/businessSlice';
import {
    setBusinessCurrentStep,
} from '../../../../../redux/slices/businessOnboardingSlice';
import { getBusinessesAsync } from '../../../../../redux/services/businessService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles } from '../../../OnBoardingScreen.styles';
import { makeBusinessStepSelectBusinessStyles } from './BusinessStepSelectBusiness.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';

const BusinessStepSelectBusiness: React.FC<{
    onContinue: () => void;
    onBack: () => void;
}> = ({ onContinue, onBack }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeBusinessStepSelectBusinessStyles(themeColors as RoleTheme), [themeColors]);

    const { get_businesses_data, get_businesses_status, selectedBusinessId } = useSelector(
        (state: any) => state.business_slice,
    );
    const businesses: any[] = Array.isArray(get_businesses_data) ? get_businesses_data : [];
    const isLoading = get_businesses_status === ASYNC_STATUS.LOADING;

    // Refresh business list each time screen focuses; auto-select newest on return
    useFocusEffect(
        useCallback(() => {
            dispatch(getBusinessesAsync()).then((result: any) => {
                const list: any[] = result?.payload ?? [];
                if (!Array.isArray(list) || list.length === 0) return;

                // If no business is selected, or the current selection is missing,
                // auto-select the most recently created (last in list)
                const currentlySelected = list.find((b: any) => b.id === selectedBusinessId);
                if (!currentlySelected) {
                    const newest = list[list.length - 1];
                    if (newest?.id) dispatch(setSelectedBusinessId(newest.id));
                }
            });
        }, [dispatch]),
    );

    const handleSelectBusiness = (id: number) => {
        dispatch(setSelectedBusinessId(id));
    };

    const handleAddNew = () => {
        navigation.navigate('AddBusinessDetails', { fromBusinessOnboarding: true });
    };

    const handleContinue = () => {
        dispatch(setBusinessCurrentStep(5));
    };

    return (
        <SafeAreaView style={commonStyles.container}>
            <AuthHeader
                title={t('onboarding.select_business.title', { defaultValue: 'Select Your Business' })}
                onBackPress={onBack}
                containerStyle={{
                    paddingHorizontal: 20,
                    marginBottom: 0,
                    paddingTop: isIOS ? 0 : 20,
                }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.subtitle}>
                    {t('onboarding.select_business.subtitle', {
                        defaultValue: 'Choose the business you want to set up, or create a new one.',
                    })}
                </Text>

                {isLoading ? (
                    <View style={styles.emptyBox}>
                        <ActivityIndicator size="large" color={themeColors.primary} />
                    </View>
                ) : businesses.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Feather name="briefcase" size={40} color={themeColors.primary} />
                        <Text style={styles.emptyTitle}>
                            {t('onboarding.select_business.no_business_title', {
                                defaultValue: 'No Business Found',
                            })}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {t('onboarding.select_business.no_business_subtitle', {
                                defaultValue: "You haven't added a business yet. Create one to get started.",
                            })}
                        </Text>
                    </View>
                ) : (
                    businesses.map((business: any) => {
                        const isSelected = business.id === selectedBusinessId;
                        return (
                            <TouchableOpacity
                                key={business.id}
                                style={[
                                    styles.businessCard,
                                    isSelected && [
                                        styles.businessCardSelected,
                                        { borderColor: themeColors.primary },
                                    ],
                                ]}
                                onPress={() => handleSelectBusiness(business.id)}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.businessIconBox,
                                        { backgroundColor: themeColors.primary + '20' },
                                    ]}
                                >
                                    <Feather name="briefcase" size={22} color={themeColors.primary} />
                                </View>
                                <View style={styles.businessInfo}>
                                    <Text style={styles.businessName} numberOfLines={1}>
                                        {business.businessName || business.name || 'Business'}
                                    </Text>
                                    {(business.description || business.entityType) ? (
                                        <Text style={styles.businessDescription} numberOfLines={2}>
                                            {business.description || business.entityType}
                                        </Text>
                                    ) : null}
                                </View>
                                {isSelected && (
                                    <Feather
                                        name="check-circle"
                                        size={22}
                                        color={themeColors.primary}
                                        style={styles.checkIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}

                {/* Add New Business CTA */}
                <TouchableOpacity
                    style={[styles.addNewButton, { borderColor: themeColors.primary }]}
                    onPress={handleAddNew}
                    activeOpacity={0.8}
                >
                    <Feather name="plus-circle" size={20} color={themeColors.primary} />
                    <Text style={[styles.addNewText, { color: themeColors.primary }]}>
                        {t('onboarding.select_business.add_new', { defaultValue: 'Create New Business' })}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        {
                            backgroundColor: themeColors.primary,
                            opacity: !selectedBusinessId ? 0.5 : 1,
                        },
                    ]}
                    onPress={handleContinue}
                    disabled={!selectedBusinessId}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>
                        {t('onboarding.common.continue', { defaultValue: 'Continue' })}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default BusinessStepSelectBusiness;
