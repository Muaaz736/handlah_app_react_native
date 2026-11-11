import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  BusinessContactNavigationProp,
  BusinessContactItem,
  ShareData,
} from './BusinessContact.types';
import {
  getBusinessContactsAsync,
  deleteBusinessContactAsync,
} from '../../../../../redux/services/businessContactsService';
import { resetDeleteBusinessContactStatus } from '../../../../../redux/slices/businessContactsSlice';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { BusinessContactItem as APIBusinessContactItem } from '../../../../../types/reduxTypes/businessContactsSlice.types';
import {
  AuthHeader,
  CustomInput,
  PrimaryButton,
  ShareModal,
  DeleteConfirmModal,
  ViewBusinessContactModal,
} from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import FONTS from '../../../../../utils/fonts';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { isIOS } from '../../../../../utils/helpers';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { darkenColor } from '../../../../../utils/roleManager';
import { makeBusinessContactStyles } from './BusinessContact.styles';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { RoleTheme } from '../../../../../types/roleManager.types';

const { height, width } = Dimensions.get('window');

const BusinessContact: React.FC = () => {
  const navigation = useNavigation<BusinessContactNavigationProp>();
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeBusinessContactStyles(themeColors  as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBusinessId } = useSelectedBusiness();
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
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] =
    useState<APIBusinessContactItem | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const autoOpenedRef = useRef(false);
  const [selectedViewContact, setSelectedViewContact] =
    useState<APIBusinessContactItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showReferencesOnly, setShowReferencesOnly] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'businesscontact' });

  const { currentConnectionUserId, emergencyConnectionBusinessId } =
    useSelector((state: any) => state.connection_slice);

  const businessContactsState = useSelector(
    (state: any) => state.business_contacts_slice,
  );

  const { contactsData, contactsStatus, deleteStatus } = useMemo(
    () => ({
      contactsData: businessContactsState?.get_business_contacts_data || [],
      contactsStatus: businessContactsState?.get_business_contacts_status,
      deleteStatus: businessContactsState?.delete_business_contact_status,
    }),
    [businessContactsState],
  );

  const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = isFromEmergencyAccess ? emergencyConnectionBusinessId : selectedBusinessId;


  const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

  useFocusEffect(useCallback(() => {
    dispatch(getDropdownOptionsAsync('BusinessContactRole'));
  }, [dispatch]));

  useFocusEffect(
    useCallback(() => {
      const connectionParams = getConnectionTabQueryParams();
      // const businessIdToUse = isFromEmergencyAccess
      //   ? emergencyConnectionBusinessId
      //   : selectedBusinessId;

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
      dispatch(getBusinessContactsAsync(params as any));

      // if (!businessIdToUse) {
      //   return;
      // }

      // if (isFromEmergencyAccess && currentConnectionUserId) {
      //   dispatch(getBusinessContactsAsync({ businessId: businessIdToUse, userId: currentConnectionUserId, ...getConnectionTabQueryParams() }));
      // } else {
      //   dispatch(getBusinessContactsAsync({ businessId: businessIdToUse, ...getConnectionTabQueryParams() }));
      // }
    }, [dispatch, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId, selectedBusinessId, selectedSharedBusiness]),
  );

  useEffect(() => {
    if (deleteStatus === ASYNC_STATUS.SUCCEEDED) {
      setDeleteModalVisible(false);
      setSelectedContact(null);
      dispatch(resetDeleteBusinessContactStatus());
    }
  }, [deleteStatus, dispatch]);

  const onRefresh = useCallback(async () => {
    const businessIdToUse = isFromEmergencyAccess
      ? emergencyConnectionBusinessId
      : selectedBusinessId;

    if (businessIdToUse) {
      setRefreshing(true);
      const arg = isFromEmergencyAccess && currentConnectionUserId
        ? { businessId: businessIdToUse, userId: currentConnectionUserId, ...getConnectionTabQueryParams() }
        : { businessId: businessIdToUse, ...getConnectionTabQueryParams() };
      await dispatch(getBusinessContactsAsync(arg as any));
      setRefreshing(false);
    }
  }, [
    selectedBusinessId,
    dispatch,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
  ]);

  useEffect(() => {
    if (contactsStatus !== ASYNC_STATUS.LOADING) {
      setRefreshing(false);
    }
  }, [contactsStatus]);

  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (contactsStatus !== ASYNC_STATUS.SUCCEEDED) return;
    const target = (contactsData as APIBusinessContactItem[]).find((c) => Number(c.id) === Number(openEntityId));
    if (target) { autoOpenedRef.current = true; setSelectedViewContact(target); setViewModalVisible(true); }
  }, [openEntityId, contactsStatus]);

  const filteredContacts = useMemo(() => {
    let results = contactsData;

    if (showReferencesOnly) {
      results = results.filter((contact: APIBusinessContactItem) => (contact as any).isReference === true);
    }

    if (!searchQuery.trim()) {
      return results;
    }

    const query = searchQuery.toLowerCase();
    return results.filter((contact: APIBusinessContactItem) => {
      return (
        contact.fullName?.toLowerCase().includes(query) ||
        contact.role?.toLowerCase().includes(query) ||
        contact.companyTeam?.toLowerCase().includes(query) ||
        contact.tags?.toLowerCase().includes(query) ||
        contact.emailAddress?.toLowerCase().includes(query)
      );
    });
  }, [contactsData, searchQuery, showReferencesOnly]);

  const handleShare = (resourceId?: number): void => {
    checkSubscription(() => {
      setShareContext({ resourceType: 'businesscontact', resourceId });
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

  const handleDeleteContact = (contact: APIBusinessContactItem): void => {
    setSelectedContact(contact);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedContact?.id) {
      await dispatch(deleteBusinessContactAsync(selectedContact.id));
    }
  };

  const handleEditContact = (contact: APIBusinessContactItem): void => {
    checkSubscription(() => navigation.navigate('AddBusinessContact' as any, { contact, isEdit: true }), 'business');
  };

  const handleShareBusinessContact = (id: string): void => {
    handleShare(Number(id));
  };

  const renderContactCard = ({
    item,
  }: {
    item: APIBusinessContactItem;
  }): React.ReactElement => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={() => {
        setSelectedViewContact(item);
        setViewModalVisible(true);
      }}
    >
      <View style={styles.contactHeader}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName} numberOfLines={1} ellipsizeMode="tail">{item.fullName}</Text>
          {item?.role && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: getColorWithOpacity(
                    themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : themeColors.primary,
                    0.5,
                  ),
                },
              ]}
            >
              <Text style={styles.roleText}>{get_dropdown_options_data?.find((option: any) => String(option.value) === String(item.role))?.label || '-'}</Text>
            </View>
          )}
        </View>

        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              (navigation as any).navigate('EditHistoryList', {
                entityType: 'BusinessContact',
                entityId: item.id,
                title: t('edit_history.title'),
              })
            }
          >
            <MaterialIcons
              name="history"
              size={24}
              color={themeColors.primary}
            />
          </TouchableOpacity>
          {shouldAllowShare && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShareBusinessContact(item.id.toString())}
            >
              <Image
                source={ICONS.SHARE_PRIMARY_ICON}
                style={[styles.shareIcon, { tintColor: themeColors.primary }]}
              />
            </TouchableOpacity>
          )}

          <View style={{ gap: 10, flexDirection: 'row' }}>
            {getItemWriteAccess(item) && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditContact(item)}
              >
                <Image
                  source={ICONS.EDIT_PENCIL_ICON}
                  style={[styles.editIcon, { tintColor: themeColors.primary }]}
                />
              </TouchableOpacity>
            )}
            {shouldAllowShare && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteContact(item)}
              >
                <Image
                  source={ICONS.DELETE_ICON}
                  style={[
                    styles.deleteIcon,
                    { tintColor: themeColors.primary },
                  ]}
                />
              </TouchableOpacity>
            )}
          </View>
        </View >
      </View >

      {
        [
          item.companyTeam,
          item.emailAddress,
          item.isPrimary != null
            ? item.isPrimary
              ? 'Primary'
              : 'Secondary'
            : null,
        ].filter(Boolean).length > 0 && (
          <Text style={styles.contactEmail}>
            {[
              item.companyTeam,
              item.emailAddress,
              item.isPrimary != null
                ? item.isPrimary
                  ? 'Primary'
                  : 'Secondary'
                : null,
            ]
              .filter(Boolean)
              .join(' • ')}
          </Text>
        )
      }
    </TouchableOpacity >
  );

  const renderEmptyState = (): React.ReactElement => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconCircle}>
        <AntDesign name="exclamation" size={32} color={colors.gray} />
      </View>
      <Text style={styles.emptyStateTitle}>
        {t('business.business_contacts.empty_state_title')}
      </Text>
      {writeAccess && (
        <Text style={styles.emptyStateSubtitle}>
          {t('business.business_contacts.empty_state_subtitle')}
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
          containerStyle={[
            styles.headerContainerStyle,
            { paddingTop: isIOS ? 0 : 20 },
          ]}
          backButtonStyle={{ marginBottom: 0 }}
          titleStyle={{ marginBottom: 0 }}
          backButtonIconStyle={{ tintColor: colors.white }}
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
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={ICONS.BUSINESS_CONTACT_ICON}
              style={styles.headerIcon}
            />

            {/* Title */}
            <Text style={styles.title}>
              {t('business.business_contacts.title')}
            </Text>
          </View>

          <View style={styles.buttonsRow}>
            {
              shouldAllowShare && (
                <PrimaryButton
                  icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                  title={t('business.business_contacts.add_business_contact')}
                  onPress={() => checkSubscription(() => navigation.navigate('AddBusinessContact' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), 'business')}
                  buttonStyle={styles.whiteButton}
                  textStyle={styles.whiteButtonText}
                />
              )
            }
            {
              contactsData.length > 0 && shouldAllowShare && (
                <PrimaryButton
                  icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                  title={t('business.business_contacts.share')}
                  onPress={() => handleShare()}
                  buttonStyle={[styles.shareButton, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.lightCGreen, 0.3) : themeColors.lightCGreen }]}
                  textStyle={[styles.shareButtonText, { color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }]}
                />
              )
            }
          </View >

          {/* Search Input + References Toggle */}
          {contactsData.length > 0 && (
            <View style={styles.searchContainer}>
              <View style={styles.searchRow}>
                <CustomInput
                  icon={ICONS.SEARCH_ICON}
                  startIconStyle={styles.searchStartIcon}
                  placeholder={t('common.search_contacts')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  inputContainerStyle={styles.searchInputContainer}
                  containerStyle={styles.searchWrapper}
                />
              </View>
              <TouchableOpacity
                style={styles.referenceToggleRow}
                onPress={() => setShowReferencesOnly(prev => !prev)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.referenceToggle,
                  showReferencesOnly && { backgroundColor: themeColors.primary },
                ]}>
                  <View style={[
                    styles.referenceToggleCircle,
                    showReferencesOnly && styles.referenceToggleCircleActive,
                  ]} />
                </View>
                <Text style={styles.referenceToggleLabel}>
                  {t('business.business_contacts.show_references_only')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {
            contactsStatus === ASYNC_STATUS.LOADING && !refreshing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )
          }

          {/* Contacts List or Empty State */}
          {
            contactsStatus !== ASYNC_STATUS.LOADING &&
            (filteredContacts.length === 0 ? (
              (() => {
                // toggle ON, no search → no reference contacts exist
                if (showReferencesOnly && !searchQuery.trim()) {
                  return (
                    <View style={styles.emptyStateContainer}>
                      <View style={styles.emptyIconCircle}>
                        <AntDesign name="staro" size={32} color={colors.gray} />
                      </View>
                      <Text style={styles.emptyStateTitle}>
                        {t('business.business_contacts.no_references_found')}
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        {t('business.business_contacts.no_references_subtitle')}
                      </Text>
                    </View>
                  );
                }
                // toggle ON + search query → no match among references
                if (showReferencesOnly && searchQuery.trim()) {
                  return (
                    <View style={styles.emptyStateContainer}>
                      <View style={styles.emptyIconCircle}>
                        <AntDesign name="search1" size={32} color={colors.gray} />
                      </View>
                      <Text style={styles.emptyStateTitle}>
                        {t('common.no_contacts_found')}
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        {t('common.adjust_search')}
                      </Text>
                    </View>
                  );
                }
                // toggle OFF + search query → no match among all contacts
                if (searchQuery.trim()) {
                  return (
                    <View style={styles.emptyStateContainer}>
                      <View style={styles.emptyIconCircle}>
                        <AntDesign name="search1" size={32} color={colors.gray} />
                      </View>
                      <Text style={styles.emptyStateTitle}>
                        {t('common.no_contacts_found')}
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        {t('common.adjust_search')}
                      </Text>
                    </View>
                  );
                }
                // toggle OFF, no search → contacts list is genuinely empty
                return renderEmptyState();
              })()
            ) : (
              <FlatList
                data={filteredContacts}
                renderItem={renderContactCard}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.contactsList}
                style={styles.fullWidth}
              />
            ))
          }
        </ScrollView >
      </SafeAreaView >

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

      <ViewBusinessContactModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedViewContact(null);
        }}
        contact={selectedViewContact}
        linkTabs={{ record: (selectedViewContact as any)?.id ? { moduleKey: 'businesscontact', id: Number((selectedViewContact as any).id) } : null }}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        title={t('business.business_contacts.delete_contact')}
        message={`${t('modals.delete_confirm')} ${selectedContact?.fullName || 'this contact'
          }?`}
        isLoading={deleteStatus === ASYNC_STATUS.LOADING}
      />
      {GateModal}
    </LinearGradient >
  );
};

export default BusinessContact;
