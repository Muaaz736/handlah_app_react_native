import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { setCurrentStep, resetNewOnboarding } from '../../../../redux/slices/newOnboardingSlice';
import Step00SetupChoice from '../steps/Step00-SetupChoice/Step00-SetupChoice';
import Step01LifeLookLike1 from '../steps/Step01-LifeLookLike1/Step01-LifeLookLike1';
import Step02LifeLookLike2 from '../steps/Step02-LifeLookLike2/Step02-LifeLookLike2';
import Step03FrustrationReminder from '../steps/Step03-FrustrationReminder/Step03-FrustrationReminder';
import Step04AddData from '../steps/Step04-AddData/Step04-AddData';
import Step05Dashboard from '../steps/Step05-Dashboard/Step05-Dashboard';
import { AppDispatch } from '../../../../types/store.types';
import { makeCommonStyles } from '../../OnBoardingScreen.styles';
import { NewOnboardingContainerProps } from './NewOnboardingContainer.types';
import { useUserRole } from '../../../../hooks/useUserRole';

const NewOnboardingContainer: React.FC<NewOnboardingContainerProps> = ({
  onComplete,
}) => {
  const { themeColors } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const currentStep = useSelector(
    (state: any) => state.newOnboarding_slice?.currentStep ?? 0
  );

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      dispatch(setCurrentStep(currentStep - 1));
    }
  }, [currentStep, dispatch, navigation]);

  const handleContinue = useCallback(() => {
    // Step change is handled by individual components via Redux
  }, []);

  const handleComplete = useCallback(() => {
    // Reset the onboarding state
    dispatch(resetNewOnboarding());

    // Call the completion callback if provided
    if (onComplete) {
      onComplete();
    } else {
      // Navigate back to home or wherever
      navigation.goBack();
    }
  }, [dispatch, navigation, onComplete]);

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step00SetupChoice onContinue={handleContinue} />
        );
      case 1:
        return (
          <Step01LifeLookLike1
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step02LifeLookLike2
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step03FrustrationReminder
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step04AddData
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step05Dashboard
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

export default NewOnboardingContainer;
