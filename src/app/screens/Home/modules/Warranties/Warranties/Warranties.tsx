import {
  Image, ScrollView, Text, View, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { RecordStatusBadge } from '../../../../../../components/records/RecordStatusBadge';
import { recordStatusOf, isInactive, INACTIVE_CARD_STYLE } from '../../../../../../utils/recordStatus';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewWarrantyModal
} from '../../../../../../components/common';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { ICONS } from '../../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../../utils/helpers';
import { Warranty, ShareData, WarrantiesNavigationProp } from './Warranties.types';
import { useDispatch, useSelector } from 'react-redux';
import { getWarrantiesAsync, deleteWarrantyAsync, getWarrantiesSharedWithMeAsync } from '../../../../../../redux/services/liabilitiesService';
import SharedWithMeSection from '../../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../../components/SharedWithMe/SharedWithMeSection';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { sharingSyncService } from '../../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles, makeWarrantiesStyles } from '../Warranties.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../../utils/roleManager';

const Warranties = (): React.ReactElement => {
  const navigation = useNavigation<WarrantiesNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const warrantiesStyles = useMemo(() => makeWarrantiesStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const { currentConnectionUserId, emergencyConnectionBusinessId, currentConnection } = useSelector(
    (state: any) => state.connection_slice,
  );
  const { user_data } = useSelector((state: any) => state.user_auth);
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openEntityIdForEdit } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
  const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });
  const getConnectionTabQueryParams = () => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  };

  // Check if user is in business mode
  const isBusiness = isBusinessRole();

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  // Redux state
  const { get_warranties_status, get_warranties_data, delete_warranty_status } = useSelector(
    (state: any) => state.liabilities_slice,
  );
  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);

  const isLoading = get_warranties_status === ASYNC_STATUS.LOADING;
  const isDeleting = delete_warranty_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
  // Who "the owner" is for the Assign To linkage rules on the edit screen.
  const editOwnerUserId = isFromEmergencyAccess
    ? currentConnectionUserId
    : (connectionTabSource === 'shared_with_you' ? ownerId : undefined);
  const editOwnerBusinessId = isFromEmergencyAccess
    ? emergencyConnectionBusinessId
    : (connectionTabSource === 'shared_with_you' ? selectedSharedBusiness?.id : undefined);
  const editOwnerName = currentConnection
    ? (currentConnection.receiveruserid === user_data?.id
        ? currentConnection?.senderuser?.firstname
        : currentConnection?.receiveruser?.firstname)
    : undefined;
  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const warranties: Warranty[] = noBusinessInBusinessMode ? [] : (get_warranties_data?.warranties || []);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: string | number;
  }>({ resourceType: 'warranty' });

  // Fetch warranties on screen focus
  useFocusEffect(
    useCallback(() => {
      const connectionParams = getConnectionTabQueryParams();

      // In business mode with no business selected, skip fetch to avoid showing personal data
      if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess && Object.keys(connectionParams).length === 0) {
        return;
      }

      const params: any = { ...connectionParams };

      if (isBusiness && selectedBusinessId && !isFromEmergencyAccess) {
        if (connectionTabSource === "shared_with_you") {
          params.businessId = selectedSharedBusiness?.id;
        } else {
          params.businessId = selectedBusinessId;
        }
      }

      if (isFromEmergencyAccess && currentConnectionUserId) {
        params.userId = currentConnectionUserId;
        if (isBusiness) {
          params.businessId = emergencyConnectionBusinessId;
        }
      }

      const arg = Object.keys(params).length ? params : undefined;
      dispatch(getWarrantiesAsync(arg));
    }, [
      dispatch,
      isBusiness,
      selectedBusinessId,
      isFromEmergencyAccess,
      currentConnectionUserId,
      emergencyConnectionBusinessId,
    ]),
  );

  const handleShare = useCallback((): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'warranty' });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
  }, [checkSubscription, isBusiness]);

  const handleViewPress = useCallback((warranty: Warranty): void => {
    setSelectedWarranty(warranty);
    setViewModalVisible(true);
  }, []);

  const handleShareWarranty = useCallback((shareData: ShareData): void => {
    const payload: any = {
      ...shareContext,
      users: shareData
    };

    if (currentBusinessId) {
      payload.businessId = currentBusinessId;
    }

    dispatch(sharingSyncService(payload));
  }, [dispatch, shareContext, currentBusinessId]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetShareSyncStatus());
      setShareModalVisible(false);
    }
  }, [share_sync_status, dispatch]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.ERROR) {
      dispatch(resetShareSyncStatus());
    }
  }, [share_sync_status, dispatch]);

  // Auto-open detail modal when navigated from a notification
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (get_warranties_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = warranties.find((w: Warranty) => Number(w.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      setSelectedWarranty(target);
      setViewModalVisible(true);
    }
  }, [openEntityId, get_warranties_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (get_warranties_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = warranties.find((w: Warranty) => Number(w.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditPress(target);
    }
  }, [openEntityIdForEdit, get_warranties_status]);

  const handleEditPress = useCallback((warranty: Warranty): void => {
    if (!getItemWriteAccess(warranty)) {
      return;
    }
    checkSubscription(() => navigation.navigate('AddWarranty', {
      warranty,
      isEdit: true,
      ...(editOwnerUserId ? { ownerUserId: editOwnerUserId } : {}),
      ...(editOwnerBusinessId ? { ownerBusinessId: editOwnerBusinessId } : {}),
      ...(editOwnerName ? { ownerName: editOwnerName } : {}),
      ...(isFromEmergencyAccess ? { isFromEmergencyAccess: true } : {}),
    }), isBusiness ? 'business' : 'personal');
  }, [navigation, checkSubscription, isBusiness, editOwnerUserId, editOwnerBusinessId, editOwnerName, isFromEmergencyAccess]);

  const handleDeletePress = useCallback((warranty: Warranty): void => {
    if (!getItemWriteAccess(warranty)) {
      return;
    }
    setSelectedWarranty(warranty);
    setDeleteModalVisible(true);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!selectedWarranty?.id || isDeleting) return;
    try {
      await dispatch(deleteWarrantyAsync(selectedWarranty.id)).unwrap();
      const businessIdParam = isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
      dispatch(getWarrantiesAsync(businessIdParam ? { businessId: businessIdParam, ...getConnectionTabQueryParams() } : getConnectionTabQueryParams()));
      setDeleteModalVisible(false);
      setSelectedWarranty(null);
    } catch (error) {
      console.error('Failed to delete warranty:', error);
    }
  }, [selectedWarranty, isDeleting, dispatch, isBusiness, selectedBusinessId]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const renderSharedWarrantyItem = useCallback(
    (item: any, owner: SharedWithMeOwner): React.ReactElement => {
      const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
      const vehicleFullyTransferred = !!(item?.vehicle?.issold && item?.vehicle?.istransferred);
      return (
        <TouchableOpacity onPress={() => handleViewPress(item)} key={item.id} style={[warrantiesStyles.warrantyCard, isInactive(recordStatusOf(item)) && INACTIVE_CARD_STYLE]}>
          <View style={warrantiesStyles.cardHeader}>
            <View style={warrantiesStyles.warrantyInfo}>
              <Text style={warrantiesStyles.warrantyName}>
                {item.itemname || item.itemName || item.name || ''}
              </Text>
<RecordStatusBadge status={recordStatusOf(item)} />
              {
                item?.expiration && (
                  <View style={[warrantiesStyles.expiryBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                    <Text style={warrantiesStyles.expiryText}>
                      {formatDate(item.expiration || item.expiryDate)}
                    </Text>
                  </View>
                )}
            </View>
            <View style={warrantiesStyles.actionButtons}>
              <TouchableOpacity
                style={warrantiesStyles.actionBtn}
                onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Warranty', entityId: item.id, title: t('edit_history.title') })}
              >
                <MaterialIcons name="history" size={24} color={themeColors.secondary} />
              </TouchableOpacity>
              {canWrite && !vehicleFullyTransferred && (
                <TouchableOpacity
                  style={warrantiesStyles.actionBtn}
                  onPress={() => checkSubscription(() => navigation.navigate('AddWarranty' as any, { warranty: item, isEdit: true, ownerUserId: owner.id, ownerName: owner.firstname }), isBusiness ? 'business' : 'personal')}
                >
                  <Feather name="edit-2" size={20} color={themeColors.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={warrantiesStyles.providerText}>
            {item.warrantyprovider || item.warrantyProvider || item.provider || ''}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleViewPress, navigation, t, themeColors, formatDate],
  );

  const renderWarrantyCard = useCallback(
    (warranty: Warranty): React.ReactElement => {
      const vehicleFullyTransferred = !!(warranty?.vehicle?.issold && warranty?.vehicle?.istransferred);
      return (
      <TouchableOpacity onPress={() => handleViewPress(warranty)} key={warranty.id} style={[warrantiesStyles.warrantyCard, isInactive(recordStatusOf(warranty)) && INACTIVE_CARD_STYLE]}>
        <View style={warrantiesStyles.cardHeader}>
          <View style={warrantiesStyles.warrantyInfo}>
            <Text style={warrantiesStyles.warrantyName}>
              {warranty.itemname || warranty.itemName || warranty.name || ''}
            </Text>
<RecordStatusBadge status={recordStatusOf(warranty)} />
            {
              warranty?.expiration || warranty.expiryDate ? (
                <View
                  style={[
                    warrantiesStyles.expiryBadge,
                     { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                  ]}
                >
                  <Text style={warrantiesStyles.expiryText}>
                    {formatDate(warranty.expiration || warranty.expiryDate)}
                  </Text>
                </View>
              ) : null}
          </View >
  <View style={warrantiesStyles.actionButtons}>
    <TouchableOpacity
      style={warrantiesStyles.actionBtn}
      onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Warranty', entityId: warranty.id, title: t('edit_history.title') })}
    >
      <MaterialIcons name="history" size={24} color={themeColors.secondary} />
    </TouchableOpacity>
    {shouldAllowShare && !vehicleFullyTransferred && (
      <TouchableOpacity
        style={warrantiesStyles.actionBtn}
        onPress={() => checkSubscription(() => {
          setShareContext({ resourceType: 'warranty', resourceId: warranty.id });
          setShareModalVisible(true);
        }, isBusiness ? 'business' : 'personal')}
      >
        <Image
          source={ICONS.SHARE_PRIMARY_ICON}
          style={[warrantiesStyles.actionIconLg, { tintColor: themeColors.secondary }]}
        />
      </TouchableOpacity>
    )}
    {getItemWriteAccess(warranty) && !vehicleFullyTransferred && (
      <TouchableOpacity
        style={warrantiesStyles.actionBtn}
        onPress={() => handleEditPress(warranty)}
      >
        <Feather name="edit-2" size={20} color={themeColors.secondary} />
      </TouchableOpacity>
    )}
    {shouldAllowShare && !vehicleFullyTransferred && (
      <TouchableOpacity
        style={warrantiesStyles.actionBtn}
        onPress={() => handleDeletePress(warranty)}
      >
        <Feather name="trash-2" size={20} color={themeColors.secondary} />
      </TouchableOpacity>
    )}
  </View>
        </View >

  <Text style={warrantiesStyles.providerText}>
    {warranty.warrantyprovider || warranty.warrantyProvider || warranty.provider || ''}
  </Text>
      </TouchableOpacity >
      );
    },
[handleShare, handleViewPress, handleEditPress, handleDeletePress, themeColors],
  );

return (
  <LinearGradient
    colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
    locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
    style={warrantiesStyles.gradientContainer}
  >
    <SafeAreaView style={warrantiesStyles.safeArea}>
      <AuthHeader
        onBackPress={() =>
          navigation.goBack()
        }
        containerStyle={[commonStyles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
        backButtonStyle={{ marginBottom: 0 }}
        titleStyle={{ marginBottom: 0 }}
        backButtonIconStyle={{ tintColor: themeColors.background }}
      />

      <ScrollView
        style={warrantiesStyles.scrollView}
        contentContainerStyle={warrantiesStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={warrantiesStyles.iconContainer}>
          <View style={warrantiesStyles.warrantyIconWrapper}>
            <Image
              source={ICONS.WARRANTIES_SCREEN_ICON}
              style={warrantiesStyles.warrantyIcon}
            />
          </View>

          {/* Title */}
          <Text style={warrantiesStyles.title}>{t('warranties.title')}</Text>
        </View>

        <View style={warrantiesStyles.buttonsRow}>
          {shouldAllowShare && (
            <PrimaryButton
              icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
              title={t('warranties.add_warranty')}
              onPress={() => checkSubscription(() => navigation.navigate('AddWarranty' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), isBusiness ? 'business' : 'personal')}
              buttonStyle={commonStyles.whiteButton}
              textStyle={commonStyles.blackText}
            />
          )}
          {shouldAllowShare && warranties.length > 0 && (
            <PrimaryButton
              icon={<Fontisto name="share-a" size={18} color={colors.black} />}
              title={t('warranties.share')}
              onPress={handleShare}
              buttonStyle={[commonStyles.whiteButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
              textStyle={{ color: colors.black }}
            />
          )}
        </View>

        {/* Warranties List */}
        <View style={warrantiesStyles.warrantiesSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color={themeColors.primary} style={warrantiesStyles.loadingIndicator} />
          ) : warranties.length > 0 ? (
            warranties.map(renderWarrantyCard)
          ) : (
            <View style={warrantiesStyles.emptyState}>
              <View style={warrantiesStyles.emptyStateIconCircle}>
                <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
              </View>
              <Text style={warrantiesStyles.emptyStateText}>
                {isFromEmergencyAccess
                  ? t('emergency_access_tab.no_data_emergency')
                  : t('warranties.no_warranties')}
              </Text>
            </View>
          )}
        </View>

        {/* Shared With Me */}
        {!accessLevel && !isFromEmergencyAccess && !isBusiness && (
          <SharedWithMeSection
            thunkAction={getWarrantiesSharedWithMeAsync}
            renderItem={renderSharedWarrantyItem}
          />
        )}
      </ScrollView>
    </SafeAreaView>

    {/* Modals */}
    <ShareModal
      visible={shareModalVisible}
      onClose={() => setShareModalVisible(false)}
      onShare={handleShareWarranty}
      title={t('warranties.share_warranty')}
      loading={sharingLoading}
      resourceType={shareContext.resourceType}
      resourceId={shareContext.resourceId}
      businessId={currentBusinessId}
    />

    <ViewWarrantyModal
      visible={viewModalVisible}
      onClose={() => { setViewModalVisible(false); setSelectedWarranty(null); }}
      warranty={selectedWarranty}
      linkTabs={{ record: selectedWarranty?.id ? { moduleKey: 'warranty', id: Number(selectedWarranty.id) } : null, canEdit: getItemWriteAccess(selectedWarranty) }}
    />

    <DeleteConfirmModal
      visible={deleteModalVisible}
      onClose={() => { if (!isDeleting) { setDeleteModalVisible(false); setSelectedWarranty(null); } }}
      onConfirm={handleDeleteConfirm}
      title={t('warranties.delete_warranty')}
      message={`${t('modals.delete_confirm')} ${selectedWarranty?.itemname || selectedWarranty?.itemName || selectedWarranty?.name || 'this warranty'
        }?`}
      isLoading={isDeleting}
    />
    {GateModal}
  </LinearGradient>
);
};

export default Warranties;
