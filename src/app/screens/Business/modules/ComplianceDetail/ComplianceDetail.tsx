import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  ComplianceDetailNavigationProp,
  ShareData,
} from './ComplianceDetail.types';
import {
  AuthHeader,
  CustomInput,
  MixedMediaDisplayer,
  PrimaryButton,
  ShareModal,
  ViewDetailModal,
} from '../../../../../components/common';
import RemoteImage from '../../../../../components/common/RemoteImage';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { isIOS } from '../../../../../utils/helpers';
import { makeComplianceDetailStyles } from './ComplianceDetail.styles';
import { ASYNC_STATUS } from '../../../../../config/constants';
import {
  getComplianceFolderByIdAsync,
  deleteComplianceRecordAsync,
} from '../../../../../redux/services/businessLicensesService';
import { resetDeleteComplianceRecordStatus } from '../../../../../redux/slices/businessLicensesSlice';
import {
  ComplianceFolderItem,
  ComplianceRecordItem,
} from '../../../../../types/reduxTypes/businessLicensesSlice.types';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import {
  getModuleWriteAccess,
  getEntityWriteAccess,
} from '../../../../../utils/accessLevel';
import { getComplianceTypeOptionsAsync } from '../../../../../redux/services/authService';
import type { DetailModalData } from '../../../../../types/viewDetailModal.types';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto'

const ComplianceDetail: React.FC = () => {
  const navigation = useNavigation<ComplianceDetailNavigationProp>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeComplianceDetailStyles(themeColors as RoleTheme), [themeColors]);
  const { selectedBusinessId } = useSelectedBusiness();
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    folder,
    from,
    connectionTabSource,
    sharedWithUserId,
    ownerId,
    accessLevel,
    accessType,
    openRecordIdForView,
  } = (route.params || {}) as {
    folder?: ComplianceFolderItem;
    from?: string;
    connectionTabSource?: string;
    sharedWithUserId?: number;
    ownerId?: number;
    accessLevel?: string;
    accessType?: string;
    openRecordIdForView?: number | string;
  };
  const isFromEmergencyAccess = from === 'emergency_access';
  const writeAccess = getModuleWriteAccess({
    isFromEmergencyAccess,
    accessType,
    accessLevel,
  });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({
      isFromEmergencyAccess,
      accessType,
      moduleWriteAccess: writeAccess,
      entity: item,
    });
  // For entity-level sharing, allow adding records if the folder itself has write access
  const folderWriteAccess = writeAccess || getItemWriteAccess(folder || {});
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
  const [searchText, setSearchText] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'compliancerecord' });
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [viewModalData, setViewModalData] = useState<DetailModalData | null>(
    null,
  );

  const {
    get_compliance_folder_data,
    get_compliance_folder_status,
    delete_compliance_record_status,
  } = useSelector((state: any) => state.business_licenses_slice);
  const { share_sync_status, selectedSharedBusiness } = useSelector(
    (state: any) => state.sharing_slice,
  );

  const { currentConnectionUserId, emergencyConnectionBusinessId } =
    useSelector((state: any) => state.connection_slice);
  const { get_compliance_type_options_data } =
    useSelector((state: any) => state.user_auth);
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isFromEmergencyAccess
    ? emergencyConnectionBusinessId
    : selectedBusinessId;

  const records: ComplianceRecordItem[] =
    get_compliance_folder_data?.complianceRecords || [];

  const filteredRecords = searchText.trim()
    ? records.filter(
      r =>
        r.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        getTypeName(r.type).toLowerCase().includes(searchText.toLowerCase()),
    )
    : records;

  // Fetch dropdown options for ComplianceType and ComplianceStatus
  useFocusEffect(
    useCallback(() => {
      dispatch(getComplianceTypeOptionsAsync() as any);
    }, [dispatch]),
  );

  const fetchRecords = useCallback(() => {
    if (!folder?.id) {
      return;
    }

    const arg: any = { id: folder.id, ...getConnectionTabQueryParams() };

    if (selectedBusinessId && !isFromEmergencyAccess) {
      arg.businessId =
        connectionTabSource === 'shared_with_you'
          ? selectedSharedBusiness?.id
          : selectedBusinessId;
    }

    if (isFromEmergencyAccess && emergencyConnectionBusinessId && currentConnectionUserId) {
      arg.businessId = emergencyConnectionBusinessId;
      arg.userId = currentConnectionUserId;
    }

    dispatch(getComplianceFolderByIdAsync(arg as any));
  }, [
    folder?.id,
    selectedBusinessId,
    isFromEmergencyAccess,
    connectionTabSource,
    selectedSharedBusiness,
    emergencyConnectionBusinessId,
    currentConnectionUserId,
    dispatch,
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  // Stop refreshing spinner when fetch completes
  useEffect(() => {
    if (
      get_compliance_folder_status === ASYNC_STATUS.SUCCEEDED ||
      get_compliance_folder_status === ASYNC_STATUS.ERROR
    ) {
      setRefreshing(false);
    }
  }, [get_compliance_folder_status]);

  // Fetch records when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      fetchRecords();
    }, [fetchRecords]),
  );

  // Handle delete success
  useEffect(() => {
    if (delete_compliance_record_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetDeleteComplianceRecordStatus());
      setDeleteLoading(false);
      fetchRecords();
    }
    if (delete_compliance_record_status === ASYNC_STATUS.ERROR) {
      setDeleteLoading(false);
    }
  }, [delete_compliance_record_status, dispatch]);

  function getTypeName(type: number): string {
    const match = get_compliance_type_options_data?.find(
      (option: any) => String(option.value) === String(type),
    );
    return match?.label || '-';
  }

  function getStatusName(status: number): string {
    const statusMap: Record<number, string> = {
      1: t('business.add_compliance_record.status_valid'),
      2: t('business.add_compliance_record.status_due'),
      3: t('business.add_compliance_record.status_expired'),
      4: t('business.add_compliance_record.status_pending'),
      5: t('business.add_compliance_record.status_under_review'),
      6: t('business.add_compliance_record.status_rejected'),
      7: t('business.add_compliance_record.status_cancelled'),
    };
    return statusMap[status] || String(status);
  }

  function getStatusColor(status: number): string {
    if (status === 1) return '#22c55e'; // Valid - green
    if (status === 3 || status === 6 || status === 7) return '#ef4444'; // Expired/Rejected/Cancelled - red
    if (status === 2) return '#f97316'; // Due - orange
    return themeColors.primary; // others
  }

  const handleShare = (
    resourceType: 'compliancefolder' | 'compliancerecord',
    resourceId?: number,
  ): void => {
    checkSubscription(() => {
      setShareContext({ resourceType, resourceId });
      setShareModalVisible(true);
    }, 'business');
  };

  const handleShareDocument = (shareData: ShareData): void => {
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
      setShareModalVisible(false);
    }
  }, [share_sync_status, dispatch]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.ERROR) {
      dispatch(resetShareSyncStatus());
    }
  }, [share_sync_status, dispatch]);

  const handleDeleteRecord = (item: ComplianceRecordItem): void => {
    if (!getItemWriteAccess(item)) {
      return;
    }
    Alert.alert(
      t('common.confirm_delete'),
      t('business.compliance_detail.delete_record_message'),
      [
        { text: t('common.cancel'), onPress: () => { }, style: 'cancel' },
        {
          text: t('common.delete'),
          onPress: () => {
            setDeleteLoading(true);
            dispatch(deleteComplianceRecordAsync(item.id) as any);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleEditRecord = (item: ComplianceRecordItem): void => {
    if (!getItemWriteAccess(item)) {
      return;
    }

    const editBusinessId = isFromEmergencyAccess
      ? emergencyConnectionBusinessId
      : connectionTabSource === 'shared_with_you'
        ? selectedSharedBusiness?.id
        : selectedBusinessId;

    checkSubscription(() => navigation.navigate('AddComplianceRecord' as any, {
      recordId: item.id,
      folderId: folder?.id,
      businessId: editBusinessId,
      ...(isFromEmergencyAccess ? { userId: currentConnectionUserId } : {}),
      ...getConnectionTabQueryParams(),
    }), 'business');
  };

  const handleAddRecord = (): void => {
    if (!folderWriteAccess) {
      return;
    }

    checkSubscription(() => navigation.navigate('AddComplianceRecord' as any, {
      folderId: folder?.id,
      businessId: selectedBusinessId,
      ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
    }), 'business');
  };

  const handleViewPress = (item: ComplianceRecordItem): void => {
    const data: DetailModalData = {
      linkRecord: (item as any)?.id ? { moduleKey: 'compliancedocument', id: Number((item as any).id) } : null,
      title: item.title,
      badge: getStatusName(item.status),
      rows: [
        {
          left: {
            label: t('business.compliance_detail.type_label') || 'Type',
            value: getTypeName(item.type),
          },
          right: {
            label:
              t('business.compliance_detail.due_expiration_label') ||
              'Due/Expiration',
            value: item.dueDate
              ? new Date(item.dueDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              : 'N/A',
          },
        },
      ],
      sections: [
        ...(item.notes
          ? [
            {
              title: t('common.notes') || 'Notes',
              content: item.notes,
            },
          ]
          : []),
      ],
      documentName: `${item.title}_document`,
      imageIds: Array.isArray(item.documentUrl)
        ? item.documentUrl
        : item.documentUrl
          ? [item.documentUrl as string]
          : [],
    };
    setViewModalData(data);
    setViewModalVisible(true);
  };

  const autoOpenRecordViewRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openRecordIdForView) return;
    if (autoOpenRecordViewRef.current === Number(openRecordIdForView)) return;
    if (get_compliance_folder_status !== ASYNC_STATUS.SUCCEEDED) return;
    const match = (get_compliance_folder_data?.complianceRecords || []).find(
      (r: ComplianceRecordItem) => Number(r.id) === Number(openRecordIdForView),
    );
    if (match) {
      autoOpenRecordViewRef.current = Number(openRecordIdForView);
      handleViewPress(match);
    }
  }, [openRecordIdForView, get_compliance_folder_status, get_compliance_folder_data]);

  const renderDocumentCard = ({
    item,
  }: {
    item: ComplianceRecordItem;
  }): React.ReactElement => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleViewPress(item)}
      activeOpacity={0.7}
    >
      {/* Header: title + status + actions */}
      <View style={styles.documentHeader}>
        <View style={styles.documentTitleRow}>
          <Text style={styles.documentTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: themeColors.lightCGreen,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: themeColors.primary }]}>
              {getStatusName(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              (navigation as any).navigate('EditHistoryList', {
                entityType: 'ComplianceRecord',
                entityId: item.id,
                title: t('edit_history.title'),
              })
            }
          >
            <MaterialIcons
              name="history"
              size={26}
              color={themeColors.primary}
            />
          </TouchableOpacity>
          {(getItemWriteAccess(item) || shouldAllowShare) && (
            <>
              {shouldAllowShare && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShare('compliancerecord', item.id)}
                >
                  <Image
                    source={ICONS.SHARE_PRIMARY_ICON}
                    style={[
                      styles.actionIcon,
                      { tintColor: themeColors.primary },
                    ]}
                  />
                </TouchableOpacity>
              )}
              {getItemWriteAccess(item) && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditRecord(item)}
                  >
                    <Image
                      source={ICONS.EDIT_ICON}
                      style={[
                        styles.actionIcon,
                        { tintColor: themeColors.primary },
                      ]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteRecord(item)}
                  >
                    <Image
                      source={ICONS.DELETE_ICON}
                      style={[
                        styles.actionIcon,
                        { tintColor: themeColors.primary },
                      ]}
                    />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>

      {/* Main content: info columns + image */}
      <View style={styles.cardContent}>
        <View style={styles.infoSide}>
          <View style={styles.infoRow}>
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>
                {t('business.compliance_detail.title_label')}
              </Text>
              <Text
                style={styles.infoValue}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
            </View>
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>
                {t('business.compliance_detail.type_label')}
              </Text>
              <Text style={styles.infoValue}>{getTypeName(item.type)}</Text>
            </View>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>
              {t('business.compliance_detail.due_expiration_label')}
            </Text>
            <Text style={styles.infoValue}>
              {item.dueDate
                ? new Date(item.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : '—'}
            </Text>
          </View>
        </View>

      </View>

      {/* Notes + Download */}
      <View style={styles.notesRow}>
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>
            {t('business.compliance_detail.notes_label')}
          </Text>
          <Text style={styles.infoValue} numberOfLines={3}>
            {item.notes || '—'}
          </Text>
        </View>
      </View>
      {(Array.isArray(item.documentUrl) ? item.documentUrl.length > 0 : !!item.documentUrl) && (
        <MixedMediaDisplayer showDocHeading={false} attachmentIds={Array.isArray(item.documentUrl) ? item.documentUrl : item.documentUrl ? [item.documentUrl as string] : []} />
      )}
    </TouchableOpacity>
  );

  const RenderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="folder-open" size={60} color={colors.black} />
      <Text style={styles.emptyStateTitle}>
        {t('business.compliance_detail.empty_state_title')}
      </Text>
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
          containerStyle={[
            styles.headerContainerStyle,
            { paddingTop: isIOS ? 0 : 20 },
          ]}
          backButtonIconStyle={{ tintColor: themeColors.background }}
          backButtonStyle={{ marginBottom: 0 }}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.white}
              colors={[colors.white]}
            />
          }
        >
          <View style={styles.iconContainer}>
            <Image source={ICONS.FOLDER_ICON} style={styles.headerFolderIcon} />
            <Text style={styles.title}>
              {folder?.folderName || t('business.sub_items.compliance')}
            </Text>
          </View>

          <View style={styles.buttonsRow}>
            {folderWriteAccess && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('business.compliance_detail.new_compliance_doc')}
                onPress={handleAddRecord}
                buttonStyle={styles.addButton}
                textStyle={styles.addButtonText}
              />
            )}
            {filteredRecords.length !== 0 && shouldAllowShare && (
              <PrimaryButton
               icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                title={t('business.compliance_detail.share')}
                onPress={() => handleShare('compliancefolder')}
                buttonStyle={[styles.shareButton, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.3) : themeColors.lightCGreen }]}
               textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
              />
            )}
          </View>

          <View style={styles.searchContainer}>
            <CustomInput
              icon={ICONS.SEARCH_ICON}
              startIconStyle={styles.searchStartIcon}
              placeholder={t('business.compliance_detail.search_placeholder')}
              value={searchText}
              onChangeText={setSearchText}
              inputContainerStyle={styles.searchInputContainer}
              containerStyle={styles.searchWrapper}
            />
          </View>

          {get_compliance_folder_status === ASYNC_STATUS.LOADING &&
            !refreshing ? (
            <View style={styles.initialLoadingContainer}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          ) : (
            <FlatList
              data={filteredRecords}
              renderItem={renderDocumentCard}
              ListEmptyComponent={<RenderEmptyState />}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.documentsList}
              style={styles.fullWidth}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Delete Loading Overlay */}
      <Modal visible={deleteLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </Modal>

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('business.compliance_detail.share')}
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
      {GateModal}
    </LinearGradient>
  );
};

export default ComplianceDetail;
