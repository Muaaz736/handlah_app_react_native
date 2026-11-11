import { Text, View, ScrollView } from 'react-native';
import { makeSubscriptionPlanStyles } from './SubscriptionPlan.styles';
import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader, PrimaryButton } from '../../../../../components/common';
import { getColorWithOpacity } from '../../../../../utils/colors';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../utils/helpers';
import { SubscriptionPlanNavigationProp } from './SubscriptionPlan.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const SubscriptionPlan: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SubscriptionPlanNavigationProp>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeSubscriptionPlanStyles(themeColors as RoleTheme), [themeColors]);

  const features: string[] = [
    t('subscription_plan.feature_1'),
    t('subscription_plan.feature_2'),
    t('subscription_plan.feature_3'),
    t('subscription_plan.feature_4'),
    t('subscription_plan.feature_5'),
  ];

  const handleUpgrade = (): void => {
    navigation.navigate('ChooseSubscriptionPlan' as any);
  };

  return (
    <ScreenWrapper
      scrollable
      showShadow={false}
      containerStyle={{ paddingHorizontal: 16 }}
    >
      <View style={styles.container}>
        <AuthHeader
          title={t('subscription_plan.title')}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
        />

        <View style={styles.content}>
          {/* Current Plan Card */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.currentPlanLabel}>{t('subscription_plan.current_plan')}</Text>
              <View style={[styles.activeBadge, { backgroundColor: getColorWithOpacity(themeColors.darkGreen, 0.1) }]}>
                <Text style={[styles.activeBadgeText, { color: themeColors.darkGreen }]}>{t('subscription_plan.active')}</Text>
              </View>
            </View>

            <Text style={styles.planTitle}>{t('subscription_plan.free_trial')}</Text>
            <Text style={styles.planDuration}>{t('subscription_plan.trial_ends')}</Text>

            <Text style={styles.billingInfo}>
              {t('subscription_plan.billing_info')}
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>{t('subscription_plan.features_included')}</Text>

            {features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.checkIconContainer}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Upgrade Button */}
          <PrimaryButton
            title={t('subscription_plan.upgrade_to_premium')}
            onPress={handleUpgrade}
            buttonStyle={[styles.upgradeButton, { backgroundColor: themeColors.darkGreen }]}
            textStyle={styles.upgradeButtonText}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SubscriptionPlan;
