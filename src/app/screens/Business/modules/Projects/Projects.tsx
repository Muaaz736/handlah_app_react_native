import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthHeader,
  DeleteConfirmModal,
  PrimaryButton,
  ShareModal,
  ViewDetailModal
} from '../../../../../components/common';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { deleteBusinessProjectAsync, getBusinessProjectsAsync } from '../../../../../redux/services/businessProjectsService';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetDeleteBusinessProjectStatus } from '../../../../../redux/slices/businessProjectsSlice';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { BusinessProjectItem } from '../../../../../types/reduxTypes/businessProjectsSlice.types';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { AppDispatch } from '../../../../../types/store.types';
import type { DetailModalData } from '../../../../../types/viewDetailModal.types';
import { getEntityWriteAccess, getModuleWriteAccess } from '../../../../../utils/accessLevel';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { isIOS } from '../../../../../utils/helpers';
import { ICONS } from '../../../../../utils/Images';
import { darkenColor } from '../../../../../utils/roleManager';
import { makeProjectsStyles } from './Projects.styles';
import { ProjectsNavigationProp, ShareData } from './Projects.types';
import Fontisto from 'react-native-vector-icons/Fontisto'

const Projects: React.FC = () => {
  const navigation = useNavigation<ProjectsNavigationProp>();
  const { t, i18n } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeProjectsStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBusinessId } = useSelectedBusiness();
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openEntityIdForEdit } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
  const isFromConnectionDetail = Boolean(connectionTabSource);
  const isFromSharedWithYou = connectionTabSource === 'shared_with_you';
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
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<BusinessProjectItem | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'businessproject' });
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [viewModalData, setViewModalData] = useState<DetailModalData | null>(null);

  const businessProjectsState = useSelector((state: any) => state.business_projects_slice);
  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);
  const businessContactsState = useSelector((state: any) => state.business_contacts_slice);
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isFromEmergencyAccess ? emergencyConnectionBusinessId : selectedBusinessId;

  const { projectsData, projectsStatus, deleteStatus } = useMemo(
    () => ({
      projectsData: businessProjectsState?.get_business_projects_data || [],
      projectsStatus: businessProjectsState?.get_business_projects_status,
      deleteStatus: businessProjectsState?.delete_business_project_status,
    }),
    [businessProjectsState]
  );

  useFocusEffect(
    useCallback(() => {
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

      dispatch(getBusinessProjectsAsync(params as any));
    }, [selectedBusinessId, dispatch, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId, selectedSharedBusiness])
  );

  useEffect(() => {
    if (deleteStatus === ASYNC_STATUS.SUCCEEDED) {
      setDeleteModalVisible(false);
      setSelectedProject(null);
      dispatch(resetDeleteBusinessProjectStatus());
    }
  }, [deleteStatus, dispatch]);

  const onRefresh = useCallback(async () => {
    const connectionParams = getConnectionTabQueryParams();

    if (!selectedBusinessId && !isFromEmergencyAccess && Object.keys(connectionParams).length === 0) {
      return;
    }

    setRefreshing(true);
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

    await dispatch(getBusinessProjectsAsync(params as any));
    setRefreshing(false);
  }, [selectedBusinessId, dispatch, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId]);

  useEffect(() => {
    if (projectsStatus !== ASYNC_STATUS.LOADING) {
      setRefreshing(false);
    }
  }, [projectsStatus]);

  const handleShare = (resourceId?: number): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'businessproject', resourceId });
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

  const handleDeleteProject = (project: BusinessProjectItem): void => {
    setSelectedProject(project);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedProject?.id) {
      await dispatch(deleteBusinessProjectAsync(selectedProject.id));
    }
  };

  const handleEditProject = (project: BusinessProjectItem): void => {
    checkSubscription(() => navigation.navigate('AddProject' as any, {
      project,
      isEdit: true,
      ...(isFromSharedWithYou ? { isFromSharedWithYou: true } : {}),
    }), 'business');
  };

  const handleShareProject = (id: string): void => {
    handleShare(Number(id));
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 1: return t('business.add_project.status_planning');
      case 2: return t('business.add_project.status_in_progress');
      case 3: return t('business.add_project.status_on_hold');
      case 4: return t('business.add_project.status_completed');
      case 5: return t('business.add_project.status_cancelled');
      default: return 'Unknown';
    }
  };

  const getClientNames = (item: BusinessProjectItem): string => {
    if (item.clients && item.clients.length > 0) {
      return item.clients.map(c => c.name).join(', ');
    }
    if (item.clientIds && item.clientIds.length > 0) {
      const contacts = businessContactsState?.get_business_contacts_data || [];
      return item.clientIds.map((id: number) => {
        const contact = contacts.find((c: any) => c.id === id);
        return contact?.fullName || `#${id}`;
      }).join(', ');
    }
    return t('common.na') || 'N/A';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
  };

  const handleViewPress = (item: BusinessProjectItem): void => {
    const data: DetailModalData = {
      linkRecord: item?.id ? { moduleKey: 'businessproject', id: Number(item.id) } : null,
      title: item.projectName || t('business.projects.project'),
      badge: getStatusLabel(item.projectStatus),
      rows: [
        {
          left: { label: t('business.add_project.contact') || 'Contact', value: getClientNames(item) },
          right: { label: t('business.projects.amount') || 'Budget', value: `$${item.amount?.toFixed(2) || '0.00'}` },
        },
        {
          left: { label: t('business.projects.start_date') || 'Start Date', value: formatDate(item.startDate) },
          right: { label: t('business.projects.end_date') || 'End Date', value: formatDate(item.endDate) },
        },
      ],
      sections: [
        ...(item.description ? [{
          title: t('business.add_project.description') || 'Description',
          content: item.description,
        }] : []),
        ...(item.additionalDetails ? [{
          title: t('business.add_project.additional_details') || 'Additional Details',
          content: item.additionalDetails,
        }] : []),
        ...(item.notes ? [{
          title: t('business.projects.notes') || 'Notes',
          content: item.notes,
        }] : []),
      ],
      documentName: `${item.projectName || 'Project'}_attachment`,
      imageIds: Array.isArray(item.attachmentUrls)
        ? item.attachmentUrls
        : item.attachmentUrls
          ? [item.attachmentUrls as string]
          : [],
    };
    setViewModalData(data);
    setViewModalVisible(true);
  };

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (projectsStatus !== ASYNC_STATUS.SUCCEEDED) return;
    const target = (projectsData as BusinessProjectItem[]).find((p) => Number(p.id) === Number(openEntityId));
    if (target) { autoOpenedRef.current = true; handleViewPress(target); }
  }, [openEntityId, projectsStatus]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (projectsStatus !== ASYNC_STATUS.SUCCEEDED) return;
    const target = (projectsData as BusinessProjectItem[]).find((p) => Number(p.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditProject(target);
    }
  }, [openEntityIdForEdit, projectsStatus]);

  const renderProjectCard = ({
    item,
  }: {
    item: BusinessProjectItem;
  }): React.ReactElement => (
    <TouchableOpacity style={styles.projectCard} onPress={() => handleViewPress(item)} activeOpacity={0.7}>
      <View style={styles.projectHeader}>
        <View style={styles.projectContentWrapper}>
          <View style={styles.projectTitleRow}>
            <View style={styles.projectTitleContent}>
              <Text style={styles.projectName}
              >{item.projectName}</Text>
            </View>

            <View style={styles.projectActions}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getColorWithOpacity(
                      themeColors.primary,
                      0.2,
                    ),
                  },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: themeColors.primary }]}
                >
                  {getStatusLabel(item.projectStatus)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'BusinessProject', entityId: item.id, title: t('edit_history.title') })}
              >
                <MaterialIcons name="history" size={22} color={themeColors.primary} />
              </TouchableOpacity>
              {shouldAllowShare && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShareProject(item.id.toString())}
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
                    onPress={() => handleEditProject(item)}
                  >
                    <Image
                      source={ICONS.EDIT_PENCIL_ICON}
                      style={[
                        styles.actionIcon,
                        { tintColor: themeColors.primary },
                      ]}
                    />
                  </TouchableOpacity>

                  {!isFromSharedWithYou && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteProject(item)}
                    >
                      <Image
                        source={ICONS.DELETE_ICON}
                        style={[
                          styles.actionIcon,
                          { tintColor: themeColors.primary },
                        ]}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>

          <View style={styles.clientDetailsRow}>
            <View style={styles.clientDetailsColumn}>
              <Text style={styles.clientText}>
                {t('business.add_project.project_name')}
              </Text>
              <Text style={styles.clientName} numberOfLines={1} ellipsizeMode="tail">
                {item.projectName}
              </Text>
            </View>
            <View style={styles.clientDetailsColumn}>
              <Text style={styles.clientText}>
                {t('business.add_project.contact')}
              </Text>
              <Text style={styles.clientName} numberOfLines={1} ellipsizeMode="tail">
                {getClientNames(item)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.clientText}>
        {t('business.add_project.description')}
      </Text>
      <Text style={styles.clientName}>{item.description || 'N/A'}</Text>
      <View>
        <Text style={styles.timelineLabel}>
          {t('business.projects.timeline')}
        </Text>
        <View style={styles.timelineRow}>
          {item.startDate && (
            <View style={styles.timelineItem}>
              <Text style={styles.timelineValue}>
                {t('business.projects.start_date')}
              </Text>
              <Text style={styles.timelineValue}>{formatDate(item.startDate)}</Text>
            </View>
          )}
          {item.endDate && (
            <View style={styles.timelineItem}>
              <Text style={styles.timelineValue}>
                {t('business.projects.end_date')}
              </Text>
              <Text style={styles.timelineValue}>{formatDate(item.endDate)}</Text>
            </View>
          )}
          <View style={[styles.budgetBadge]}>
            <Text style={styles.clientText}>
              {t('business.projects.amount')}
            </Text>
            <Text
              style={[
                styles.budgetValue,
                {
                  backgroundColor: getColorWithOpacity(
                    themeColors.primary,
                    0.5,
                  ),
                },
              ]}
            >
              ${item.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.clientText}>{t('business.projects.notes')}</Text>
      <Text style={styles.clientName}>{item.notes || 'N/A'}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconCircle}>
        <AntDesign name="exclamation" size={32} color={colors.gray} />
      </View>
      {!isFromEmergencyAccess ? (

        <Text style={styles.emptyStateTitle}>
          {t('business.projects.empty_state_title')}
        </Text>
      ) : (
        <Text style={styles.emptyStateTitle}>
          {t('business.projects.empty_state_emergency')}
        </Text>
      )}
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
              onRefresh={onRefresh}
              tintColor={colors.white}
              colors={[themeColors.primary]}
            />
          }
        >
          <View style={styles.iconContainer}>
            <Image
              source={ICONS.PROJECTS_ICON}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>{t('business.projects.title')}</Text>
          </View>

          {((writeAccess && !isFromConnectionDetail) || shouldAllowShare) && (
            <View style={styles.buttonsRow}>
              {writeAccess && !isFromConnectionDetail && (
                <PrimaryButton
                  icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                  title={t('business.projects.add_project')}
                  onPress={() => checkSubscription(() => navigation.navigate('AddProject' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), 'business')}
                  buttonStyle={styles.addButton}
                  textStyle={styles.addButtonText}
                />
              )}
              {projectsData.length > 0 && shouldAllowShare && (
                <PrimaryButton
                 icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                  title={t('business.projects.share')}
                  onPress={() => handleShare()}
                  buttonStyle={[styles.shareButton, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.3) : themeColors.lightCGreen }]}
                  textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
                />
              )}
            </View>
          )}

          {/* Loading State */}
          {projectsStatus === ASYNC_STATUS.LOADING && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}

          {projectsStatus !== ASYNC_STATUS.LOADING && (
            projectsData.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={projectsData}
                renderItem={renderProjectCard}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.projectsList}
                style={styles.fullWidth}
              />
            )
          )}
        </ScrollView>
      </SafeAreaView>

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('business.projects.share')}
        loading={sharingLoading}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        title={t('business.projects.delete_project')}
        message={`${t('modals.delete_confirm')} ${selectedProject?.projectName || 'this project'
          }?`}
        isLoading={deleteStatus === ASYNC_STATUS.LOADING}
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

export default Projects;
