import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { makeChooseSubscriptionPlanStyles } from './SubscriptionPlan.styles';
import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, PrimaryButton } from '../../../../../components/common';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../utils/helpers';
import { ChooseSubscriptionPlanNavigationProp, PlanType } from './SubscriptionPlan.types';
import { USER_SUBSCRIPTION_PLANS } from '../../../../../utils/staticData';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { usePurchases } from '../../../../../services/purchases/PurchasesProvider';

const ChooseSubscriptionPlan: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<ChooseSubscriptionPlanNavigationProp>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeChooseSubscriptionPlanStyles(themeColors as RoleTheme), [themeColors]);
  const { openPaywall } = usePurchases();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(USER_SUBSCRIPTION_PLANS.PREMIUM );

  const features: string[] = [
    t('choose_subscription_plan.feature_1'),
    t('choose_subscription_plan.feature_2'),
    t('choose_subscription_plan.feature_3'),
    t('choose_subscription_plan.feature_4'),
    t('choose_subscription_plan.feature_5'),
  ];

  const handleContinue = async (): Promise<void> => {
    const outcome = await openPaywall();
    if (outcome === 'purchased' || outcome === 'restored') {
      navigation.goBack();
    }
  };

  const isFreePlan: boolean = selectedPlan === USER_SUBSCRIPTION_PLANS.FREE;

  return (
    <ScreenWrapper
      scrollable
      showShadow={false}
      containerStyle={{ paddingHorizontal: 16 }}
    >
      <View style={styles.container}>
        <AuthHeader
          title={t('choose_subscription_plan.title')}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
        />

        <View style={styles.content}>
          {/* Free Plan Option */}
          <TouchableOpacity
            style={[styles.planOption, isFreePlan && styles.premiumPlan]}
            onPress={() => setSelectedPlan('free')}
            activeOpacity={0.7}
          >
            <View style={styles.planContent}>
              <View style={styles.planRadio}>
                {isFreePlan && <View style={styles.planRadioInner} />}
              </View>
              <Text
                style={[styles.planName, isFreePlan && styles.activePlanText]}
              >
                {t('choose_subscription_plan.free_plan')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Premium Plan Option */}
          <TouchableOpacity
            style={[styles.planOption, !isFreePlan && [styles.premiumPlan, { backgroundColor: themeColors.darkGreen }]]}
            onPress={() => setSelectedPlan('premium')}
            activeOpacity={0.7}
          >
            <View style={styles.planContent}>
              <View style={styles.planRadio}>
                {!isFreePlan && <View style={[styles.planRadioInner, { backgroundColor: themeColors.darkGreen }]} />}
              </View>
              <Text
                style={[styles.planName, !isFreePlan && styles.activePlanText]}
              >
                {t('choose_subscription_plan.premium_pro')}
              </Text>
            </View>
            <Text
              style={[styles.planPrice, !isFreePlan && styles.activePlanText]}
            >
              {t('choose_subscription_plan.price')}
            </Text>
          </TouchableOpacity>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>{t('choose_subscription_plan.features_included')}</Text>

            {features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.checkIconContainer}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Continue Button */}
          <PrimaryButton
            title={t('choose_subscription_plan.continue_to_payment')}
            onPress={handleContinue}
            buttonStyle={[styles.continueButton, { backgroundColor: themeColors.darkGreen }]}
            textStyle={styles.continueButtonText}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ChooseSubscriptionPlan;
