import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  memo,
  FC,
  ReactElement,
} from 'react';
import { useTutorialContext } from '../../../tutorial/TutorialContext';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ListRenderItem,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  LayoutAnimation,
  UIManager,
  StatusBar,
} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import CustomFavoriteCard from '../../../components/CustomCards/CustomFavoriteCard';
import CustomListItemCard from '../../../components/CustomCards/CustomListItemCard';
import { CustomFloatingActionButton } from '../../../components/common';
import CustomIdentityHubBottomSheet from '../../../components/CustomBottomSheetComps/CustomIdentityHubBottomSheet';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import LinearGradient from 'react-native-linear-gradient';
import FONTS from '../../../utils/fonts';
import {
  ESSENTIALS_DATA,
  DASHBOARD_GROUPS,
} from '../../../utils/staticData';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../hooks/useSubscriptionGate';
import {
  IFavoritesSectionProps,
  IListSectionProps,
  IHomeScreenProps,
  IHomeNavigationItem,
} from './home.types';
import Feather from 'react-native-vector-icons/Feather';
import BottomSheet from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppTabsAsync, getFavoriteTabsAsync } from '../../../redux/services/essentialsService';
import { setFavoriteTabOrder } from '../../../redux/slices/essentialsSlice';
import { getModuleCountsAsync } from '../../../redux/services/homeService';
import { globalSearchAsync } from '../../../redux/services/searchService';
import {
  clearSearchResults,
  SearchResultItem,
} from '../../../redux/slices/searchSlice';
import { useSelectedBusiness } from '../../../hooks/useSelectedBusiness';
import { ASYNC_STATUS } from '../../../config/constants';
import { ICONS } from '../../../utils/Images';
import type {
  ApiAppTabCategory,
  ApiAppTab,
} from '../../../types/reduxTypes/essentialsSlice.types';
import { fabStyles } from '../../../navigation/StackNavigation/Stackstyles';
import { AiFab } from '../../../components/common/AiFab';
import { AppDispatch } from '../../../types/store.types';
import { getOnboardingStatusAsync } from '../../../redux/services/onboardingService';
import { ensureBiometricDeviceRegistered } from '../../../utils/biometricRegistration';
import { useAIDashboardToggle } from '../../../hooks/useAIDashboardToggle';
import InlineAIDashboard from '../../../components/common/InlineAIDashboard';
import crashlytics from '@react-native-firebase/crashlytics';
import { View as RNView } from 'react-native';
import { RoleTheme } from '../../../types/roleManager.types';
import { DashboardBackground, DashboardModeSwitch, GlassSearchBar, TileRows, TileSectionHeader, groupRows, type TileItem } from '../../../components/home/HomeLayout';
import { HOME_BACKGROUND, HOME_TILE_IMAGES, TILE_ICONS } from '../../../components/home/tileImages';
import { useShowFavorites } from '../../../hooks/useHomePreferences';

const { height } = Dimensions.get('window');

const ROUTE_TO_SCREEN: Record<string, string> = {
  '/identity-hub': 'IdentityHub',
  '/social-media': 'SocialMedia',
  '/health-tracker': 'HealthTracker',
  '/bookmarks': 'Bookmarks',
  '/wallet': 'Wallet',
  '/pets': 'Pets',
  '/legal': 'Legal',
  '/subscriptions': 'Subscriptions',
  '/personal-property': 'PersonalProperty',
  '/real-estate': 'RealEstate',
  '/vehicles': 'Vehicles',
  '/banking-finance': 'BankingFinance',
  '/loans': 'Loans',
  '/utilities': 'Utilities',
  '/insurances': 'Insurance',
  '/warranties': 'Warranties',
};

const ROUTE_TO_ICON: Record<string, any> = {
  '/identity-hub': ICONS.IDENTITY_HUB_ICON,
  '/social-media': ICONS.SOCIAL_MEDIA_ICON,
  '/health-tracker': ICONS.HEALTH_TRACKER_ICON,
  '/bookmarks': ICONS.BOOKMARK_ICON,
  '/wallet': ICONS.WALLET_ICON,
  '/pets': ICONS.PETS_ICON,
  '/legal': ICONS.LEGAL_ICON,
  '/subscriptions': ICONS.SUBSCRIPTION_ICON,
  '/personal-property': ICONS.PERSONAL_BUILDING_ICON,
  '/real-estate': ICONS.REAL_ESTATE_ICON,
  '/vehicles': ICONS.VEHICLE_ICON,
  '/banking-finance': ICONS.BANKING_FINANCE_ICON,
  '/loans': ICONS.LOANS_PAYMENT_ICON,
  '/utilities': ICONS.UTILITIES_ICON,
  '/insurances': ICONS.INSURANCE_ICON,
  '/warranties': ICONS.WARRENTIES_ICON,
};

const ROUTE_TO_TITLE_KEY: Record<string, string> = {
  '/identity-hub': 'home.essentials.identity_hub.title',
  '/social-media': 'home.essentials.social_media.title',
  '/health-tracker': 'home.essentials.health_tracker.title',
  '/bookmarks': 'home.essentials.bookmarks.title',
  '/wallet': 'home.essentials.wallet.title',
  '/pets': 'home.essentials.pets.title',
  '/legal': 'home.essentials.legal.title',
  '/subscriptions': 'home.essentials.subscriptions.title',
  '/personal-property': 'home.assets.personal_property.title',
  '/real-estate': 'home.assets.real_estate.title',
  '/vehicles': 'home.assets.vehicles.title',
  '/banking-finance': 'home.assets.banking.title',
  '/loans': 'home.liabilities.loans.title',
  '/utilities': 'home.liabilities.utilities.title',
  '/insurances': 'home.liabilities.insurance.title',
  '/warranties': 'home.liabilities.warranties.title',
};

const HOME_CARD_GAP = 5;
const HOME_CARD_PADDING = 32;
const HOME_CARD_MAX_SIZE = 110;
const getHomeCardSize = (windowWidth: number): number =>
  Math.min(
    Math.round((windowWidth - HOME_CARD_PADDING - HOME_CARD_GAP * 3) / 4),
    HOME_CARD_MAX_SIZE,
  );

const FavoritesSection: FC<IFavoritesSectionProps> = memo(
  ({ data, onManagePress, title, onFavoritePress, onPhoto }) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { themeColors } = useUserRole();
    const { width: windowWidth } = useWindowDimensions();
    const cardSize = getHomeCardSize(windowWidth);

    const handleFavoritePress = useCallback(
      (item: IHomeNavigationItem) => {
        if (onFavoritePress) {
          onFavoritePress(item);
        } else {
          navigation.navigate(item.screenRoute as never);
        }
      },
      [navigation, onFavoritePress],
    );

    const renderFavoriteItem: ListRenderItem<IHomeNavigationItem> = useCallback(
      ({ item }) => (
        <CustomFavoriteCard
          item={item as any}
          onPress={() => handleFavoritePress(item)}
          containerStyle={{ width: cardSize }}
          count={(item as any).count}
        />
      ),
      [handleFavoritePress, cardSize],
    );

    const keyExtractor = useCallback(
      (item: IHomeNavigationItem) => item.id,
      [],
    );

    return (
      <View style={[styles.section, styles.sectionPadding, onPhoto && { marginTop: 0, marginBottom: 12 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: onPhoto ? '#fff' : themeColors.textPrimary }, onPhoto && styles.onPhotoText]}>{title}</Text>
          <TouchableOpacity
            style={[styles.manageButton, { borderColor: onPhoto ? 'rgba(255,255,255,0.85)' : themeColors.primary }, onPhoto && styles.manageOnPhoto]}
            onPress={onManagePress}
          >
            <Text
              style={[styles.manageButtonText, { color: onPhoto ? '#fff' : themeColors.primary }]}
            >
              {t('home.sections.manage')}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          renderItem={renderFavoriteItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.favoritesList}
          style={styles.listContainer}
        />
      </View>
    );
  },
);

FavoritesSection.displayName = 'FavoritesSection';

const ListSection: FC<IListSectionProps> = memo(
  ({ title, data, onItemPress, firstItemRef, theme }) => {
    const renderListItem: ListRenderItem<IHomeNavigationItem> = useCallback(
      ({ item, index }) => (
        <View
          style={styles.listItemPadding}
          ref={index === 0 ? firstItemRef : undefined}
          collapsable={false}
        >
          <CustomListItemCard
            item={item as any}
            onPress={() => onItemPress(item)}
            isLast={index === data.length - 1}
            count={(item as any).count}
            rightIconColor={theme.textPrimary}
          />
        </View>
      ),
      [data.length, onItemPress, firstItemRef],
    );

    const keyExtractor = useCallback(
      (item: IHomeNavigationItem) => item.id,
      [],
    );

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, styles.listSectionTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderListItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
    );
  },
);

ListSection.displayName = 'ListSection';

// Enable LayoutAnimation on Android so the search/switch expand is animated
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HomeScreen: FC<IHomeScreenProps> = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const searchInputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole } = useUserRole();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const { personalComplete, status_status } = useSelector((state: any) => state.onboarding_slice);
  const unseenNotificationCount = useSelector(
    (state: any) => state.notifications_slice?.unseen_count ?? 0,
  );

  // Tutorial
  const {
    step: tutorialStep,
    initialize: initializeTutorial,
    nextStep: nextTutorialStep,
    setSpotlightRect,
    setSpotlightAction,
  } = useTutorialContext();


  const identityHubItemRef = useRef<RNView>(null);
  // Account → Home Screen → Show Favorites.
  const [showFavorites] = useShowFavorites();
  const aiFabRef = useRef<RNView>(null);

  useEffect(() => {
    initializeTutorial();
  }, [initializeTutorial]);

  useEffect(() => {
    ensureBiometricDeviceRegistered(dispatch);
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (tutorialStep === 'spotlight_identity_hub') {
        const t = setTimeout(() => {
          identityHubItemRef.current?.measureInWindow((x, y, w, h) => {
            if (w > 0 && h > 0) {
              setSpotlightRect({ x, y, width: w, height: h });
            }
          });
          setSpotlightAction(() => {
            nextTutorialStep();
            navigation.navigate('IdentityHub' as never);
          });
        }, 350);
        return () => clearTimeout(t);
      }

      if (tutorialStep === 'spotlight_halo_fab') {
        const t = setTimeout(() => {
          aiFabRef.current?.measureInWindow((x, y, w, h) => {
            if (w > 0 && h > 0) {
              setSpotlightRect({ x, y, width: w, height: h });
            }
          });
          setSpotlightAction(() => {
            nextTutorialStep();
            (navigation as any).navigate('Dashboard', { screen: 'AiAssistant' });
          });
        }, 350);
        return () => clearTimeout(t);
      }

      return undefined;
    }, [tutorialStep, setSpotlightRect, setSpotlightAction, navigation, nextTutorialStep]),
  );
  // End tutorial

  const get_app_tabs_data: ApiAppTabCategory[] | null = useSelector(
    (state: any) => state.essentials_slice?.get_app_tabs_data ?? null,
  );

  const get_favorite_tabs_data: ApiAppTab[] | null = useSelector(
    (state: any) => state.essentials_slice?.get_favorite_tabs_data ?? null,
  );

  const favorite_tab_order: string[] | null = useSelector(
    (state: any) => state.essentials_slice?.favorite_tab_order ?? null,
  );

  const onboardingStatusLoading = status_status === ASYNC_STATUS.LOADING;
  const { isAIDashboardMode, toggleAIDashboardMode } = useAIDashboardToggle();

  useEffect(() => {
    if (!favorite_tab_order) {
      AsyncStorage.getItem('@handlah_favorites')
        .then(stored => {
          if (stored) {
            const ids: string[] = JSON.parse(stored);
            if (ids.length > 0) dispatch(setFavoriteTabOrder(ids));
          }
        })
        .catch(() => { });
    }
    dispatch(getOnboardingStatusAsync({} as any));
  }, []);

  const global_search_status = useSelector(
    (state: any) => state.search_slice?.global_search_status,
  );
  const global_search_data = useSelector(
    (state: any) => state.search_slice?.global_search_data,
  );

  const moduleCounts = useSelector(
    (state: any) => state.home_slice?.get_module_counts_data ?? null,
  );

  const isSearchLoading = global_search_status === ASYNC_STATUS.LOADING;
  const isSearchActive = isSearchFocused || searchQuery.length > 0;

  useFocusEffect(
    useCallback(() => {
      dispatch(getAppTabsAsync(undefined));
      dispatch(getFavoriteTabsAsync(undefined));
      dispatch(getModuleCountsAsync(undefined));
    }, [dispatch]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(clearSearchResults());
        setSearchQuery('');
        setIsSearchFocused(false);
      };
    }, [dispatch]),
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (isAIDashboardMode) {
      dispatch(clearSearchResults());
      return;
    }
    if (searchQuery.trim().length > 0) {
      debounceTimer.current = setTimeout(() => {
        dispatch(
          globalSearchAsync({
            search: searchQuery.trim(),
            ...(isBusinessRole() && selectedBusinessId
              ? { businessId: selectedBusinessId }
              : {}),
          }),
        );
      }, 400);
    } else {
      dispatch(clearSearchResults());
    }
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, selectedBusinessId, dispatch, isAIDashboardMode]);

  const countByRoute = useMemo<Record<string, number>>(() => {
    if (!moduleCounts) return {};
    return moduleCounts.reduce((acc: Record<string, number>, m: any) => {
      acc[m.routekey] = m.count;
      return acc;
    }, {});
  }, [moduleCounts]);

  const apiFavorites = useMemo<IHomeNavigationItem[]>(() => {
    if (!get_favorite_tabs_data?.length) {
      return [];
    }
    let tabs = [...get_favorite_tabs_data];
    if (favorite_tab_order && favorite_tab_order.length > 0) {
      const orderMap = new Map(favorite_tab_order.map((id, idx) => [id, idx]));
      tabs = tabs.sort(
        (a, b) =>
          (orderMap.get(String(a.id)) ?? 999) -
          (orderMap.get(String(b.id)) ?? 999),
      );
    }
    return tabs.map(tab => {
      const screenRoute = ROUTE_TO_SCREEN[tab.route] ?? tab.route;
      return {
        id: String(tab.id),
        titleKey: ROUTE_TO_TITLE_KEY[tab.route] ?? tab.name,
        subtitleKey: ROUTE_TO_TITLE_KEY[tab.route] ?? tab.name,
        icon: ROUTE_TO_ICON[tab.route] ?? ICONS.BOOKMARK_ICON,
        screenRoute,
        count: countByRoute[screenRoute] ?? 0,
      };
    });
  }, [get_favorite_tabs_data, favorite_tab_order, countByRoute]);

  const essentialsWithCounts = useMemo(
    () =>
      ESSENTIALS_DATA.map(item => ({
        ...item,
        count: countByRoute[item.screenRoute] ?? 0,
      })),
    [countByRoute],
  );

  const favoritesData =
    apiFavorites.length > 0
      ? apiFavorites
      : (essentialsWithCounts as IHomeNavigationItem[]);

  const groupsWithCounts = useMemo(
    () =>
      DASHBOARD_GROUPS.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          count: countByRoute[item.screenRoute] ?? 0,
        })),
      })),
    [countByRoute],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    dispatch(clearSearchResults());
    searchInputRef.current?.blur();
    setIsSearchFocused(false);
  }, [dispatch]);

  // Expand the search input (collapses the switch pill to an icon)
  const handleExpandSearch = useCallback((): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchExpanded(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, []);

  // Collapse search back to an icon and re-expand the switch pill
  const handleExpandSwitch = useCallback((): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearchExpanded(false);
    handleClearSearch();
  }, [handleClearSearch]);

  const handleManagePress = useCallback(() => {
    navigation.navigate('FavoritesManagement' as never);
  }, [navigation]);

  const handleItemPress = useCallback(
    (item: IHomeNavigationItem) => {
      navigation.navigate(item.screenRoute as never);
    },
    [navigation],
  );

  const handleFavoritePress = useCallback(
    (item: IHomeNavigationItem) => {
      navigation.navigate(item.screenRoute as never);
    },
    [navigation],
  );

  const handleResultPress = useCallback(
    (routeKey: string) => {
      handleClearSearch();
      navigation.navigate(routeKey as never);
    },
    [navigation, handleClearSearch],
  );

  const handleFABPress = useCallback(() => {
    checkSubscription(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current?.snapToIndex(0);
      }
    }, isBusinessRole() ? 'business' : 'personal');
  }, [checkSubscription, isBusinessRole]);

  const handleViewNewOnboarding = useCallback(() => {
    if (personalComplete) {
      (navigation as any).navigate('AIDashboard', { spaceType: 'Personal' });
    } else {
      navigation.navigate('NewOnboarding' as never);
    }
  }, [navigation, personalComplete]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Notifications' as never);
  }, [navigation]);

  const groupedResults = useMemo(() => {
    if (!global_search_data?.items?.length) {
      return [];
    }
    const map = new Map<string, SearchResultItem[]>();
    global_search_data.items.forEach((item: SearchResultItem) => {
      const cat = item.categoryname || 'Other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    });
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [global_search_data]);

  const renderSearchResult = useCallback(
    (item: SearchResultItem) => (
      <TouchableOpacity
        key={`${item.type}-${item.id}`}
        style={[styles.resultItem, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
        activeOpacity={0.7}
        onPress={() => handleResultPress(item.routekey)}
      >
        <View
          style={[
            styles.resultIconBadge,
            { backgroundColor: themeColors.primary + '20' },
          ]}
        >
          <Feather name="file-text" size={16} color={themeColors.primary} />
        </View>
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          {!!item.subtitle && (
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
          <Text style={[styles.resultModule, { color: themeColors.primary }]}>
            {item.displayname}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.placeholder} />
      </TouchableOpacity>
    ),
    [handleResultPress, themeColors],
  );

  const favoritesSection: ReactElement = useMemo(
    () => (
      <FavoritesSection
        data={favoritesData}
        onManagePress={handleManagePress}
        onFavoritePress={handleFavoritePress}
        title={t('home.sections.favorites')}
        onPhoto
      />
    ),
    [favoritesData, handleManagePress, handleFavoritePress, t],
  );

  // The tiles in the same groups as the website (People & Identity, Digital & Everyday, Property & Vehicles,
  // Money & Coverage), each with its heading.
  const tileSections = useMemo(() => {
    return groupsWithCounts.map(group => {
      const tiles: TileItem[] = group.items
        .map((item: any): TileItem | null => {
          const route = item.screenRoute as keyof typeof HOME_TILE_IMAGES;
          const image = HOME_TILE_IMAGES[route];
          if (!image) return null;
          const count = item.count ?? 0;
          return {
            key: route,
            title: t(item.titleKey),
            subtitle: count > 0 ? t('home.tiles.records', { count }) : t(item.subtitleKey),
            image,
            icon: TILE_ICONS[route],
            onPress: () => handleItemPress(item),
          };
        })
        .filter((x): x is TileItem => !!x);
      return { key: group.key, title: t(group.titleKey), tiles, rows: groupRows(tiles) };
    }).filter(section => section.tiles.length > 0);
  }, [groupsWithCounts, handleItemPress, t]);

  const handleDashboardMode = useCallback((advanced: boolean) => {
    if (advanced) {
      checkSubscription(() => toggleAIDashboardMode(true), isBusinessRole() ? 'business' : 'personal');
    } else {
      toggleAIDashboardMode(false);
    }
  }, [checkSubscription, toggleAIDashboardMode, isBusinessRole]);

  // The status bar sits on the photo here: light text while this screen is showing.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
      return () => {
        StatusBar.setBarStyle(themeColors?.isDark ? 'light-content' : 'dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setTranslucent(false);
          StatusBar.setBackgroundColor(themeColors.background);
        }
      };
    }, [themeColors]),
  );

  return (
    <>
      <DashboardBackground source={HOME_BACKGROUND} />
      <ScreenWrapper showShadow={false} backgroundColor="transparent" containerStyle={{ backgroundColor: 'transparent' }}>
        <CustomHeader
          headerText={t('home.header.title')}
          onNotificationPress={handleNotificationPress}
          notificationCount={unseenNotificationCount}
          variant="overPhoto"
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Frosted search bar (search your records; the mic talks to Halo) */}
          <View style={styles.searchRow}>
            <GlassSearchBar
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('home.tiles.search_placeholder')}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              loading={isSearchLoading}
              onClear={handleClearSearch}
              onMicPress={() => (navigation as any).navigate('Dashboard', { screen: 'AiAssistant' })}
            />
          </View>

          {(isAIDashboardMode || !isSearchActive) && (
            <DashboardModeSwitch
              advanced={isAIDashboardMode}
              onChange={handleDashboardMode}
              accent={themeColors.primary}
              labels={{ dashboard: t('home.tiles.view_dashboard'), advanced: t('home.tiles.view_advanced') }}
            />
          )}

          {isAIDashboardMode ? (
            <InlineAIDashboard
              spaceType="Personal"
              searchQuery={searchQuery}
              onExit={() => toggleAIDashboardMode(false)}
            />
          ) : isSearchActive ? (
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={[styles.scrollContentContainer, styles.searchPanel, { backgroundColor: themeColors.background }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {searchQuery.trim().length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="search" size={48} color={colors.placeholder} />
                  <Text style={styles.emptyStateTitle}>
                    {t('search.start_typing')}
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {t('search.start_typing_subtitle')}
                  </Text>
                </View>
              ) : isSearchLoading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
              ) : groupedResults.length === 0 &&
                global_search_status === ASYNC_STATUS.SUCCEEDED ? (
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={48} color={colors.placeholder} />
                  <Text style={styles.emptyStateTitle}>
                    {t('search.no_results_title')}
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {t('search.no_results_subtitle', { query: searchQuery })}
                  </Text>
                </View>
              ) : (
                <>
                  {global_search_data && (
                    <Text style={styles.resultsCount}>
                      {t('search.results_count', {
                        count: global_search_data.totalresults,
                        query: searchQuery,
                      })}
                    </Text>
                  )}
                  {groupedResults.map(({ category, items }) => (
                    <View key={category} style={styles.resultGroup}>
                      <View style={[styles.resultGroupHeader, { backgroundColor: themeColors.surface }]}>
                        <View
                          style={[
                            styles.resultGroupDot,
                            { backgroundColor: themeColors.primary },
                          ]}
                        />
                        <Text style={[styles.resultGroupTitle, { color: themeColors.textSecondary }]}>{category}</Text>
                      </View>
                      {items.map(renderSearchResult)}
                    </View>
                  ))}
                </>
              )}
              <View style={styles.bottomPadding} />
            </ScrollView>
          ) : (
            /* Normal home content */
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* {!personalComplete && (
                <TouchableOpacity
                  style={[styles.newOnboardingButton, { backgroundColor: themeColors.primary }]}
                  onPress={handleViewNewOnboarding}
                >
                  <Feather
                    name="play-circle"
                    size={16}
                    color={'white'}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.newOnboardingButtonText}>
                    Complete AI Dashboard Onboarding
                  </Text>
                </TouchableOpacity>
              )} */}
              {showFavorites && favoritesSection}
              <View style={styles.tiles}>
                {tileSections.map(section => (
                  <View key={section.key}>
                    <TileSectionHeader title={section.title} countLabel={t('home.tiles.items', { count: section.tiles.length })} />
                    <TileRows rows={section.rows} iconColor="#1a1a1a" tileRefs={{ IdentityHub: identityHubItemRef }} />
                  </View>
                ))}
              </View>
              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
        <CustomFloatingActionButton
          onPress={handleFABPress}
          style={styles.floating_action_btn}
        />
        <AiFab ref={aiFabRef} />
      </ScreenWrapper>
      <CustomIdentityHubBottomSheet ref={bottomSheetRef} />
      {GateModal}
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  searchRow: { paddingHorizontal: 15, paddingTop: 4, paddingBottom: 12 },
  tiles: { paddingHorizontal: 10 },
  searchPanel: { marginHorizontal: 16, borderRadius: 20, paddingTop: 8 },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    paddingLeft: 18,
    paddingRight: 10,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  advancedText: { flex: 1, fontSize: 15, fontFamily: FONTS.display_semi_bold, color: '#fff' },
  onPhotoText: { textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  manageOnPhoto: { backgroundColor: 'rgba(0,0,0,0.25)' },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 50,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.display_bold,
    color: colors.text,
    textAlign: 'left',
  },
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  manageButtonText: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
  },
  favoritesList: {
    gap: HOME_CARD_GAP,
    paddingVertical: 4,
  },
  listContainer: {
    overflow: 'visible',
  },
  bottomPadding: {
    height: 20,
  },
  floating_action_btn: {
    bottom: height >= 812 ? 10 : 15,
    right: 24,
  },
  sectionPadding: {
    paddingHorizontal: 16,
  },
  listItemPadding: {
    paddingHorizontal: 16,
  },
  listSectionTitle: {
    marginTop: 0,
    paddingHorizontal: 16,
  },
  listContentContainer: {
    gap: 10,
    paddingVertical: 20,
  },
  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: colors.text,
    padding: 0,
    margin: 0,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: colors.placeholder,
  },
  // Search results
  resultsCount: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  resultGroup: {
    marginBottom: 8,
  },
  resultGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lightGray,
    gap: 8,
  },
  resultGroupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultGroupTitle: {
    fontSize: 12,
    fontFamily: FONTS.display_semi_bold,
    color: colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  resultIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
  },
  resultSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.display_regular,
    color: colors.textSecondary,
  },
  resultModule: {
    fontSize: 11,
    fontFamily: FONTS.display_medium,
  },
  // Empty / loading states
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: colors.text,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  aiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiToggleLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: colors.text,
  },

  // Expandable search + Advanced Dashboard switch row
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topControlExpanded: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    paddingVertical: 0,
  },
  iconControl: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10
  },
  switchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    // paddingLeft: 18,
    // paddingRight: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  switchPillLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: colors.text,
  },
  newOnboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  newOnboardingButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
  },
});
