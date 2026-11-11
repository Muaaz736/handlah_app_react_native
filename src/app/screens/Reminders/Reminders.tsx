import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import {
  CustomScrollableTabs,
  CustomFloatingActionButton,
  ViewReminderModal,
} from '../../../components/common';
import colors from '../../../utils/colors';
import ReminderGroupCard from '../../../components/CustomCards/ReminderGroupCard';
import { REMINDER_TABS_DATA } from '../../../utils/staticData';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../hooks/useSelectedBusiness';
import Feather from 'react-native-vector-icons/Feather';
import {
  RemindersNavigationProp,
  ReminderTab,
} from './Reminders.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  getRemindersAsync,
  getReminderByIdAsync,
  markReminderCompletedAsync,
  updateReminderAsync,
  deleteReminderAsync,
  setReminderActiveAsync,
  setBatchActiveAsync,
  deleteBatchReminderAsync,
  dismissReminderAsync,
  dismissBatchReminderAsync,
  ReminderStatusParam,
  ReminderDateRange,
  GetRemindersParams,
  UpdateReminderPayload,
  NormalizedReminderGroup,
} from '../../../redux/services/reminderService';
import { setReminderActionStatus } from '../../../redux/slices/reminderSlice';
import {
  resolveScreenFromNotification,
  BUSINESS_MODULE_SCREENS,
} from '../../../utils/notificationNavigator';
import { setUserRole } from '../../../redux/slices/userRoleSlice';
import { setSelectedBusinessId } from '../../../redux/slices/businessSlice';
import { USER_ROLES } from '../../../utils/roleManager';
import EditReminderModal from '../../../components/CustomModals/EditReminderModal';
import { ASYNC_STATUS } from '../../../config/constants';
import { ENV } from '../../../config/env';
import { seriesOfBatch } from '../../../redux/services/reminderV2';
import { ShareReminderModal } from '../../../components/reminders/ShareReminderModal';
import { makeRemindersStyles } from './Reminders.styles';
import { AiFab } from '../../../components/common/AiFab';
import { useSubscriptionGate } from '../../../hooks/useSubscriptionGate';
import { RoleTheme } from '../../../types/roleManager.types';

interface RemindersProps {
  /** Shown inside the bottom-bar Calendar tab, under the Calendar/Reminders switch. */
  embedded?: boolean;
  topSlot?: React.ReactNode;
}

const Reminders = ({ embedded = false, topSlot }: RemindersProps = {}): React.ReactElement => {
  const navigation = useNavigation<RemindersNavigationProp>();
  const route = useRoute<RouteProp<{ Reminders: { openReminderId?: number; openReminderEntityType?: string } }, 'Reminders'>>();
  const { t } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeRemindersStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const dispatch = useDispatch();

  const isBusiness = isBusinessRole();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const [activeUserAccountType, setActiveUserAccountType] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReminder, setSelectedReminder] = useState<any | null>(null);
  /** Custom reminder being shared with connections. */
  const [shareTarget, setShareTarget] = useState<{ seriesId: number; title: string } | null>(null);
  const [editReminder, setEditReminder] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mutatingKey, setMutatingKey] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'completed' | 'dismissed' | 'expired'>('all');
  const [filterMenuVisible, setFilterMenuVisible] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<ReminderDateRange | null>(null);
  const [dateRangeMenuVisible, setDateRangeMenuVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    get_reminder_groups,
    get_reminder_pagination,
    get_reminder_status,
    add_ad_hoc_reminder_status,
    mark_completed_reminder_status,
    reminder_action_status,
  } = useSelector((state: any) => state.reminder_slice);
  const unseenNotificationCount = useSelector(
    (state: any) => state.notifications_slice?.unseen_count ?? 0,
  );

  const isLoading = get_reminder_status === ASYNC_STATUS.LOADING;
  const isMarkingCompleted =
    mark_completed_reminder_status === ASYNC_STATUS.LOADING;

  const getApiStatus = useCallback(
    (tabValue: ReminderTab['value']): ReminderStatusParam | undefined => {
      if (tabValue === 'due_today') return 'today';
      if (tabValue === 'upcoming') return 'upcoming';
      if (tabValue === 'past_due') return 'past_due';
      if (tabValue === 'completed') return 'completed';
      return undefined;
    },
    [],
  );

  useFocusEffect(useCallback(() => {
    const tabValue = REMINDER_TABS_DATA[activeTab]?.value;
    const apiStatus = getApiStatus(tabValue as ReminderTab['value']);
    const params: GetRemindersParams = { page: 1, pageSize: 20, isBusiness };
    if (apiStatus) params.status = apiStatus;
    if (isBusiness && selectedBusinessId) params.businessId = selectedBusinessId;
    if (activeFilter === 'active' || activeFilter === 'inactive') params.isActive = activeFilter === 'active';
    if (apiStatus === 'completed' && (activeFilter === 'completed' || activeFilter === 'dismissed' || activeFilter === 'expired')) params.closedAs = activeFilter;
    if (apiStatus === 'upcoming' && dateRange) params.dateRange = dateRange;
    setCurrentPage(1);
    dispatch(getRemindersAsync(params) as any);
  }, [activeTab, getApiStatus, isBusiness, selectedBusinessId, activeFilter, dateRange, dispatch]))

  useEffect(() => {
    const { openReminderId, openReminderEntityType } = (route.params ?? {}) as any;
    if (!openReminderId) return;
    dispatch(getReminderByIdAsync({ id: openReminderId }) as any).then((res: any) => {
      const data = res?.payload;
      if (data) {
        setSelectedReminder({ ...data, _entityType: openReminderEntityType });
      }
    });
    navigation.setParams({ openReminderId: undefined, openReminderEntityType: undefined } as any);
  }, [route.params]);

  useEffect(() => {
    const tabValue = REMINDER_TABS_DATA[activeTab]?.value;
    const apiStatus = getApiStatus(tabValue as ReminderTab['value']);

    const params: GetRemindersParams = {
      page: currentPage,
      pageSize: 20,
      isBusiness: isBusiness,
    };
    if (apiStatus) params.status = apiStatus;
    if (isBusiness && selectedBusinessId) params.businessId = selectedBusinessId;
    if (activeFilter === 'active' || activeFilter === 'inactive') params.isActive = activeFilter === 'active';
    if (apiStatus === 'completed' && (activeFilter === 'completed' || activeFilter === 'dismissed' || activeFilter === 'expired')) params.closedAs = activeFilter;
    if (apiStatus === 'upcoming' && dateRange) params.dateRange = dateRange;

    dispatch(getRemindersAsync(params) as any);
  }, [
    activeTab,
    currentPage,
    getApiStatus,
    isBusiness,
    selectedBusinessId,
    activeFilter,
    dateRange,
    add_ad_hoc_reminder_status,
  ]);

  const handleTabChange = useCallback((index: number): void => {
    setActiveTab(index);
    setCurrentPage(1);
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  const handleFilterChange = useCallback(
    (next: 'all' | 'active' | 'inactive' | 'completed' | 'dismissed' | 'expired'): void => {
      setActiveFilter(next);
      setCurrentPage(1);
      setFilterMenuVisible(false);
    },
    [],
  );

  const handleDateRangeChange = useCallback(
    (next: ReminderDateRange | null): void => {
      setDateRange(next);
      setCurrentPage(1);
      setDateRangeMenuVisible(false);
    },
    [],
  );

  const handleLoadMore = useCallback((): void => {
    const hasMore = get_reminder_pagination?.hasMore ?? false;
    const isLoadingMore = get_reminder_status === ASYNC_STATUS.LOADING;
    if (hasMore && !isLoadingMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [get_reminder_pagination, get_reminder_status]);

  const handleFloatingButtonPress = useCallback((): void => {
    checkSubscription(() => navigation.navigate('AddAdHocReminder' as any), isBusiness ? 'business' : 'personal');
  }, [checkSubscription, navigation, isBusiness]);

  const reloadReminders = useCallback(() => {
    const tabValue = REMINDER_TABS_DATA[activeTab]?.value;
    const apiStatus = getApiStatus(tabValue as ReminderTab['value']);
    const params: GetRemindersParams = { page: 1, pageSize: 20, isBusiness };
    if (apiStatus) params.status = apiStatus;
    if (isBusiness && selectedBusinessId) params.businessId = selectedBusinessId;
    if (activeFilter === 'active' || activeFilter === 'inactive') params.isActive = activeFilter === 'active';
    if (apiStatus === 'completed' && (activeFilter === 'completed' || activeFilter === 'dismissed' || activeFilter === 'expired')) params.closedAs = activeFilter;
    if (apiStatus === 'upcoming' && dateRange) params.dateRange = dateRange;
    setCurrentPage(1);
    return dispatch(getRemindersAsync(params) as any);
  }, [activeTab, getApiStatus, isBusiness, selectedBusinessId, activeFilter, dateRange, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadReminders();
    } finally {
      setRefreshing(false);
    }
  }, [reloadReminders]);

  const handleMarkAsCompleted = useCallback(
    (reminderId: string | undefined): void => {
      if (!reminderId) return;
      dispatch(markReminderCompletedAsync(Number(reminderId)) as any).then(
        () => {
          setSelectedReminder(null);
          reloadReminders();
        },
      );
    },
    [dispatch, reloadReminders],
  );

  const handleMarkCompleteGroup = useCallback(
    (group: NormalizedReminderGroup): void => {
      const id = group.reminders[0]?.id;
      if (!id) return;
      dispatch(markReminderCompletedAsync(Number(id)) as any).then(() => {
        reloadReminders();
      });
    },
    [dispatch, reloadReminders],
  );

  const isAdHocReminder = (reminder: any): boolean =>
    reminder?.entitytype === 'ad_hoc' || reminder?._entityType === 'ad_hoc';

  const handleEditPress = useCallback((reminder: any): void => {
    setSelectedReminder(null);
    setEditReminder(reminder);
  }, []);

  const handleSaveEdit = useCallback(
    async (payload: UpdateReminderPayload): Promise<void> => {
      if (!editReminder?.id) return;
      try {
        setIsSavingEdit(true);
        await dispatch(
          updateReminderAsync({ id: Number(editReminder.id), data: payload }) as any,
        ).unwrap();
        setEditReminder(null);
        reloadReminders();
      } catch {
      } finally {
        setIsSavingEdit(false);
      }
    },
    [dispatch, editReminder, reloadReminders],
  );

  const handleDeleteReminder = useCallback(
    (reminder: any): void => {
      if (!reminder?.id) return;
      Alert.alert(
        t('reminders_screen.delete_reminder', { defaultValue: 'Delete Reminder' }),
        t('reminders_screen.delete_reminder_confirm', {
          defaultValue: 'Are you sure you want to delete this reminder? This cannot be undone.',
        }),
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('common.delete') || 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsDeleting(true);
                await dispatch(
                  deleteReminderAsync(Number(reminder.id)) as any,
                ).unwrap();
                setSelectedReminder(null);
                reloadReminders();
              } catch {
              } finally {
                setIsDeleting(false);
              }
            },
          },
        ],
      );
    },
    [dispatch, t, reloadReminders],
  );

  const handleViewReminder = useCallback(
    (reminder: any, group: NormalizedReminderGroup): void => {
      setSelectedReminder({
        ...reminder,
        _entityType: group.entityType,
        _batchId: group.batchId,
        _tabStatus: REMINDER_TABS_DATA[activeTab]?.value,
      });
    },
    [activeTab],
  );

  const getReminderNavTarget = useCallback((reminder: any) => {
    if (!reminder) return null;
    const entityType = reminder.entitytype || reminder._entityType;
    if (!entityType || entityType === 'ad_hoc') return null;
    const target = resolveScreenFromNotification({
      entityType,
      entityId: reminder.entityid != null ? String(reminder.entityid) : undefined,
      businessId:
        reminder.businessid != null ? String(reminder.businessid) : undefined,
      notificationType: 'reminder',
    });
    if (!target || target.screen === 'Dashboard') return null;
    return target;
  }, []);

  const handleViewDetails = useCallback((): void => {
    const reminder = selectedReminder;
    const target = getReminderNavTarget(reminder);
    if (!target) return;
    setSelectedReminder(null);
    const businessId = reminder?.businessid;
    if (businessId && BUSINESS_MODULE_SCREENS.has(target.screen)) {
      dispatch(setUserRole(USER_ROLES.BUSINESS));
      dispatch(setSelectedBusinessId(Number(businessId)));
    }
    (navigation as any).navigate(target.screen, target.params);
  }, [selectedReminder, getReminderNavTarget, dispatch, navigation]);


  const buildBatchEditParams = useCallback(
    (group: NormalizedReminderGroup) => {
      const DAY_NAMES = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
      ];
      const pickF = (o: any, ...keys: string[]): any => {
        for (const k of keys) {
          if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
          const l = k.toLowerCase();
          if (o?.[l] !== undefined && o?.[l] !== null) return o[l];
        }
        return undefined;
      };

      const dates = group.reminders
        .map((r: any) => new Date(pickF(r, 'reminderDate', 'reminderdate')))
        .filter((d: Date) => !isNaN(d.getTime()))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

      const weekdays = Array.from(
        new Set(dates.map((d: Date) => DAY_NAMES[d.getDay()])),
      );
      const doms = Array.from(new Set(dates.map((d: Date) => d.getDate())));
      const months = new Set(
        dates.map((d: Date) => `${d.getFullYear()}-${d.getMonth()}`),
      );

      const frequency: 'weekly' | 'monthly' =
        months.size >= 2 && doms.length <= 3 ? 'monthly' : 'weekly';

      const isInfinite = group.isRecurring && group.recurrenceEndDate == null;
      const hasExplicitEndDate = !isInfinite && group.recurrenceEndDate != null;
      const recurrenceEndDate = hasExplicitEndDate ? new Date(group.recurrenceEndDate as string) : null;

      const timeStr = pickF(group.reminders[0], 'reminderTime', 'remindertime');
      let timeISO: string | null = null;
      if (timeStr) {
        const m = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (m) {
          let h = parseInt(m[1], 10);
          const min = parseInt(m[2], 10);
          const ap = (m[3] || '').toUpperCase();
          if (ap === 'PM' && h !== 12) h += 12;
          if (ap === 'AM' && h === 12) h = 0;
          const td = new Date();
          td.setHours(h, min, 0, 0);
          timeISO = td.toISOString();
        }
      }

      return {
        batchId: group.batchId,
        prefill: {
          description: group.title,
          frequency,
          timeISO,
          startDateISO: dates.length ? dates[0].toISOString() : null,
          endDateISO: hasExplicitEndDate ? (recurrenceEndDate as Date).toISOString() : null,
          selectedDays: weekdays,
          selectedDates: doms,
        },
      };
    },
    [],
  );

  const handleEditGroup = useCallback(
    (group: NormalizedReminderGroup): void => {
      if (group.count > 1 && group.batchId) {
        navigation.navigate(
          'AddAdHocReminder' as any,
          buildBatchEditParams(group) as any,
        );
      } else if (group.reminders[0]) {
        setEditReminder(group.reminders[0]);
      }
    },
    [navigation, buildBatchEditParams],
  );

  const handleDeleteGroup = useCallback(
    (group: NormalizedReminderGroup): void => {
      const isBatch = group.count > 1 && !!group.batchId;
      Alert.alert(
        isBatch
          ? t('reminders_screen.delete_series', { defaultValue: 'Delete Series' })
          : t('reminders_screen.delete_reminder', { defaultValue: 'Delete Reminder' }),
        isBatch
          ? t('reminders_screen.delete_series_confirm', {
            defaultValue:
              'Delete all {{count}} reminders in this series? This cannot be undone.',
            count: group.count,
          })
          : t('reminders_screen.delete_reminder_confirm', {
            defaultValue:
              'Are you sure you want to delete this reminder? This cannot be undone.',
          }),
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('common.delete') || 'Delete',
            style: 'destructive',
            onPress: async () => {
              const key = isBatch
                ? String(group.batchId)
                : String(group.reminders[0]?.id);
              try {
                setMutatingKey(key);
                if (isBatch) {
                  await dispatch(
                    deleteBatchReminderAsync(String(group.batchId)) as any,
                  ).unwrap();
                } else {
                  await dispatch(
                    deleteReminderAsync(Number(group.reminders[0]?.id)) as any,
                  ).unwrap();
                }
                reloadReminders();
              } catch {
              } finally {
                setMutatingKey(null);
                dispatch(setReminderActionStatus());
              }
            },
          },
        ],
      );
    },
    [dispatch, t, reloadReminders],
  );

  const handleDismissGroup = useCallback(
    (group: NormalizedReminderGroup): void => {
      const isBatch = group.count > 1 && !!group.batchId;
      Alert.alert(
        t('reminders_screen.dismiss_reminder', { defaultValue: 'Dismiss Reminder' }),
        isBatch
          ? t('reminders_screen.dismiss_series_confirm', { defaultValue: 'Dismiss all {{count}} dates of this reminder? They move to history.', count: group.count })
          : t('reminders_screen.dismiss_reminder_confirm', { defaultValue: 'Dismiss this reminder? It moves to history.' }),
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('common.dismiss', { defaultValue: 'Dismiss' }),
            onPress: async () => {
              const key = isBatch ? String(group.batchId) : String(group.reminders[0]?.id);
              try {
                setMutatingKey(key);
                if (isBatch) await dispatch(dismissBatchReminderAsync(String(group.batchId)) as any).unwrap();
                else await dispatch(dismissReminderAsync(Number(group.reminders[0]?.id)) as any).unwrap();
                reloadReminders();
              } catch {
              } finally {
                setMutatingKey(null);
                dispatch(setReminderActionStatus());
              }
            },
          },
        ],
      );
    },
    [dispatch, t, reloadReminders],
  );

  const [isDismissing, setIsDismissing] = useState(false);
  const handleDismissFromModal = useCallback(
    (reminder: any): void => {
      Alert.alert(
        t('reminders_screen.dismiss_reminder', { defaultValue: 'Dismiss Reminder' }),
        t('reminders_screen.dismiss_reminder_confirm', { defaultValue: 'Dismiss this reminder? It moves to history.' }),
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('common.dismiss', { defaultValue: 'Dismiss' }),
            onPress: async () => {
              try {
                setIsDismissing(true);
                await dispatch(dismissReminderAsync(Number(reminder.id)) as any).unwrap();
                setSelectedReminder(null);
                reloadReminders();
              } catch {
              } finally {
                setIsDismissing(false);
                dispatch(setReminderActionStatus());
              }
            },
          },
        ],
      );
    },
    [dispatch, t, reloadReminders],
  );

  const handleToggleActive = useCallback(
    async (group: NormalizedReminderGroup, next: boolean): Promise<void> => {
      const isBatch = group.count > 1 && !!group.batchId;
      const key = isBatch ? String(group.batchId) : String(group.reminders[0]?.id);
      try {
        setMutatingKey(key);
        if (isBatch) {
          await dispatch(
            setBatchActiveAsync({ batchId: String(group.batchId), isActive: next }) as any,
          ).unwrap();
        } else {
          await dispatch(
            setReminderActiveAsync({
              id: Number(group.reminders[0]?.id),
              isActive: next,
            }) as any,
          ).unwrap();
        }
        reloadReminders();
      } catch {
      } finally {
        setMutatingKey(null);
        dispatch(setReminderActionStatus());
      }
    },
    [dispatch, reloadReminders],
  );

  const filteredGroups = useMemo((): NormalizedReminderGroup[] => {
    const groups: NormalizedReminderGroup[] = Array.isArray(get_reminder_groups)
      ? get_reminder_groups
      : [];
    const tabValue = REMINDER_TABS_DATA[activeTab]?.value;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return groups.filter(
        g =>
          g.title?.toLowerCase().includes(q) ||
          g.reminders?.some((r: any) =>
            String(r?.message ?? '').toLowerCase().includes(q),
          ),
      );
    }
    return groups;
  }, [activeTab, get_reminder_groups, searchQuery]);

  const groupKey = useCallback(
    (group: NormalizedReminderGroup): string =>
      group.batchId
        ? `batch-${group.batchId}`
        : `single-${group.reminders[0]?.id ?? Math.random()}`,
    [],
  );

  const tabValue = REMINDER_TABS_DATA[activeTab]?.value;
  const showActiveToggle = tabValue !== 'past_due' && tabValue !== 'completed';

  const renderGroupItem = useCallback<ListRenderItem<NormalizedReminderGroup>>(
    ({ item }): React.ReactElement => (
      <ReminderGroupCard
        group={item}
        themeColors={themeColors}
        onView={handleViewReminder}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
        onToggleActive={handleToggleActive}
        onMarkComplete={tabValue !== 'completed' ? handleMarkCompleteGroup : undefined}
        onDismiss={ENV.REMINDERS_V2 && tabValue !== 'completed' ? handleDismissGroup : undefined}
        showActiveToggle={showActiveToggle}
        isMutating={
          mutatingKey ===
          (item.batchId
            ? String(item.batchId)
            : String(item.reminders[0]?.id))
        }
      />
    ),
    [
      themeColors,
      handleViewReminder,
      handleEditGroup,
      handleDeleteGroup,
      handleToggleActive,
      handleDismissGroup,
      handleMarkCompleteGroup,
      tabValue,
      showActiveToggle,
      mutatingKey,
    ],
  );

  const isCompletedTab =
    (REMINDER_TABS_DATA[activeTab]?.value as string) === 'completed';

  const filterLabel =
    activeFilter === 'completed' || activeFilter === 'dismissed' || activeFilter === 'expired'
      ? t(`reminders_screen.closed_${activeFilter}`, { defaultValue: activeFilter === 'completed' ? 'Completed' : activeFilter === 'dismissed' ? 'Dismissed' : 'Expired' })
      : activeFilter === 'active'
      ? t('reminders_screen.filter_active', { defaultValue: 'Active' })
      : activeFilter === 'inactive'
        ? t('reminders_screen.filter_inactive', { defaultValue: 'Inactive' })
        : t('reminders_screen.filter_all', { defaultValue: 'All' });

  const isUpcomingTab = tabValue === 'upcoming';

  const dateRangeOptions = useMemo(
    (): { key: ReminderDateRange | null; label: string }[] => [
      { key: null, label: t('reminders_screen.range_all', { defaultValue: 'All upcoming' }) },
      { key: 'next_7', label: t('reminders_screen.range_next_7', { defaultValue: 'Next 7 days' }) },
      { key: 'next_30', label: t('reminders_screen.range_next_30', { defaultValue: 'Next 30 days' }) },
      { key: 'next_90', label: t('reminders_screen.range_next_90', { defaultValue: 'Next 3 months' }) },
      { key: 'this_month', label: t('reminders_screen.range_this_month', { defaultValue: 'This month' }) },
      { key: 'this_year', label: t('reminders_screen.range_this_year', { defaultValue: 'This year' }) },
    ],
    [t],
  );

  const dateRangeLabel =
    dateRangeOptions.find(o => o.key === dateRange)?.label ?? dateRangeOptions[0].label;

  const ListHeaderComponent = useMemo(
    (): React.ReactElement => (
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>{t('reminders_screen.title')}</Text>
          {!embedded && <TouchableOpacity
            style={[styles.filterButton, { borderColor: themeColors.primary + '55', marginLeft: 'auto', marginRight: 8 }]}
            onPress={() => navigation.navigate('Calendar' as never)}
            activeOpacity={0.7}
            accessibilityLabel={t('calendar_screen.title')}
          >
            <Feather name="calendar" size={14} color={themeColors.primary} />
            <Text style={[styles.filterButtonText, { color: themeColors.primary }]}>{t('calendar_screen.title')}</Text>
          </TouchableOpacity>}
          <TouchableOpacity
            style={[styles.filterButton, { borderColor: themeColors.primary + '55' }, embedded && { marginLeft: 'auto' }]}
            onPress={() => setFilterMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="filter" size={14} color={themeColors.primary} />
            <Text style={[styles.filterButtonText, { color: themeColors.primary }]}>
              {filterLabel}
            </Text>
            <Feather name="chevron-down" size={14} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
        <CustomScrollableTabs
          tabs={REMINDER_TABS_DATA}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showViewAll={false}
        />
        {isUpcomingTab && (
          <View style={styles.titleRow}>
            <TouchableOpacity
              style={[styles.filterButton, { borderColor: themeColors.primary + '55' }]}
              onPress={() => setDateRangeMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Feather name="calendar" size={14} color={themeColors.primary} />
              <Text style={[styles.filterButtonText, { color: themeColors.primary }]}>
                {dateRangeLabel}
              </Text>
              <Feather name="chevron-down" size={14} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.searchBar, { borderColor: themeColors.primary + '44' }]}>
          <Feather name="search" size={16} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('reminders_screen.search_completed') || 'Search completed reminders...'}
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [
      activeTab,
      handleTabChange,
      t,
      isCompletedTab,
      isUpcomingTab,
      dateRangeLabel,
      searchQuery,
      themeColors,
      filterLabel,
    ],
  );

  const ListEmptyComponent = useMemo(
    (): React.ReactElement => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t('reminders_screen.no_reminders')}
        </Text>
      </View>
    ),
    [t],
  );

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('Notifications' as never);
  }, [navigation]);

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <CustomHeader
        onNotificationPress={handleNotificationPress}
        notificationCount={unseenNotificationCount}
      />
      {topSlot}

      <FlatList<NormalizedReminderGroup>
        data={filteredGroups}
        renderItem={renderGroupItem}
        keyExtractor={groupKey}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={isLoading && currentPage === 1 ? undefined : ListEmptyComponent}
        ListFooterComponent={
          isLoading && currentPage > 1
            ? () => (
              <ActivityIndicator
                size="small"
                color={themeColors.primary}
                style={{ marginVertical: 16 }}
              />
            )
            : undefined
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
      />

      <CustomFloatingActionButton
        onPress={handleFloatingButtonPress}
        icon="plus"
        color={themeColors.primary}
        iconColor={themeColors.text}
        size={55}
        iconSize={28}
        style={styles.floatingButton}
      />
      <AiFab />
      {GateModal}
      <ViewReminderModal
        visible={!!selectedReminder}
        onClose={() => setSelectedReminder(null)}
        reminder={selectedReminder}
        onMarkAsCompleted={
          selectedReminder && selectedReminder.kind !== 'row'
            ? () => handleMarkAsCompleted(String(selectedReminder.id))
            : undefined
        }
        isMarkingCompleted={isMarkingCompleted}
        onDismiss={
          ENV.REMINDERS_V2 && selectedReminder && (selectedReminder.kind !== 'row' || selectedReminder.candismissrow)
            ? () => handleDismissFromModal(selectedReminder)
            : undefined
        }
        isDismissing={isDismissing}
        onViewDetails={
          getReminderNavTarget(selectedReminder) ? handleViewDetails : undefined
        }
        onEdit={
          isAdHocReminder(selectedReminder)
            ? () => handleEditPress(selectedReminder)
            : undefined
        }
        onDelete={
          isAdHocReminder(selectedReminder) || (selectedReminder?.kind === 'row' && selectedReminder?.candeleterow)
            ? () => handleDeleteReminder(selectedReminder)
            : undefined
        }
        isDeleting={isDeleting}
        onShare={
          ENV.REMINDERS_V2 && isAdHocReminder(selectedReminder) && selectedReminder?.batchid && seriesOfBatch(String(selectedReminder.batchid))
            ? () => {
                setShareTarget({ seriesId: seriesOfBatch(String(selectedReminder.batchid))!, title: selectedReminder.title || selectedReminder.message || '' });
                setSelectedReminder(null);
              }
            : undefined
        }
      />

      <ShareReminderModal seriesId={shareTarget?.seriesId ?? null} title={shareTarget?.title} onClose={() => setShareTarget(null)} />

      <EditReminderModal
        visible={!!editReminder}
        reminder={editReminder}
        onClose={() => setEditReminder(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
      />

      <Modal
        visible={filterMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.filterMenuOverlay}
          activeOpacity={1}
          onPress={() => setFilterMenuVisible(false)}
        >
          <View style={[styles.filterMenu, { top: 110, right: 16 }]}>
            {(ENV.REMINDERS_V2 && isCompletedTab
              ? [
                  { key: 'all', label: t('reminders_screen.filter_all', { defaultValue: 'All' }) },
                  { key: 'completed', label: t('reminders_screen.closed_completed', { defaultValue: 'Completed' }) },
                  { key: 'dismissed', label: t('reminders_screen.closed_dismissed', { defaultValue: 'Dismissed' }) },
                  { key: 'expired', label: t('reminders_screen.closed_expired', { defaultValue: 'Expired' }) },
                ]
              : [
                  { key: 'all', label: t('reminders_screen.filter_all', { defaultValue: 'All' }) },
                  { key: 'active', label: t('reminders_screen.filter_active', { defaultValue: 'Active' }) },
                  { key: 'inactive', label: t('reminders_screen.filter_inactive', { defaultValue: 'Inactive' }) },
                ] as { key: any; label: string }[]
            ).map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={styles.filterMenuItem}
                onPress={() => handleFilterChange(opt.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterMenuItemText,
                    activeFilter === opt.key && { color: themeColors.primary },
                  ]}
                >
                  {opt.label}
                </Text>
                {activeFilter === opt.key && (
                  <Feather name="check" size={16} color={themeColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={dateRangeMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateRangeMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.filterMenuOverlay}
          activeOpacity={1}
          onPress={() => setDateRangeMenuVisible(false)}
        >
          <View style={[styles.filterMenu, { top: 250, left: 16 }]}>
            {dateRangeOptions.map(opt => (
              <TouchableOpacity
                key={String(opt.key)}
                style={styles.filterMenuItem}
                onPress={() => handleDateRangeChange(opt.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterMenuItemText,
                    dateRange === opt.key && { color: themeColors.primary },
                  ]}
                >
                  {opt.label}
                </Text>
                {dateRange === opt.key && (
                  <Feather name="check" size={16} color={themeColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
};

export default Reminders;
