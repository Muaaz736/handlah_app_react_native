import {
  Image, ScrollView, Text, View, TouchableOpacity
} from 'react-native';
import { RecordStatusBadge } from '../../../../../../components/records/RecordStatusBadge';
import { recordStatusOf, isInactive, INACTIVE_CARD_STYLE } from '../../../../../../utils/recordStatus';
import React, { FC, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewUtilityModal
} from '../../../../../../components/common';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { ICONS } from '../../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../../utils/helpers';
import {
  Utility, ShareData, UtilitiesNavigationProp
} from './Utilities.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUtilitiesAsync, deleteUtilityAsync
} from '../../../../../../redux/services/liabilitiesService';
import { getUtilitiesSharedWithMeAsync } from '../../../../../../redux/services/liabilitiesService';
import SharedWithMeSection from '../../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../../components/SharedWithMe/SharedWithMeSection';
import { getBusinessRealStateOverviewAsync, getRealStateOverviewAsync } from '../../../../../../redux/services/assetsService';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { sharingSyncService } from '../../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles, makeUtilitiesStyles } from '../Utilities.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../../utils/roleManager';
import { billingFrequencyKey, formatBillingAmount } from '../../../../../../utils/billingFrequency';

const Utilities: FC = (): React.ReactElement => {
  const navigation = useNavigation<UtilitiesNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const utilitiesStyles = useMemo(() => makeUtilitiesStyles(themeColors as RoleTheme), [themeColors]);
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
    get_utilities_status,
    get_utilities_data,
    delete_utility_status,
    add_utility_status,
    update_utility_status
  } = useSelector((state: any) => state.liabilities_slice);
  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const { get_real_state_overview_data } = useSelector(
    (state: any) => state?.assets_slice,
  );
  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);
  const isLoading = get_utilities_status === ASYNC_STATUS.LOADING;
  const isDeleting = delete_utility_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isBusiness && selectedBusinessId ? selectedBusinessId : undefined;

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: string | number;
  }>({ resourceType: 'utility' });
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showPropertyDropdown, setShowPropertyDropdown] =
    useState<boolean>(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState<boolean>(false);
  // Fetch utilities on mount / updates
  useEffect(() => {
    const connectionParams = getConnectionTabQueryParams();

    // In business mode with no business selected, skip fetch to avoid showing personal data
    if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess && Object.keys(connectionParams).length === 0) {
      return;
    }

    const params: any = { ...connectionParams };

    if (isBusiness && !isFromEmergencyAccess) {
      if (connectionTabSource === "shared_with_you") {
        // Viewing a connection's shared business — use their business, not
        // whatever business (if any) is currently selected for your own account.
        if (selectedSharedBusiness?.id) {
          params.businessId = selectedSharedBusiness.id;
        }
      } else if (selectedBusinessId) {
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

    dispatch(getUtilitiesAsync(arg));
    dispatch(getDropdownOptionsAsync('UtilityType'));

    // The real-estate list here is only used to label utility.realestateid in
    // the property filter dropdown. The /real-estates endpoint 403s when a
    // businessId you don't directly own is combined with ownerUserId, so —
    // same as web — this always uses your own business (never the connection's
    // shared business) and never passes an owner/shared param.
    if (isFromEmergencyAccess && currentConnectionUserId) {
      dispatch(getRealStateOverviewAsync({ userId: currentConnectionUserId, ...connectionParams }));
    } else if (isBusiness && selectedBusinessId) {
      dispatch(getBusinessRealStateOverviewAsync({ businessId: selectedBusinessId } as any));
    } else if (!isBusiness) {
      dispatch(getRealStateOverviewAsync(Object.keys(connectionParams).length ? connectionParams : undefined));
    }
  }, [
    dispatch,
    add_utility_status,
    update_utility_status,
    isBusiness,
    selectedBusinessId,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
    connectionTabSource,
    selectedSharedBusiness?.id,
  ]);

  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const utilities: Utility[] = noBusinessInBusinessMode ? [] : (get_utilities_data?.utilities || []);

  const realEstateProperties = get_real_state_overview_data?.realestates || [];

  const propertyMap = new Map(
    realEstateProperties.map((re: any) => [
      re.id,
      re.nickname || re.streetaddress || `Property ${re.id}`,
    ]),
  );

  const uniquePropertyIds = Array.from(
    new Set(utilities.map(u => u.realestateid).filter(Boolean)),
  );
  const propertyOptions = uniquePropertyIds.map(id => ({
    label: String(propertyMap.get(id) || `Property ${id}`),
    value: String(id)
  }));

  const utilityTypeOptions = (get_dropdown_options_data || []).map((opt: any) => ({
    label: opt.label,
    value: String(opt.value)
  }));

  const resolveUtilityTypeLabel = (utility: any): string => {
    if (!utility) return '-';
    const asLabel = (val: any): string => {
      const text = String(val ?? '').trim();
      return text && !/^\d+$/.test(text) ? text : '';
    };
    const typeLabel = asLabel(utility.utilitytypelabel);
    const otherLabel = asLabel(utility.utilitytypeother);
    // "Other" type → show the custom text the user entered
    if (typeLabel.toLowerCase() === 'other') return otherLabel || '-';
    return typeLabel || otherLabel || '-';
  };

  const filteredUtilities = utilities.filter(utility => {
    const matchesProperty =
      selectedProperties.length === 0 ||
      selectedProperties.includes(String(utility.realestateid));
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(String(utility.utilitytype));
    return matchesProperty && matchesType;
  });

  const hasActiveFilters = selectedProperties.length > 0 || selectedTypes.length > 0;

  // Bucket each utility's average amount by its own billing frequency, then
  // annualize each bucket separately (monthly x12, quarterly x4, annual x1)
  // instead of relying on the backend's frequency-blind totals.
  // (Unset frequencies count as monthly, as on the web; one-time amounts are not annualized.)
  const sumByFrequency = (freqs: string[]) =>
    filteredUtilities.reduce((sum, u) => {
      const freq = billingFrequencyKey(u.billingfrequency) ?? 'monthly';
      return freqs.includes(freq) ? sum + (u.averagemonthlyamount || 0) : sum;
    }, 0);

  const monthlyValue = sumByFrequency(['monthly']);
  const quarterlyValue = sumByFrequency(['quarterly']);
  const annualValue = sumByFrequency(['annually']);
  const weeklyValue = sumByFrequency(['weekly']);
  const biWeeklyValue = sumByFrequency(['bi-weekly']);
  const annualizedValue = monthlyValue * 12 + quarterlyValue * 4 + annualValue + weeklyValue * 52 + biWeeklyValue * 26;

  const totalMonthly = `$${monthlyValue.toFixed(2)}`;
  const totalQuarterly = `$${quarterlyValue.toFixed(2)}`;
  const totalAnnual = `$${annualValue.toFixed(2)}`;
  const totalAnnualized = `$${annualizedValue.toFixed(2)}`;

  const handleShare = (): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'utility' });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
  };

  const handleShareUtility = (shareData: ShareData): void => {
    const payload: any = {
      ...shareContext,
      users: shareData
    };

    if (currentBusinessId) {
      payload.businessId = currentBusinessId;
    }

    dispatch(sharingSyncService(payload));
  };

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetShareSyncStatus());
      setShareModalVisible(false);
      setSelectedUtility(null);
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
    if (get_utilities_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = utilities.find((u: Utility) => Number(u.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      setSelectedUtility(target);
      setViewModalVisible(true);
    }
  }, [openEntityId, get_utilities_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (get_utilities_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = utilities.find((u: Utility) => Number(u.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditPress(target);
    }
  }, [openEntityIdForEdit, get_utilities_status]);

  const handleViewPress = (utility: Utility): void => {
    setSelectedUtility(utility);
    setViewModalVisible(true);
  };

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

  const handleEditPress = (utility: any): void => {
    if (!getItemWriteAccess(utility)) {
      return;
    }
    checkSubscription(() => navigation.navigate('AddUtility', {
      utility,
      isEdit: true,
      ...(editOwnerUserId ? { ownerUserId: editOwnerUserId } : {}),
      ...(editOwnerBusinessId ? { ownerBusinessId: editOwnerBusinessId } : {}),
      ...(editOwnerName ? { ownerName: editOwnerName } : {}),
      ...(isFromEmergencyAccess ? { isFromEmergencyAccess: true } : {}),
    }), isBusiness ? 'business' : 'personal');
  };

  const handleDeletePress = (utility: Utility): void => {
    if (!getItemWriteAccess(utility)) {
      return;
    }
    setSelectedUtility(utility);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedUtility?.id || isDeletePending) return;

    setIsDeletePending(true);

    try {
      await dispatch(deleteUtilityAsync(selectedUtility.id)).unwrap();
      // Close modal immediately after successful delete
      setDeleteModalVisible(false);
      setSelectedUtility(null);

      // Refresh utilities list after modal closes
      const businessIdParam =
        isBusiness && selectedBusinessId ? selectedBusinessId : undefined;
      await dispatch(getUtilitiesAsync(businessIdParam)).unwrap();
    } catch (error) {
      console.error('Delete utility failed:', error);
    } finally {
      setIsDeletePending(false);
    }
  };

  const renderSharedUtilityItem = (item: any, owner: SharedWithMeOwner): React.ReactElement => {
    const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
    return (
      <TouchableOpacity onPress={() => handleViewPress(item)} key={item.id} style={[utilitiesStyles.utilityCard, isInactive(recordStatusOf(item)) && INACTIVE_CARD_STYLE]}>
        <View style={utilitiesStyles.topRow}>
          <View style={utilitiesStyles.nameSection}>
            <Text style={utilitiesStyles.utilityName} numberOfLines={1}>{(item as any).name || item.vendor || 'N/A'}</Text>
<RecordStatusBadge status={recordStatusOf(item)} />
          </View>
          <View style={utilitiesStyles.actionButtons}>
            <TouchableOpacity
              style={utilitiesStyles.actionBtn}
              onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Utility', entityId: item.id, title: t('edit_history.title') })}
            >
              <MaterialIcons name="history" size={24} color={themeColors.secondary} />
            </TouchableOpacity>
            {canWrite && (
              <TouchableOpacity
                style={utilitiesStyles.actionBtn}
                onPress={() => checkSubscription(() => navigation.navigate('AddUtility' as any, { utility: item, isEdit: true, ownerUserId: owner.id, ownerName: owner.firstname }), isBusiness ? 'business' : 'personal')}
              >
                <Feather name="edit-2" size={20} color={themeColors.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={utilitiesStyles.propertyRow}>
          <Text style={utilitiesStyles.propertyText} numberOfLines={1} ellipsizeMode="tail">
            {resolveUtilityTypeLabel(item)} - Account: {item.accountnumber || 'N/A'}
          </Text>
          <View
            style={[
              utilitiesStyles.amountBadge,
              { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
            ]}
          >
            <Text style={utilitiesStyles.amountText}>
              {formatBillingAmount(`$${item.averagemonthlyamount?.toFixed(2) || '0.00'}`, item.billingfrequency, true)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUtilityCard = (utility: Utility): React.ReactElement => (
    <TouchableOpacity onPress={() => handleViewPress(utility)} key={utility.id} style={[utilitiesStyles.utilityCard, isInactive(recordStatusOf(utility)) && INACTIVE_CARD_STYLE]}>
      <View style={utilitiesStyles.topRow}>
        <View style={utilitiesStyles.nameSection}>
          <Text style={utilitiesStyles.utilityName} numberOfLines={1}>{(utility as any).name || utility.vendor || 'N/A'}</Text>
<RecordStatusBadge status={recordStatusOf(utility)} />
        </View>
        <View style={utilitiesStyles.actionButtons}>
          <TouchableOpacity
            style={utilitiesStyles.actionBtn}
            onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Utility', entityId: utility.id, title: t('edit_history.title') })}
          >
            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
          </TouchableOpacity>
          {shouldAllowShare && (
            <TouchableOpacity
              style={utilitiesStyles.actionBtn}
              onPress={() => checkSubscription(() => {
                setShareContext({ resourceType: 'utility', resourceId: utility.id });
                setShareModalVisible(true);
              }, isBusiness ? 'business' : 'personal')}
            >
              <Image
                source={ICONS.SHARE_PRIMARY_ICON}
                style={[
                  utilitiesStyles.actionIconLg,
                  { tintColor: themeColors.secondary },
                ]}
              />
            </TouchableOpacity>
          )}
          {getItemWriteAccess(utility) && (
            <TouchableOpacity
              style={utilitiesStyles.actionBtn}
              onPress={() => handleEditPress(utility)}
            >
              <Feather name="edit-2" size={20} color={themeColors.secondary} />
            </TouchableOpacity>
          )}
          {shouldAllowShare && (
            <TouchableOpacity
              style={utilitiesStyles.actionBtn}
              onPress={() => handleDeletePress(utility)}
            >
              <Feather name="trash-2" size={20} color={themeColors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={utilitiesStyles.propertyRow}>
        <Text style={utilitiesStyles.propertyText} numberOfLines={1} ellipsizeMode="tail">
          {resolveUtilityTypeLabel(utility)} - Account:{' '}
          {utility.accountnumber || 'N/A'}
        </Text>
        <View
          style={[
            utilitiesStyles.amountBadge,
            { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
          ]}
        >
          <Text style={utilitiesStyles.amountText}>
            {formatBillingAmount(`$${utility.averagemonthlyamount?.toFixed(2) || '0.00'}`, utility.billingfrequency, true)}
          </Text>
        </View>
      </View>
       

      {/* Arrow Icon */}
      <TouchableOpacity
        style={utilitiesStyles.arrowButton}
        onPress={() => handleViewPress(utility)}
      ></TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={utilitiesStyles.gradientContainer}
    >
      <SafeAreaView style={utilitiesStyles.safeArea}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={[
            commonStyles.headerContainerStyle,
            { paddingTop: isIOS ? 0 : 20 },
          ]}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{ marginBottom: 0 }}
          backButtonIconStyle={{ tintColor: themeColors.background }}
        />

        <ScrollView
          style={utilitiesStyles.scrollView}
          contentContainerStyle={utilitiesStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={utilitiesStyles.iconContainer}>
            <View style={utilitiesStyles.utilityIconWrapper}>
              <Image source={ICONS.UTILITIES_ICON} style={utilitiesStyles.utilityIcon} />
            </View>

            {/* Title */}
            <Text style={utilitiesStyles.title}>{t('utilities.title')}</Text>
          </View>

          <View style={utilitiesStyles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('utilities.add_utility')}
                onPress={() => checkSubscription(() => navigation.navigate('AddUtility' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), isBusiness ? 'business' : 'personal')}
                buttonStyle={commonStyles.whiteButton}
                textStyle={commonStyles.blackText}
              />
            )}

            {filteredUtilities.length !== 0 && shouldAllowShare &&
              <PrimaryButton
                icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                title={t('utilities.share')}
                onPress={handleShare}
                buttonStyle={[
                  commonStyles.whiteButton,
                  { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
                textStyle={{color:themeColors?.isDark ? themeColors.background : themeColors.textPrimary}}
              />
            }
          </View>

          {/* Totals Section */}
          {get_utilities_data?.utilities?.length > 0 &&
            filteredUtilities.length > 0 && (
              <View
                style={[
                  utilitiesStyles.totalsSection,
                ]}
              >
                <View style={utilitiesStyles.totalItem}>
                  <Text style={utilitiesStyles.totalLabel}>
                    {t('utilities.total_monthly')}:{' '}
                  </Text>
                  <Text
                    style={utilitiesStyles.totalValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {totalMonthly}
                  </Text>
                </View>
                <View style={utilitiesStyles.totalItem}>
                  <Text style={utilitiesStyles.totalLabel}>
                    {t('utilities.total_quarterly')}:{' '}
                  </Text>
                  <Text
                    style={utilitiesStyles.totalValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {totalQuarterly}
                  </Text>
                </View>
                <View style={utilitiesStyles.totalItem}>
                  <Text style={utilitiesStyles.totalLabel}>
                    {t('utilities.total_annual')}:{' '}
                  </Text>
                  <Text
                    style={utilitiesStyles.totalValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {totalAnnual}
                  </Text>
                </View>
                <View style={utilitiesStyles.totalItem}>
                  <Text style={utilitiesStyles.totalLabel}>
                    {t('utilities.total_annualized')}:{' '}
                  </Text>
                  <Text
                    style={utilitiesStyles.totalValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {totalAnnualized}
                  </Text>
                </View>
              </View>
            )}

          {/* Filter Buttons */}
          {get_utilities_data?.utilities?.length > 0 && (
            <View style={utilitiesStyles.filterRow}>
              {/* All / Reset */}
              <TouchableOpacity
                style={[
                  utilitiesStyles.filterButton,
                  !hasActiveFilters && utilitiesStyles.filterButtonActive,
                ]}
                onPress={() => {
                  setSelectedProperties([]);
                  setSelectedTypes([]);
                  setShowPropertyDropdown(false);
                  setShowTypeDropdown(false);
                }}
              >
                <Text
                  style={[
                    utilitiesStyles.filterText,
                    !hasActiveFilters && utilitiesStyles.filterTextActive,
                  ]}
                >
                  {t('utilities.all')}
                </Text>
              </TouchableOpacity>

              {/* By Property */}
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[
                    utilitiesStyles.filterButton,
                    (showPropertyDropdown || selectedProperties.length > 0) &&
                    utilitiesStyles.filterButtonActive,
                  ]}
                  onPress={() => {
                    setShowPropertyDropdown(prev => !prev);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      utilitiesStyles.filterText,
                      selectedProperties.length > 0 && utilitiesStyles.filterTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t('utilities.by_property')}
                  </Text>
                  {selectedProperties.length > 0 && (
                    <View style={utilitiesStyles.countBadge}>
                      <Text style={utilitiesStyles.countBadgeText}>
                        {selectedProperties.length}
                      </Text>
                    </View>
                  )}
                  <Entypo
                    name={showPropertyDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={themeColors.textPrimary}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>

                {/* Property Dropdown - Multi-select */}
                {showPropertyDropdown && (
                  <View style={utilitiesStyles.inlineDropdown}>
                    <ScrollView
                      style={utilitiesStyles.dropdownScroll}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator
                    >
                    {propertyOptions.length > 0 ? (
                      propertyOptions.map(option => {
                        const isSelected = selectedProperties.includes(option.value);
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              utilitiesStyles.dropdownItem,
                              isSelected && utilitiesStyles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                              setSelectedProperties(prev =>
                                isSelected
                                  ? prev.filter(v => v !== option.value)
                                  : [...prev, option.value],
                              );
                            }}
                          >
                            <View style={utilitiesStyles.checkboxWrap}>
                              <View
                                style={[
                                  utilitiesStyles.checkbox,
                                  isSelected && {
                                    backgroundColor: themeColors.primary,
                                    borderColor: themeColors.primary
                                  },
                                ]}
                              >
                                {isSelected && (
                                  <Entypo name="check" size={12} color={colors.white} />
                                )}
                              </View>
                            </View>
                            <Text
                              style={[
                                utilitiesStyles.dropdownItemText,
                                isSelected && utilitiesStyles.dropdownItemTextSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={utilitiesStyles.dropdownItem}>
                        <Text style={utilitiesStyles.dropdownItemText}>
                          {t('utilities.no_properties')}
                        </Text>
                      </View>
                    )}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* By Type */}
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[
                    utilitiesStyles.filterButton,
                    (showTypeDropdown || selectedTypes.length > 0) &&
                    utilitiesStyles.filterButtonActive,
                  ]}
                  onPress={() => {
                    setShowTypeDropdown(prev => !prev);
                    setShowPropertyDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      utilitiesStyles.filterText,
                      selectedTypes.length > 0 && utilitiesStyles.filterTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t('utilities.by_type')}
                  </Text>
                  {selectedTypes.length > 0 && (
                    <View style={utilitiesStyles.countBadge}>
                      <Text style={utilitiesStyles.countBadgeText}>
                        {selectedTypes.length}
                      </Text>
                    </View>
                  )}
                  <Entypo
                    name={showTypeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={themeColors.textPrimary}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>

                {/* Type Dropdown - Multi-select */}
                {showTypeDropdown && (
                  <View style={utilitiesStyles.inlineDropdown}>
                    <ScrollView
                      style={utilitiesStyles.dropdownScroll}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator
                    >
                    {utilityTypeOptions.map((option: { label: string; value: string }) => {
                      const isSelected = selectedTypes.includes(option.value);
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            utilitiesStyles.dropdownItem,
                            isSelected && utilitiesStyles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedTypes(prev =>
                              isSelected
                                ? prev.filter(v => v !== option.value)
                                : [...prev, option.value],
                            );
                          }}
                        >
                          <View style={utilitiesStyles.checkboxWrap}>
                            <View
                              style={[
                                utilitiesStyles.checkbox,
                                isSelected && {
                                  backgroundColor: themeColors.primary,
                                  borderColor: themeColors.primary
                                },
                              ]}
                            >
                              {isSelected && (
                                <Entypo name="check" size={12} color={colors.white} />
                              )}
                            </View>
                          </View>
                          <Text
                            style={[
                              utilitiesStyles.dropdownItemText,
                              isSelected && utilitiesStyles.dropdownItemTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Utilities List */}
          <View style={utilitiesStyles.utilitiesSection}>
            {filteredUtilities.length > 0 ? (
              filteredUtilities.map(renderUtilityCard)
            ) : (
              <View style={utilitiesStyles.emptyStateContainer}>
                <View style={utilitiesStyles.emptyIconCircle}>
                  <AntDesign
                    name="exclamation"
                    size={32}
                    color={colors.gray || '#888'}
                  />
                </View>
                <Text style={utilitiesStyles.emptyText}>
                  {isFromEmergencyAccess
                    ? t('emergency_access_tab.no_data_emergency')
                    : t('utilities.no_utilities')}
                </Text>
              </View>
            )}
          </View>

          {/* Shared With Me */}
          {!accessLevel && !isFromEmergencyAccess && !isBusiness && (
            <SharedWithMeSection
              thunkAction={getUtilitiesSharedWithMeAsync}
              renderItem={renderSharedUtilityItem}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareUtility}
        title={t('utilities.share_utility')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          if (!isDeletePending) {
            setDeleteModalVisible(false);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title={t('utilities.delete_utility')}
        message={`${t('modals.delete_confirm')} ${selectedUtility?.vendor || 'this utility'
          }?`}
        isLoading={isDeletePending}
      />

      <ViewUtilityModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        utility={selectedUtility}
        linkTabs={{ record: selectedUtility?.id ? { moduleKey: 'utility', id: Number(selectedUtility.id) } : null }}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default Utilities;
