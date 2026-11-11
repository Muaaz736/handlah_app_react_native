import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ListRenderItem,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Switch,
  LayoutAnimation,
  UIManager,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import {
  CustomFloatingActionButton,
  CustomScrollableTabs,
  CustomDropDown,
  SelectBusinessModal,
} from '../../../components/common';
import CustomListItemCard from '../../../components/CustomCards/CustomListItemCard';
import CustomIdentityHubBottomSheet from '../../../components/CustomBottomSheetComps/CustomIdentityHubBottomSheet';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import { ICONS } from '../../../utils/Images';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../hooks/useSelectedBusiness';
import { getBusinessesAsync } from '../../../redux/services/businessService';
import { getDropdownOptionsAsync } from '../../../redux/services/authService';
import { getBusinessContactsAsync } from '../../../redux/services/businessContactsService';
import { getBusinessProjectsAsync } from '../../../redux/services/businessProjectsService';
import { getModuleCountsAsync } from '../../../redux/services/homeService';
import { setSelectedBusinessId } from '../../../redux/slices/businessSlice';
import { globalSearchAsync } from '../../../redux/services/searchService';
import { clearSearchResults, SearchResultItem } from '../../../redux/slices/searchSlice';
import { ASYNC_STATUS } from '../../../config/constants';
import {
  BusinessNavigationProp,
  BusinessTab,
  BusinessSection,
  SubItem,
  BusinessOption,
} from './Business.types';
import BottomSheet from '@gorhom/bottom-sheet';
import { makeBusinessStyles } from './Business.styles';
import { AiFab } from '../../../components/common/AiFab';
import { getOnboardingStatusAsync } from '../../../redux/services/onboardingService';
import { AppDispatch } from '../../../types/store.types';
import { useAIDashboardToggle } from '../../../hooks/useAIDashboardToggle';
import InlineAIDashboard from '../../../components/common/InlineAIDashboard';
import SubscriptionGateModal from '../../../components/common/SubscriptionGateModal';
import { RoleTheme } from '../../../types/roleManager.types';
import { DashboardBackground, DashboardModeSwitch, GlassSearchBar, TileRows, TileSectionHeader, groupRows, type TileItem } from '../../../components/home/HomeLayout';
import { BUSINESS_HOME_BACKGROUND, BUSINESS_TILE_IMAGES, TILE_ICONS } from '../../../components/home/tileImages';
import FONTS from '../../../utils/fonts';

const { width, height } = Dimensions.get('window');

// Get business tabs with translations
const getBusinessTabs = (t: any): BusinessTab[] => [
  { label: t('business.tabs.all'), value: 'all' },
  { label: t('business.tabs.fleet'), value: 'fleet' },
  { label: t('business.tabs.assets'), value: 'assets' },
  { label: t('business.tabs.expenses'), value: 'expenses' },
];

// Get business sections with translations and subcategories
export const getBusinessSections = (t: any): BusinessSection[] => [
  {
    id: 'company',
    title: t('business.sections.company'),
    items: [
      {
        id: '6',
        titleKey: 'business.profile',
        subtitleKey: 'business.profile_subtitle',
        icon: ICONS.USER_ICON,
        screenRoute: 'BusinessDetailsPage',
        category: 'company',
        expandable: false,
      },
    ],
  },
  {
    id: 'essentials',
    title: t('business.sections.essentials'),
    items: [
      {
        id: '1',
        titleKey: 'business.business_snapshot',
        subtitleKey: 'business.business_snapshot_subtitle',
        icon: ICONS.IDENTITY_HUB_ICON,
        category: 'essentials',
        expandable: true,
        subItems: [
          {
            id: '1-1',
            titleKey: 'business.sub_items.social_media',
            icon: ICONS.SOCIAL_MEDIA_ICON,
            route: 'SocialMedia',
            count: '5',
          },
          {
            id: '1-2',
            titleKey: 'business.sub_items.bookmarks',
            icon: ICONS.BOOKMARK_ICON,
            route: 'Bookmarks',
            count: '12',
          },
          {
            id: '1-3',
            titleKey: 'business.sub_items.business_contacts',
            icon: ICONS.BUSINESS_CONTACT_ICON1,
            route: 'BusinessContact',
            count: '18',
          },
          {
            id: '1-4',
            titleKey: 'business.sub_items.projects',
            icon: ICONS.BUSINESS_PROJECT_ICON1,
            route: 'Projects',
            count: '5',
          },
          // {
          //   id: '1-5',
          //   titleKey: 'business.sub_items.legal',
          //   icon: ICONS.LEGAL_ICON,
          //   route: 'Legal',
          //   count: '3',
          // },
        ],
      },
    ],
  },
  {
    id: 'fleet',
    title: t('business.sections.fleet'),
    items: [
      {
        id: '2',
        titleKey: 'business.fleet_status',
        subtitleKey: 'business.fleet_status_subtitle',
        icon: ICONS.VEHICLE_ICON,
        category: 'fleet',
        expandable: true,
        subItems: [
          {
            id: '2-1',
            titleKey: 'business.sub_items.all_vehicles',
            icon: ICONS.VEHICLE_ICON,
            route: 'Vehicles',
            count: '3',
          },
        ],
      },
    ],
  },
  {
    id: 'assets',
    title: t('business.sections.assets'),
    items: [
      {
        id: '3',
        titleKey: 'business.assets_locations',
        subtitleKey: 'business.assets_locations_subtitle',
        icon: ICONS.REAL_ESTATE_ICON,
        category: 'assets',
        expandable: true,
        subItems: [
          {
            id: '3-1',
            titleKey: 'business.sub_items.real_estate',
            icon: ICONS.REAL_ESTATE_ICON,
            route: 'RealEstate',
            count: '2',
          },
          {
            id: '3-2',
            titleKey: 'business.sub_items.business_property',
            icon: ICONS.BUSINESS_PROPERTY_ICON,
            route: 'PersonalProperty',
            count: '3',
          },
          {
            id: '3-3',
            titleKey: 'business.sub_items.banking_finance',
            icon: ICONS.BANK_ICON,
            route: 'BankingFinance',
            count: '5',
          },
          {
            id: '3-4',
            titleKey: 'business.sub_items.wallet',
            icon: ICONS.WALLET_ICON,
            route: 'Wallet',
          },
        ],
      },
    ],
  },
  {
    id: 'expenses',
    title: t('business.sections.expenses'),
    items: [
      {
        id: '4',
        titleKey: 'business.this_month',
        subtitleKey: 'business.this_month_subtitle',
        icon: ICONS.LOANS_PAYMENT_ICON,
        category: 'expenses',
        expandable: true,
        subItems: [
          {
            id: '4-1',
            titleKey: 'business.sub_items.loans',
            icon: ICONS.LOANS_PAYMENT_ICON,
            route: 'Loans',
            count: '2',
            amount: '$1,500',
          },
          {
            id: '4-2',
            titleKey: 'business.sub_items.utilities',
            icon: ICONS.UTILITIES_ICON,
            route: 'Utilities',
            count: '4',
            amount: '$800',
          },
          {
            id: '4-3',
            titleKey: 'business.sub_items.insurance',
            icon: ICONS.INSURANCE_ICON,
            route: 'Insurance',
            count: '3',
            amount: '$600',
          },
          {
            id: '4-4',
            titleKey: 'business.sub_items.warranties',
            icon: ICONS.WARRENTIES_ICON,
            route: 'Warranties',
            count: '3',
            amount: '$300',
          },
          {
            id: '4-5',
            titleKey: 'business.sub_items.subscriptions',
            icon: ICONS.SUBSCRIPTION_ICON,
            route: 'Subscriptions',
            count: '0',
          },
        ],
      },
    ],
  },
  {
    id: 'licenses',
    title: t('business.sections.licenses'),
    items: [
      {
        id: '5',
        titleKey: 'business.licenses_renewals',
        subtitleKey: 'business.licenses_renewals_subtitle',
        icon: ICONS.LEGAL_ICON,
        category: 'licenses',
        expandable: true,
        subItems: [
          {
            id: '5-1',
            titleKey: 'business.sub_items.licenses',
            icon: ICONS.LEGAL_ICON,
            route: 'Licenses',
            count: '3',
          },
          {
            id: '5-2',
            titleKey: 'business.sub_items.compliance',
            icon: ICONS.BUSINESS_DOCUMENT_ICON,
            route: 'ComplianceVault',
            count: '2',
          },
        ],
      },
    ],
  },

];

// Enable LayoutAnimation on Android so the search/switch expand is animated
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Business: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const searchInputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<BusinessNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const styles = useMemo(() => makeBusinessStyles(themeColors as RoleTheme), [themeColors]);
  const dispatch = useDispatch<AppDispatch>();

  // Use custom hook for business selection
  const { selectedBusiness, selectedBusinessId, businesses } =
    useSelectedBusiness();
  const businessesStatus = useSelector(
    (state: any) => state.business_slice?.get_businesses_status,
  );
  const { businessComplete, status_status } = useSelector((state: any) => state.onboarding_slice);
  const unseenNotificationCount = useSelector(
    (state: any) => state.notifications_slice?.unseen_count ?? 0,
  );

  // Redux — business contacts & projects counts
  const businessContactsData = useSelector(
    (state: any) => state.business_contacts_slice?.get_business_contacts_data,
  );
  const businessProjectsData = useSelector(
    (state: any) => state.business_projects_slice?.get_business_projects_data,
  );

  // Redux — search
  const global_search_status = useSelector(
    (state: any) => state.search_slice?.global_search_status,
  );
  const global_search_data = useSelector(
    (state: any) => state.search_slice?.global_search_data,
  );

  // Redux — entity type options
  const entityTypeOptions = useSelector(
    (state: any) => state.user_auth?.get_dropdown_options_data ?? [],
  );

  // Redux — module counts
  const moduleCounts = useSelector(
    (state: any) => state.home_slice?.get_module_counts_data ?? null,
  );

  const isSearchLoading = global_search_status === ASYNC_STATUS.LOADING;
  const onboardingStatusLoading = status_status === ASYNC_STATUS.LOADING;
  const isSearchActive = isSearchFocused || searchQuery.length > 0;
  const { isAIDashboardMode, toggleAIDashboardMode } = useAIDashboardToggle();
  const subscription = useSelector((state: any) => state.user_auth?.user_data?.subscription ?? null);
  const [isSubscriptionGateVisible, setIsSubscriptionGateVisible] = useState<boolean>(false);
  const [isSelectBusinessModalVisible, setIsSelectBusinessModalVisible] = useState<boolean>(false);
  const [pendingModuleRoute, setPendingModuleRoute] = useState<string | null>(null);

  // Get translated tabs and sections
  const businessTabs = useMemo(() => getBusinessTabs(t), [t]);

  // Compute dynamic counts for business snapshot
  const contactsCount = useMemo(() => {
    return Array.isArray(businessContactsData) ? businessContactsData.length : 0;
  }, [businessContactsData]);

  const projectsCount = useMemo(() => {
    return Array.isArray(businessProjectsData) ? businessProjectsData.length : 0;
  }, [businessProjectsData]);

  const businessSections = useMemo(() => {
    const sections = getBusinessSections(t);
    // Override the Business Snapshot subtitle with dynamic counts
    const essentialsSection = sections.find(s => s.id === 'essentials');
    if (essentialsSection) {
      const snapshotItem = essentialsSection.items.find(i => i.id === '1');
      if (snapshotItem) {
        snapshotItem.subtitle = `${contactsCount} ${t('business.contacts_label')} · ${projectsCount} ${t('business.projects_label')}`;
      }
    }
    return sections;
  }, [t, contactsCount, projectsCount]);

  // Resolve entity type label from dropdown options
  const entityTypeLabel = useMemo(() => {
    if (!selectedBusiness?.entitytype) return 'N/A';
    const match = entityTypeOptions?.find(
      (opt: any) => String(opt.value) === String(selectedBusiness.entitytype),
    );
    return match?.label || '-';
  }, [selectedBusiness, entityTypeOptions]);

  // Build routekey → count map for sub-items
  const countByRoute = useMemo<Record<string, number>>(() => {
    if (!moduleCounts || !selectedBusinessId) return {};
    return moduleCounts.reduce((acc: Record<string, number>, m: any) => {
      acc[m.routekey] = m.count;
      return acc;
    }, {});
  }, [moduleCounts, selectedBusinessId]);

  // Transform businesses to dropdown options with safety checks
  const businessOptions: BusinessOption[] = useMemo(() => {
    if (!Array.isArray(businesses) || businesses.length === 0) {
      return [];
    }
    return businesses
      .filter(
        (business: any) => business && business.id && business.businessname,
      )
      .map((business: any) => ({
        label: business.businessname || 'Unnamed Business',
        value: business.id.toString(),
      }));
  }, [businesses]);

  useEffect(() => {
    dispatch(getOnboardingStatusAsync({} as any));
  }, [])

  const handleViewNewOnboarding = useCallback(() => {
    if (businessComplete) {
      navigation.navigate('AIDashboard', { spaceType: 'Business', businessId: selectedBusinessId ?? null });
    } else {
      navigation.navigate('BusinessOnboarding' as never);
    }
  }, [navigation, businessComplete, selectedBusinessId]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Notifications' as never);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getBusinessesAsync() as any);
      dispatch(getDropdownOptionsAsync('BusinessEntityType') as any);
    }, [dispatch]),
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedBusinessId) {
        dispatch(getBusinessContactsAsync(selectedBusinessId) as any);
        dispatch(getBusinessProjectsAsync(selectedBusinessId) as any);
        dispatch(getModuleCountsAsync({ businessId: selectedBusinessId }) as any);
      }
    }, [dispatch, selectedBusinessId]),
  );

  useEffect(() => {
    if (selectedBusinessId) {
      dispatch(getModuleCountsAsync({ businessId: selectedBusinessId }) as any);
    }
  }, [selectedBusinessId]);

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
    if (searchQuery.trim().length > 0 && selectedBusinessId) {
      debounceTimer.current = setTimeout(() => {
        dispatch(
          globalSearchAsync({
            search: searchQuery.trim(),
            businessId: selectedBusinessId,
          }) as any,
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

  const handleSearchPress = useCallback((e: string): void => {
    setSearchValue(e);
  }, []);

  const handleClearSearch = useCallback((): void => {
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

  const handleResultPress = useCallback(
    (routeKey: string): void => {
      handleClearSearch();
      navigation.navigate(routeKey as any);
    },
    [navigation, handleClearSearch],
  );

  const handleTabChange = useCallback((index: number): void => {
    setActiveTab(index);
  }, []);

  const handleAddBusiness = useCallback((): void => {
    checkSubscription(() => {
      navigation.navigate('AddBusinessDetails' as any);
    }, 'business');
  }, [navigation, checkSubscription]);

  const handleFABPress = useCallback((): void => {
    checkSubscription(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current?.snapToIndex(0);
      }
    }, 'business');
  }, [checkSubscription]);

  const handleSubItemPress = useCallback(
    (route: string): void => {
      if (!subscription) {
        setIsSubscriptionGateVisible(true);
        return;
      }
      if (businesses.length === 0) {
        Alert.alert(
          t('business.no_business_module_title'),
          t('business.no_business_module_message'),
          [
            {
              text: t('business.add_business_now'),
              onPress: () => checkSubscription(() => navigation.navigate('AddBusinessDetails' as any), 'business'),
            },
            { text: t('common.cancel'), style: 'cancel' },
          ],
        );
        return;
      }
      if (!selectedBusinessId) {
        setPendingModuleRoute(route);
        setIsSelectBusinessModalVisible(true);
        return;
      }
      navigation.navigate(route as any);
    },
    [navigation, selectedBusinessId, businesses, subscription, t, checkSubscription],
  );

  const handleSelectBusinessFromModal = useCallback(
    (businessId: number): void => {
      dispatch(setSelectedBusinessId(businessId));
      setIsSelectBusinessModalVisible(false);
      if (pendingModuleRoute) {
        navigation.navigate(pendingModuleRoute as any);
        setPendingModuleRoute(null);
      }
    },
    [dispatch, navigation, pendingModuleRoute],
  );

  // Group search results by category
  const groupedResults = useMemo(() => {
    if (!global_search_data?.items?.length) { return []; }
    const map = new Map<string, SearchResultItem[]>();
    global_search_data.items.forEach((item: SearchResultItem) => {
      const cat = item.categoryname || 'Other';
      if (!map.has(cat)) { map.set(cat, []); }
      map.get(cat)!.push(item);
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [global_search_data]);

  const renderSearchResult = useCallback(
    (item: SearchResultItem) => (
      <TouchableOpacity
        key={`${item.type}-${item.id}`}
        style={styles.resultItem}
        activeOpacity={0.7}
        onPress={() => handleResultPress(item.routekey)}
      >
        <View style={[styles.resultIconBadge, { backgroundColor: themeColors.primary + '20' }]}>
          <Feather name="file-text" size={16} color={themeColors.primary} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          {!!item.subtitle && (
            <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          )}
          <Text style={[styles.resultModule, { color: themeColors.primary }]}>{item.displayname}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.placeholder} />
      </TouchableOpacity>
    ),
    [handleResultPress, themeColors],
  );

  const renderBusinessHeader = (): React.ReactElement => (
    <View style={styles.businessHeader}>
      {/* AI Dashboard / Onboarding button */}
      {/* {!businessComplete &&  (
        <TouchableOpacity
          style={[styles.newOnboardingButton, { backgroundColor: themeColors.primary }]}
          onPress={handleViewNewOnboarding}
        >
          <Feather
            name={businessComplete ? 'bar-chart-2' : 'play-circle'}
            size={16}
            color={'white'}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.newOnboardingButtonText}>
            {businessComplete ? 'Visit AI Dashboard' : 'Complete AI Dashboard Onboarding'}
          </Text>
        </TouchableOpacity>
      )} */}
      <View style={styles.businessSelectorRow}>
        <Text style={styles.selectBusinessText}>{t('business.title')}</Text>
        <TouchableOpacity
          style={[styles.addBusinessButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.2) : getColorWithOpacity(themeColors.primary, 0.15) }]}
          onPress={handleAddBusiness}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBusinessText, { color: themeColors.primary }]}>
            {t('business.add_business')}
          </Text>
        </TouchableOpacity>
      </View>

      {businessesStatus === ASYNC_STATUS.LOADING ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={themeColors.primary} />
        </View>
      ) : businesses.length > 0 ? (
        <>
          <View style={styles.dropdownContainer}>
            <CustomDropDown
              options={businessOptions}
              value={selectedBusinessId?.toString() || ''}
              onSelect={(val: any) =>
                dispatch(setSelectedBusinessId(Number(val)))
              }
              placeholder={t('common.select_business')}
              search={false}
              leftIcon={true}
              style={styles.businessDropdown}
            />
          </View>

          {selectedBusiness ? (
            <View style={styles.businessCard}>
              <View style={[styles.businessAvatar, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.2) }]}>
                <Text style={[styles.businessAvatarText, { color: themeColors.primary }]}>
                  {selectedBusiness.businessname?.charAt(0).toUpperCase() ||
                    'B'}
                </Text>
              </View>
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>
                  {selectedBusiness.businessname || t('common.unnamed_business')}
                </Text>
                <Text style={styles.businessType}>
                  {entityTypeLabel} · {selectedBusiness.statelabel || 'N/A'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>{t('business.business_not_found')}</Text>
              <Text style={styles.emptyStateSubtext}>
                {t('business.select_valid_business')}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>{t('business.no_businesses_found')}</Text>
          <Text style={styles.emptyStateSubtext}>
            {t('business.add_first_business')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTopControls = (): React.ReactElement => (
    <View style={styles.topControlsRow}>
      {/* Search segment */}
      {isSearchExpanded ? (
        <View
          style={[
            styles.searchBar,
            styles.topControlExpanded,
            isSearchFocused && { borderColor: themeColors.primary },
          ]}
        >
          <Feather name="search" size={20} color={isSearchFocused ? themeColors.primary : colors.gray} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {isSearchLoading && (
            <ActivityIndicator size="small" color={themeColors.primary} />
          )}
          {searchQuery.length > 0 && !isSearchLoading && (
            <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={18} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.iconControl}
          onPress={handleExpandSearch}
          activeOpacity={0.8}
        >
          <Feather name="search" size={20} color={colors.gray} />
        </TouchableOpacity>
      )}

      {/* Switch segment */}
      {isSearchExpanded ? (
        <TouchableOpacity
          style={styles.iconControl}
          onPress={handleExpandSwitch}
          activeOpacity={0.8}
        >
          <Feather name="x" size={20} color={colors.gray} />
        </TouchableOpacity>
      ) : (
        <LinearGradient
          colors={[themeColors.primary, getColorWithOpacity(themeColors.primary, 0.55)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.switchPill}
        >
          <View style={styles.switchBox}>

            <Text
              style={[styles.switchPillLabel, { color: colors.white }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              Switch to Advanced Dashboard
            </Text>
            <View>
              <Switch
                value={isAIDashboardMode}
                onValueChange={(value) => {
                  if (value) {
                    checkSubscription(() => toggleAIDashboardMode(value), 'business');
                  } else {
                    toggleAIDashboardMode(value);
                  }
                }}
                trackColor={{ false: getColorWithOpacity(colors.black, 0.2), true: colors.white }}
                thumbColor={isAIDashboardMode ? themeColors.primary : colors.white}
                ios_backgroundColor={getColorWithOpacity(colors.black, 0.2)}
              />
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  );

  // The tiles, as in the design: Business Profile across the top, then each section's tiles two per row (an odd one
  // out across the row), with the section name and how many items it has.
  const tileSections = useMemo(() => {
    const toTile = (sub: { id: string; titleKey: string; route?: string }): TileItem | null => {
      const route = sub.route || '';
      const image = BUSINESS_TILE_IMAGES[route];
      if (!route || !image) return null;
      const count = countByRoute[route] ?? 0;
      return {
        key: `${sub.id}-${route}`,
        title: route === 'BusinessDetailsPage' ? t('home.tiles.business_profile') : t(sub.titleKey),
        subtitle: t('home.tiles.records', { count }),
        image,
        icon: BUSINESS_TILE_ICONS[route] ?? TILE_ICONS[route] ?? 'folder-outline',
        onPress: () => handleSubItemPress(route),
      };
    };
    // Same groups and order as the website's business dashboard.
    const titleKeys = new Map<string, string>();
    for (const section of businessSections) {
      for (const item of section.items) {
        if (item.subItems) item.subItems.forEach(sub => { if (sub.route) titleKeys.set(sub.route, sub.titleKey); });
        else if (item.screenRoute) titleKeys.set(item.screenRoute, item.titleKey);
      }
    }
    const WEB_GROUPS: { id: string; titleKey: string; routes: string[] }[] = [
      { id: 'company', titleKey: 'business.sections.company_group', routes: ['BusinessDetailsPage', 'ComplianceVault', 'Licenses'] },
      { id: 'network', titleKey: 'business.sections.network', routes: ['BusinessContact', 'SocialMedia', 'Bookmarks', 'Projects'] },
      { id: 'physical', titleKey: 'business.sections.physical', routes: ['RealEstate', 'PersonalProperty', 'Vehicles'] },
      { id: 'money', titleKey: 'business.sections.money', routes: ['BankingFinance', 'Utilities', 'Loans', 'Insurance', 'Warranties', 'Subscriptions'] },
    ];
    return WEB_GROUPS.map(group => {
      const tiles = group.routes
        .map(route => toTile({ id: `${group.id}-${route}`, titleKey: titleKeys.get(route) ?? route, route }))
        .filter((x): x is TileItem => !!x);
      return { id: group.id, title: t(group.titleKey), tiles, rows: groupRows(tiles) };
    }).filter(section => section.tiles.length > 0);
  }, [businessSections, countByRoute, handleSubItemPress, t]);

  const renderSection: ListRenderItem<BusinessSection> = ({
    item: section,
  }) => {
    if (
      activeTab !== 0 &&
      businessTabs[activeTab]?.value !== section.id &&
      section.id !== 'essentials'
    ) {
      return null;
    }

    // Collect all sub-items from all items in the section
    const allSubItems: SubItem[] = section.items.flatMap(
      item => item.subItems ?? (item.screenRoute ? [{
        id: item.id,
        titleKey: item.titleKey,
        icon: item.icon,
        route: item.screenRoute,
      } as SubItem] : []),
    );

    if (allSubItems.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <View style={styles.listContentContainer}>
          {allSubItems.map((subItem, index) => (
            <CustomListItemCard
              key={subItem.id}
              item={{
                icon: subItem.icon,
                titleKey: subItem.titleKey,
                route: subItem.route,
              }}
              onPress={() => handleSubItemPress(subItem.route || '')}
              count={countByRoute[subItem.route || ''] ?? 0}
              isLast={index === allSubItems.length - 1}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <>
      <ScreenWrapper scrollable={false} showShadow={true}>
        <CustomHeader
          onSearchChange={handleSearchPress}
          searchValue={searchValue}
          isShowSearchedInput={false}
          onNotificationPress={handleNotificationPress}
          notificationCount={unseenNotificationCount}
        />

        <DashboardBackground source={BUSINESS_HOME_BACKGROUND} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Frosted search bar (search your business records; the mic talks to Halo) */}
            <View style={tileStyles.searchRow}>
              <GlassSearchBar
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('home.tiles.business_search_placeholder')}
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
                onChange={(advanced) => {
                  if (advanced) checkSubscription(() => toggleAIDashboardMode(true), 'business');
                  else toggleAIDashboardMode(false);
                }}
                accent={themeColors.primary}
                labels={{ dashboard: t('home.tiles.view_dashboard'), advanced: t('home.tiles.view_advanced') }}
              />
            )}

            {/* Which business: only needed with no business yet (add one) or several (switch). */}
            {(businessesStatus === ASYNC_STATUS.LOADING || businesses.length !== 1) && (
              <View style={[tileStyles.panel, { backgroundColor: themeColors.background }]}>
                {renderBusinessHeader()}
              </View>
            )}

            {/* Who runs this business: people, roles, approvals and handing it over (as on the website). */}
            {!isAIDashboardMode && !isSearchActive && !!selectedBusinessId && (
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('BusinessTeam', { businessId: Number(selectedBusinessId) })}
                accessibilityRole="button"
                style={[teamButtonStyle.button, { borderColor: themeColors.primary, backgroundColor: themeColors.background }]}
              >
                <Feather name="users" size={15} color={themeColors.primary} />
                <Text style={[teamButtonStyle.text, { color: themeColors.primary }]}>{t('business_team.openTeam')}</Text>
              </TouchableOpacity>
            )}

            {isAIDashboardMode && selectedBusinessId ? (
              /* AI Dashboard inline — its search filters the "What needs
                 attention" list locally (no global search). */
              <InlineAIDashboard
                spaceType="Business"
                businessId={selectedBusinessId}
                searchQuery={searchQuery}
                onExit={() => toggleAIDashboardMode(false)}
              />
            ) : isSearchActive ? (
              // Search results
              <View style={[styles.searchResultsContainer, tileStyles.panel, { backgroundColor: themeColors.background }]}>
                {searchQuery.trim().length === 0 ? (
                  <View style={styles.emptySearchState}>
                    <Feather name="search" size={48} color={colors.placeholder} />
                    <Text style={styles.emptyStateTitle}>{t('search.start_typing')}</Text>
                    <Text style={styles.emptyStateSubtitle}>{t('search.start_typing_subtitle')}</Text>
                  </View>
                ) : isSearchLoading ? (
                  <View style={styles.emptySearchState}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                  </View>
                ) : groupedResults.length === 0 && global_search_status === ASYNC_STATUS.SUCCEEDED ? (
                  <View style={styles.emptySearchState}>
                    <Feather name="inbox" size={48} color={colors.placeholder} />
                    <Text style={styles.emptyStateTitle}>{t('search.no_results_title')}</Text>
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
                        <View style={styles.resultGroupHeader}>
                          <View style={[styles.resultGroupDot, { backgroundColor: themeColors.primary }]} />
                          <Text style={styles.resultGroupTitle}>{category}</Text>
                        </View>
                        {items.map(renderSearchResult)}
                      </View>
                    ))}
                  </>
                )}
              </View>
            ) : (
              // Normal business content: the tiles
              <View style={tileStyles.tiles}>
                {tileSections.map(section => (
                  <View key={section.id}>
                    <TileSectionHeader title={section.title} countLabel={t('home.tiles.items', { count: section.tiles.length })} />
                    <TileRows rows={section.rows} iconColor={themeColors.primary} />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        </DashboardBackground>
      </ScreenWrapper>

      <CustomFloatingActionButton
        onPress={handleFABPress}
        style={[
          styles.floating_action_btn,
          { backgroundColor: themeColors.primary },
        ]}
        iconColor={colors.white}
      />
      <AiFab />

      <CustomIdentityHubBottomSheet ref={bottomSheetRef} />
      <SubscriptionGateModal
        visible={isSubscriptionGateVisible}
        onClose={() => setIsSubscriptionGateVisible(false)}
      />
      <SelectBusinessModal
        visible={isSelectBusinessModalVisible}
        onClose={() => {
          setIsSelectBusinessModalVisible(false);
          setPendingModuleRoute(null);
        }}
        onSelect={handleSelectBusinessFromModal}
        businesses={businessOptions}
      />
      {GateModal}
    </>
  );
};



/** Business-specific badge icons from the design (laptop for business property, card for loans…). */
const BUSINESS_TILE_ICONS: Record<string, string> = {
  PersonalProperty: 'laptop',
  Loans: 'credit-card-outline',
  Utilities: 'cash-sync',
  BankingFinance: 'bank-outline',
  Subscriptions: 'card-account-details-star-outline',
};

const tileStyles = StyleSheet.create({
  searchRow: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 10 },
  panel: { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, overflow: 'hidden' },
  tiles: { paddingHorizontal: 15, paddingBottom: 110 },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
    paddingLeft: 18,
    paddingRight: 10,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  advancedText: { flex: 1, fontSize: 15, fontFamily: FONTS.display_semi_bold, color: '#fff' },
});

export default Business;

const teamButtonStyle = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  text: { fontSize: 13, fontWeight: '600' },
});
