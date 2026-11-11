import { isSoftwareLicense } from '../../../../../constants/licenseKinds';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { authenticateWithAlert, biometricKeysExist } from '../../../../../utils/biometricServices';
import { unlockResourceWithBiometric } from '../../../../../utils/biometricUnlock';

import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LicensesNavigationProp, ShareData } from './Licenses.types';
import {
  AuthHeader,
  PrimaryButton,
  ShareModal,
  ViewDetailModal,
  showErrorToast,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { makeLicensesStyles } from './Licenses.styles';
import {
  getBusinessLicensesAsync,
  deleteBusinessLicenseAsync,
} from '../../../../../redux/services/businessLicensesService';
import { resetDeleteBusinessLicenseStatus } from '../../../../../redux/slices/businessLicensesSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import type { AppDispatch, RootState } from '../../../../../types/store.types';
import type { BusinessLicenseItem } from '../../../../../types/reduxTypes/businessLicensesSlice.types';
import { formatDate, extractApiError } from '../../../../../utils/helpers';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import type { DetailModalData } from '../../../../../types/viewDetailModal.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto';

const Licenses: React.FC = () => {
  const navigation = useNavigation<LicensesNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeLicensesStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [viewModalData, setViewModalData] = useState<DetailModalData | null>(null);

  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'businesslicense' });

  // Redux selectors
  const { get_business_licenses_status, get_business_licenses_data, delete_business_license_status } = useSelector(
    (state: any) => state.business_licenses_slice,
  );
  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector(
    (state: any) => state.connection_slice,
  );

  const licenses = get_business_licenses_data || [];
  const isLoading = get_business_licenses_status === ASYNC_STATUS.LOADING;
  const isDeleting = delete_business_license_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isFromEmergencyAccess ? emergencyConnectionBusinessId : selectedBusinessId;

  const fetchLicenses = useCallback(() => {
    const connectionParams = getConnectionTabQueryParams();

    if (!selectedBusinessId && !isFromEmergencyAccess && Object.keys(connectionParams).length === 0) {
      return;
    }

    const params: any = { ...connectionParams };

    if (selectedBusinessId && !isFromEmergencyAccess) {
      if (connectionTabSource === "shared_with_you") {
        params.businessId = selectedSharedBusiness?.id;
      } else {
        params.businessId = selectedBusinessId;
      }
    }

    if (isFromEmergencyAccess && currentConnectionUserId) {
      params.userId = currentConnectionUserId;
      params.businessId = emergencyConnectionBusinessId;
    }

    dispatch(getBusinessLicensesAsync(params as any));
  }, [
    selectedBusinessId,
    dispatch,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
    selectedSharedBusiness,
  ]);

  // Fetch licenses when component mounts or business/emergency context changes
  useFocusEffect(
    React.useCallback(() => {
      fetchLicenses();
    }, [fetchLicenses])
  );

  // Refetch licenses after delete
  useEffect(() => {
    if (delete_business_license_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetDeleteBusinessLicenseStatus());
      fetchLicenses();
    }
  }, [delete_business_license_status, dispatch, fetchLicenses]);

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    fetchLicenses();
    // Stop refreshing after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleShare = (resourceId?: number): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'businesslicense', resourceId });
      setShareModalVisible(true);
    }, 'business');
  };

  const handleShareDocument = (shareData: ShareData): void => {
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
    }
  }, [share_sync_status, dispatch]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.ERROR) {
      dispatch(resetShareSyncStatus());
    }
  }, [share_sync_status, dispatch]);

  const handleDeleteLicense = (id: number): void => {
    Alert.alert(
      t('business.licenses.delete_title'),
      t('business.licenses.delete_message'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {
            // Cancel delete
          },
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: () => {
            dispatch(deleteBusinessLicenseAsync(id) as any);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleEditLicense = (id: number): void => {
    checkSubscription(async () => {
      const hasBiometricDevice = await biometricKeysExist();
      if (!hasBiometricDevice) {
        authenticateWithAlert({
          promptMessage: t('common.biometric_prompt') || 'Authenticate to edit license',
          failureTitle: t('common.authentication_failed') || 'Authentication Failed',
          failureMessage: t('common.authentication_required') || 'Biometric authentication is required to edit license',
          onSuccess: () => {
            navigation.navigate('AddLicense' as any, { licenseId: id });
          },
        });
        return;
      }

      try {
        const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
        const unlockedData = await unlockResourceWithBiometric('business-licenses', id, ownerUserId);
        navigation.navigate('AddLicense' as any, {
          licenseId: id,
          unlockedCredentials: {
            username: unlockedData?.username ?? '',
            password: unlockedData?.password ?? '',
          },
        });
      } catch (err: any) {
        const message = String(err?.message || '').toLowerCase();
        if (message.includes('cancel')) return;
        showErrorToast(extractApiError(err, 'Failed to unlock license.'));
      }
    }, 'business');
  };

  const handleShareLicense = (id: number): void => {
    handleShare(id);
  };

  const buildLicenseDetail = (license: BusinessLicenseItem): DetailModalData =>
    isSoftwareLicense(license.licenseKind) ? buildSoftwareDetail(license) : buildPermitDetail(license);

  /** A license or permit (liquor, building, contractor…): number, agency, state, holder, dates. */
  const buildPermitDetail = (license: BusinessLicenseItem): DetailModalData => {
    const row = (a: [string, string | null | undefined], b?: [string, string | null | undefined]) => ({
      left: { label: a[0], value: a[1] || '—' },
      ...(b ? { right: { label: b[0], value: b[1] || '—' } } : {}),
    });
    return {
      linkRecord: license.id ? { moduleKey: 'businesslicense', id: Number(license.id) } : null,
      title: license.state ? `${license.product} (${license.state})` : license.product || t('business.licenses.license'),
      subtitle: license.vendorProvider || undefined,
      badge: t(`license_permits.kinds.${license.licenseKind}`, { defaultValue: license.licenseKind }),
      rows: [
        row([t('license_permits.permit.licenseNumber'), license.licenseNumber], [t('license_permits.permit.status'), license.status ? t(`license_permits.statuses.${license.status}`, { defaultValue: license.status }) : null]),
        row([t('license_permits.permit.state'), license.state], [t('license_permits.permit.jurisdiction'), license.jurisdiction]),
        row([t('license_permits.permit.issueDate'), license.issueDate ? formatDate(license.issueDate) : null], [t('license_permits.permit.expirationDate'), license.renewalDate ? formatDate(license.renewalDate) : null]),
        row([t('license_permits.permit.holder'), license.holderName], [t('license_permits.permit.classOrType'), license.plan]),
        row([t('license_permits.permit.location'), license.location], [t('license_permits.permit.fee'), license.cost ? `$${license.cost}${license.period ? ` / ${license.period}` : ''}` : null]),
      ],
      sections: [
        ...(license.notes ? [{ title: t('business.licenses.notes') || 'Notes', content: license.notes }] : []),
      ],
    };
  };

  const buildSoftwareDetail = (license: BusinessLicenseItem): DetailModalData => ({
    linkRecord: (license as any)?.id ? { moduleKey: 'businesslicense', id: Number((license as any).id) } : null,
    title: license.vendorProvider || t('business.licenses.license'),
    subtitle: license.product || undefined,
    badge: license.plan || undefined,
    rows: [
      {
        left: { label: t('business.licenses.seats') || 'Seats', value: String(license.seats || 0) },
        right: { label: t('business.licenses.cost') || 'Cost', value: `$${license.cost || 0} / ${license.period || ''}` },
      },
      {
        left: { label: t('business.licenses.renewal') || 'Renewal Date', value: formatDate(license.renewalDate) },
        right: { label: t('business.licenses.auto_renew') || 'Auto Renew', value: license.autoRenew ? (t('common.yes') || 'Yes') : (t('common.no') || 'No') },
      },
      ...(license.licenseKey ? [{
        left: { label: t('business.licenses.license_key') || 'License Key', value: license.licenseKey, secret: true },
      }] : []),
      ...(license.username || license.password ? [{
        left: { label: t('business.add_license.username') || 'Username', value: license.username || '' },
        right: { label: t('business.add_license.password') || 'Password', value: license.password || '', secret: true },
      }] : []),
    ],
    sections: [
      ...(license.notes ? [{
        title: t('business.licenses.notes') || 'Notes',
        content: license.notes,
      }] : []),
    ],
  });

  const handleViewPress = async (license: BusinessLicenseItem): Promise<void> => {
    if (!license) return;

    const hasBiometricDevice = await biometricKeysExist();
    if (!hasBiometricDevice) {
      await authenticateWithAlert({
        promptMessage: t('common.biometric_prompt') || 'Authenticate to view license',
        cancelButtonText: t('common.cancel') || 'Cancel',
        failureTitle: t('common.authentication_failed') || 'Authentication Failed',
        failureMessage: t('common.authentication_required') || 'Biometric authentication is required to view license',
        okButtonText: t('common.ok') || 'OK',
        allowDeviceCredentials: true,
        onSuccess: () => {
          setViewModalData(buildLicenseDetail(license));
          setViewModalVisible(true);
        },
      });
      return;
    }

    try {
      const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
      const unlockedData = await unlockResourceWithBiometric(
        'business-licenses',
        Number(license.id),
        ownerUserId,
      );
      const resolvedLicense = { ...license, ...unlockedData };
      setViewModalData(buildLicenseDetail(resolvedLicense));
      setViewModalVisible(true);
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) return;
      showErrorToast(extractApiError(err, 'Failed to unlock license.'));
    }
  };

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (get_business_licenses_status !== ASYNC_STATUS.SUCCEEDED) return;
    const licenseList = get_business_licenses_data || [];
    const target = licenseList.find((l: BusinessLicenseItem) => Number(l.id) === Number(openEntityId));
    if (target) { autoOpenedRef.current = true; handleViewPress(target); }
  }, [openEntityId, get_business_licenses_status]);

  const renderLicenseCard = ({ item }: { item: BusinessLicenseItem }): React.ReactElement => (
    <TouchableOpacity onPress={() => handleViewPress(item)} style={styles.licenseCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.licenseName}>{item.vendorProvider}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'BusinessLicense', entityId: item.id, title: t('edit_history.title') })}
          >
            <MaterialIcons name="history" size={26} color={themeColors.primary} />
          </TouchableOpacity>
          {shouldAllowShare && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShareLicense(item.id)}
            >
              <Image
                source={ICONS.SHARE_PRIMARY_ICON}
                style={[styles.actionIcon, { tintColor: themeColors.primary }]}
              />
            </TouchableOpacity>
          )}
          {getItemWriteAccess(item) && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditLicense(item.id)}
            >
              <Image
                source={ICONS.EDIT_ICON}
                style={[styles.actionIcon, { tintColor: themeColors.primary }]}
              />
            </TouchableOpacity>
          )}
          {shouldAllowShare && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteLicense(item.id)}
              disabled={isDeleting}
              activeOpacity={isDeleting ? 0.5 : 1}
            >
              <Image
                source={ICONS.DELETE_ICON}
                style={[styles.actionIcon, { tintColor: themeColors.primary }]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSoftwareLicense(item.licenseKind) ? (
<>
      <View style={[styles.planBadge]}>
        <Text style={styles.planText} numberOfLines={1} ellipsizeMode="tail">{item.product}</Text>
        <View style={[styles.renewalDateBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : themeColors.lightCGreen }]}>
          <Text style={styles.renewalDateText}>{formatDate(item.renewalDate)}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('business.licenses.seats')}</Text>
          <Text style={styles.detailValue}>{item.seats}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>
            {t('business.licenses.renewal')}
          </Text>
          <Text style={styles.detailValue}>{item.autoRenew ? t('common.yes') : t('common.no')}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('business.licenses.cost')}</Text>
          <Text style={styles.detailValue}>${item.cost} / {item.period}</Text>
        </View>
      </View>

</>
) : (
<>
      <View style={[styles.planBadge]}>
        <Text style={styles.planText} numberOfLines={1} ellipsizeMode="tail">
          {item.state ? `${item.product} (${item.state})` : item.product}
        </Text>
        <View style={[styles.renewalDateBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : themeColors.lightCGreen }]}>
          <Text style={styles.renewalDateText}>{t(`license_permits.kinds.${item.licenseKind}`, { defaultValue: item.licenseKind })}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('license_permits.permit.licenseNumber')}</Text>
          <Text style={styles.detailValue}>{item.licenseNumber || '—'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('license_permits.permit.expirationDate')}</Text>
          <Text style={[styles.detailValue, item.renewalDate && new Date(item.renewalDate) < new Date() ? { color: '#C0392B' } : null]}>
            {item.renewalDate ? formatDate(item.renewalDate) : '—'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('license_permits.permit.status')}</Text>
          <Text style={styles.detailValue}>{item.status ? t(`license_permits.statuses.${item.status}`, { defaultValue: item.status }) : '—'}</Text>
        </View>
      </View>

</>
)}

      <View style={styles.notesSection}>
        <Text style={styles.notesLabel}>{t('business.licenses.notes')}: </Text>
        <Text style={styles.notesText}>{item.notes}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="error-outline" size={60} color={colors.gray} />
      </View>
      <Text style={styles.emptyStateTitle}>
        {isFromEmergencyAccess
          ? t('emergency_access_tab.no_data_emergency')
          : t('business.licenses.empty_state_title')}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {writeAccess && t('business.licenses.empty_state_subtitle')}
      </Text>
    </View>
  );

  const renderLoadingState = (): React.ReactElement => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );



  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <AuthHeader
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainerStyle}
          backButtonIconStyle={{ tintColor: themeColors.background }}
          backButtonStyle={{ marginBottom: 0 }}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
        >
          <View style={styles.iconContainer}>
            <Image source={ICONS.IDENTITY_HUB_ICON} style={styles.headerIcon} />
            <Text style={styles.title}>{t('business.licenses.title')}</Text>
          </View>

          <View style={styles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('business.licenses.add_license')}
                onPress={() => checkSubscription(() => navigation.navigate('AddLicense' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), 'business')}
                buttonStyle={styles.addButton}
                textStyle={styles.addButtonText}
              />
            )}
            {shouldAllowShare && licenses.length > 0 && (
              <PrimaryButton
               icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                title={t('business.licenses.share')}
                onPress={() => handleShare()}
                buttonStyle={[styles.shareButton, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.3) : themeColors.lightCGreen }]}
                textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
              />
            )}
          </View>

          {isLoading ? (
            renderLoadingState()
          ) : licenses.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={licenses}
              renderItem={renderLicenseCard}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.licensesList}
              style={styles.fullWidth}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('business.licenses.share_licenses')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
      />

      <ViewDetailModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setViewModalData(null);
        }}
        data={viewModalData}
      />

      {/* Delete Loading Overlay */}
      <Modal
        visible={isDeleting}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.deleteLoadingOverlay}>
          <View style={styles.deleteLoadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={[styles.deleteLoadingText, { color: themeColors.primary }]}>
              {t('common.loading') || 'Deleting...'}
            </Text>
          </View>
        </View>
      </Modal>

      {GateModal}
    </LinearGradient>
  );
};

export default Licenses;
