import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper/ScreenWrapper';
import CustomHeader from '../../../components/CustomHeader/CustomHeader';
import {
  CustomScrollableTabs,
  CustomFloatingActionButton,
  CustomAddNotesModal,
  CustomSocialLinksModal,
  CustomAddConnectionModal,
} from '../../../components/common';
import CustomConnectionCard from '../../../components/CustomCards/CustomConnectionCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { makeConnectionsStyles } from './Connections.styles';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../hooks/useUserRole';
import { Connection, ConnectionsNavigationProps } from './Connections.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  getConnectionAsync,
  getConnectionTypesAsync,
} from '../../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../../config/constants';
import { ConnectionTypes } from '../../../types/reduxTypes/connectionSlice.types';
import { setCurrentConnection, setInitialConnectionRole } from '../../../redux/slices/connectionSlice';
import { AiFab } from '../../../components/common/AiFab';
import { AppDispatch } from '../../../types/store.types';
import { useSubscriptionGate } from '../../../hooks/useSubscriptionGate';
import { RoleTheme } from '../../../types/roleManager.types';
import { emergencyAccessApi, type EmergencyAccessLabel } from '../../../services/emergencyAccess';
import { EMERGENCY_LABEL_KEYS } from './modules/ConnectionsRequest/ConnectionsUserTabsContent/emergencyLabel';

const Connections = (): React.ReactElement => {
  const navigation = useNavigation<ConnectionsNavigationProps>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole, userRole } = useUserRole();
  const styles = useMemo(() => makeConnectionsStyles(themeColors as RoleTheme), [themeColors]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [notesModalVisible, setNotesModalVisible] = useState<boolean>(false);
  const [socialModalVisible, setSocialModalVisible] = useState<boolean>(false);
  const [addConnectionModalVisible, setAddConnectionModalVisible] =
    useState<boolean>(false);
  const [selectedConnection, setSelectedConnection] = useState<
    Connection | any
  >(null);

  const type = isBusinessRole() ? 'Business' : 'Personal';
  const { checkSubscription, GateModal } = useSubscriptionGate();

  const {
    get_connection_types_data,
    get_connection_types_status,
    get_connections_data,
    get_connections_status,
  } = useSelector((state: any) => state.connection_slice);
  const { user_data } = useSelector((state: any) => state.user_auth);
  const unseenNotificationCount = useSelector(
    (state: any) => state.notifications_slice?.unseen_count ?? 0,
  );

  const isConnectionTypesLoading =
    get_connection_types_status === ASYNC_STATUS.LOADING;

  const isConnectionsLoading = get_connections_status === ASYNC_STATUS.LOADING;

  const { update_connection_state, connection_and_emergency_requests_count } = useSelector(
    (state: any) => state.connection_slice,
  );

  const connectionTabs = useMemo(() => {
    const apiTypes: ConnectionTypes[] = get_connection_types_data || [];
    return [
      { label: 'All', value: 'all' },
      { label: 'Emergency Contacts', value: 'emergency' },
      ...apiTypes.map((type: ConnectionTypes) => ({
        label: type.name,
        value: String(type.id),
      })),
    ];
  }, [get_connection_types_data]);

  const handleTabChange = useCallback((index: number): void => {
    setActiveTab(index);
  }, []);

  // Emergency access state per connection, for the "Emergency Contact – …" badges.
  const [emergencyLabels, setEmergencyLabels] = useState<Record<number, EmergencyAccessLabel>>({});

  useFocusEffect(
    useCallback(() => {
      dispatch(getConnectionTypesAsync());
      dispatch(getConnectionAsync({ targetAccountType: type }));
      let active = true;
      emergencyAccessApi
        .getAll(type)
        .then(list => {
          if (!active) return;
          const next: Record<number, EmergencyAccessLabel> = {};
          list.forEach(st => { next[st.connectionId] = st.label; });
          setEmergencyLabels(next);
        })
        .catch(() => {
          // Badges fall back to "Emergency Contact".
        });
      return () => { active = false; };
    }, [dispatch, type]),
  );

  const handleViewAllPress = useCallback((): void => { }, []);

  const handleConnectionPress = useCallback((connection: Connection): void => {
    setSelectedConnection(connection);
    setSocialModalVisible(true);
  }, []);

  const handleFloatingButtonPress = useCallback((): void => {
    checkSubscription(() => setAddConnectionModalVisible(true), type === 'Business' ? 'business' : 'personal');
  }, [checkSubscription, type]);

  const handleRequestPress = useCallback((): void => {
    navigation.navigate('ConnectionsRequest' as never);
  }, [navigation]);

  const handleNotesPress = useCallback((connection: Connection): void => {
    setSelectedConnection(connection);
    setNotesModalVisible(true);
  }, []);

  const handleSaveNote = useCallback((message: string): void => {
    dispatch(getConnectionAsync({ targetAccountType: type }));
  }, [update_connection_state, dispatch, type]);

  const handleSaveConnection = useCallback(
    (connectionData: any): void => {
      dispatch(getConnectionAsync({ targetAccountType: type }));
    },
    [dispatch, type],
  );

  const handleCardPress = useCallback(
    (connectionData: Connection): void => {
      const currentConnectionUserId =
        connectionData?.receiveruser?.id === user_data?.id
          ? connectionData?.senderuser?.id
          : connectionData?.receiveruser?.id;
      dispatch(
        setCurrentConnection({ connectionData, currentConnectionUserId }),
      );

      dispatch(setInitialConnectionRole(userRole))
      navigation.navigate('ConnectionUserDetails', {
        connectionId: connectionData?.id,
      });
    },
    [navigation, userRole],
  );

  const filteredConnections = useMemo((): Connection[] => {
    const activeTabData = connectionTabs[activeTab];
    if (!activeTabData || activeTabData.value === 'all') {
      return get_connections_data as Connection[];
    }
    if (activeTabData.value === 'emergency') {
      return (get_connections_data as Connection[]).filter(
        conn =>
          (conn.receiveruserid === user_data?.id && conn.receiverisemergency) ||
          (conn.senderuserid === user_data?.id && conn.senderisemergency) ||
          emergencyLabels[Number(conn.id)] != null
      );
    }
    return (get_connections_data as Connection[]).filter(
      conn =>
        conn.connectiontypeid === activeTabData.value ||
        conn.connectiontypename?.toLowerCase() ===
        activeTabData.label.toLowerCase(),
    );
  }, [activeTab, connectionTabs, get_connections_data, emergencyLabels]);

  const renderConnectionItem = useCallback<ListRenderItem<Connection>>(
    ({ item }): React.ReactElement => (
      <CustomConnectionCard
        name={
          user_data?.id === item?.receiveruserid
            ? `${item?.senderuser?.firstname} ${item?.senderuser?.lastname}`
            : `${item?.receiveruser?.firstname} ${item?.receiveruser?.lastname}`
        }
        email={
          user_data?.id === item?.receiveruserid
            ? item?.senderuser?.email
            : item?.receiveruser?.email
        }
        phone={
          user_data?.id === item?.receiveruserid
            ? item?.senderuser?.phone
            : item?.receiveruser?.phone
        }
        avatar={
          user_data?.id === item?.receiveruserid
            ? item?.senderuser?.profilepicture
            : item?.receiveruser?.profilepicture
        }
        category={item.connectiontypename}
        isSharedAccess={item?.isSharedAccess}
        isEmergencyContact={
          item.receiveruserid === user_data?.id
            ? item.receiverisemergency
            : item.senderisemergency
        }
        emergencyLabel={
          emergencyLabels[Number(item?.id)]
            ? t('emergencyAccess.bubbleLabel', { state: t(EMERGENCY_LABEL_KEYS[emergencyLabels[Number(item.id)]]) })
            : undefined
        }
        onNotesPress={() => handleNotesPress(item)}
        onConnectionPress={() => handleConnectionPress(item)}
        onPress={() => handleCardPress(item)}
      />
    ),
    [handleConnectionPress, handleNotesPress, handleCardPress, emergencyLabels, t],
  );

  const keyExtractor = useCallback((item: any): string => item.id, []);

  const ListHeaderComponent = useMemo(
    (): React.ReactElement => (
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>
            {t('connections_screen.title')} ({filteredConnections?.length})
          </Text>

          <TouchableOpacity
            onPress={handleRequestPress}
            style={[
              styles.requestsBadge,
              { borderColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary },
            ]}
          >
            <Text
              style={[styles.requestsText, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}
            >
              {t('connections_screen.requests')}
            </Text>
            <View
              style={[
                styles.notificationBadge,
                { backgroundColor: themeColors.primary },
              ]}
            >
              <Text
                style={[styles.notificationText, { color: themeColors.text }]}
              >
                {connection_and_emergency_requests_count}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <CustomScrollableTabs
          tabs={connectionTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onViewAllPress={handleViewAllPress}
          showViewAll={false}
        />
      </View>
    ),
    [
      filteredConnections?.length,
      connectionTabs,
      activeTab,
      handleTabChange,
      handleViewAllPress,
      handleRequestPress,
      themeColors,
      t,
      connection_and_emergency_requests_count,
    ],
  );

  const ListEmptyComponent = useMemo(
    (): React.ReactElement => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: themeColors.secondary }]}>
          {t('connections_screen.no_connections')}
        </Text>
      </View>
    ),
    [t, themeColors],
  );

  const SkeletonCard = (): React.ReactElement => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
    </View>
  );

  const SkeletonTabs = (): React.ReactElement => (
    <View style={styles.skeletonTabsRow}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.skeletonTab} />
      ))}
    </View>
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

      {isConnectionTypesLoading || isConnectionsLoading ? (
        <View style={styles.listContent}>
          {isConnectionTypesLoading && (
            <View style={styles.headerSection}>
              <View style={styles.titleRow}>
                <View
                  style={[styles.skeletonLine, { width: 160, height: 22 }]}
                />
                <View
                  style={[
                    styles.skeletonLine,
                    { width: 100, height: 32, borderRadius: 20 },
                  ]}
                />
              </View>
              <SkeletonTabs />
            </View>
          )}

          {isConnectionsLoading &&
            [1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : (
        <FlatList<Connection>
          data={filteredConnections}
          renderItem={renderConnectionItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      )}

      <CustomFloatingActionButton
        onPress={handleFloatingButtonPress}
        icon="user-plus"
        color={themeColors.primary}
        iconColor={themeColors.text}
        size={55}
        iconSize={28}
        style={styles.floatingButton}
      />

      <CustomAddNotesModal
        visible={notesModalVisible}
        onClose={() => setNotesModalVisible(false)}
        onSave={handleSaveNote}
        connection={selectedConnection}
      />

      <CustomSocialLinksModal
        visible={socialModalVisible}
        onClose={() => setSocialModalVisible(false)}
        connection={selectedConnection}
      />

      <CustomAddConnectionModal
        visible={addConnectionModalVisible}
        categoryList={
          get_connection_types_data?.map((type: any) => ({
            label: type.name,
            value: String(type.id),
          })) || []
        }
        onClose={() => setAddConnectionModalVisible(false)}
        onSave={handleSaveConnection}
      />
      <AiFab />
      {GateModal}
    </ScreenWrapper>
  );
};

export default Connections;
