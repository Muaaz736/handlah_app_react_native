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
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { ComplianceVaultNavigationProp, Folder, ShareData } from './ComplianceVault.types';
import {
  AuthHeader,
  PrimaryButton,
  AddFolderModal,
  ShareModal,
} from '../../../../../components/common';
import colors from '../../../../../utils/colors';
import { ICONS, IMAGES } from '../../../../../utils/Images';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../utils/helpers';
import { makeComplianceVaultStyles } from './ComplianceVault.styles';
import {
  getComplianceFoldersAsync,
  addComplianceFolderAsync,
  updateComplianceFolderAsync,
  deleteComplianceFolderAsync,
  getComplianceRecordByIdAsync,
} from '../../../../../redux/services/businessLicensesService';
import {
  resetAddComplianceFolderStatus,
  resetUpdateComplianceFolderStatus,
  resetDeleteComplianceFolderStatus,
} from '../../../../../redux/slices/businessLicensesSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { ComplianceFolderFormData } from '../../../../../types/common.types';
import { ComplianceFolderItem, ComplianceFolderPayload } from '../../../../../types/reduxTypes/businessLicensesSlice.types';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { LinkedRecordsButton } from '../../../../../components/recordLinks/LinkedRecordsButton';

const ComplianceVault: React.FC = () => {
  const navigation = useNavigation<ComplianceVaultNavigationProp>();
  const { t, i18n } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeComplianceVaultStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openRecordIdForView, openRecordIdForEdit } = route.params || {};
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

  const isRTL: boolean = i18n.language === 'ar';

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [folderModalVisible, setFolderModalVisible] = useState<boolean>(false);
  const [editingFolder, setEditingFolder] = useState<ComplianceFolderItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'compliancefolder' });

  // Redux state
  const {
    get_compliance_folders_status,
    get_compliance_folders_data,
    add_compliance_folder_status,
    update_compliance_folder_status,
    delete_compliance_folder_status,
    get_compliance_record_status,
    get_compliance_record_data,
  } = useSelector((state: any) => state.business_licenses_slice);
  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector(
    (state: any) => state.connection_slice,
  );

  const isLoading =
    add_compliance_folder_status === ASYNC_STATUS.LOADING ||
    update_compliance_folder_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isFromEmergencyAccess ? emergencyConnectionBusinessId : selectedBusinessId;

  const folders = get_compliance_folders_data || [];

  const fetchFolders = useCallback(() => {
    const connectionParams = getConnectionTabQueryParams();

    // In business mode with no business selected, skip fetch to avoid showing personal data
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


    dispatch(getComplianceFoldersAsync(params as any));
  }, [
    selectedBusinessId,
    dispatch,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
  ]);

  // Fetch folders on component focus
  useFocusEffect(
    React.useCallback(() => {
      fetchFolders();
    }, [fetchFolders])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFolders();
  };

  // Stop refreshing when fetch completes
  useEffect(() => {
    if (
      get_compliance_folders_status === ASYNC_STATUS.SUCCEEDED ||
      get_compliance_folders_status === ASYNC_STATUS.ERROR
    ) {
      setRefreshing(false);
    }
  }, [get_compliance_folders_status]);

  const autoFetchRecordRef = useRef<number | null>(null);
  useEffect(() => {
    const targetId = openRecordIdForView ?? openRecordIdForEdit;
    if (!targetId) return;
    if (autoFetchRecordRef.current === Number(targetId)) return;
    autoFetchRecordRef.current = Number(targetId);
    dispatch(getComplianceRecordByIdAsync(Number(targetId)) as any);
  }, [openRecordIdForView, openRecordIdForEdit, dispatch]);

  const autoOpenFolderRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openRecordIdForView) return;
    if (autoOpenFolderRef.current === Number(openRecordIdForView)) return;
    if (get_compliance_record_status !== ASYNC_STATUS.SUCCEEDED) return;
    if (Number(get_compliance_record_data?.id) !== Number(openRecordIdForView)) return;
    if (!get_compliance_record_data?.complianceFolderId) return;
    autoOpenFolderRef.current = Number(openRecordIdForView);
    navigation.navigate('ComplianceDetail' as any, {
      folder: { id: get_compliance_record_data.complianceFolderId },
      openRecordIdForView,
      ...(isFromEmergencyAccess ? { from: 'emergency_access' } : {}),
      ...(connectionTabSource ? { connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } : {}),
    });
  }, [openRecordIdForView, get_compliance_record_status, get_compliance_record_data]);

  // Deep-link support: an insight pointing at a specific record (e.g. "Add
  // File") skips straight to that record's edit form, once its folder id
  // is known from the fetch above.
  const autoOpenEditRef = useRef<number | null>(null);
  useEffect(() => {
    if (!openRecordIdForEdit) return;
    if (autoOpenEditRef.current === Number(openRecordIdForEdit)) return;
    if (get_compliance_record_status !== ASYNC_STATUS.SUCCEEDED) return;
    if (Number(get_compliance_record_data?.id) !== Number(openRecordIdForEdit)) return;
    if (!get_compliance_record_data?.complianceFolderId) return;
    autoOpenEditRef.current = Number(openRecordIdForEdit);
    checkSubscription(() => navigation.navigate('AddComplianceRecord' as any, {
      recordId: Number(openRecordIdForEdit),
      folderId: get_compliance_record_data.complianceFolderId,
      businessId: currentBusinessId,
      ...(isFromEmergencyAccess ? { from: 'emergency_access' } : {}),
      ...(connectionTabSource ? { connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } : {}),
    }), 'business');
  }, [openRecordIdForEdit, get_compliance_record_status, get_compliance_record_data, currentBusinessId]);

  // Handle successful add/update
  useEffect(() => {
    if (add_compliance_folder_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetAddComplianceFolderStatus());
      setFolderModalVisible(false);
      setEditingFolder(null);
      fetchFolders();
    }
    if (update_compliance_folder_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetUpdateComplianceFolderStatus());
      setFolderModalVisible(false);
      setEditingFolder(null);
      fetchFolders();
    }
  }, [add_compliance_folder_status, update_compliance_folder_status, dispatch, fetchFolders]);

  // Handle successful delete
  useEffect(() => {
    if (delete_compliance_folder_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetDeleteComplianceFolderStatus());
      setDeleteLoading(false);
    }
  }, [delete_compliance_folder_status, dispatch]);

  const handleAddFolder = (): void => {
    if (!writeAccess) {
      return;
    }
    checkSubscription(() => {
      setEditingFolder(null);
      setFolderModalVisible(true);
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

  const handleSaveFolder = (formData: ComplianceFolderFormData): void => {
    if (!selectedBusinessId) {
      console.error('Business ID is not available');
      return;
    }

    const payload: ComplianceFolderPayload = {
      businessId: selectedBusinessId,
      folderName: formData.folderName,
      ...(accessLevel ? { ownerUserId: currentConnectionUserId } : {}),
    };

    if (editingFolder) {

      dispatch(
        updateComplianceFolderAsync({ id: editingFolder.id, payload }) as any
      );
    } else {
      // Add new folder
      dispatch(addComplianceFolderAsync(payload) as any);
    }
  };

  const handleEditFolder = (folder: ComplianceFolderItem): void => {
    if (!getItemWriteAccess(folder)) {
      return;
    }

    checkSubscription(() => {
      setEditingFolder(folder);
      setFolderModalVisible(true);
    }, 'business');
  };

  const handleDeleteFolder = (folder: ComplianceFolderItem): void => {
    if (!getItemWriteAccess(folder)) {
      return;
    }

    Alert.alert(
      t('common.confirm_delete'),
      t('business.compliance.delete_folder_message'),
      [
        {
          text: t('common.cancel'),
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          onPress: () => {
            setDeleteLoading(true);
            dispatch(deleteComplianceFolderAsync(folder.id) as any);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleShareFolder = (id: number): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'compliancefolder', resourceId: id });
      setShareModalVisible(true);
    }, 'business');
  };

  const handleShareModule = (): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'compliancefolder' });
      setShareModalVisible(true);
    }, 'business');
  };

  const handleFolderPress = (folder: ComplianceFolderItem): void => {
    navigation.navigate('ComplianceDetail' as any, {
      folder,
      ...(isFromEmergencyAccess ? { from: 'emergency_access' } : {}),
      ...(connectionTabSource ? { connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } : {}),
    });
  };

  const renderFolderCard = ({ item }: { item: ComplianceFolderItem }): React.ReactElement => (
    <TouchableOpacity
      style={styles.folderCard}
      onPress={() => handleFolderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.folderContent}>
        <Image
          source={ICONS.FOLDER_ICON}
          style={styles.folder_icon}
        />
        <View style={styles.folderInfo}>
          <Text style={styles.folderName}>{item.folderName}</Text>

          <MaterialIcons
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={24}
            color={themeColors.textPrimary}
            style={styles.chevronIcon}
          />
        </View>
      </View>

      <View style={styles.folderActions}>
        <LinkedRecordsButton
          record={{ moduleKey: 'compliancefolder', id: Number(item.id) }}
          title={(item as any).name || (item as any).foldername}
          canEdit={shouldAllowShare}
          iconColor={themeColors.primary}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'ComplianceFolder', entityId: item.id, title: t('edit_history.title') })}
        >
          <MaterialIcons name="history" size={26} color={themeColors.primary} />
        </TouchableOpacity>
        {shouldAllowShare && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShareFolder(item.id)}
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
            onPress={() => handleEditFolder(item)}
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
            onPress={() => handleDeleteFolder(item)}
          >
            <Image
              source={ICONS.DELETE_ICON}
              style={[styles.actionIcon, { tintColor: themeColors.primary }]}
            />
          </TouchableOpacity>
        )}
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
          : t('business.compliance.empty_state_title')}
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
          containerStyle={[styles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
          backButtonIconStyle={{ tintColor: colors.white }}
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
            <Image
              source={ICONS.COMPLIANCE_VAULT_ICON}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>{t('business.compliance.title')}</Text>
          </View>

          <View style={styles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('business.compliance.add_folder')}
                onPress={handleAddFolder}
                buttonStyle={styles.addButton}
                textStyle={styles.addButtonText}
              />
            )}
            {shouldAllowShare && folders.length > 0 && (
              <PrimaryButton
                icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                title={t('common.share')}
                onPress={handleShareModule}
                buttonStyle={[styles.addButton, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.3) : themeColors.lightCGreen }]}
                textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
              />
            )}
          </View>

          {folders.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={folders}
              renderItem={renderFolderCard}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.foldersList}
              style={styles.fullWidthFlex}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <AddFolderModal
        visible={folderModalVisible}
        onClose={() => {
          setFolderModalVisible(false);
          setEditingFolder(null);
        }}
        onSave={handleSaveFolder}
        editFolder={editingFolder || undefined}
        isLoading={isLoading}
      />

      {/* Delete Loading Overlay */}
      <Modal visible={deleteLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </Modal>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('business.business_contacts.share')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default ComplianceVault;
