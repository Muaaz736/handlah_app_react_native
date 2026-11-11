import React, { useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader } from '../../../components/common';
import CustomFavoriteCard from '../../../components/CustomCards/CustomFavoriteCard';
import colors from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import { ICONS } from '../../../utils/Images';
import { useUserRole } from '../../../hooks/useUserRole';
import { useTutorialContext } from '../../../tutorial/TutorialContext';

type GuideItem = {
  id: string;
  titleKey: string;
  icon: any;
  routeKey: string;
};

type GuideSection = {
  id: string;
  titleKey: string;
  items: GuideItem[];
};

const HOME_ITEM: GuideItem = {
  id: 'home',
  titleKey: 'bottom_nav.home',
  icon: ICONS.HOME_ICON,
  routeKey: 'Home',
};

const REMINDERS_ITEM: GuideItem = {
  id: 'reminders',
  titleKey: 'bottom_nav.reminders',
  icon: ICONS.REMINDERS_ICON,
  routeKey: 'Reminder',
};

const CONNECTIONS_ITEM: GuideItem = {
  id: 'connections',
  titleKey: 'bottom_nav.connections',
  icon: ICONS.CONNECTIONS_ICON,
  routeKey: 'Connections',
};


const PERSONAL_TOP_ITEMS: GuideItem[] = [HOME_ITEM, REMINDERS_ITEM, CONNECTIONS_ITEM];
const BUSINESS_TOP_ITEMS: GuideItem[] = [HOME_ITEM, CONNECTIONS_ITEM, REMINDERS_ITEM];

const PERSONAL_SECTIONS: GuideSection[] = [
  {
    id: 'essentials',
    titleKey: 'user_guide.personal_sections.essentials',
    items: [
      { id: 'identity_hub', titleKey: 'home.essentials.identity_hub.title', icon: ICONS.IDENTITY_HUB_ICON, routeKey: 'IdentityHub' },
      { id: 'social_media', titleKey: 'home.essentials.social_media.title', icon: ICONS.SOCIAL_MEDIA_ICON, routeKey: 'SocialMedia' },
      { id: 'health_tracker', titleKey: 'home.essentials.health_tracker.title', icon: ICONS.HEALTH_TRACKER_ICON, routeKey: 'HealthTracker' },
      { id: 'bookmarks', titleKey: 'home.essentials.bookmarks.title', icon: ICONS.BOOKMARK_ICON, routeKey: 'Bookmarks' },
      { id: 'wallet', titleKey: 'home.essentials.wallet.title', icon: ICONS.WALLET_ICON, routeKey: 'Wallet' },
      { id: 'pets', titleKey: 'home.essentials.pets.title', icon: ICONS.PETS_ICON, routeKey: 'Pets' },
      { id: 'legal', titleKey: 'home.essentials.legal.title', icon: ICONS.LEGAL_ICON, routeKey: 'Legal' },
      { id: 'subscriptions', titleKey: 'home.essentials.subscriptions.title', icon: ICONS.SUBSCRIPTION_ICON, routeKey: 'Subscriptions' },
    ],
  },
  {
    id: 'assets',
    titleKey: 'user_guide.personal_sections.assets',
    items: [
      { id: 'personal_property', titleKey: 'home.assets.personal_property.title', icon: ICONS.PERSONAL_BUILDING_ICON, routeKey: 'PersonalProperty' },
      { id: 'real_estate', titleKey: 'home.assets.real_estate.title', icon: ICONS.REAL_ESTATE_ICON, routeKey: 'RealEstate' },
      { id: 'vehicles', titleKey: 'home.assets.vehicles.title', icon: ICONS.VEHICLE_ICON, routeKey: 'Vehicles' },
      { id: 'banking', titleKey: 'home.assets.banking.title', icon: ICONS.BANKING_FINANCE_ICON, routeKey: 'BankingFinance' },
    ],
  },
  {
    id: 'liabilities',
    titleKey: 'user_guide.personal_sections.liabilities',
    items: [
      { id: 'loans', titleKey: 'home.liabilities.loans.title', icon: ICONS.LOANS_PAYMENT_ICON, routeKey: 'Loans' },
      { id: 'utilities', titleKey: 'home.liabilities.utilities.title', icon: ICONS.UTILITIES_ICON, routeKey: 'Utilities' },
      { id: 'insurance', titleKey: 'home.liabilities.insurance.title', icon: ICONS.INSURANCE_ICON, routeKey: 'Insurance' },
      { id: 'warranties', titleKey: 'home.liabilities.warranties.title', icon: ICONS.WARRENTIES_ICON, routeKey: 'Warranties' },
    ],
  },
];

const BUSINESS_SECTIONS: GuideSection[] = [
  {
    id: 'essentials',
    titleKey: 'user_guide.business_sections.essentials',
    items: [
      { id: 'social_media', titleKey: 'home.essentials.social_media.title', icon: ICONS.SOCIAL_MEDIA_ICON, routeKey: 'SocialMedia' },
      { id: 'bookmarks', titleKey: 'home.essentials.bookmarks.title', icon: ICONS.BOOKMARK_ICON, routeKey: 'Bookmark' },
      { id: 'business_contact', titleKey: 'business.sub_items.business_contacts', icon: ICONS.BUSINESS_CONTACT_ICON, routeKey: 'BusinessContact' },
      { id: 'projects', titleKey: 'business.sub_items.projects', icon: ICONS.PROJECTS_ICON, routeKey: 'Projects' },
      { id: 'legal', titleKey: 'home.essentials.legal.title', icon: ICONS.LEGAL_ICON, routeKey: 'Documents' },
    ],
  },
  {
    id: 'fleet',
    titleKey: 'user_guide.business_sections.fleet',
    items: [
      { id: 'vehicles', titleKey: 'home.assets.vehicles.title', icon: ICONS.VEHICLE_ICON, routeKey: 'Vehicles' },
    ],
  },
  {
    id: 'assets',
    titleKey: 'user_guide.business_sections.assets',
    items: [
      { id: 'real_estate', titleKey: 'home.assets.real_estate.title', icon: ICONS.REAL_ESTATE_ICON, routeKey: 'RealEstate' },
      { id: 'business_property', titleKey: 'home.assets.personal_property.title', icon: ICONS.PERSONAL_BUILDING_ICON, routeKey: 'BusinessProperty' },
      { id: 'banking', titleKey: 'home.assets.banking.title', icon: ICONS.BANKING_FINANCE_ICON, routeKey: 'bankingfinance' },
    ],
  },
  {
    id: 'expenses',
    titleKey: 'user_guide.business_sections.expenses',
    items: [
      { id: 'loans', titleKey: 'home.liabilities.loans.title', icon: ICONS.LOANS_PAYMENT_ICON, routeKey: 'Loans' },
      { id: 'utilities', titleKey: 'home.liabilities.utilities.title', icon: ICONS.UTILITIES_ICON, routeKey: 'Utility' },
      { id: 'insurance', titleKey: 'home.liabilities.insurance.title', icon: ICONS.INSURANCE_ICON, routeKey: 'Insurance' },
      { id: 'warranties', titleKey: 'home.liabilities.warranties.title', icon: ICONS.WARRENTIES_ICON, routeKey: 'Warranties' },
    ],
  },
  {
    id: 'licenses',
    titleKey: 'user_guide.business_sections.licenses',
    items: [
      { id: 'licenses', titleKey: 'business.sub_items.licenses', icon: ICONS.LEGAL_ICON, routeKey: 'Licenses' },
      { id: 'compliance', titleKey: 'business.sub_items.compliance', icon: ICONS.COMPLIANCE_VAULT_ICON, routeKey: 'Legal' },
    ],
  },
];

const { width: screenWidth } = Dimensions.get('window');
const GRID_HORIZONTAL_PADDING = 16;
const GRID_GAP = 12;
const GRID_COLUMNS = 4;
const CARD_SIZE = Math.floor(
  (screenWidth - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS,
);

const UserGuideScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { isBusinessRole, themeColors } = useUserRole();
  const styles = useMemo(
    () => makeStyles(themeColors),
    [themeColors]
  );

  const isBusiness = isBusinessRole();

  const sections = useMemo(
    () => (isBusiness ? BUSINESS_SECTIONS : PERSONAL_SECTIONS),
    [isBusiness],
  );

  const topItems = isBusiness ? BUSINESS_TOP_ITEMS : PERSONAL_TOP_ITEMS;

  const screenTitle = t('user_guide.title');

  // Open the module's guide in the in-app viewer.
  const openGuide = useCallback(
    (routeKey: string, title: string) => {
      navigation.navigate('GuideDetail', { routeKey, title });
    },
    [navigation],
  );

  // Tutorial: spotlight the first module section during the walkthrough. Tapping
  // it opens that module's guide, which advances the tutorial to the final step.
  const { step: tutorialStep, setSpotlightRect, setSpotlightAction } = useTutorialContext();
  const firstSectionRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      if (tutorialStep !== 'spotlight_guide_module') return undefined;
      const timer = setTimeout(() => {
        firstSectionRef.current?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            setSpotlightRect({ x, y, width: w, height: h });
          }
        });
        const firstModule = sections[0]?.items?.[0];
        setSpotlightAction(() => {
          if (firstModule) {
            openGuide(firstModule.routeKey, t(firstModule.titleKey));
          }
        });
      }, 400);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tutorialStep, sections]),
  );

  const renderCard = (item: GuideItem) => (
    <View key={item.id} style={styles.cardWrapper}>
      <CustomFavoriteCard
        item={{ id: item.id, titleKey: item.titleKey, icon: item.icon } as any}
        onPress={() => openGuide(item.routeKey, t(item.titleKey))}
        containerStyle={{ width: CARD_SIZE } as any}
      />
    </View>
  );

  return (
    <ScreenWrapper scrollable showShadow={false}>
      <View style={styles.container}>
        <AuthHeader
          title={screenTitle}
          showBackButton
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.header}
          titleStyle={styles.headerTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        <Text style={styles.subtitle}>{t('user_guide.select_module')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('user_guide.general')}</Text>
          <View style={styles.grid}>{topItems.map(renderCard)}</View>
        </View>

        {sections.map((section, idx) => (
          <View
            key={section.id}
            style={styles.section}
            ref={idx === 0 ? firstSectionRef : undefined}
            collapsable={idx === 0 ? false : undefined}
          >
            <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
            <View style={styles.grid}>{section.items.map(renderCard)}</View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </View>
    </ScreenWrapper>
  );
};

const makeStyles = (themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: GRID_HORIZONTAL_PADDING,
      backgroundColor: themeColors.background,
    },
    header: {
      marginBottom: 8,
      paddingTop: 12,
    },
    headerTitle: {
      fontSize: 22,
      color: themeColors.textPrimary,
    },
    subtitle: {
      fontFamily: FONTS.display_regular,
      color: themeColors.textSecondary,
      fontSize: 13,
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontFamily: FONTS.display_bold,
      fontSize: 16,
      color: themeColors.textPrimary,
      marginBottom: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GRID_GAP,
    },
    cardWrapper: {
      position: 'relative',
    },
  });

export default UserGuideScreen;
