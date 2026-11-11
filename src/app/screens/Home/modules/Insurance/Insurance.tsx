import { Image, ScrollView, Text, View, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { RecordStatusBadge } from '../../../../../components/records/RecordStatusBadge';
import { recordStatusOf, isInactive, INACTIVE_CARD_STYLE } from '../../../../../utils/recordStatus';
import { formatBillingAmount, insuranceFrequency } from '../../../../../utils/billingFrequency';
import React, { JSX, useState, useEffect, useRef, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewInsuranceModal, } from '../../../../../components/common';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import {
  InsurancePolicy, InsuranceScreenNavigationProp, InsuranceScreenState, } from './Insurance.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  getInsurancesAsync, deleteInsuranceAsync, getInsurancesSharedWithMeAsync, } from '../../../../../redux/services/liabilitiesService';
import SharedWithMeSection from '../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { isIOS } from '../../../../../utils/helpers';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makeInsuranceStyles } from './Insurance.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';

const Insurance: React.FC = () => {
  const navigation = useNavigation<InsuranceScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeInsuranceStyles(themeColors as RoleTheme), [themeColors]);
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

  // Redux state
  const {
    get_insurances_status,
    get_insurances_data,
    delete_insurance_status,
  } = useSelector((state: any) => state.liabilities_slice);
  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const isLoading = get_insurances_status === ASYNC_STATUS.LOADING;
  const isDeleting = delete_insurance_status === ASYNC_STATUS.LOADING;
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

  const [state, setState] = useState<InsuranceScreenState>({
    shareModalVisible: false,
    deleteModalVisible: false,
    viewModalVisible: false,
    selectedInsurance: null,
  });
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: string | number;
  }>({ resourceType: 'insurance' });
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);

  const fetchInsurances = () => {
    const connectionParams = getConnectionTabQueryParams();

    // In business mode with no business selected, skip fetch to avoid showing personal data
    if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess && Object.keys(connectionParams).length === 0) {
      return;
    }

    const params: any = { ...connectionParams };

    if (isBusiness && selectedBusinessId && !isFromEmergencyAccess) {
      if (connectionTabSource === "shared_with_you") {
        params.businessId = selectedSharedBusiness.id;
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

    dispatch(getInsurancesAsync(arg));
  }

  // Fetch insurances on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchInsurances();
    }, [
      dispatch,
      isBusiness,
      selectedBusinessId,
      isFromEmergencyAccess,
      currentConnectionUserId,
      emergencyConnectionBusinessId,
    ]),
  );

  // Get insurances from API response
  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const insurances: InsurancePolicy[] = noBusinessInBusinessMode ? [] : (get_insurances_data?.insurances || []);

  // Calculate totals from API response
  const totalAnnual: string = `$${get_insurances_data?.totalannualpremium?.toFixed(2) || '0.00'
    }`;

  const handleShare = (insurance?: InsurancePolicy): void => {
    checkSubscription(() => {
      if (insurance?.id) {
        setShareContext({ resourceType: 'insurance', resourceId: insurance.id });
      } else {
        setShareContext({ resourceType: 'insurance' });
      }
      setState(prev => ({ ...prev, shareModalVisible: true }));
    }, isBusiness ? 'business' : 'personal');
  };

  const handleShareInsurance = (shareData: any): void => {
    const payload: any = {
      ...shareContext,
      users: shareData,
    };

    if (currentBusinessId) {
      payload.businessId = currentBusinessId;
    }

    dispatch(sharingSyncService(payload));
  };

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetShareSyncStatus());
      setState(prev => ({ ...prev, shareModalVisible: false }));
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
    if (get_insurances_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = insurances.find((ins: InsurancePolicy) => Number(ins.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      setState(prev => ({ ...prev, selectedInsurance: target, viewModalVisible: true }));
    }
  }, [openEntityId, get_insurances_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (get_insurances_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = insurances.find((ins: InsurancePolicy) => Number(ins.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditPress(target);
    }
  }, [openEntityIdForEdit, get_insurances_status]);

  const handleViewPress = (insurance: InsurancePolicy): void => {
    setState(prev => ({
      ...prev,
      selectedInsurance: insurance,
      viewModalVisible: true,
    }));
  };

  const handleEditPress = (insurance: InsurancePolicy): void => {
    if (!getItemWriteAccess(insurance)) {
      return;
    }
    checkSubscription(() => navigation.navigate('AddInsurancePolicy', {
      insurance,
      isEdit: true,
      ...(editOwnerUserId ? { ownerUserId: editOwnerUserId } : {}),
      ...(editOwnerBusinessId ? { ownerBusinessId: editOwnerBusinessId } : {}),
      ...(editOwnerName ? { ownerName: editOwnerName } : {}),
      ...(isFromEmergencyAccess ? { isFromEmergencyAccess: true } : {}),
    }), isBusiness ? 'business' : 'personal');
  };

  const handleDeletePress = (insurance: InsurancePolicy): void => {
    if (!getItemWriteAccess(insurance)) {
      return;
    }
    setState(prev => ({
      ...prev,
      selectedInsurance: insurance,
      deleteModalVisible: true,
    }));
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!state.selectedInsurance?.id || isDeletePending) return;

    setIsDeletePending(true);

    try {
      await dispatch(deleteInsuranceAsync(state.selectedInsurance.id)).unwrap();
      // Close modal immediately after successful delete
      setState(prev => ({
        ...prev,
        deleteModalVisible: false,
        selectedInsurance: null,
      }));

      fetchInsurances();
    } catch (error) {
      console.error('Delete insurance failed:', error);
    } finally {
      setIsDeletePending(false);
    }
  };

  const renderSharedInsuranceItem = (item: any, owner: SharedWithMeOwner): JSX.Element => {
    const canWrite = item.accessLevel === 'write' || item.accesslevel === 'write';
    const vehicleFullyTransferred = !!(item?.vehicle?.issold && item?.vehicle?.istransferred);
    return (
      <TouchableOpacity onPress={() => handleViewPress(item)} key={item.id} style={[styles.insuranceCard, isInactive(recordStatusOf(item)) && INACTIVE_CARD_STYLE]}>
        <View style={styles.cardHeader}>
          <View style={styles.insuranceInfo}>
            <Text style={styles.insuranceName} numberOfLines={1} ellipsizeMode="tail">
              {item.itemname || item.itemName || 'N/A'} -{' '}
              {item.insurancecarrier || item.insuranceCarrier || ''}
            </Text>
<RecordStatusBadge status={recordStatusOf(item)} />
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Insurance', entityId: item.id, title: t('edit_history.title') })}
            >
              <MaterialIcons name="history" size={24} color={themeColors.secondary} />
            </TouchableOpacity>
            {canWrite && !vehicleFullyTransferred && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => checkSubscription(() => navigation.navigate('AddInsurancePolicy' as any, { insurance: item, isEdit: true, ownerUserId: owner.id, ownerName: owner.firstname }), isBusiness ? 'business' : 'personal')}
              >
                <Feather name="edit-2" size={20} color={themeColors.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyText} numberOfLines={1} ellipsizeMode="tail">
            {t('insurance.policy_number')}:{' '}
            {item.policynumber || item.policyNumber || 'N/A'}
          </Text>
          <View style={[styles.balanceBadge, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
            <Text style={styles.balanceText}>{formatBillingAmount(`$${(item.annualpremium ?? 0).toFixed(2)}`, insuranceFrequency(item))}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInsuranceCard = (insurance: InsurancePolicy): JSX.Element => {
    const vehicleFullyTransferred = !!(insurance?.vehicle?.issold && insurance?.vehicle?.istransferred);
    return (
    <TouchableOpacity onPress={() => handleViewPress(insurance)} key={insurance.id} style={[styles.insuranceCard, isInactive(recordStatusOf(insurance)) && INACTIVE_CARD_STYLE]}>
      <View style={styles.cardHeader}>
        <View style={styles.insuranceInfo}>
          <Text style={styles.insuranceName} numberOfLines={1} ellipsizeMode="tail">
            {insurance.itemname || insurance.itemName || 'N/A'} -{' '}
            {insurance.insurancecarrier || insurance.insuranceCarrier || ''}
          </Text>
<RecordStatusBadge status={recordStatusOf(insurance)} />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Insurance', entityId: insurance.id, title: t('edit_history.title') })}
          >
            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
          </TouchableOpacity>
          {shouldAllowShare && !vehicleFullyTransferred && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleShare(insurance)}
            >
              <Image
                source={ICONS.SHARE_PRIMARY_ICON}
                style={[styles.actionIcon, { tintColor: themeColors.secondary }]}
              />
            </TouchableOpacity>
          )}
          {getItemWriteAccess(insurance) && !vehicleFullyTransferred && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEditPress(insurance)}
            >
              <Feather
                name="edit-2"
                size={20}
                color={themeColors.secondary}
              />
            </TouchableOpacity>
          )}
          {shouldAllowShare && !vehicleFullyTransferred && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeletePress(insurance)}
            >
              <Feather
                name="trash-2"
                size={20}
                color={themeColors.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.policyRow}>
        <Text style={styles.policyText} numberOfLines={1} ellipsizeMode="tail">
          {t('insurance.policy_number')}:{' '}
          {insurance.policynumber || insurance.policyNumber || 'N/A'}
        </Text>
        <View
          style={[
            styles.balanceBadge,
            { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
          ]}
        >
          <Text style={styles.balanceText}>
            {formatBillingAmount(`$${(insurance.annualpremium ?? 0).toFixed(2)}`, insuranceFrequency(insurance))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={[
            styles.headerContainerStyle,
            { paddingTop: isIOS ? 0 : 20 },
          ]}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{ marginBottom: 0 }}
          backButtonIconStyle={{ tintColor: themeColors.background }}
        />

        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.insuranceIconWrapper}>
              <Image
                source={ICONS.INSURANCE_ICON}
                style={styles.insuranceIcon}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{t('insurance.title')}</Text>
          </View>

          <View style={styles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('insurance.add_insurance')}
                onPress={() => checkSubscription(() => navigation.navigate('AddInsurancePolicy' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), isBusiness ? 'business' : 'personal')}
                buttonStyle={styles.whiteButton}
                textStyle={styles.blackText}
              />
            )}
            {insurances?.length !== 0 && shouldAllowShare && (
              <PrimaryButton
                icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                title={t('insurance.share')}
                onPress={() => handleShare()}
                buttonStyle={[
                  styles.whiteButton,
                  { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
                textStyle={{color:themeColors?.isDark ? themeColors.background : themeColors.textPrimary}}
              />
            )}
          </View>

          {/* Totals Section */}
          {(!isLoading && insurances?.length !== 0) && (
            <View style={styles.totalsSection}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>
                  {t('insurance.total_annual')}:{' '}
                </Text>
                <Text style={styles.totalValue}>{totalAnnual}</Text>
              </View>
            </View>
          )}

          {/* Insurance List */}
          <View style={styles.insuranceSection}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={themeColors.primary}
                style={styles.loadingIndicator}
              />
            ) : insurances?.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconCircle}>
                  <AntDesign
                    name="exclamation"
                    size={32}
                    color={colors.gray || '#888'}
                  />
                </View>
                <Text style={styles.emptyText}>
                  {isFromEmergencyAccess
                    ? t('emergency_access_tab.no_data_emergency')
                    : t('insurance.no_insurances')}
                </Text>
              </View>
            ) : (
              insurances.map(renderInsuranceCard)
            )}
          </View>

          {/* Shared With Me */}
          {!accessLevel && !isFromEmergencyAccess && !isBusiness && (
            <SharedWithMeSection
              thunkAction={getInsurancesSharedWithMeAsync}
              renderItem={renderSharedInsuranceItem}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ShareModal
        visible={state.shareModalVisible}
        onClose={() =>
          setState(prev => ({ ...prev, shareModalVisible: false }))
        }
        onShare={handleShareInsurance}
        title={t('insurance.share_insurance')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
      />

      <DeleteConfirmModal
        visible={state.deleteModalVisible}
        onClose={() => {
          if (!isDeletePending) {
            setState(prev => ({ ...prev, deleteModalVisible: false }));
          }
        }}
        onConfirm={handleDeleteConfirm}
        title={t('insurance.delete_insurance')}
        message={`${t('modals.delete_confirm')} ${state.selectedInsurance?.itemname ||
          state.selectedInsurance?.itemName ||
          'this insurance'
          }?`}
        isLoading={isDeletePending}
      />

      <ViewInsuranceModal
        visible={state.viewModalVisible}
        onClose={() => setState(prev => ({ ...prev, viewModalVisible: false }))}
        insurance={state.selectedInsurance}
        linkTabs={{ record: state.selectedInsurance?.id ? { moduleKey: 'insurance', id: Number(state.selectedInsurance.id) } : null }}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default Insurance;
