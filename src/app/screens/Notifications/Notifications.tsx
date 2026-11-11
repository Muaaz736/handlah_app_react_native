import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import FONTS from '../../../utils/fonts';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../types/store.types';
import { ASYNC_STATUS } from '../../../config/constants';
import {
  getNotificationsAsync,
  markSingleNotificationSeenAsync,
  markAllNotificationsSeenAsync,
  deleteAllNotificationsAsync,
  ApiNotification,
} from '../../../redux/services/notificationsService';
import {
  resetNotifications,
  markItemSeen,
  markAllSeen,
} from '../../../redux/slices/notificationsSlice';
import { resolveScreenFromNotification, buildSharedBusinessFromNotification } from '../../../utils/notificationNavigator';
import { setSelectedBusinessId } from '../../../redux/slices/businessSlice';
import { setSelectedSharedBusiness } from '../../../redux/slices/sharingSlice';
import { setUserRole } from '../../../redux/slices/userRoleSlice';
import { setCurrentConnection, setInitialConnectionRole } from '../../../redux/slices/connectionSlice';
import { USER_ROLES } from '../../../utils/roleManager';
import LinearGradient from 'react-native-linear-gradient';
import { ICONS } from '../../../utils/Images';

const TYPE_ICON: Record<string, string> = {
  reminder: 'bell',
  missed_deadline: 'alert-circle',
  vehicle_transfer_request: 'truck',
  vehicle_transfer_accepted: 'check-circle',
  vehicle_transfer_rejected: 'x-circle',
  shared_data_updated: 'edit-2',
  connection_request: 'users',
  subscription_activated: 'star',
  trial_will_end: 'clock',
  system: 'settings',
  update: 'info',
};
const DEFAULT_ICON = 'bell';

const { width } = require('react-native').Dimensions.get('window');

const stripEmoji = (text: string): string =>
  text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}\u{200D}\u{20D0}-\u{20FF}]/gu, '').trim();

const formatTimestamp = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

type FilterTab = 'all' | 'unread' | 'read';

interface Section {
  title: string;
  data: ApiNotification[];
}

const groupByDate = (items: ApiNotification[]): Section[] => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const buckets: Section[] = [
    { title: 'Today', data: [] },
    { title: 'Yesterday', data: [] },
    { title: 'This Week', data: [] },
    { title: 'Earlier', data: [] },
  ];

  for (const item of items) {
    const d = new Date(item.createdon);
    if (d >= todayStart) buckets[0].data.push(item);
    else if (d >= yesterdayStart) buckets[1].data.push(item);
    else if (d >= weekStart) buckets[2].data.push(item);
    else buckets[3].data.push(item);
  }

  return buckets.filter(b => b.data.length > 0);
};

// Card
const NotificationCard: React.FC<{
  item: ApiNotification;
  onPress: (item: ApiNotification) => void;
  primaryColor: string;
}> = React.memo(({ item, onPress, primaryColor }) => {
  const isUnread = !item.isseen;
  const { themeColors } = useUserRole();
  const iconName = TYPE_ICON[item.type] ?? DEFAULT_ICON;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, isUnread && { backgroundColor: getColorWithOpacity(themeColors.primary, 0.1) }]}
      onPress={() => onPress(item)}
    >
      <LinearGradient
        colors={[
          getColorWithOpacity(themeColors.primary, 0.5),
          themeColors.primary,
        ]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.iconBadge}
      >
        <Feather name={iconName as any} size={20} color={themeColors.background} />
      </LinearGradient>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text
            style={[styles.cardTitle, { color: themeColors.textPrimary }, isUnread && styles.cardTitleUnread]}
            numberOfLines={1}
          >
            {stripEmoji(item.title ?? '')}
          </Text>
          {isUnread && (
            <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />
          )}
        </View>
        <Text style={styles.cardBody} numberOfLines={2}>
          {stripEmoji(item.description ?? '')}
        </Text>
        <Text style={styles.cardTimestamp}>{formatTimestamp(item.createdon)}</Text>
      </View>
    </TouchableOpacity>
  );
});
NotificationCard.displayName = 'NotificationCard';

// Section header
const SectionHeader: React.FC<{ title: string }> = React.memo(({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
));
SectionHeader.displayName = 'SectionHeader';

const PAGE_SIZE = 20;

const Notifications: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { themeColors, userRole } = useUserRole();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const {
    notifications,
    unseen_count,
    total_count,
    has_more,
    current_page,
    get_notifications_status,
    load_more_status,
    delete_all_status,
  } = useSelector((state: any) => state.notifications_slice);

  const isLoading = get_notifications_status === ASYNC_STATUS.LOADING;
  const isLoadingMore = load_more_status === ASYNC_STATUS.LOADING;
  const isRefreshing = isLoading && notifications.length > 0;
  const isClearingAll = delete_all_status === ASYNC_STATUS.LOADING;

  const fetchPage = useCallback(
    (page: number) => {
      dispatch(getNotificationsAsync({ page, pageSize: PAGE_SIZE }));
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(resetNotifications());
    fetchPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    dispatch(resetNotifications());
    fetchPage(1);
  }, [fetchPage, dispatch]);

  const handleEndReached = useCallback(() => {
    if (!has_more || isLoadingMore || isLoading) return;
    fetchPage(current_page + 1);
  }, [has_more, isLoadingMore, isLoading, current_page, fetchPage]);

  const handleNotificationPress = useCallback(
    (item: ApiNotification) => {
      if (!item.isseen) {
        dispatch(markItemSeen(item.id));
        dispatch(markSingleNotificationSeenAsync(item.id));
      }

      const data = item.data as any;
      const bId = data?.businessId || data?.business_id;
      const targetAccountType = data?.targetAccountType || data?.targetaccounttype;
      const roleBeforeSwitch = userRole;

      if (bId) {
        dispatch(setUserRole(USER_ROLES.BUSINESS));
        dispatch(setSelectedBusinessId(Number(bId)));
        const sharedBusiness = buildSharedBusinessFromNotification(data);
        if (sharedBusiness) {
          dispatch(setSelectedSharedBusiness(sharedBusiness));
        }
      } else if (targetAccountType === 'Business') {
        dispatch(setUserRole(USER_ROLES.BUSINESS));
      } else if (targetAccountType === 'Personal') {
        dispatch(setUserRole(USER_ROLES.PERSONAL));
      } else if (userRole === USER_ROLES.BUSINESS) {
        dispatch(setUserRole(USER_ROLES.PERSONAL));
      }

      if (item.type === 'connection_accepted' && data?.acceptedByUserId != null) {
        dispatch(setInitialConnectionRole(roleBeforeSwitch));
        dispatch(setCurrentConnection({ currentConnectionUserId: Number(data.acceptedByUserId) }));
      }

      const target = resolveScreenFromNotification({
        ...data,
        notificationType: item.type,
        url: item.url,
      });
      if (target) {
        (navigation as any).navigate(target.screen, target.params);
      }
    },
    [dispatch, navigation, userRole],
  );

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllSeen());
    dispatch(markAllNotificationsSeenAsync());
  }, [dispatch]);

  const handleClearAll = useCallback(() => {
    if (isClearingAll) return;
    Alert.alert(
      t('notifications.clear_all_title', { defaultValue: 'Clear all notifications?' }),
      t('notifications.clear_all_message', {
        defaultValue: 'This will permanently delete all your notifications. This action cannot be undone.',
      }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('notifications.clear_all', { defaultValue: 'Clear all' }),
          style: 'destructive',
          onPress: () => dispatch(deleteAllNotificationsAsync()),
        },
      ],
    );
  }, [dispatch, isClearingAll, t]);

  const sections = useMemo(() => {
    const filtered =
      activeTab === 'unread'
        ? notifications.filter((n: ApiNotification) => !n.isseen)
        : activeTab === 'read'
          ? notifications.filter((n: ApiNotification) => n.isseen)
          : notifications;
    return groupByDate(filtered);
  }, [notifications, activeTab]);

  const renderItem = useCallback(
    ({ item }: { item: ApiNotification }) => (
      <NotificationCard
        item={item}
        onPress={handleNotificationPress}
        primaryColor={themeColors.primary}
      />
    ),
    [handleNotificationPress, themeColors.primary],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => <SectionHeader title={section.title} />,
    [],
  );

  const keyExtractor = useCallback((item: ApiNotification) => String(item.id), []);

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: t('common.all', { defaultValue: 'All' }) },
    {
      key: 'unread',
      label: t('notifications.unread', { defaultValue: 'Unread' }),
      count: unseen_count || 0,
    },
    {
      key: 'read',
      label: t('notifications.read', { defaultValue: 'Read' }),
      count: (total_count || 0) - (unseen_count || 0),
    },
  ];

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={ICONS.BACK_ICON}
            style={{ width: 35, height: 35, tintColor: themeColors.textPrimary }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { marginRight: unseen_count > 0 ? width * -0.12 : 0, color: themeColors.textPrimary }]}>{t('notifications.title')}</Text>
        {unseen_count > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: themeColors.primary }]}>
              {t('notifications.mark_all_read')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Filter tabs */}
      <View style={[styles.tabsRow, { backgroundColor: themeColors.background }]}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive ? {
                  backgroundColor: themeColors.primary + '30',
                  borderColor: themeColors.primary,
                } : {
                  borderColor: themeColors.textSecondary,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive, { color: isActive ? themeColors.primary : themeColors.textSecondary }]}>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 ? `  ${tab.count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}

        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={handleClearAll}
            disabled={isClearingAll}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isClearingAll ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Feather name="trash-2" size={14} color={colors.error} />
                <Text style={styles.clearAllText}>
                  {t('notifications.clear_all', { defaultValue: 'Clear all' })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Full-page loader (first fetch) */}
      {isLoading && notifications.length === 0 ? (
        <View style={styles.fullLoader}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="bell-off" size={52} color={colors.placeholder} />
          <Text style={styles.emptyTitle}>{t('notifications.empty_title')}</Text>
          <Text style={styles.emptySubtitle}>{t('notifications.empty_subtitle')}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        />
      )}
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: '800',
    flex: 1,
    textAlign: 'center',
  },
  markAllBtn: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  markAllText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
  },
  headerPlaceholder: {
    width: 36,
  },

  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium
  },
  tabTextActive: {
    fontFamily: FONTS.display_semi_bold,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 13,
    fontFamily: FONTS.display_medium,
    color: colors.error,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  fullLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  separator: {
    height: 6,
  },
  sectionSeparator: {
    height: 2,
  },

  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontFamily: FONTS.display_semi_bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    ...Platform.select({
      android: { elevation: 0 },
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
    }),
  },
  cardUnread: {
    backgroundColor: '#FAFBFF',
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    flex: 1,
  },
  cardTitleUnread: {
    fontFamily: FONTS.display_semi_bold,
  },
  cardBody: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardTimestamp: {
    fontSize: 11,
    fontFamily: FONTS.display_regular,
    color: colors.placeholder,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 2,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_semi_bold,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});


