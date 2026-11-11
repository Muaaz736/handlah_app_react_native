import React, { useState, useEffect, useRef, FC, useCallback, useMemo } from 'react';
import { enforceHttps } from '../../../../../utils/httpsGuard';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  I18nManager,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShareModal,
  DeleteConfirmModal,
  ViewBookmarkModal,
  showErrorToast,
  PrimaryButton,
} from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { ICONS } from '../../../../../utils/Images';
import {
  getDocumentUrl,
  downloadAndOpenDocument,
  extractApiError,
} from '../../../../../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { authenticateWithAlert, biometricKeysExist } from '../../../../../utils/biometricServices';
import { unlockResourceWithBiometric } from '../../../../../utils/biometricUnlock';
import {
  bookmarksAsync,
  deleteBookmarkAsync,
} from '../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import {
  IBookmarksScreenProps,
  IBookmark,
  BookMarkNavigationProp,
} from './bookmarks.types';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  setCreateBookmarkStatus,
  setUpdateBookmarkStatus,
} from '../../../../../redux/slices/essentialsSlice';
import {
  getModuleWriteAccess,
  getEntityWriteAccess,
} from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import SharedWithMeSection, { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { getBookmarksSharedWithMeAsync } from '../../../../../redux/services/essentialsService';
import { makeCommonStyles, makeBookMarkListStyles } from './BookMarks.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';

const BookMarks: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<BookMarkNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makeBookMarkListStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
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
    accessLevel,
  });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({
      isFromEmergencyAccess,
      accessType,
      moduleWriteAccess: writeAccess,
      entity: item,
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

  // Check if user is in business mode
  const isBusiness = isBusinessRole();
  const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;

  const { currentConnectionUserId, emergencyConnectionBusinessId } =
    useSelector((state: any) => state.connection_slice);

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: string | number;
  }>({ resourceType: 'bookmark' });
  const [selectedBookmark, setSelectedBookmark] = useState<IBookmark | null>(
    null,
  );
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);

  const {
    bookmarks_data,
    bookmarks_status,
    update_bookmark_status,
    delete_bookmark_status,
    create_bookmark_status,
  } = useSelector((state: any) => state.essentials_slice);
  const { share_sync_status, selectedSharedBusiness } = useSelector(
    (state: any) => state.sharing_slice,
  );

  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isBusiness ? selectedBusinessId : undefined;

  const handleAddBookmark = useCallback(() => {
    checkSubscription(() => navigation.navigate(
      'AddBookmark' as any,
      accessLevel ? { ownerUserId: currentConnectionUserId } : undefined,
    ), isBusiness ? 'business' : 'personal');
  }, [navigation, accessLevel, currentConnectionUserId, checkSubscription, isBusiness]);

  const handleShare = useCallback(() => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'bookmark' });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
  }, [checkSubscription, isBusiness]);

  const handleShareBookmark = useCallback(
    (shareData: any) => {
      const payload: any = {
        ...shareContext,
        users: shareData,
      };

      if (currentBusinessId) {
        payload.businessId = currentBusinessId;
      }

      dispatch(sharingSyncService(payload));
    },
    [dispatch, shareContext, currentBusinessId],
  );

  const handleEditBookmark = useCallback(
    (bookmark: IBookmark) => {
      if (!bookmark?.id) return;

      checkSubscription(async () => {
        const navigateToEdit = (resolvedBookmark: IBookmark) => {
          navigation.navigate('EditBookmark', { bookmark: resolvedBookmark, isEdit: true });
        };

        // No registered biometric device on this install — fall back to the
        // local Face ID/passcode screen-lock gate (no backend unlock call).
        const hasBiometricDevice = await biometricKeysExist();
        if (!hasBiometricDevice) {
          await authenticateWithAlert({
            promptMessage:
              t('bookmarks.authenticateToEdit') ||
              'Authenticate to edit bookmark details',
            cancelButtonText: t('common.cancel') || 'Cancel',
            failureTitle:
              t('social_media.authenticationFailed') || 'Authentication Failed',
            failureMessage:
              t('social_media.authenticationRequiredToEditAccount') ||
              'Authentication is required to edit bookmark details',
            okButtonText: t('common.ok') || 'OK',
            allowDeviceCredentials: true,
            onSuccess: () => {
              navigateToEdit(bookmark);
            },
          });
          return;
        }

        try {
          const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
          const unlockedData = await unlockResourceWithBiometric(
            'bookmarks',
            Number(bookmark.id),
            ownerUserId,
          );
          navigateToEdit({ ...bookmark, ...unlockedData });
        } catch (err: any) {
          const message = String(err?.message || '').toLowerCase();
          if (message.includes('cancel')) return;
          showErrorToast(extractApiError(err, 'Failed to unlock bookmark.'));
        }
      }, isBusiness ? 'business' : 'personal');
    },
    [navigation, t, accessLevel, currentConnectionUserId, checkSubscription, isBusiness],
  );

  const getTypeLabel = (type: number | string): string | number => {
    // Handle numeric types: 0=Document, 1=Notes, 2=URL, 3=Other
    switch (type) {
      case 0:
        return t('bookmarks.types.document');
      case 1:
        return t('bookmarks.types.notes');
      case 2:
        return t('bookmarks.types.url');
      case 3:
        return t('bookmarks.types.other');
      case 'Document':
        return t('bookmarks.types.document');
      case 'Notes':
        return t('bookmarks.types.notes');
      case 'Link':
      case 'URL':
        return t('bookmarks.types.url');
      case 'Other':
        return t('bookmarks.types.other');
      default:
        return type;
    }
  };

  // Get bookmarks from Redux or empty array
  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
  const bookmarks = noBusinessInBusinessMode ? [] : (Array.isArray(bookmarks_data) ? bookmarks_data : []);

  const handleDeleteBookmark = useCallback((bookmark: IBookmark) => {
    setSelectedBookmark(bookmark);
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedBookmark?.id || isDeletePending) return;

    setIsDeletePending(true);

    try {
      await dispatch(deleteBookmarkAsync(selectedBookmark.id as any)).unwrap();

      // Close modal immediately after successful delete
      setDeleteModalVisible(false);
      setSelectedBookmark(null);

      // Refresh bookmarks list after modal closes
      const params: any = { ...getConnectionTabQueryParams() };

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

      dispatch(bookmarksAsync(arg));
    } catch (error) {
      console.error('Delete bookmark failed:', error);
    } finally {
      setIsDeletePending(false);
    }
  }, [
    selectedBookmark,
    isDeletePending,
    dispatch,
    isBusiness,
    selectedBusinessId,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
  ]);

  const handleShareItem = useCallback((bookmark: IBookmark) => {
    checkSubscription(() => {
      setSelectedBookmark(bookmark);
      setShareContext({ resourceType: 'bookmark', resourceId: bookmark?.id });
      setShareModalVisible(true);
    }, isBusiness ? 'business' : 'personal');
  }, [checkSubscription, isBusiness]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetShareSyncStatus());
      setShareModalVisible(false);
      setSelectedBookmark(null);
    }
  }, [share_sync_status, dispatch]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.ERROR) {
      dispatch(resetShareSyncStatus());
    }
  }, [share_sync_status, dispatch]);

  const handleViewItem = useCallback(async (bookmark: IBookmark) => {
    if (!bookmark?.id) return;

    // No registered biometric device on this install — fall back to the
    // local Face ID/passcode screen-lock gate (no backend unlock call).
    const hasBiometricDevice = await biometricKeysExist();
    if (!hasBiometricDevice) {
      await authenticateWithAlert({
        promptMessage:
          t('bookmarks.authenticateToView') ||
          'Authenticate to view bookmark details',
        cancelButtonText: t('common.cancel') || 'Cancel',
        failureTitle:
          t('social_media.authenticationFailed') || 'Authentication Failed',
        failureMessage:
          t('social_media.authenticationRequiredToViewAccount') ||
          'Authentication is required to view bookmark details',
        okButtonText: t('common.ok') || 'OK',
        allowDeviceCredentials: true,
        onSuccess: () => {
          setSelectedBookmark(bookmark);
          setViewModalVisible(true);
        },
      });
      return;
    }

    try {
      const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
      const unlockedData = await unlockResourceWithBiometric(
        'bookmarks',
        Number(bookmark.id),
        ownerUserId,
      );
      setSelectedBookmark({ ...bookmark, ...unlockedData });
      setViewModalVisible(true);
    } catch (err: any) {
      // A cancelled/failed Face ID prompt shouldn't surface as an error toast.
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) return;
      showErrorToast(extractApiError(err, 'Failed to unlock bookmark.'));
    }
  }, [t, accessLevel, currentConnectionUserId]);

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (bookmarks_status !== ASYNC_STATUS.SUCCEEDED) return;
    const bookmarkList: IBookmark[] = Array.isArray(bookmarks_data) ? bookmarks_data : [];
    const target = bookmarkList.find((b: IBookmark) => Number(b.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      handleViewItem(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityId, bookmarks_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (bookmarks_status !== ASYNC_STATUS.SUCCEEDED) return;
    const bookmarkList: IBookmark[] = Array.isArray(bookmarks_data) ? bookmarks_data : [];
    const target = bookmarkList.find((b: IBookmark) => Number(b.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditBookmark(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityIdForEdit, bookmarks_status]);

  const handleViewHistory = useCallback(async (bookmark: IBookmark) => {
    if (!bookmark) return;

    const success = await authenticateWithAlert({
      promptMessage:
        t('bookmarks.authenticateToView') ||
        'Authenticate to view bookmark details',
      cancelButtonText: t('common.cancel') || 'Cancel',
      failureTitle:
        t('social_media.authenticationFailed') || 'Authentication Failed',
      failureMessage:
        t('social_media.authenticationRequiredToViewAccount') ||
        'Authentication is required to view bookmark details',
      okButtonText: t('common.ok') || 'OK',
      allowDeviceCredentials: true,
      onSuccess: () => {
        navigation.navigate('EditHistoryList', {
          entityType: 'Bookmark',
          entityId: bookmark.id,
          title: t('edit_history.title'),
        });
      },
    });
  }, []);

  const handleOpenURL = (url: any) => {
    if (!url) return;

    // Ensure URL has proper protocol
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    formattedUrl = enforceHttps(formattedUrl);

    Linking.canOpenURL(formattedUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(formattedUrl);
        } else {
          Alert.alert(t('common.error') || 'Error', t('common.cannot_open_url'));
        }
      })
      .catch(err => {
        console.error('Error opening URL:', err);
        Alert.alert(t('common.error') || 'Error', t('common.invalid_url'));
      });
  };

  const handleDownloadDocument = async (
    documentId: string,
    fileName: string,
  ) => {
    if (!documentId) {
      Alert.alert(
        t('common.error') || 'Error',
        t('bookmarks.no_document') || 'No document available',
      );
      return;
    }

    try {
      const fullUrl = getDocumentUrl(documentId);

      await downloadAndOpenDocument(fullUrl || 'document.pdf');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        t('common.error') || 'Error',
        t('bookmarks.download_failed') || 'Failed to download document',
      );
    }
  };

  const getTypeColor = useCallback(
    (type: string): string => {
      return themeColors.lightCGreen;
    },
    [themeColors],
  );

  const isRTL = I18nManager.isRTL;

  const getTypeIcon = (
    type: number | string,
  ): { name: string; library: 'ionicons' | 'material' } => {
    switch (type) {
      case 0:
      case 'Document':
        return { name: 'document-text-outline', library: 'ionicons' };
      case 1:
      case 'Notes':
        return { name: 'sticky-note-2', library: 'material' };
      case 2:
      case 'Link':
      case 'URL':
        return { name: 'link-outline', library: 'ionicons' };
      case 3:
      case 'Other':
        return { name: 'bookmark-outline', library: 'ionicons' };
      default:
        return { name: 'bookmark-outline', library: 'ionicons' };
    }
  };

  const renderSharedBookmarkItem = useCallback((item: any, _owner: SharedWithMeOwner): React.ReactNode => {
    const canWrite = item.accessLevel === 'write' || item.accesslevel === 'write';
    const typeIcon = getTypeIcon(item.type);
    return (
      <TouchableOpacity
        onPress={() => handleViewItem(item as IBookmark)}
        style={styles.bookmarkCard}
      >
        <View style={[styles.accountInfo, { flexDirection: 'row' }]}>
          <View style={[styles.platformIcon, { marginRight: 10 }]}>
            {typeIcon.library === 'ionicons' ? (
              <Ionicons name={typeIcon.name} size={28} color={themeColors.textPrimary} />
            ) : (
              <MaterialIcons name={typeIcon.name} size={28} color={themeColors.textPrimary} />
            )}
          </View>
          <View style={styles.accountDetails}>
            <Text style={[styles.platformName, { textAlign: 'left' }]} numberOfLines={1}>
              {item.sitename || item.title}
            </Text>
            <Text style={[styles.username, { textAlign: 'left' }]} numberOfLines={1}>
              {getTypeLabel(item.type)}
            </Text>
          </View>
        </View>
        <View style={[styles.actionButtons, { flexDirection: 'row' }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              (navigation as any).navigate('EditHistoryList', {
                entityType: 'Bookmark',
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
              onPress={() => handleEditBookmark(item as IBookmark)}
            >
              <Feather name="edit-2" size={20} color={themeColors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleViewItem, handleEditBookmark, themeColors, getTypeIcon, getTypeLabel, navigation, t]);

  // Fetch bookmarks on component mount / focus
  useFocusEffect(
    useCallback(() => {
      dispatch(setUpdateBookmarkStatus());

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
        params.businessId = emergencyConnectionBusinessId;
      }

      const arg = Object.keys(params).length ? params : undefined;

      dispatch(bookmarksAsync(arg));
    }, [
      dispatch,
      isBusiness,
      selectedBusinessId,
      isFromEmergencyAccess,
      currentConnectionUserId,
      emergencyConnectionBusinessId,
    ]),
  );

  // Fetch bookmarks on component mount
  useEffect(() => {
    dispatch(setCreateBookmarkStatus());
  }, [dispatch]);

  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea}>
        {/* Header */}
        <View style={commonStyles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.background} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={ICONS.BOOKMARK_SCREEN_ICON}
              style={[styles.bookmarkScreenIcon, { tintColor: themeColors.background }]}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('bookmarks.title')}</Text>

          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            {shouldAllowShare && (
              <PrimaryButton
                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                title={t('bookmarks.add_bookmark')}
                onPress={handleAddBookmark}
                buttonStyle={styles.addButton}
                textStyle={styles.addButtonText}
              />
            )}
            {bookmarks.length > 0 && shouldAllowShare && (
              <PrimaryButton
                icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                title={t('common.share')}
                onPress={() => handleShare()}
                buttonStyle={[styles.shareButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                textStyle={[styles.shareButtonText, { color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }]}
              />
            )}
          </View>

          {/* Bookmarks List */}
          <View style={styles.bookmarksList}>
            <Text style={[styles.listHeader, { textAlign: 'left' }]}>
              {t('bookmarks.title')} ({bookmarks.length})
            </Text>
            {bookmarks_status === ASYNC_STATUS.LOADING ? (
              <ActivityIndicator
                size="large"
                color={themeColors.primary}
                style={styles.loadingIndicator}
              />
            ) : bookmarks.length > 0 ? (
              bookmarks.map(bookmark => {
                const typeIcon = getTypeIcon(bookmark.type);
                return (
                  <TouchableOpacity
                    onPress={() => handleViewItem(bookmark)}
                    key={bookmark.id}
                    style={styles.bookmarkCard}
                  >
                    <View
                      style={[styles.accountInfo, { flexDirection: 'row' }]}
                    >
                      <View
                        style={[
                          styles.platformIcon,
                          {
                            marginRight: isRTL ? 0 : 10,
                            marginLeft: isRTL ? 10 : 0,
                          },
                        ]}
                      >
                        {typeIcon.library === 'ionicons' ? (
                          <Ionicons
                            name={typeIcon.name}
                            size={28}
                            color={themeColors.textPrimary}
                          />
                        ) : (
                          <MaterialIcons
                            name={typeIcon.name}
                            size={28}
                            color={themeColors.textPrimary}
                          />
                        )}
                      </View>
                      <View style={styles.accountDetails}>
                        <Text
                          style={[styles.platformName, { textAlign: 'left' }]}
                          numberOfLines={1}
                        >
                          {bookmark.sitename || bookmark.title}
                        </Text>
                        <Text
                          style={[styles.username, { textAlign: 'left' }]}
                          numberOfLines={1}
                        >
                          {getTypeLabel(bookmark.type)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[styles.actionButtons, { flexDirection: 'row' }]}
                    >
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleViewHistory(bookmark)}
                      >
                        <MaterialIcons
                          name="history"
                          size={20}
                          color={themeColors.secondary}
                        />
                      </TouchableOpacity>
                      {shouldAllowShare && (
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleShareItem(bookmark)}
                        >
                          <Image
                            source={ICONS.SHARE_PRIMARY_ICON}
                            style={[
                              styles.shareIcon,
                              { tintColor: themeColors.secondary },
                            ]}
                          />
                        </TouchableOpacity>
                      )}
                      <View style={{ gap: 8, flexDirection: 'row' }}>
                        {getItemWriteAccess(bookmark) && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleEditBookmark(bookmark)}
                          >
                            <Feather
                              name="edit-2"
                              size={20}
                              color={themeColors.secondary}
                            />
                          </TouchableOpacity>
                        )}
                        {shouldAllowShare && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleDeleteBookmark(bookmark)}
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
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconCircle}>
                  <AntDesign
                    name="exclamation"
                    size={32}
                    color={colors.gray || '#888'}
                  />
                </View>
                {isFromEmergencyAccess ? (
                  <Text style={styles.emptyText}>
                    {t('bookmarks.no_bookmarks_emergency')}
                  </Text>
                ) : (
                  <Text style={styles.emptyText}>
                    {t('bookmarks.no_bookmarks')}
                  </Text>
                )}
              </View>
            )}
          </View>
          {showSharedWithMe && (
            <SharedWithMeSection
              thunkAction={getBookmarksSharedWithMeAsync}
              renderItem={renderSharedBookmarkItem}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareBookmark}
        title={t('bookmarks.share_bookmarks')}
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
        onConfirm={confirmDelete}
        title={t('modals.delete_confirm')}
        isLoading={isDeletePending}
      />

      <ViewBookmarkModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedBookmark(null);
        }}
        bookmark={selectedBookmark}
        linkTabs={{ record: selectedBookmark?.id ? { moduleKey: 'bookmark', id: Number(selectedBookmark.id) } : null }}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default BookMarks;
