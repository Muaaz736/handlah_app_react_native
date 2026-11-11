import { Image, ScrollView, Text, View, TouchableOpacity, ActivityIndicator, } from 'react-native';
import React, { useState, useEffect, useRef, FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
  AuthHeader, DeleteConfirmModal, PrimaryButton, ShareModal, ViewSubscriptionModal, showErrorToast,
} from '../../../../../components/common';
import {
  useNavigation, useRoute, useFocusEffect,
} from '@react-navigation/native';
import { ICONS } from '../../../../../utils/Images';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import { makeCommonStyles, makeSocialMediaStyles } from './SocialMedia.styles';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { isIOS, extractApiError } from '../../../../../utils/helpers';
import { authenticateWithAlert, biometricKeysExist } from '../../../../../utils/biometricServices';
import { unlockResourceWithBiometric } from '../../../../../utils/biometricUnlock';
import {
  socialNetworkTypesAsync,
  userSocialNetworksAsync,
  deleteSocialNetworkSetupAsync,
} from '../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import {
  SocialMediaAccount,
  SelectedAccountView,
  SocialMediaNavigationProp,
} from './SocialMedia.types';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { SvgXml } from 'react-native-svg';
import { AppDispatch } from '../../../../../types/store.types';
import SharedWithMeSection, { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { getSocialNetworksSharedWithMeAsync } from '../../../../../redux/services/essentialsService';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';

const SocialMedia: FC = (): React.ReactElement => {
  const navigation = useNavigation<SocialMediaNavigationProp>();
  const { t, i18n } = useTranslation();
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeSocialMediaStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const isRTL = i18n.language === 'ar';
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openEntityIdForEdit } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
  const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });

  const getConnectionTabQueryParams = useCallback(() => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  }, [connectionTabSource, sharedWithUserId, ownerId]);

  // Get business role status once
  const isBusiness = isBusinessRole();
  const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;
  const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);
  const { share_sync_status } = useSelector((state: any) => state.sharing_slice);
  const { selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: string | number;
  }>({ resourceType: 'usersocialnetwork' });
  const [selectedAccount, setSelectedAccount] = useState<
    SocialMediaAccount | SelectedAccountView | null
  >(null);

  const {
    social_network_types_data,
    user_social_networks_data,
    user_social_networks_status,
  } = useSelector((state: any) => state.essentials_slice);

  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isBusiness ? selectedBusinessId : undefined;

  const fetchSocialMediaData = useCallback(() => {
    dispatch(socialNetworkTypesAsync());

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

    dispatch(
      userSocialNetworksAsync(
        Object.keys(params).length ? params : undefined
      )
    );
  }, [
    dispatch,
    getConnectionTabQueryParams,
    isBusiness,
    selectedBusinessId,
    selectedSharedBusiness,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
  ]);

  // Fetch network types and user social networks on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchSocialMediaData();
    }, [fetchSocialMediaData])
  );

  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const accounts: SocialMediaAccount[] = noBusinessInBusinessMode
    ? []
    : (user_social_networks_data?.usersocialnetworksetups || []) as SocialMediaAccount[];

  const openShareModal = (resourceId?: string | number): void => {
    checkSubscription(() => {
      setShareContext({
        resourceType: 'usersocialnetwork',
        resourceId,
      });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal')

  };

  const handleShareDocument = (shareData: any[]) => {
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

  const handleEditPress = (account: SocialMediaAccount): void => {
    if (!account || !account.id) return;

    checkSubscription(async () => {
      const navigateToEdit = (resolvedAccount: SocialMediaAccount) => {
        navigation.navigate('AddSocialMedia', {
          isEdit: true,
          accountId: resolvedAccount.id,
          account: {
            socialNetworkTypeId: resolvedAccount.socialnetworktypeid || '',
            accountName: resolvedAccount.accountname || '',
            socialNetworkUrl: resolvedAccount.url || '',
            username: resolvedAccount.username || '',
            password: resolvedAccount.password || '',
            startDate: resolvedAccount.startdate || '',
            endDate: resolvedAccount.enddate || '',
          },
        });
      };

      const hasBiometricDevice = await biometricKeysExist();
      if (!hasBiometricDevice) {
        await authenticateWithAlert({
          promptMessage:
            t('social_media.authenticateToEdit') ||
            'Authenticate to edit account details',
          cancelButtonText: t('common.cancel') || 'Cancel',
          failureTitle:
            t('social_media.authenticationFailed') || 'Authentication Failed',
          failureMessage:
            t('social_media.authenticationRequiredToEditAccount') ||
            'Authentication is required to edit account details',
          okButtonText: t('common.ok') || 'OK',
          allowDeviceCredentials: true,
          onSuccess: () => {
            navigateToEdit(account);
          },
        });
        return;
      }

      try {
        const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
        const unlockedData = await unlockResourceWithBiometric(
          'social-media',
          Number(account.id),
          ownerUserId,
        );
        navigateToEdit({ ...account, ...unlockedData });
      } catch (err: any) {
        const message = String(err?.message || '').toLowerCase();
        if (message.includes('cancel')) return;
        showErrorToast(extractApiError(err, 'Failed to unlock social media account.'));
      }
    }, isBusiness ? 'business' : 'personal');
  };

  const handleViewPress = async (account: SocialMediaAccount): Promise<void> => {
    if (!account) return;

    const openView = (resolvedAccount: SocialMediaAccount) => {
      const viewData: SelectedAccountView = {
        name: resolvedAccount.accountname || resolvedAccount.socialnetworktypename || '',
        username: resolvedAccount.username || '',
        password: resolvedAccount.password || '',
        url: resolvedAccount.url || '',
        socialAccountId: resolvedAccount.socialnetworktypeid || '',
        socialNetworkTypeName: resolvedAccount.socialnetworktypename || '',
        socialNetworkIcon: get_dropdown_options_data?.find((opt: any) => Number(opt.value) === Number(resolvedAccount.socialnetworktypeid))?.icon || null,
      };
      setSelectedAccount(viewData);
      setViewModalVisible(true);
    };

    const hasBiometricDevice = await biometricKeysExist();
    if (!hasBiometricDevice) {
      await authenticateWithAlert({
        promptMessage:
          t('social_media.authenticateToView') ||
          'Authenticate to view account details',
        cancelButtonText: t('common.cancel') || 'Cancel',
        failureTitle:
          t('social_media.authenticationFailed') || 'Authentication Failed',
        failureMessage:
          t('social_media.authenticationRequiredToViewAccount') ||
          'Authentication is required to view account details',
        okButtonText: t('common.ok') || 'OK',
        allowDeviceCredentials: true,
        onSuccess: () => {
          openView(account);
        },
      });
      return;
    }

    try {
      const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
      const unlockedData = await unlockResourceWithBiometric(
        'social-media',
        Number(account.id),
        ownerUserId,
      );
      openView({ ...account, ...unlockedData });
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) return;
      showErrorToast(extractApiError(err, 'Failed to unlock social media account.'));
    }
  };

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (user_social_networks_status !== ASYNC_STATUS.SUCCEEDED) return;
    const accounts: SocialMediaAccount[] = user_social_networks_data?.usersocialnetworksetups || [];
    const target = accounts.find((a: SocialMediaAccount) => Number(a.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      handleViewPress(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityId, user_social_networks_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (user_social_networks_status !== ASYNC_STATUS.SUCCEEDED) return;
    const accounts: SocialMediaAccount[] = user_social_networks_data?.usersocialnetworksetups || [];
    const target = accounts.find((a: SocialMediaAccount) => Number(a.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditPress(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityIdForEdit, user_social_networks_status]);

  const handleDeletePress = (account: SocialMediaAccount): void => {
    if (!account) return;
    setSelectedAccount(account);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedAccount?.id || isDeletePending) return;

    setIsDeletePending(true);

    try {
      await dispatch(
        deleteSocialNetworkSetupAsync(selectedAccount.id),
      ).unwrap();

      setDeleteModalVisible(false);
      setSelectedAccount(null);
      fetchSocialMediaData();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeletePending(false);
    }
  };

  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  const getSocialMediaIcon = useCallback((networkType?: string): string => {
    const iconMap: Record<string, string> = {
      facebook: 'facebook',
      instagram: 'instagram',
      x: 'twitter',
      twitter: 'twitter',
      linkedin: 'linkedin',
      youtube: 'youtube',
      snapchat: 'snapchat',
      pinterest: 'pinterest',
      whatsapp: 'whatsapp',
      reddit: 'reddit',
      github: 'github',
      discord: 'discord',
      telegram: 'telegram',
      web: 'web',
    };
    return iconMap[String(networkType || '').toLowerCase()] || 'web';
  }, []);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('SocialNetworkType'));
  }, [dispatch]));

  const renderSharedSocialMediaItem = useCallback((item: any, _owner: SharedWithMeOwner): React.ReactNode => {
    const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleViewPress(item as SocialMediaAccount)}
        style={styles.accountCard}
      >
        <View style={[styles.accountInfo, { flexDirection: 'row' }]}>
          <View style={[styles.platformIcon, { marginRight: 10 }]}>
            <MaterialCommunityIcons name="web" size={18} color={themeColors.textPrimary} />
          </View>
          <View style={styles.accountDetails}>
            <Text style={[styles.platformName, { textAlign: 'left' }]} numberOfLines={1} ellipsizeMode="tail">
              {item.accountname || item.socialnetworktypename}
            </Text>
            {
              item.username || item.url ?
                <Text style={[styles.username, { textAlign: 'left' }]} numberOfLines={1} ellipsizeMode="tail">
                  {item.username || item.url}
                </Text>
                : null
            }
          </View>
        </View>
        <View style={[styles.actionButtons, { flexDirection: 'row' }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              (navigation as any).navigate('EditHistoryList', {
                entityType: 'UserSocialNetworkSetup',
                entityId: item.id,
                title: t('edit_history.title'),
              })
            }
          >
            <MaterialIcons name="history" size={20} color={themeColors.secondary} />
          </TouchableOpacity>
          {canWrite && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEditPress(item as SocialMediaAccount)}
            >
              <Feather name="edit-2" size={20} color={themeColors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleViewPress, handleEditPress, themeColors, navigation, t]);

  const renderAccountCard = (account: SocialMediaAccount): React.ReactElement | null => {
    if (!account || !account.id) return null;

    const iconTodisplay = get_dropdown_options_data?.find((opt: any) => Number(opt.value) === Number(account.socialnetworktypeid))?.icon

    return (
      <TouchableOpacity
        key={account.id}
        onPress={() => handleViewPress(account)}
        style={styles.accountCard}
      >
        <View style={[styles.accountInfo, { flexDirection: 'row' }]}>
          <View
            style={[
              styles.platformIcon,
              { marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 },
            ]}
          >
            {iconTodisplay ? (
              <SvgXml xml={iconTodisplay} width={18} height={18} />
            ) : (
              <MaterialCommunityIcons
                name={getSocialMediaIcon('web')}
                size={18}
                color={themeColors.textPrimary}
              />
            )}
          </View>
          <View style={styles.accountDetails}>
            <Text style={[styles.platformName, { textAlign: 'left' }]} numberOfLines={1} ellipsizeMode="tail">
              {account.accountname || account.socialnetworktypename}
            </Text>
            {account.socialnetworktypename || account.url ?
              <Text style={[styles.username, { textAlign: 'left', textTransform: 'uppercase' }]} numberOfLines={1} ellipsizeMode="tail">
                {account.socialnetworktypename || account.url}
              </Text>
              : null
            }
          </View>
        </View>
        <View style={[styles.actionButtons, { flexDirection: 'row' }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              (navigation as any).navigate('EditHistoryList', {
                entityType: 'UserSocialNetworkSetup',
                entityId: account.id,
                title: t('edit_history.title'),
              })
            }
          >
            <MaterialIcons name="history" size={20} color={themeColors.secondary} />
          </TouchableOpacity>

          {shouldAllowShare && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => openShareModal(account.id)}
            >
              <Image
                source={ICONS.SHARE_PRIMARY_ICON}
                style={[styles.shareIcon, { tintColor: themeColors.secondary }]}
              />
            </TouchableOpacity>
          )}

          <View style={{ gap: 8, flexDirection: 'row' }}>
            {getItemWriteAccess(account) && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleEditPress(account)}
              >
                <Feather name="edit-2" size={20} color={themeColors.secondary} />
              </TouchableOpacity>
            )}
            {shouldAllowShare && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDeletePress(account)}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={22}
                  color={themeColors.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={commonStyles.gradientContainer}
    >
      <SafeAreaView style={commonStyles.safeArea}>
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
          style={commonStyles.scrollView}
          contentContainerStyle={commonStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={commonStyles.iconContainer}>
            <Image
              source={ICONS.SOCIAL_MEDIA_ICON}
              style={commonStyles.headerIcon}
            />
            <Text style={[commonStyles.title, { textAlign: 'center' }]}>
              {t('social_media.title')}
            </Text>
          </View>

          <View style={styles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('social_media.add_account')}
                onPress={() =>
                  checkSubscription(() => navigation.navigate(
                    'AddSocialMedia' as any,
                    accessLevel ? { ownerUserId: currentConnectionUserId } : undefined,
                  ), isBusiness ? 'business' : 'personal')
                }
                buttonStyle={styles.whiteButton}
                textStyle={styles.blackText}
              />
            )}
            {shouldAllowShare && accounts.length > 0 && (
              <PrimaryButton
                icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                title={t('common.share')}
                onPress={() => openShareModal()}
                buttonStyle={[styles.whiteButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
              />
            )}
          </View>

          {/* Accounts Section */}
          <View style={styles.accountsSection}>
            <Text style={[styles.accountsHeader, { textAlign: 'left' }]}>
              {t('social_media.accounts')} ({accounts.length})
            </Text>
            {user_social_networks_status === ASYNC_STATUS.LOADING ? (
              <ActivityIndicator
                size="large"
                color={themeColors.primary}
                style={styles.loadingIndicator}
              />
            ) : accounts.length > 0 ? (
              accounts.map(renderAccountCard)
            ) : (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconCircle}>
                  <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
                </View>
                <Text style={styles.emptyText}>
                  {t('social_media.no_accounts')}
                </Text>
              </View>
            )}
          </View>
          {showSharedWithMe && (
            <SharedWithMeSection
              thunkAction={getSocialNetworksSharedWithMeAsync}
              renderItem={renderSharedSocialMediaItem}
            />
          )}
        </ScrollView>

        {/* Share Modal */}
        <ShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          onShare={handleShareDocument}
          title={t('social_media.share_social_media')}
          loading={sharingLoading}
          resourceType={shareContext.resourceType}
          resourceId={shareContext.resourceId}
          businessId={currentBusinessId}
        />

        <DeleteConfirmModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
          title={t('social_media.delete_account')}
          message={`${t('social_media.delete_account_message')} ${selectedAccount?.accountname || 'this account'
            }?`}
          isLoading={isDeletePending}
        />

        {/* View Subscription Modal */}
        <ViewSubscriptionModal
          visible={viewModalVisible}
          onClose={() => {
            setViewModalVisible(false);
            setSelectedAccount(null);
          }}
          subscription={selectedAccount}
          socialNetworks={social_network_types_data?.socialnetworktypes || []}
          linkTabs={{ record: selectedAccount?.id ? { moduleKey: 'socialmedia', id: Number(selectedAccount.id) } : null }}
        />
      </SafeAreaView>
      {GateModal}
    </LinearGradient>
  );
};

export default SocialMedia;