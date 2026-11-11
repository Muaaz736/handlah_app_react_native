import React, { useState, useEffect, useRef, useCallback, FC, useMemo } from 'react';
import { RecordStatusBadge } from '../../../../../../components/records/RecordStatusBadge';
import { recordStatusOf, isInactive, INACTIVE_CARD_STYLE } from '../../../../../../utils/recordStatus';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  PrimaryButton,
  ShareModal,
  ViewDetailModal,
  DeleteConfirmModal,
  showErrorToast
} from '../../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { formatDate, extractApiError } from '../../../../../../utils/helpers';
import type { DetailModalData } from '../../../../../../types/viewDetailModal.types';
import { ICONS } from '../../../../../../utils/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  subscriptionsAsync,
  deleteSubscriptionAsync
} from '../../../../../../redux/services/essentialsService';
import { getDropdownOptionsAsync } from '../../../../../../redux/services/authService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { authenticateWithAlert, biometricKeysExist } from '../../../../../../utils/biometricServices';
import { unlockResourceWithBiometric } from '../../../../../../utils/biometricUnlock';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import {
  SubscriptionItem,
  ShareData,
  SubscriptionsNavigationProp
} from './Subscriptions.types';
import { sharingSyncService } from '../../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../../redux/slices/sharingSlice';
import SharedWithMeSection, { SharedWithMeOwner } from '../../../../../../components/SharedWithMe/SharedWithMeSection';
import { getSubscriptionsSharedWithMeAsync } from '../../../../../../redux/services/essentialsService';
import {
  getModuleWriteAccess,
  getEntityWriteAccess
} from '../../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../../types/store.types';
import { makeCommonStyles, makeSubscriptionsStyles } from '../Subscriptions.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';

const Subscriptions: FC = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SubscriptionsNavigationProp>();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const subscriptionsStyles = useMemo(() => makeSubscriptionsStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const dispatch = useDispatch<AppDispatch>();
  const isBusiness = isBusinessRole();

  const route = useRoute<any>();
  const {
    from,
    connectionTabSource,
    sharedWithUserId,
    ownerId,
    accessLevel,
    accessType,
    openEntityId,
    openEntityIdForEdit,
  } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;

  const writeAccess = getModuleWriteAccess({
    isFromEmergencyAccess,
    accessType,
    accessLevel
  });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({
      isFromEmergencyAccess,
      accessType,
      moduleWriteAccess: writeAccess,
      entity: item
    });
  // The business whose records are listed: the one picked in the app, or the owner's when looking at somebody's shared business.
  const listScopeParams = () => ({
    ...getConnectionTabQueryParams(),
    ...(isBusiness && selectedBusinessId
      ? { businessId: connectionTabSource === 'shared_with_you' ? selectedSharedBusiness?.id : selectedBusinessId }
      : {}),
  });

  const getConnectionTabQueryParams = () => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  };

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [viewDetailData, setViewDetailData] = useState<DetailModalData | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionItem | null>(null);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'subscription' });

  const {
    subscriptions_data,
    subscriptions_status,
    update_subscription_status,
    delete_subscription_status,
    create_subscription_status
  } = useSelector((state: any) => state.essentials_slice);
  const { get_dropdown_options_data: paymentMethodOptions } = useSelector(
    (state: any) => state.user_auth,
  );
  const { share_sync_status } = useSelector(
    (state: any) => state.sharing_slice,
  );
  const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector(
    (state: any) => state.connection_slice,
  );
  const { selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;

  const handleAddSubscription = (): void => {
    checkSubscription(() => navigation.navigate(
      'AddSubscription' as any,
      accessLevel
        ? {
            ownerUserId: currentConnectionUserId,
            ownerBusinessId: isBusiness
              ? (isFromEmergencyAccess ? emergencyConnectionBusinessId : selectedSharedBusiness?.id)
              : undefined,
          }
        : undefined,
    ));
  };

  const handleShare = (resourceId?: number): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'subscription', resourceId });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
  };

  const handleShareSubscription = (shareData: ShareData): void => {
    dispatch(
      sharingSyncService({
        ...shareContext,
        users: shareData,
        ...(isBusiness && selectedBusinessId ? { businessId: selectedBusinessId } : {}),
      } as any),
    );
  };

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

  useEffect(() => {
    dispatch(getDropdownOptionsAsync('PaymentMethod') as any);
  }, [dispatch]);

  useEffect(() => {
    if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess) {
      return;
    }

    if (isFromEmergencyAccess && currentConnectionUserId) {
      dispatch(
        subscriptionsAsync({
          userId: currentConnectionUserId,
          ...(isBusiness && emergencyConnectionBusinessId ? { businessId: emergencyConnectionBusinessId } : {}),
          ...getConnectionTabQueryParams()
        }),
      );
    } else {
      dispatch(subscriptionsAsync(listScopeParams()));
    }
  }, [
    dispatch,
    update_subscription_status,
    delete_subscription_status,
    create_subscription_status,
    isFromEmergencyAccess,
    currentConnectionUserId,
    isBusiness,
    selectedBusinessId,
  ]);

  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const subscriptions: SubscriptionItem[] = noBusinessInBusinessMode
    ? []
    : Array.isArray(subscriptions_data?.subscriptions,)
      ? subscriptions_data.subscriptions
      : [];

  // One section per billing frequency; anything an older record holds that is none of them goes under "Other".
  const frequencyOf = (value?: string | null): string => {
    const v = (value ?? '').toLowerCase().replace(/[\s-]/g, '');
    if (v === 'onetime' || v === 'once') return 'one_time';
    if (v === 'monthly') return 'monthly';
    if (v === 'quarterly') return 'quarterly';
    if (v === 'annually' || v === 'annual' || v === 'yearly') return 'annual';
    return 'other';
  };
  const groupOrder = ['monthly', 'quarterly', 'annual', 'one_time', 'other'];
  const subscriptionGroups = groupOrder
    .map(key => ({ key, items: subscriptions.filter(s => frequencyOf(s.billingfrequency) === key) }))
    .filter(g => g.items.length > 0);

  const money = (amount?: number | null, currency?: string | null): string => {
    if (amount === null || amount === undefined) return '';
    const symbol = !currency || currency === 'USD' ? '$' : `${currency} `;
    return `${symbol}${amount}`;
  };

  const costLabel = (item: SubscriptionItem): string => {
    if (item.cost === null || item.cost === undefined) return '';
    if (Number(item.cost) === 0) return t('subscriptions.free');
    const f = frequencyOf(item.billingfrequency);
    const per = f === 'monthly' ? t('subscriptions.per_month') : f === 'quarterly' ? t('subscriptions.per_quarter') : f === 'annual' ? t('subscriptions.per_year') : '';
    return `${money(item.cost, item.currency)}${per}`;
  };

  const openSubscriptionDetail = (subscription: SubscriptionItem) => {
    setSelectedSubscription(subscription);

    const { username, password } = subscription;

    // const resolvedPaymentMethod = (subscription as any).paymentmethod
    //   ? (paymentMethodOptions?.find(
    //     (opt: any) => String(opt.value) === String((subscription as any).paymentmethod),
    //   )?.label || String((subscription as any).paymentmethod))
    //   : undefined;
    const resolvedPaymentMethod = subscription?.paymentmethodlabel

    const item = subscription as any;
    const yes = t('common.yes') || 'Yes';
    const no = t('common.no') || 'No';
    const pair = (
      left: { label: string; value: any; secret?: boolean },
      right?: { label: string; value: any; secret?: boolean },
    ) => ({
      left: { ...left, value: left.value === null || left.value === undefined ? '' : String(left.value) },
      ...(right ? { right: { ...right, value: right.value === null || right.value === undefined ? '' : String(right.value) } } : {}),
    });
    const date = (v?: string | null) => (v ? formatDate(v) || '' : '');
    const billing = frequencyOf(item.billingfrequency);
    const billingLabel = billing === 'other' ? item.billingfrequency || '' : t(`subscriptions.billing_options.${billing === 'annual' ? 'yearly' : billing}`);

    const rows: DetailModalData['rows'] = [
      pair(
        { label: t('subscriptions.type') || 'Type', value: item.typelabel || item.type },
        { label: t('subscriptions.provider') || 'Provider', value: item.provider },
      ),
      pair(
        { label: t('subscriptions.member_name') || 'Member', value: item.membername },
        { label: t('subscriptions.membership_number') || 'Membership number', value: item.membershipnumber, secret: true },
      ),
      pair(
        { label: t('subscriptions.plan_tier') || 'Plan / Tier', value: item.plantier },
        { label: t('subscriptions.location') || 'Location', value: item.location },
      ),
      pair(
        { label: t('subscriptions.cost') || 'Cost', value: item.cost != null ? (Number(item.cost) === 0 ? t('subscriptions.free') : money(item.cost, item.currency)) : '' },
        { label: t('subscriptions.billing_frequency') || 'Billing', value: billingLabel },
      ),
      pair(
        { label: t('subscriptions.renewal_date') || 'Renewal Date', value: date(item.nextrenewaldate) },
        { label: t('subscriptions.next_payment_date') || 'Next payment', value: date(item.nextpaymentdate) },
      ),
      pair(
        { label: t('subscriptions.start_date') || 'Start', value: date(item.startdate) },
        { label: t('subscriptions.expiration_date') || 'Expiration', value: item.noexpiration ? t('subscriptions.no_expiration') : date(item.enddate) },
      ),
      pair(
        { label: t('subscriptions.auto_renew') || 'Auto-renew', value: item.autorenew == null ? '' : item.autorenew ? yes : no },
        { label: t('subscriptions.payment_method') || 'Payment Method', value: subscription?.paymentmethodlabel || '' },
      ),
      pair(
        { label: t('subscriptions.username_email') || 'Username/Email', value: username },
        { label: t('common.password') || 'Password', value: password, secret: true },
      ),
    ];

    if (item.barcodevalue) {
      rows.push(pair({ label: t('subscriptions.barcode_value') || 'Barcode / QR code', value: item.barcodevalue }));
    }
    if (item.issuerapplink) {
      rows.push(pair({ label: t('subscriptions.issuer_app_link') || "Issuer's app link", value: item.issuerapplink }));
    }
    rows.push(pair({ label: t('subscriptions.add_to_wallet') || 'Wallet', value: item.addtowallet ? yes : no }));
    if (item.notes) {
      rows.push(pair({ label: t('common.notes') || 'Notes', value: item.notes }));
    }

    const sections: NonNullable<DetailModalData['sections']> = [];
    const addSection = (title: string, content?: string | null) => {
      if (content) sections.push({ title, content });
    };
    addSection(t('subscriptions.cancellation_notice'), item.cancellationnotice);
    addSection(t('subscriptions.cancellation_instructions'), item.cancellationinstructions);
    addSection(t('subscriptions.benefits'), item.benefits);
    addSection(t('subscriptions.restrictions'), item.restrictions);

    const images = [item.cardfronturl, item.cardbackurl, item.barcodeimageurl].filter(Boolean) as string[];
    const detail: DetailModalData = {
      linkRecord: item?.id ? { moduleKey: 'subscription', id: Number(item.id) } : null,
      title: item.subscriptionname || '',
      subtitle: [item.typelabel || item.type, item.provider].filter(Boolean).join(' · ') || undefined,
      badge: item.status ? t(`subscriptions.status_options.${String(item.status).toLowerCase()}`) : undefined,
      rows,
      sections: sections.length ? sections : undefined,
      url: item.websiteurl || item.url || undefined,
      imageIds: images.length ? images : undefined,
      documentId: item.cardpdfurl || undefined,
      additionalAttachments: Array.isArray(item.uploadattachments) && item.uploadattachments.length ? item.uploadattachments : undefined,
    };

    setViewDetailData(detail);
    setViewModalVisible(true);
  };

  const handleViewSubscription = async (subscription: SubscriptionItem) => {
    if (!subscription) return;

    const hasBiometricDevice = await biometricKeysExist();
    if (!hasBiometricDevice) {
      await authenticateWithAlert({
        promptMessage:
          t('subscriptions.authenticateToView') ||
          'Authenticate to view subscription details',
        cancelButtonText: 'Cancel',
        failureTitle:
          'Authentication Failed',
        failureMessage:
          'Authentication is required to view subscription details',
        okButtonText: 'OK',
        allowDeviceCredentials: true,
        onSuccess: () => {
          openSubscriptionDetail(subscription);
        }
      });
      return;
    }

    try {
      const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
      const unlockedData = await unlockResourceWithBiometric(
        'subscriptions',
        Number(subscription.id),
        ownerUserId,
      );
      openSubscriptionDetail({ ...subscription, ...unlockedData });
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) return;
      showErrorToast(extractApiError(err, 'Failed to unlock subscription.'));
    }
  };

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (subscriptions_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = subscriptions.find(
      (s: SubscriptionItem) => Number((s as any).id) === Number(openEntityId),
    );
    if (target) {
      autoOpenedRef.current = true;
      handleViewSubscription(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityId, subscriptions_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (subscriptions_status !== ASYNC_STATUS.SUCCEEDED) return;
    const target = subscriptions.find(
      (s: SubscriptionItem) => Number((s as any).id) === Number(openEntityIdForEdit),
    );
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditSubscription(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityIdForEdit, subscriptions_status]);

  const handleEditSubscription = async (subscription: SubscriptionItem) => {
    const hasBiometricDevice = await biometricKeysExist();
    if (!hasBiometricDevice) {
      await authenticateWithAlert({
        promptMessage:
          'Authenticate to edit subscription',
        cancelButtonText: 'Cancel',
        failureTitle:
          'Authentication Failed',
        failureMessage:
          'Authentication is required to edit subscription details',
        okButtonText: 'OK',
        allowDeviceCredentials: true,
        onSuccess: () => {
          navigation.navigate('AddSubscription', { subscription, isEdit: true });
        }
      });
      return;
    }

    try {
      const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
      const unlockedData = await unlockResourceWithBiometric(
        'subscriptions',
        Number(subscription.id),
        ownerUserId,
      );
      navigation.navigate('AddSubscription', {
        subscription: { ...subscription, ...unlockedData },
        isEdit: true,
      });
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) return;
      showErrorToast(extractApiError(err, 'Failed to unlock subscription.'));
    }
  };

  const handleDeleteSubscription = (subscription: SubscriptionItem) => {
    setSelectedSubscription(subscription);
    setDeleteModalVisible(true);
  };

  const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;

  const renderSharedSubscriptionItem = useCallback(
    (item: any, _owner: SharedWithMeOwner) => {
      const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
      return (
        <TouchableOpacity
          onPress={() => handleViewSubscription(item)}
          style={[subscriptionsStyles.subscriptionCard, isInactive(recordStatusOf(item)) && INACTIVE_CARD_STYLE]}
        >
          <View style={subscriptionsStyles.cardHeader}>
            <Text style={subscriptionsStyles.subscriptionName}>
              {item.subscriptionname}
            </Text>
<RecordStatusBadge status={recordStatusOf(item)} />
            <View style={subscriptionsStyles.actionsRow}>
              <TouchableOpacity
                style={subscriptionsStyles.iconButton}
                onPress={() =>
                  navigation.navigate('EditHistoryList', {
                    entityType: 'Subscription',
                    entityId: item.id,
                    title: t('edit_history.title'),
                  })
                }
              >
                <MaterialIcons
                  name="history"
                  size={26}
                  color={themeColors.secondary}
                />
              </TouchableOpacity>
              {canWrite && (
                <TouchableOpacity
                  style={subscriptionsStyles.iconButton}
                  onPress={() => handleEditSubscription(item)}
                >
                  <Image
                    source={ICONS.EDIT_ICON}
                    style={[
                      subscriptionsStyles.actionIcon,
                      { tintColor: themeColors.secondary },
                    ]}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={subscriptionsStyles.cardBody}>
            <View>
              <Text
                style={[subscriptionsStyles.renewalLabel, { textAlign: 'left' }]}
              >
                {t('subscriptions.renewal_date')}
              </Text>
              <Text
                style={[subscriptionsStyles.renewalDate, { textAlign: 'left' }]}
              >
                {formatDate(item.nextrenewaldate)}
              </Text>
            </View>
            <View
              style={[
                subscriptionsStyles.costBadge,
                { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
              ]}
            >
              <Text style={subscriptionsStyles.costText}>
                {costLabel(item)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeColors, t, navigation],
  );

  const confirmDelete = async () => {
    if (!selectedSubscription?.id || deleteLoading) return;

    setDeleteLoading(true);
    try {
      const action = await dispatch(
        deleteSubscriptionAsync(selectedSubscription.id as any),
      );
      if (action.type === deleteSubscriptionAsync.fulfilled.type) {
        dispatch(subscriptionsAsync(listScopeParams()));
      }
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setSelectedSubscription(null);
    }
  };

  const accent = themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5);

  const renderSubscriptionCard = (subscription: SubscriptionItem) => {
    const sublabel = [subscription.typelabel || subscription.type, subscription.provider].filter(Boolean).join(' · ');
    return (
      <TouchableOpacity
        onPress={() => handleViewSubscription(subscription)}
        key={subscription.id}
        style={[subscriptionsStyles.subscriptionCard, isInactive(recordStatusOf(subscription)) && INACTIVE_CARD_STYLE]}
      >
        <View style={subscriptionsStyles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={subscriptionsStyles.subscriptionName}>{subscription.subscriptionname}</Text>
<RecordStatusBadge status={recordStatusOf(subscription)} />
            {!!sublabel && <Text style={[subscriptionsStyles.renewalLabel, { textAlign: 'left' }]}>{sublabel}</Text>}
          </View>
          <View style={subscriptionsStyles.actionsRow}>
            <TouchableOpacity
              style={subscriptionsStyles.iconButton}
              onPress={() =>
                navigation.navigate('EditHistoryList', {
                  entityType: 'Subscription',
                  entityId: subscription.id,
                  title: t('edit_history.title')
                })
              }
            >
              <MaterialIcons name="history" size={26} color={themeColors.secondary} />
            </TouchableOpacity>
            {shouldAllowShare && (
              <TouchableOpacity style={subscriptionsStyles.iconButton} onPress={() => handleShare(subscription.id)}>
                <Image source={ICONS.SHARE_PRIMARY_ICON} style={[subscriptionsStyles.actionIcon, { tintColor: themeColors.secondary }]} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={subscriptionsStyles.iconButton} onPress={() => handleViewSubscription(subscription)}>
              <Image source={ICONS.EYE_ICON} style={[subscriptionsStyles.actionIcon, { tintColor: themeColors.secondary }]} />
            </TouchableOpacity>
            {getItemWriteAccess(subscription) && (
              <>
                <TouchableOpacity style={subscriptionsStyles.iconButton} onPress={() => handleEditSubscription(subscription)}>
                  <Image source={ICONS.EDIT_ICON} style={[subscriptionsStyles.actionIcon, { tintColor: themeColors.secondary }]} />
                </TouchableOpacity>
                <TouchableOpacity style={subscriptionsStyles.iconButton} onPress={() => handleDeleteSubscription(subscription)}>
                  <Image source={ICONS.DELETE_ICON} style={[subscriptionsStyles.actionIcon, { tintColor: themeColors.secondary }]} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <View style={subscriptionsStyles.cardBody}>
          <View>
            <Text style={[subscriptionsStyles.renewalLabel, { textAlign: 'left' }]}>{t('subscriptions.renewal_date')}</Text>
            <Text style={[subscriptionsStyles.renewalDate, { textAlign: 'left' }]}>
              {subscription.nextrenewaldate ? formatDate(subscription.nextrenewaldate) : '—'}
            </Text>
            {!!subscription.status && subscription.status !== 'Active' && (
              <Text style={[subscriptionsStyles.renewalLabel, { textAlign: 'left' }]}>
                {t(`subscriptions.status_options.${String(subscription.status).toLowerCase()}`)}
              </Text>
            )}
          </View>
          {!!costLabel(subscription) && (
            <View style={[subscriptionsStyles.costBadge, { backgroundColor: accent }]}>
              <Text style={subscriptionsStyles.costText}>{costLabel(subscription)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={subscriptionsStyles.container}
    >
      <SafeAreaView style={subscriptionsStyles.safeArea}>
        {/* Header */}
        <View style={subscriptionsStyles.header}>
          <TouchableOpacity
            style={[subscriptionsStyles.backButton, { borderColor: themeColors.background }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.background} />
          </TouchableOpacity>
        </View>
        {/* Subscriptions List */}
        <ScrollView
          style={subscriptionsStyles.subscriptionsList}
          showsVerticalScrollIndicator={false}
        >

          {/* Content */}
          <View style={subscriptionsStyles.content}>
            {/* Icon */}
            <View style={subscriptionsStyles.iconContainer}>
              <Image
                source={ICONS.SUBSCRIPTION_WHITE_ICON}
                style={subscriptionsStyles.subscriptionIcon}
              />
            </View>

            {/* Title */}
            <Text style={subscriptionsStyles.title}>{t('subscriptions.title')}</Text>

            {/* Buttons Row */}
            <View style={subscriptionsStyles.buttonsRow}>
              {shouldAllowShare && (
                <PrimaryButton
                  icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                  title={t('subscriptions.add_subscription')}
                  onPress={handleAddSubscription}
                  buttonStyle={subscriptionsStyles.addButton}
                  textStyle={subscriptionsStyles.addButtonText}
                />

              )}

              {subscriptions.length > 0 && shouldAllowShare && (
                <PrimaryButton
                  icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                  title={t('subscriptions.share')}
                  onPress={() => handleShare()}
                  buttonStyle={[subscriptionsStyles.shareButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                  textStyle={[subscriptionsStyles.shareButtonText, { color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }]}
                />
              )}
            </View>

            {/* Totals */}
            <View style={subscriptionsStyles.totalsContainer}>
              <View style={subscriptionsStyles.totalItem}>
                <Text style={subscriptionsStyles.totalLabel}>
                  {t('subscriptions.total_monthly')}
                </Text>
                <Text style={subscriptionsStyles.totalValue}>
                  ${subscriptions_data?.totalmonthlyamount ?? 0}
                </Text>
              </View>
              <View style={subscriptionsStyles.totalItem}>
                <Text style={subscriptionsStyles.totalLabel}>
                  {t('subscriptions.total_quarterly')}
                </Text>
                <Text style={subscriptionsStyles.totalValue}>
                  ${subscriptions_data?.totalquarterlyamount ?? 0}
                </Text>
              </View>
              <View style={subscriptionsStyles.totalItem}>
                <Text style={subscriptionsStyles.totalLabel}>
                  {t('subscriptions.total_annual')}
                </Text>
                <Text style={subscriptionsStyles.totalValue}>
                  ${subscriptions_data?.totalannuallyamount ?? 0}
                </Text>
              </View>
              <View style={subscriptionsStyles.totalItem}>
                <Text style={subscriptionsStyles.totalLabel}>
                  {t('subscriptions.total_one_time')}
                </Text>
                <Text style={subscriptionsStyles.totalValue}>
                  ${subscriptions_data?.totalonetimeamount ?? 0}
                </Text>
              </View>
              <View style={subscriptionsStyles.totalItem}>
                <Text style={subscriptionsStyles.totalLabel}>
                  {t('subscriptions.total_annual_combined') || 'Total Annual'}
                </Text>
                <Text style={subscriptionsStyles.totalValue}>
                  ${subscriptions_data?.totalamount ?? 0}
                </Text>
              </View>
            </View>


            {subscriptions_status === ASYNC_STATUS.LOADING ? (
              <ActivityIndicator
                size="large"
                color={themeColors.primary}
                style={subscriptionsStyles.loadingIndicator}
              />
            ) : subscriptions.length > 0 ? (
              <>
                {subscriptionGroups.map(group => (
                  <React.Fragment key={group.key}>
                    <Text style={subscriptionsStyles.sectionHeader}>
                      {t(`subscriptions.group_${group.key}`)}
                    </Text>
                    {group.items.map((subscription: SubscriptionItem) => renderSubscriptionCard(subscription))}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <View style={subscriptionsStyles.emptyStateContainer}>
                <View style={subscriptionsStyles.emptyIconCircle}>
                  <AntDesign
                    name="exclamation"
                    size={32}
                    color={colors.gray || '#888'}
                  />
                </View>
                <Text style={subscriptionsStyles.emptyText}>
                  {t('subscriptions.no_subscriptions')}
                </Text>
              </View>
            )}

            {/* Shared With Me Section — personal only */}
            {showSharedWithMe && (
              <SharedWithMeSection
                thunkAction={getSubscriptionsSharedWithMeAsync}
                renderItem={renderSharedSubscriptionItem}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareSubscription}
        title={t('subscriptions.title')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
      />

      <ViewDetailModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setViewDetailData(null);
        }}
        data={viewDetailData}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteModalVisible(false);
            setSelectedSubscription(null);
          }
        }}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title={t('modals.delete_confirm')}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default Subscriptions;
