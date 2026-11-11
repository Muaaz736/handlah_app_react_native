import React, { useState, useCallback, useMemo, useEffect, useRef, use } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { CustomTabs, PrimaryButton, CustomEditConnectionModal, ProfileAvatar } from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { makeConnectionUserDetailsStyles } from './ConnectionUserDetails.styles';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import YoursConnectionTab from '../ConnectionsRequest/ConnectionsUserTabsContent/YoursConnectionTab';
import SharedWithYouTabContent from '../ConnectionsRequest/ConnectionsUserTabsContent/SharedWithYouTabContent';
import EmergencyAccessTabContent from '../ConnectionsRequest/ConnectionsUserTabsContent/EmergencyAccessTabContent';
import { emergencyAccessApi, type EmergencyAccessStatus } from '../../../../../services/emergencyAccess';
import { EMERGENCY_LABEL_KEYS } from '../ConnectionsRequest/ConnectionsUserTabsContent/emergencyLabel';
import { Tab, ConnectionUserDetailsRouteParams } from './ConnectionUserDetails.types';
import { useDispatch, useSelector } from 'react-redux';
import { checkBothSideConnection, getConnectionbyIdAsync, removeConnectionAsync } from '../../../../../redux/services/connectionService';
import { getConnectionEmergencySummary, getConnectionSharingsummary } from '../../../../../redux/services/sharingService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { resetIsPersonalAndBusinessConnection, resetRemoveConnectionStatus, setCurrentConnection } from '../../../../../redux/slices/connectionSlice';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { USER_ACCOUNT_TYPES } from '../../../../../utils/staticData';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const SOCIAL_ICON_MAP: Record<string, any> = {
  facebook: ICONS.FACEBOOK_ICON,
  instagram: ICONS.INSTAGRAM_ICON,
  linkedin: ICONS.LINKEDIN_ICON,
  twitter: ICONS.TWITTER_ICON,
  x: ICONS.TWITTER_ICON,
};

const SOCIAL_COLOR_MAP: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  twitter: '#000000',
  x: '#000000',
};

const ConnectionUserDetails = (): React.ReactElement => {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<{ params: ConnectionUserDetailsRouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { themeColors, isBusinessRole, changeUserRole, userRole } = useUserRole();
  const { switchRole, GateModal } = useSubscriptionGate();
  const styles = useMemo(() => makeConnectionUserDetailsStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const [activeTab, setActiveTab] = useState<number>(0);
  // Emergency access in both directions (countdowns, the label on the banner).
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyAccessStatus | null>(null);
  const [emergencyStatusLoading, setEmergencyStatusLoading] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState<boolean>(false);
  const [isSocialDetailModalVisible, setIsSocialDetailModalVisible] = useState<boolean>(false);
  const [selectedSocialAccount, setSelectedSocialAccount] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { user_data } = useSelector((state: any) => state.user_auth);
  const { is_personal_and_business_connection_status, isPersonalAndBusinessConnection, initialconnectionRole, get_connection_types_data, get_connection_by_id_status, get_connection_by_id_data, remove_connection_by_id_status, currentConnectionUserId, initialConnectionRole } = useSelector((state: any) => state.connection_slice);
  const { selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const { connectionId, showSharedWithYouFirst } = route.params;
  const isBusiness = isBusinessRole();

  const REQUEST_TABS: Tab[] = [
    { id: 'yours', label: t('connection_user_details.tab_yours') },
    { id: 'shared', label: t('connection_user_details.tab_shared') },
    {
      id: 'emergency',
      label: t('connection_user_details.tab_emergency')
    },
  ];

  useFocusEffect(
    useCallback(() => {
      dispatch(
        getConnectionbyIdAsync({
          userId: currentConnectionUserId,
          targetAccountType: isBusiness ? 'Business' : 'Personal',
        })
      );
    }, [dispatch, connectionId, userRole])
  );

  useEffect(() => {
    dispatch(checkBothSideConnection({
      userId: currentConnectionUserId,
      targetAccountType: isBusiness ? 'Personal' : 'Business',
    }))
  }, []);

  useEffect(() => {
    if (get_connection_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
    if (!get_connection_by_id_data) return;

    const userId =
      get_connection_by_id_data.receiveruserid === user_data?.id
        ? get_connection_by_id_data?.senderuser?.id
        : get_connection_by_id_data?.receiveruser?.id;

    const params: any = { userId };

    if (isBusiness) {
      if (activeTab === 0) {
        if (!selectedBusinessId) return;
        params.businessId = selectedBusinessId;
      } else if (activeTab === 1) {
        if (!selectedSharedBusiness) return;
        params.businessId = selectedSharedBusiness.id;
      }
    }

    dispatch(getConnectionSharingsummary(params));
  }, [
    get_connection_by_id_status,
    activeTab,
    selectedBusinessId,
    selectedSharedBusiness,
    isBusiness,
    user_data?.id
  ]);

  // donot remove/change these conitions
  const userInfo = get_connection_by_id_data?.receiveruserid === user_data?.id ? get_connection_by_id_data?.senderuser : get_connection_by_id_data?.receiveruser;
  const hasEmergencyAccess = get_connection_by_id_data?.receiveruserid === user_data?.id ? get_connection_by_id_data?.senderisemergency : get_connection_by_id_data?.receiverisemergency;
  const isEmergencyConnection = get_connection_by_id_data?.receiveruserid === user_data?.id ? get_connection_by_id_data?.receiverisemergency : get_connection_by_id_data?.senderisemergency;
  // The Emergency tab is for both people: the one who can request access and the one who can approve it.
  const showEmergencyTab = !!(hasEmergencyAccess || isEmergencyConnection || emergencyStatus);

  // Social network data for the OTHER user
  const isCurrentUserReceiver = get_connection_by_id_data?.receiveruserid === user_data?.id;
  const otherUserSocialNetworks: any[] = isCurrentUserReceiver
    ? get_connection_by_id_data?.sendersocialnetworks ?? []
    : get_connection_by_id_data?.receiversocialnetworks ?? [];
  const otherUserBusinesses: any[] = isCurrentUserReceiver
    ? get_connection_by_id_data?.senderbusinesses ?? []
    : get_connection_by_id_data?.receiverbusinesses ?? [];

  // Personal social accounts (no businessid)
  const personalSocialAccounts = useMemo(
    () => otherUserSocialNetworks.filter((sn: any) => !sn.businessid),
    [otherUserSocialNetworks],
  );

  // Social accounts grouped by business
  const socialByBusiness = useMemo(
    () =>
      otherUserBusinesses.map((b: any) => ({
        business: b,
        accounts: otherUserSocialNetworks.filter(
          (sn: any) => String(sn.businessid) === String(b.id),
        ),
      })),
    [otherUserBusinesses, otherUserSocialNetworks],
  );

  const { get_summary_status, get_summary_data, get_emergency_summary_status, get_emergency_summary_data } = useSelector((state: any) => state.sharing_slice);

  const connectionLoading = get_connection_by_id_status === ASYNC_STATUS.LOADING;
  const isConnectionError =
    get_connection_by_id_status === ASYNC_STATUS.ERROR ||
    (get_connection_by_id_status === ASYNC_STATUS.SUCCEEDED && get_connection_by_id_data.data === '');
  const summaryLoading = get_summary_status === ASYNC_STATUS.LOADING;
  const emergencySummaryLoading = get_emergency_summary_status === ASYNC_STATUS.LOADING;
  const isRemoving = remove_connection_by_id_status === ASYNC_STATUS.LOADING;
  const checkingBothSidesConnection = is_personal_and_business_connection_status === ASYNC_STATUS.LOADING;

  useEffect(() => {
    if (get_connection_by_id_data) {
      dispatch(setCurrentConnection({
        connectionData: get_connection_by_id_data,
      }));
    }
  }, [dispatch, get_connection_by_id_data]);

  // Emergency access in both directions (countdowns, the label on the banner). Reloaded on focus.
  const statusRequest = useRef(0);
  const loadEmergencyStatus = useCallback(() => {
    if (connectionId == null) return;
    const ticket = ++statusRequest.current;
    setEmergencyStatusLoading(true);
    emergencyAccessApi
      .get(connectionId)
      .then(result => {
        if (ticket === statusRequest.current) setEmergencyStatus(result);
      })
      .catch(() => {
        // Keep what we had; the tab falls back to the older summary.
      })
      .finally(() => {
        if (ticket === statusRequest.current) setEmergencyStatusLoading(false);
      });
  }, [connectionId]);
  useFocusEffect(
    useCallback(() => {
      loadEmergencyStatus();
    }, [loadEmergencyStatus]),
  );

  // Fetch emergency summary only when connection changes — NOT on business switch
  useEffect(() => {
    if (get_connection_by_id_data) {
      dispatch(getConnectionEmergencySummary({ id: connectionId }));
    }
  }, [dispatch, get_connection_by_id_data, connectionId]);

  // Navigate back after successful removal
  useEffect(() => {
    if (remove_connection_by_id_status === ASYNC_STATUS.SUCCEEDED) {
      setIsConfirmModalVisible(false);
      navigation.goBack();
      dispatch(resetRemoveConnectionStatus());
    }
  }, [remove_connection_by_id_status]);

  // Reset to first tab when role switches so the summary effect isn't blocked
  useEffect(() => {
    if (showSharedWithYouFirst) {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [isBusiness]);

  const handleTabChange = useCallback((index: number): void => {
    setActiveTab(index);
  }, []);

  const handleUserTabChange = (index: number): void => {
    switchRole(index);
  };

  const handleEditConnection = useCallback((): void => {
    setIsEditModalVisible(true);
  }, []);

  // Step 1: open confirmation modal
  const handleRemoveConnection = useCallback((): void => {
    setIsConfirmModalVisible(true);
  }, []);

  // Step 2: confirmed — dispatch remove
  const handleConfirmRemove = useCallback((): void => {
    dispatch(removeConnectionAsync({ connectionId }));
  }, [dispatch, connectionId]);

  const handleCancelRemove = useCallback((): void => {
    setIsConfirmModalVisible(false);
  }, []);

  const handleSocialIconPress = useCallback((account: any): void => {
    setSelectedSocialAccount(account);
    setIsSocialDetailModalVisible(true);
  }, []);

  const getSocialTypeName = (account: any): string => {
    return account?.socialnetworktypename || account?.socialnetworktype?.name || 'Social Media';
  };

  const getSocialIcon = (account: any): any => {
    const name = getSocialTypeName(account).toLowerCase();
    return SOCIAL_ICON_MAP[name] || ICONS.SOCIAL_MEDIA_ICON;
  };

  const renderTabContent = useCallback((): React.ReactElement => {
    switch (activeTab) {
      case 0:
        return <YoursConnectionTab loading={summaryLoading} connectionUserId={get_summary_data?.connectionuserid} data={get_summary_data?.yours} />;
      case 1:
        return <SharedWithYouTabContent loading={summaryLoading} connectionUserId={get_summary_data?.connectionuserid} data={get_summary_data?.sharedwithyou} />;
      case 2:
        return (
          <EmergencyAccessTabContent
            loading={emergencySummaryLoading}
            data={get_emergency_summary_data}
            connectionId={connectionId}
            userName={userInfo?.firstname}
            status={emergencyStatus}
            statusLoading={emergencyStatusLoading}
            onStatusChanged={loadEmergencyStatus}
          />
        );
      default:
        return <View style={styles.container} />;
    }
  }, [activeTab, get_summary_status, get_summary_data, get_emergency_summary_data, get_emergency_summary_status, emergencyStatus, emergencyStatusLoading, loadEmergencyStatus, userInfo?.firstname]);

  const handleEditModalSave = useCallback((data: any): void => {
    setIsEditModalVisible(false);
    dispatch(getConnectionbyIdAsync({ userId: currentConnectionUserId, targetAccountType: isBusiness ? 'Business' : 'Personal' }));
  }, [dispatch]);

  const tabsForDisplay = useMemo(
    () => REQUEST_TABS.map((tab: Tab) => ({
      ...tab,
      label: `${tab.label}`,
    })),
    [],
  );

  const handleNavigateBack = useCallback((): void => {
    if (initialconnectionRole === userRole) {
      navigation.goBack();
    } else {
      changeUserRole(initialconnectionRole);
      navigation.goBack();
    }
  }, [navigation, initialconnectionRole, userRole]);

  if (connectionLoading) {
    return (
      <LinearGradient
        colors={themeColors?.isDark ? [...themeColors.gradient.slice(0, 2), themeColors.background] : themeColors.gradient}
        style={styles.container}
        locations={[0, 0.118, 0.2774, 0.4327, 0.5913, 0.7067, 0.8558, 1]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={themeColors?.isDark ? [...themeColors.gradient.slice(0, 2), themeColors.background] : themeColors.gradient}
      style={styles.container}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913, 0.7067, 0.8558, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleNavigateBack}>
            <Image source={ICONS.BACK_ICON} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            {!isConnectionError && (
              <TouchableOpacity onPress={handleEditConnection}>
                <Image source={ICONS.EDIT_ICON} style={styles.editIcon} />
              </TouchableOpacity>
            )}
            <View style={[styles.headerToggle, { display: (!checkingBothSidesConnection && isPersonalAndBusinessConnection) ? 'flex' : 'none', pointerEvents: (!checkingBothSidesConnection && isPersonalAndBusinessConnection) ? 'auto' : 'none' }]}>
              <CustomTabs
                tabs={USER_ACCOUNT_TYPES.map(tab => ({
                  ...tab,
                  label: t(tab.label),
                }))}
                activeTab={userRole}
                onTabChange={handleUserTabChange}
                showIcons={false}
                containerStyle={[styles.roleTabsContainer, { height: 32, backgroundColor: themeColors.surface }]}
                labelStyle={styles.tabLabel}
                activeLabelStyle={{ color: themeColors.background }}
                activeTabStyle={{ backgroundColor: themeColors.primary }}
              />
            </View>
          </View>
          {isConnectionError && <View style={{ width: 25 }} />}
        </View>

        {/* Tab Content */}
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {userInfo && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ProfileAvatar
                imageId={userInfo?.profilepicture}
                name={userInfo?.firstname}
                size={80}
                variant="neutral"
                style={{ marginBottom: 12, marginLeft: 16, alignSelf: 'flex-start' }}
              />
              <View>
                <Text style={styles.userName}>{userInfo?.firstname} {userInfo?.lastname}</Text>
                {userInfo?.username && (
                  <Text style={styles.userHandle}>@{userInfo?.username}</Text>
                )}
              </View>
            </View>
          )}
          {showEmergencyTab && (
            <View style={styles.emergencyBanner}>
              <Text style={[styles.emergencyText, { color: themeColors.secondary }]}>
                {emergencyStatus
                  ? t('emergencyAccess.bubbleLabel', { state: t(EMERGENCY_LABEL_KEYS[emergencyStatus.label]) })
                  : t('connection_user_details.emergency_contact_banner')}
              </Text>
            </View>
          )}

          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Phone + Email in one row */}
            <View style={styles.contactInfoRow}>
              {userInfo?.phonenumber && (
                <View style={styles.contactRow}>
                  <Image source={ICONS.PHONE_ICON} style={styles.contactIcon} />
                  <Text style={styles.contactText}>{userInfo.phonenumber}</Text>
                </View>
              )}
              {userInfo?.email && (
                <View style={styles.contactRow}>
                  <Image source={ICONS.EMAIL_ICON} style={styles.contactIcon} />
                  <Text style={styles.contactText}>{userInfo.email}</Text>
                </View>
              )}
            </View>

            {/* Social Handles — Personal */}
            {!isConnectionError && !isBusiness && personalSocialAccounts.length > 0 && (
              <View style={styles.socialSection}>
                <Text style={styles.socialSectionLabel}>{t('connection_user_details.social_handles')}</Text>
                <View style={styles.socialIconsRow}>
                  {personalSocialAccounts.map((account: any, index: number) => (
                    <TouchableOpacity
                      key={account.id ?? index}
                      style={[styles.socialIconBtn, { backgroundColor: getColorWithOpacity(colors.white, 0.8) }]}
                      onPress={() => handleSocialIconPress(account)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={getSocialIcon(account)}
                        style={[styles.socialIconImg, { tintColor: themeColors.secondary }]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Social Handles — Business (grouped by business) */}
            {!isConnectionError && isBusiness && socialByBusiness.length > 0 && (
              <View style={styles.socialSection}>
                <Text style={styles.socialSectionLabel}>{t('connection_user_details.social_handles')}</Text>
                {socialByBusiness.map(({ business, accounts }) => (
                  <View key={String(business.id)} style={styles.businessSocialGroup}>
                    <Text style={styles.businessGroupName}>
                      {business.businessname || business.name || `Business ${business.id}`}
                    </Text>
                    {accounts.length === 0 ? (
                      <Text style={styles.noSocialText}>
                        {t('connection_user_details.no_social_shared')}
                      </Text>
                    ) : (
                      <View style={styles.socialIconsRow}>
                        {accounts.map((account: any, index: number) => (
                          <TouchableOpacity
                            key={account.id ?? index}
                            style={[styles.socialIconBtn, { backgroundColor: getColorWithOpacity(colors.white, 0.25) }]}
                            onPress={() => handleSocialIconPress(account)}
                            activeOpacity={0.7}
                          >
                            <Image
                              source={getSocialIcon(account)}
                              style={[styles.socialIconImg, { tintColor: themeColors.secondary }]}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tabs */}
          {!isConnectionError && (
            <View style={styles.tabsContainer}>
              <CustomTabs
                tabs={showEmergencyTab ? tabsForDisplay : tabsForDisplay.slice(0, 2)}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                showIcons={false}
                containerStyle={styles.tabsWrapper}
                labelStyle={styles.tabLabel}
                activeTabStyle={{ backgroundColor: themeColors?.isDark ? themeColors.primary : themeColors.secondary }}
              />
            </View>
          )}

          {isConnectionError ? (
            <View style={styles.notConnectedBanner}>
              <Text style={styles.notConnectedText}>
                {isBusiness
                  ? t('connection_user_details.not_business_connection', { name: userInfo?.firstname ?? '' })
                  : t('connection_user_details.not_personal_connection', { name: userInfo?.firstname ?? '' })}
              </Text>
            </View>
          ) : (
            renderTabContent()
          )}
        </ScrollView>

        {/* Footer Button */}
        {!isConnectionError && (
          <View style={styles.footer}>
            <PrimaryButton
              title={isRemoving ? '' : t('connection_user_details.remove_button')}
              onPress={handleRemoveConnection}
              disabled={isRemoving}
              variant="primary"
              buttonStyle={styles.removeButton}
            />
          </View>
        )}

        {/* Confirmation Modal */}
        <Modal
          visible={isConfirmModalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCancelRemove}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>
                {t('connection_user_details.remove_confirm_title')}
              </Text>
              <Text style={styles.confirmMessage}>
                {t('connection_user_details.remove_confirm_message')}
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.cancelBtn]}
                  onPress={handleCancelRemove}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.removeConfirmBtn]}
                  onPress={handleConfirmRemove}
                  activeOpacity={0.8}
                >
                  {isRemoving ? <ActivityIndicator size={"small"} /> :
                    <Text style={styles.removeBtnText}>
                      {t('common.remove')}
                    </Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Connection Modal */}
        <CustomEditConnectionModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleEditModalSave}
          existingData={{
            connectionId: get_connection_by_id_data?.id,
            toUserId: userInfo?.id,
            connectionTypeId:
              get_connection_by_id_data?.connectionTypeId ?? (get_connection_by_id_data as any)?.connectiontypeid,
            targetAccountType:
              (get_connection_by_id_data as any)?.targetaccounttype ?? (get_connection_by_id_data as any)?.targetAccountType,
            isEmergencyContact: isEmergencyConnection,
            username: userInfo?.username,
            senderbusinessids:
              userInfo?.id === get_connection_by_id_data?.receiveruserid ? (get_connection_by_id_data as any)?.senderbusinessids : (get_connection_by_id_data as any)?.recieverbusinessids,
            businessroles: Object.fromEntries(
              (((userInfo?.id === get_connection_by_id_data?.receiveruserid
                ? (get_connection_by_id_data as any)?.senderbusinesses
                : (get_connection_by_id_data as any)?.receiverbusinesses) ?? []) as { id: number; role?: string }[])
                .map(b => [String(b.id), b.role === 'owner_admin' ? 'owner_admin' : 'standard'] as [string, 'standard' | 'owner_admin']),
            ),
            socialnetworkids: (
              userInfo?.id === get_connection_by_id_data?.receiveruserid
                ? (get_connection_by_id_data as any)?.sendersocialnetworks
                : (get_connection_by_id_data as any)?.receiversocialnetworks
            )?.map((sn: any) => sn.id),
          }}
          categoryList={
            get_connection_types_data?.map((type: any) => ({
              label: type.name,
              value: String(type.id),
            })) || []
          }
        />

        {/* Personal Social Media Detail Modal */}
        <Modal
          visible={isSocialDetailModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsSocialDetailModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsSocialDetailModalVisible(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.socialDetailModal}>
              <TouchableOpacity style={styles.socialDetailCloseX} onPress={() => setIsSocialDetailModalVisible(false)}>
                <Text style={styles.socialDetailCloseXText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.socialDetailTitle}>
                {t('connection_user_details.social_media_account')}
              </Text>
              {selectedSocialAccount && (
                <View style={styles.socialDetailContent}>
                  <Text style={styles.socialDetailPlatform}>
                    {getSocialTypeName(selectedSocialAccount)}
                  </Text>
                  {selectedSocialAccount.username && (
                    <Text style={styles.socialDetailUsername}>
                      @{selectedSocialAccount.username}
                    </Text>
                  )}
                  {selectedSocialAccount.url && (
                    <Text style={styles.socialDetailUrl}>
                      {selectedSocialAccount.url}
                    </Text>
                  )}
                </View>
              )}
              <TouchableOpacity
                style={[styles.socialDetailCloseBtn, { backgroundColor: themeColors.primary }]}
                onPress={() => setIsSocialDetailModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.socialDetailCloseBtnText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>


        {GateModal}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ConnectionUserDetails;
