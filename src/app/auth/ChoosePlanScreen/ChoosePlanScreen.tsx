import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AuthHeader, PrimaryButton, RadioButton } from '../../../components/common';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import type {
  PlanType,
  FeatureList,
} from '../../../types/authTypes/ChoosePlanScreen.types';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../config/constants';
import { showErrorAlert } from '../../../utils/AlertHelper';
import { subscribePlanAsync } from '../../../redux/services/authService';
import { isIOS } from '../../../utils/helpers';
import { USER_SUBSCRIPTION_PLANS } from '../../../utils/staticData';
import { makeChoosePlanStyles } from './ChoosePlanScreen.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const ChoosePlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeChoosePlanStyles(themeColors as RoleTheme), [themeColors]);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(USER_SUBSCRIPTION_PLANS.PREMIUM);

  const { subscribe_plan_status } = useSelector(
    (state: any) => state.user_auth,
  );

  const isLoading = subscribe_plan_status === ASYNC_STATUS.LOADING;

  // Handle back button press
  useEffect(() => {
    // Disable iOS swipe back gesture
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
    });

    // Handle Android hardware back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        showErrorAlert(t('common.complete_plan_selection'));
        return true; // prevent default back action
      },
    );

    return () => backHandler.remove();
  }, [navigation, t]);

  const handleBackPress = () => {
    showErrorAlert(t('common.complete_plan_selection'));
  };

  const handleContinue = async () => {
    try {
      const result = await dispatch(subscribePlanAsync()).unwrap();
      navigation.navigate('PrivacyHealthData' as never);
    } catch (error) {
      // Error toast is already shown by slice
    }
  };
  const freeFeatures: FeatureList = [
    t('choose_plan.free_feature_1'),
    t('choose_plan.free_feature_2'),
    t('choose_plan.free_feature_3'),
  ];

  const premiumFeatures: FeatureList = [
    t('choose_plan.premium_feature_1'),
    t('choose_plan.premium_feature_2'),
    t('choose_plan.premium_feature_3'),
    t('choose_plan.premium_feature_4'),
    t('choose_plan.premium_feature_5'),
  ];

  const features: FeatureList =
    selectedPlan === USER_SUBSCRIPTION_PLANS.PREMIUM ? premiumFeatures : freeFeatures;

  const isFreePlan: boolean = selectedPlan === USER_SUBSCRIPTION_PLANS.FREE;


  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          <AuthHeader
            title={t('choose_plan.choose_plan')}
            onBackPress={handleBackPress}
            showBackButton={true}
          />

          <View style={styles.plansContainer}>
            {/* Free Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                isFreePlan && styles.planCardPremium,
                isFreePlan && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
              ]}
              onPress={() => setSelectedPlan(USER_SUBSCRIPTION_PLANS.FREE)}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <RadioButton
                  selected={isFreePlan}
                  onPress={() => setSelectedPlan(USER_SUBSCRIPTION_PLANS.FREE)}
                  size={24}
                  borderColor={colors.border}
                  selectedBorderColor={themeColors.primary}
                  outerBackgroundColor={colors.white}
                  fillColor={themeColors.primary}
                  innerSizeRatio={0.5}
                  containerStyle={styles.radioSpacing}
                />
                <Text style={[styles.planTitle, isFreePlan && styles.planTitlePremium]}>
                  {' '}
                  {t('choose_plan.free_plan')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Premium Pro Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                !isFreePlan && styles.planCardPremium,
                !isFreePlan && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
              ]}
              onPress={() => setSelectedPlan(USER_SUBSCRIPTION_PLANS.PREMIUM)}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <RadioButton
                  selected={!isFreePlan}
                  onPress={() => setSelectedPlan(USER_SUBSCRIPTION_PLANS.PREMIUM)}
                  size={24}
                  borderColor={colors.border}
                  selectedBorderColor={themeColors.primary}
                  outerBackgroundColor={colors.white}
                  fillColor={themeColors.primary}
                  innerSizeRatio={0.5}
                  containerStyle={styles.radioSpacing}
                />
                <Text style={[styles.planTitle, !isFreePlan && styles.planTitlePremium]}>
                  {t('choose_plan.premium_plan')}
                </Text>
                <Text style={[styles.planPrice, !isFreePlan && styles.planTitlePremium]}> {t('choose_plan.price')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>
              {' '}
              {t('choose_plan.features_title')}
            </Text>

            {features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <PrimaryButton
          title={t('choose_plan.continue_payment')}
          onPress={handleContinue}
          loading={isLoading}
          disabled={isLoading}
          textStyle={{ color: colors.white }}
          buttonStyle={{ borderRadius: 40, backgroundColor: themeColors.primary }}
        />
      </View>
    </View>
  );
};

export default ChoosePlanScreen;
