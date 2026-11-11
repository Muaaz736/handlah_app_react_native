import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { ASYNC_STATUS } from '../../../config/constants';
import { globalSearchAsync } from '../../../redux/services/searchService';
import { makeSearchResultsStyles } from './SearchResultsScreen.styles';
import {
  clearSearchResults,
  SearchResultItem,
} from '../../../redux/slices/searchSlice';
import { useSelectedBusiness } from '../../../hooks/useSelectedBusiness';
import { AppDispatch } from '../../../types/store.types';

// Map FA icon names from API → category grouping color
const CATEGORY_COLORS: Record<string, string> = {
  Essentials: '#4CAF50',
  Assets: '#2196F3',
  'Liabilities and Expenses': '#FF9800',
};

// Routekey from API → stack screen name (handles any case differences)
const ROUTEKEY_TO_SCREEN: Record<string, string> = {
  IdentityHub: 'IdentityHub',
  SocialMedia: 'SocialMedia',
  HealthTracker: 'HealthTracker',
  Bookmarks: 'Bookmarks',
  Legal: 'Legal',
  Subscriptions: 'Subscriptions',
  PersonalProperty: 'PersonalProperty',
  RealEstate: 'RealEstate',
  Vehicles: 'Vehicles',
  BankingFinance: 'BankingFinance',
  Loans: 'Loans',
  Utilities: 'Utilities',
  Insurance: 'Insurance',
  Warranties: 'Warranties',
  Wallet: 'Wallet',
  Pets: 'Pets',
};

export interface SearchResultsRouteParams {
  initialQuery?: string;
}

const SearchResultsScreen: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ SearchResults: SearchResultsRouteParams }, 'SearchResults'>>();
  const { initialQuery = '' } = route.params ?? {};

  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeSearchResultsStyles(themeColors), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();

  const [query, setQuery] = useState<string>(initialQuery);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    global_search_status,
    global_search_data,
    global_search_error,
  } = useSelector((state: any) => state.search_slice);

  const isLoading = global_search_status === ASYNC_STATUS.LOADING;
  const hasResults =
    global_search_status === ASYNC_STATUS.SUCCEEDED &&
    global_search_data !== null;
  const isEmpty =
    hasResults &&
    (!global_search_data?.items || global_search_data.items.length === 0);

  // Trigger search with debounce
  const triggerSearch = useCallback(
    (text: string) => {
      if (!text.trim()) {
        dispatch(clearSearchResults());
        return;
      }
      const params: any = { search: text.trim() };
      if (selectedBusinessId) {
        params.businessId = selectedBusinessId;
      }
      dispatch(globalSearchAsync(params));
    },
    [dispatch, selectedBusinessId],
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      triggerSearch(query);
    }, 400);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, triggerSearch]);

  // Run initial query immediately
  useEffect(() => {
    if (initialQuery.trim()) {
      triggerSearch(initialQuery);
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, []);

  // Group items by categoryname
  const groupedItems = useMemo(() => {
    if (!global_search_data?.items?.length) { return []; }
    const groups: Record<string, SearchResultItem[]> = {};
    global_search_data.items.forEach((item: SearchResultItem) => {
      const cat = item.categoryname ?? 'Other';
      if (!groups[cat]) { groups[cat] = []; }
      groups[cat].push(item);
    });
    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  }, [global_search_data]);

  // Navigate to result
  const handleResultPress = useCallback(
    (item: SearchResultItem) => {
      const screen = ROUTEKEY_TO_SCREEN[item.routekey] ?? item.routekey;
      navigation.navigate(screen as never);
    },
    [navigation],
  );

  // Render a single result row
  const renderItem: ListRenderItem<SearchResultItem> = useCallback(
    ({ item, index }) => {
      const isLast = index === (global_search_data?.items?.length ?? 0) - 1;
      return (
        <TouchableOpacity
          style={[styles.resultRow, isLast && styles.resultRowLast]}
          activeOpacity={0.7}
          onPress={() => handleResultPress(item)}
        >
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: themeColors.primary + '20' },
            ]}
          >
            <FontAwesome
              name={item.icon?.replace('fa-', '') || 'circle'}
              size={18}
              color={themeColors.primary}
            />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!!item.subtitle && (
              <Text style={styles.resultSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            )}
            <Text style={styles.resultModule}>{item.displayname}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.placeholder} />
        </TouchableOpacity>
      );
    },
    [global_search_data?.items?.length, handleResultPress, themeColors.primary],
  );

  const keyExtractor = useCallback(
    (item: SearchResultItem, index: number) =>
      `${item.type}-${item.id}-${index}`,
    [],
  );

  // Render group section
  const renderGroup = useCallback(
    ({ category, items }: { category: string; items: SearchResultItem[] }) => {
      const catColor = CATEGORY_COLORS[category] ?? themeColors.primary;
      return (
        <View key={category} style={styles.groupContainer}>
          <View style={styles.groupHeader}>
            <View
              style={[styles.groupDot, { backgroundColor: catColor }]}
            />
            <Text style={[styles.groupTitle, { color: catColor }]}>
              {category}
            </Text>
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>{items.length}</Text>
            </View>
          </View>
          <View style={styles.groupCard}>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
            />
          </View>
        </View>
      );
    },
    [renderItem, keyExtractor, themeColors.primary],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name={isRTL ? 'arrow-right' : 'arrow-left'}
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* Search input */}
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={18} color={themeColors.primary} />
          <TextInput
            style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.placeholder}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => triggerSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                dispatch(clearSearchResults());
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="x" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        data={groupedItems}
        keyExtractor={(g) => g.category}
        renderItem={({ item: group }) => renderGroup(group)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Results count */}
            {hasResults && !isEmpty && (
              <Text style={styles.resultsCount}>
                {t('search.results_count', {
                  count: global_search_data?.totalresults ?? 0,
                  query: global_search_data?.search ?? '',
                })}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={themeColors.primary} />
            ) : global_search_status === ASYNC_STATUS.ERROR ? (
              <>
                <Feather name="alert-circle" size={48} color={colors.error} />
                <Text style={styles.emptyTitle}>{t('search.error_title')}</Text>
                <Text style={styles.emptySubtitle}>{global_search_error}</Text>
              </>
            ) : query.trim().length === 0 ? (
              <>
                <Feather name="search" size={48} color={colors.placeholder} />
                <Text style={styles.emptyTitle}>{t('search.start_typing')}</Text>
                <Text style={styles.emptySubtitle}>
                  {t('search.start_typing_subtitle')}
                </Text>
              </>
            ) : isEmpty ? (
              <>
                <Feather name="inbox" size={48} color={colors.placeholder} />
                <Text style={styles.emptyTitle}>
                  {t('search.no_results_title')}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t('search.no_results_subtitle', { query })}
                </Text>
              </>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default SearchResultsScreen;
