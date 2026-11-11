import {
  useWindowDimensions,
  FlatList,
  ScrollView,
  Text,
  View,
  ListRenderItem,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useRef,
  FC,
  useEffect,
} from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AuthHeader } from '../../../../../components/common';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { makeFavoritesManagementStyles } from './FavoritesManagement.styles';
import { useUserRole } from '../../../../../hooks/useUserRole';
import CustomFavoriteCard from '../../../../../components/CustomCards/CustomFavoriteCard';
import { PrimaryButton } from '../../../../../components/common';
import { isIOS } from '../../../../../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAppTabsAsync,
  getFavoriteTabsAsync,
  addFavoriteTabAsync,
  deleteFavoriteTabAsync,
} from '../../../../../redux/services/essentialsService';
import { setFavoriteTabOrder } from '../../../../../redux/slices/essentialsSlice';
import { ICONS } from '../../../../../utils/Images';
import type {
  ApiAppTab,
  ApiAppTabCategory,
} from '../../../../../types/reduxTypes/essentialsSlice.types';
import {
  FavoriteItem,
  FavoritesSectionReceiverProps,
  FavoritesSectionDonorProps,
  DraggableCardProps,
  DragPosition,
  DragSource,
  LayoutMetrics,
  MAX_FAVORITES,
} from './FavoritesManagement.types';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const MIN_CARDS_PER_ROW = 4;
const CARD_MARGIN = 6;
const SECTION_HORIZONTAL_PADDING = 16;
const CONTAINER_PADDING = 10;
const FAVORITES_STORAGE_KEY = '@handlah_favorites';

const TARGET_CARD_SIZE = 90;

const getGridMetrics = (
  windowWidth: number,
): { cardsPerRow: number; cardWidth: number } => {
  const available =
    windowWidth - SECTION_HORIZONTAL_PADDING * 2 - CONTAINER_PADDING * 2;
  const cardsPerRow = Math.max(
    MIN_CARDS_PER_ROW,
    Math.floor((available + CARD_MARGIN) / (TARGET_CARD_SIZE + CARD_MARGIN)),
  );
  const cardWidth =
    (available - CARD_MARGIN * (cardsPerRow - 1)) / cardsPerRow;
  return { cardsPerRow, cardWidth };
};

// ─── Draggable Card (react-native-gesture-handler + reanimated) ──────────────
const DraggableCard: FC<DraggableCardProps> = memo(
  ({
    item,
    source,
    onDragStart,
    onDragMove,
    onDragEnd,
    containerWidth,
    onDragActiveChange,
    showCloseBtn = false,
    onClosePress,
  }) => {
    const scale = useSharedValue(1);
    const dragCommitted = useSharedValue(false);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const panGesture = Gesture.Pan()
      .activateAfterLongPress(150)
      .onStart((e) => {
        startX.value = e.absoluteX;
        startY.value = e.absoluteY;
        dragCommitted.value = false;
      })
      .onUpdate((e) => {
        const dx = e.absoluteX - startX.value;
        const dy = e.absoluteY - startY.value;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!dragCommitted.value && distance > 8) {
          dragCommitted.value = true;
          scale.value = withSpring(1.12, { mass: 0.5, stiffness: 300 });
          runOnJS(onDragStart)(item, { x: e.absoluteX, y: e.absoluteY }, source);
          if (onDragActiveChange) runOnJS(onDragActiveChange)(true);
        }
        if (dragCommitted.value) {
          runOnJS(onDragMove)({ x: e.absoluteX, y: e.absoluteY });
        }
      })
      .onEnd((e) => {
        if (dragCommitted.value) {
          runOnJS(onDragEnd)(item, { x: e.absoluteX, y: e.absoluteY }, source);
          if (onDragActiveChange) runOnJS(onDragActiveChange)(false);
        }
        dragCommitted.value = false;
        scale.value = withSpring(1, { mass: 0.5, stiffness: 300 });
      })
      .onFinalize(() => {
        if (dragCommitted.value) {
          runOnJS(onDragEnd)(item, { x: 0, y: 0 }, source);
          if (onDragActiveChange) runOnJS(onDragActiveChange)(false);
        }
        dragCommitted.value = false;
        scale.value = withSpring(1, { mass: 0.5, stiffness: 300 });
      });

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <CustomFavoriteCard
            item={item}
            onPress={() => { }}
            containerStyle={{ width: containerWidth }}
            isDragCard={true}
            showCloseBtn={showCloseBtn}
            onClosePress={onClosePress}
          />
        </Animated.View>
      </GestureDetector>
    );
  },
);
DraggableCard.displayName = 'DraggableCard';

const FavoritesSectionReceiver: FC<FavoritesSectionReceiverProps> = memo(
  ({
    data,
    onRemove,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragActiveChange,
    isDragActive,
    receiverRef,
  }) => {
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeFavoritesManagementStyles(themeColors as RoleTheme), [themeColors]);
    const { width: windowWidth } = useWindowDimensions();
    const { cardsPerRow, cardWidth } = getGridMetrics(windowWidth);

    const renderItem: ListRenderItem<FavoriteItem> = useCallback(
      ({ item }) => (
        <DraggableCard
          item={item}
          source="receiver"
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragActiveChange={onDragActiveChange}
          containerWidth={cardWidth}
          showCloseBtn={true}
          onClosePress={() => onRemove(item)}
        />
      ),
      [onRemove, onDragStart, onDragMove, onDragEnd, onDragActiveChange, cardWidth],
    );

    const keyExtractor = useCallback((item: FavoriteItem) => item.id, []);

    return (
      <View
        ref={receiverRef}
        collapsable={false}
        style={styles.sectionWithPadding}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {data.length} {t('favorites_management.shown_on_dashboard')}
          </Text>
          <Text style={[styles.sectionCount, { color: themeColors.primary }]}>
            {data.length}/{MAX_FAVORITES}
          </Text>
        </View>
        <View
          style={[
            styles.favoritesListContainer,
            isDragActive && styles.dropZoneActive,
          ]}
        >
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={cardsPerRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.favoritesGrid}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            key={`receiver-grid-${cardsPerRow}`}
          />
        </View>
      </View>
    );
  },
);
FavoritesSectionReceiver.displayName = 'FavoritesSectionReceiver';

// ─── Donor Section (bottom – available items) ────────────────────────────────
const FavoritesSectionDonor: FC<FavoritesSectionDonorProps> = memo(
  ({ data, onDragStart, onDragMove, onDragEnd, onDragActiveChange, donorRef }) => {
    const { t } = useTranslation();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeFavoritesManagementStyles(themeColors as RoleTheme), [themeColors]);
    const { width: windowWidth } = useWindowDimensions();
    const { cardsPerRow, cardWidth } = getGridMetrics(windowWidth);

    const renderItem: ListRenderItem<FavoriteItem> = useCallback(
      ({ item }) => (
        <DraggableCard
          item={item}
          source="donor"
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          containerWidth={cardWidth}
          onDragActiveChange={onDragActiveChange}
        />
      ),
      [onDragStart, onDragMove, onDragEnd, onDragActiveChange, cardWidth],
    );

    const keyExtractor = useCallback((item: FavoriteItem) => item.id, []);

    return (
      <View
        ref={donorRef}
        collapsable={false}
        style={styles.sectionWithPadding}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('favorites_management.available_to_show')}
          </Text>
        </View>
        <View style={styles.favoritesListContainer}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={cardsPerRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.favoritesGrid}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            columnWrapperStyle={styles.columnWrapper}
            key={`grid-${cardsPerRow}`}
          />
        </View>
      </View>
    );
  },
);
FavoritesSectionDonor.displayName = 'FavoritesSectionDonor';

// ─── Route → screenRoute map ─────────────────────────────────────────────────
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

// Route → i18n title key map (used by CustomFavoriteCard via t(item.titleKey))
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

// Route → local icon map
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

function mapApiTabToFavoriteItem(tab: ApiAppTab): FavoriteItem {
  return {
    id: String(tab.id),
    titleKey: ROUTE_TO_TITLE_KEY[tab.route] ?? tab.name,
    icon: ROUTE_TO_ICON[tab.route] ?? ICONS.BOOKMARK_ICON,
    screenRoute: ROUTE_TO_SCREEN[tab.route] ?? tab.route,
    appTabId: tab.id,
    isfavorite: tab.isfavorite,
  } as FavoriteItem;
}

const FavoritesManagement: FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const { cardsPerRow, cardWidth } = getGridMetrics(windowWidth);
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeFavoritesManagementStyles(themeColors as RoleTheme), [themeColors]);

  const get_app_tabs_data: ApiAppTabCategory[] | null = useSelector(
    (state: any) => state.essentials_slice?.get_app_tabs_data ?? null,
  );
  const get_app_tabs_status: string = useSelector(
    (state: any) => state.essentials_slice?.get_app_tabs_status ?? 'IDLE',
  );
  const get_favorite_tabs_data: ApiAppTab[] | null = useSelector(
    (state: any) => state.essentials_slice?.get_favorite_tabs_data ?? null,
  );

  const allItems = useMemo<FavoriteItem[]>(() => {
    if (!get_app_tabs_data) {
      return [];
    }
    const tabs: ApiAppTab[] = get_app_tabs_data.flatMap(
      cat => cat.apptabs ?? [],
    );
    return tabs.map(mapApiTabToFavoriteItem);
  }, [get_app_tabs_data]);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Drag state — use refs for high-frequency updates (no re-renders on move)
  const [draggedItem, setDraggedItem] = useState<FavoriteItem | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragPosRef = useRef<DragPosition>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<DragPosition>({ x: 0, y: 0 });

  const receiverRef = useRef<View>(null);
  const donorRef = useRef<View>(null);
  const receiverLayoutRef = useRef<LayoutMetrics | null>(null);

  useEffect(() => {
    dispatch(getAppTabsAsync(undefined));
    dispatch(getFavoriteTabsAsync(undefined));
  }, [dispatch]);

  useEffect(() => {
    const appTabsReady = get_app_tabs_status === 'SUCCEEDED';
    const appTabsError = get_app_tabs_status === 'ERROR';

    if (!appTabsReady && !appTabsError) return;

    if (get_favorite_tabs_data !== null && allItems.length > 0) {
      const ordered = get_favorite_tabs_data
        .map(tab => allItems.find(item => item.id === String(tab.id)))
        .filter(Boolean) as FavoriteItem[];
      setFavorites(ordered);
      setIsLoading(false);
      return;
    }

    if (appTabsError) {
      // Fallback: try AsyncStorage
      AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
        .then(stored => {
          if (stored) {
            const savedIds: string[] = JSON.parse(stored);
            const restored = savedIds
              .map(id => allItems.find(item => item.id === id))
              .filter(Boolean) as FavoriteItem[];
            setFavorites(restored);
          }
        })
        .catch(() => { })
        .finally(() => setIsLoading(false));
      return;
    }

    // All tabs loaded but no favorites yet
    if (appTabsReady) {
      setIsLoading(false);
    }
  }, [get_app_tabs_status, get_favorite_tabs_data, allItems]);

  const availableItems = useMemo<FavoriteItem[]>(
    () => allItems.filter(item => !favorites.some(fav => fav.id === item.id)),
    [favorites, allItems],
  );

  const measureReceiver = useCallback(() => {
    if (receiverRef.current) {
      receiverRef.current.measure((_x, _y, width, height, pageX, pageY) => {
        receiverLayoutRef.current = { x: pageX, y: pageY, width, height };
      });
    }
  }, []);

  const handleDragStart = useCallback(
    (item: FavoriteItem, position: DragPosition, _source: DragSource) => {
      measureReceiver();
      dragPosRef.current = position;
      setDragPos(position);
      setDraggedItem(item);
      setIsDragActive(true);
    },
    [measureReceiver],
  );

  const handleDragMove = useCallback((position: DragPosition) => {
    dragPosRef.current = position;
    setDragPos({ ...position });
  }, []);

  const handleDragEnd = useCallback(
    (item: FavoriteItem, position: DragPosition, source: DragSource) => {
      setIsDragActive(false);
      setDraggedItem(null);
      setDragPos({ x: 0, y: 0 });

      const layout = receiverLayoutRef.current;
      const isInsideReceiver =
        !!layout &&
        position.x > 0 &&
        position.y >= layout.y &&
        position.y <= layout.y + layout.height;

      if (!isInsideReceiver) return;

      if (source === 'donor') {
        if (!favorites.some(fav => fav.id === item.id)) {
          setFavorites(prev => {
            const next =
              prev.length >= MAX_FAVORITES
                ? [...prev.slice(1), item]
                : [...prev, item];
            return next;
          });
        }
        return;
      }

      // source === 'receiver' → reorder within favorites
      const cellWidth = cardWidth + CARD_MARGIN;
      const cellHeight = cardWidth + CARD_MARGIN;
      const localX = position.x - layout!.x - CONTAINER_PADDING;
      const localY = position.y - layout!.y - CONTAINER_PADDING;
      const col = Math.max(
        0,
        Math.min(cardsPerRow - 1, Math.floor(localX / cellWidth)),
      );
      const row = Math.max(0, Math.floor(localY / cellHeight));
      const rawIndex = row * cardsPerRow + col;

      setFavorites(prev => {
        const fromIndex = prev.findIndex(f => f.id === item.id);
        if (fromIndex === -1) return prev;
        const targetIndex = Math.max(
          0,
          Math.min(prev.length - 1, rawIndex),
        );
        if (fromIndex === targetIndex) return prev;
        const next = [...prev];
        next.splice(fromIndex, 1);
        next.splice(targetIndex, 0, item);
        return next;
      });
    },
    [favorites, cardsPerRow, cardWidth],
  );

  const handleRemove = useCallback((item: FavoriteItem) => {
    setFavorites(prev => prev.filter(fav => fav.id !== item.id));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const ids = favorites.map(f => f.id);

      dispatch(setFavoriteTabOrder(ids));

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));


      const originalFavoriteIds = new Set(
        allItems.filter(item => (item as any).isfavorite).map(item => item.id),
      );
      const newFavoriteIds = new Set(favorites.map(f => f.id));

      const toAdd = favorites.filter(f => !originalFavoriteIds.has(f.id));
      const toRemove = allItems.filter(
        item => (item as any).isfavorite && !newFavoriteIds.has(item.id),
      );

      const addPromises = toAdd.map(item =>
        dispatch(addFavoriteTabAsync({ appTabId: (item as any).appTabId })),
      );
      const removePromises = toRemove.map(item =>
        dispatch(deleteFavoriteTabAsync((item as any).appTabId)),
      );
      await Promise.all([...addPromises, ...removePromises]);

      dispatch(getAppTabsAsync(undefined));
      dispatch(getFavoriteTabsAsync(undefined));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    } finally {
      setIsSaving(false);
      navigation.goBack();
    }
  }, [favorites, allItems, dispatch, navigation]);

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false} showShadow={false}>
        <AuthHeader
          title={t('favorites_management.title')}
          subtitle={t('favorites_management.subtitle')}
          onBackPress={() => navigation.goBack()}
          containerStyle={[
            styles.headerContainerStyle,
            { paddingTop: isIOS ? 0 : 20 },
          ]}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <AuthHeader
        title={t('favorites_management.title')}
        subtitle={t('favorites_management.subtitle')}
        onBackPress={() => navigation.goBack()}
        containerStyle={[
          styles.headerContainerStyle,
          { paddingTop: isIOS ? 0 : 20 },
        ]}
      />
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        nestedScrollEnabled={true}
        scrollEnabled={!isDragActive}
      >
        <FavoritesSectionReceiver
          data={favorites}
          onRemove={handleRemove}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragActiveChange={(active: boolean) => setIsDragActive(active)}
          isDragActive={isDragActive}
          receiverRef={receiverRef}
        />

        <FavoritesSectionDonor
          data={availableItems}
          onAdd={() => { }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragActiveChange={(active: boolean) => setIsDragActive(active)}
          donorRef={donorRef}
        />

        <PrimaryButton
          title={
            isSaving
              ? t('common.saving') || 'Saving…'
              : t('favorites_management.save')
          }
          onPress={handleSave}
          textStyle={styles.saveButtonText}
          buttonStyle={styles.saveButton}
        />
      </ScrollView>

      {/* Floating ghost card follows the finger */}
      {isDragActive && draggedItem && (
        <View style={styles.floatingCardContainer} pointerEvents="none">
          <View
            style={[
              styles.floatingCard,
              {
                left: dragPos.x - cardWidth / 2,
                top: dragPos.y - cardWidth / 2,
              },
            ]}
          >
            <CustomFavoriteCard
              item={draggedItem}
              containerStyle={{ width: cardWidth }}
              isDragCard={true}
              showCloseBtn={false}
            />
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default FavoritesManagement;
