import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { setBusinessCurrentStep, resetBusinessOnboarding } from '../../../../redux/slices/businessOnboardingSlice';
import { setUserRole } from '../../../../redux/slices/userRoleSlice';
import { USER_ROLES } from '../../../../utils/roleManager';
import BusinessStep01 from '../steps/BusinessStep01/BusinessStep01';
import BusinessStep02 from '../steps/BusinessStep02/BusinessStep02';
import BusinessStep03 from '../steps/BusinessStep03/BusinessStep03';
import BusinessStep04 from '../steps/BusinessStep04/BusinessStep04';
import BusinessStep05 from '../steps/BusinessStep05/BusinessStep05';
import BusinessStepSelectBusiness from '../steps/BusinessStepSelectBusiness/BusinessStepSelectBusiness';
import { AppDispatch } from '../../../../types/store.types';
import { makeCommonStyles } from '../../OnBoardingScreen.styles';
import { useUserRole } from '../../../../hooks/useUserRole';

const BusinessOnboardingContainer: React.FC = () => {
    const { themeColors } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();

    const currentStep = useSelector(
        (state: any) => state.businessOnboarding_slice?.currentStep ?? 1
    );

    // Switch to Business role/theme when entering business onboarding
    useEffect(() => {
        dispatch(setUserRole(USER_ROLES.BUSINESS));
    }, [dispatch]);

    const handleBack = useCallback(() => {
        if (currentStep <= 1) {
            // Back to personal flow (going back in navigation stack)
            navigation.goBack();
        } else {
            dispatch(setBusinessCurrentStep(currentStep - 1));
        }
    }, [currentStep, dispatch, navigation]);

    const handleContinue = useCallback(() => {
        // Step changes are handled by individual components via Redux
    }, []);

    const handleComplete = useCallback(() => {
        // Business-only flow complete: reset state, switch back to personal role, go home
        dispatch(resetBusinessOnboarding());
        dispatch(setUserRole(USER_ROLES.PERSONAL));
        navigation.popToTop();
    }, [dispatch, navigation]);

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BusinessStep01
                        onContinue={handleContinue}
                        onBack={handleBack}
                    />
                );
            case 2:
                return (
                    <BusinessStep02
                        onContinue={handleContinue}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <BusinessStep03
                        onContinue={handleContinue}
                        onBack={handleBack}
                    />
                );
            case 4:
                return (
                    <BusinessStepSelectBusiness
                        onContinue={handleContinue}
                        onBack={handleBack}
                    />
                );
            case 5:
                return (
                    <BusinessStep04
                        onContinue={handleContinue}
                        onBack={handleBack}
                    />
                );
            case 6:
                return (
                    <BusinessStep05
                        onBack={handleBack}
                        onComplete={handleComplete}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={commonStyles.container}>
            {renderCurrentStep()}
        </View>
    );
};

export default BusinessOnboardingContainer;
