import { Image, ScrollView, Text, View, TouchableOpacity, GestureResponderEvent, FlatList, RefreshControl, ActivityIndicator, } from 'react-native';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewPersonalPropertyModal, MovePropertyModal,
} from '../../../../../components/common';
import {
  useFocusEffect, useNavigation, useRoute,
} from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { isIOS } from '../../../../../utils/helpers';
import {
  AddPersonalPropertyMainNavigationProp, type PersonalPropertyType, type ShareData,
} from './PersonalProperty.types';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPersonalPropertyAsync, deletePersonalPropertyAsync, updatePersonalPropertyAsync, getBusinessPropertyAsync, getRealStateOverviewAsync, getBusinessRealStateOverviewAsync, movePersonalPropertyAsync, getPersonalPropertySharedWithMeAsync,
} from '../../../../../redux/services/assetsService';
import SharedWithMeSection from '../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import {
  setDeletePersonalPropertyStatus, setAddPersonalPropertyStatus, setMovePersonalPropertyStatus, setUpdatePersonalPropertyStatus,
} from '../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import {
  getModuleWriteAccess, getEntityWriteAccess,
} from '../../../../../utils/accessLevel';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makePersonalPropertyStyles } from './PersonalProperty.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import { recordTabsWithExpenses } from '../../../../../components/recordLinks/recordTabs';

const PersonalProperty: React.FC = () => {
  const navigation = useNavigation<AddPersonalPropertyMainNavigationProp>();
  const { t } = useTranslation();
  const { themeColors, userRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const styles = useMemo(() => makePersonalPropertyStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const dispatch = useDispatch<AppDispatch>();
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
  const getConnectionTabQueryParams = useCallback(() => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  }, [connectionTabSource, sharedWithUserId, ownerId]);

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PersonalPropertyType | null>(null);
  const [viewingSharedOwner, setViewingSharedOwner] = useState<SharedWithMeOwner | null>(null);
  const editOwnerUserId = viewingSharedOwner
    ? viewingSharedOwner.id
    : (connectionTabSource === 'shared_with_you' ? ownerId : undefined);
  const [deleteItemType, setDeleteItemType] = useState<
    'property' | 'loan' | 'insurance' | 'warranty'
  >('property');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [shareContext, setShareContext] = useState<{
    resourceType: string;
    resourceId?: number;
  }>({ resourceType: 'property' });
  const [selectedPropertyFilters, setSelectedPropertyFilters] = useState<string[]>([]);
  const [showPropertyFilterDropdown, setShowPropertyFilterDropdown] = useState<boolean>(false);

  // Redux state
  const {
    get_personal_property_data,
    get_personal_property_status,
    delete_personal_property_status,
    add_personal_property_status,
    move_personal_property_status,
    get_real_state_overview_data,
    update_personal_property_status,
  } = useSelector((state: any) => state.assets_slice);

  // Loading state for delete
  const deleteLoading =
    delete_personal_property_status === ASYNC_STATUS.LOADING;
  const { share_sync_status, selectedSharedBusiness } = useSelector(
    (state: any) => state.sharing_slice,
  );

  const { currentConnectionUserId, emergencyConnectionBusinessId, currentConnection } =
    useSelector((state: any) => state.connection_slice);
  const { user_data } = useSelector((state: any) => state.user_auth);

  // Who "the owner" is for the Assign To (real estate) linkage rules on the
  // edit screen — business side only; the "Shared With Me" personal flow has
  // no business concept.
  const editOwnerBusinessId = isFromEmergencyAccess
    ? emergencyConnectionBusinessId
    : (connectionTabSource === 'shared_with_you' ? selectedSharedBusiness?.id : undefined);
  const editOwnerName = viewingSharedOwner
    ? viewingSharedOwner.firstname
    : (currentConnection
        ? (currentConnection.receiveruserid === user_data?.id
            ? currentConnection?.senderuser?.firstname
            : currentConnection?.receiveruser?.firstname)
        : undefined);

  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode =
    userRole && !selectedBusinessId && !isFromEmergencyAccess;
  const showSharedWithMe = !userRole && !isFromEmergencyAccess && !connectionTabSource;
  const properties = noBusinessInBusinessMode
    ? []
    : get_personal_property_data?.properties ||
    get_personal_property_data ||
    [];
  const isLoading = get_personal_property_status === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const currentBusinessId = userRole ? selectedBusinessId : undefined;

  // Map real estate properties for the move modal dropdown
  const realEstateOptions = (
    get_real_state_overview_data?.realestates || []
  ).map((estate: any) => ({
    label: estate.nickname || estate.streetaddress || 'Property',
    value: String(estate.id),
  }));

  // Build a map of real estate id -> label for filter display
  const realEstateMap = new Map(
    (get_real_state_overview_data?.realestates || []).map((re: any) => [
      String(re.id),
      re.nickname || re.streetaddress || `Property ${re.id}`,
    ]),
  );

  // Unique real estate IDs from current properties (only those with a realestateid)
  const uniqueRealEstateIds = Array.from(
    new Set(
      properties
        .map((p: any) => p.realestateid)
        .filter(Boolean)
        .map(String),
    ),
  );
  const propertyFilterOptions = (uniqueRealEstateIds as string[]).map((id: string) => ({
    label: String(realEstateMap.get(id) || `Property ${id}`),
    value: id,
  }));

  const hasActivePropertyFilter = selectedPropertyFilters.length > 0;

  const filteredProperties = hasActivePropertyFilter
    ? properties.filter((p: any) =>
      selectedPropertyFilters.includes(String(p.realestateid)),
    )
    : properties;

  const { get_dropdown_options_data } = useSelector(
    (state: any) => state.user_auth,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(getDropdownOptionsAsync('PropertyCategory'));
    }, [dispatch]),
  );

  const fetchProperties = useCallback(() => {
    const connectionParams = getConnectionTabQueryParams();

    if (isFromEmergencyAccess && currentConnectionUserId) {
      if (userRole) {
        const businessIdToUse =
          emergencyConnectionBusinessId || selectedBusinessId;
        if (businessIdToUse) {
          dispatch(
            getBusinessPropertyAsync({
              businessId: businessIdToUse,
              userId: currentConnectionUserId,
              ...connectionParams,
            }),
          );
        }
      } else {
        dispatch(
          getPersonalPropertyAsync({
            userId: currentConnectionUserId,
            ...connectionParams,
          }),
        );
      }
    } else {
      // In business mode with no business selected, skip fetch to avoid showing personal data
      if (
        userRole &&
        !selectedBusinessId &&
        Object.keys(connectionParams).length === 0
      ) {
        return;
      }

      if (userRole) {
        if (connectionTabSource === "shared_with_you") {
          dispatch(
            getBusinessPropertyAsync({
              businessId: selectedSharedBusiness.id,
              ...connectionParams,
            }),
          );
        } else {
          dispatch(
            getBusinessPropertyAsync({
              businessId: selectedBusinessId,
              ...connectionParams,
            }),
          );
        }
      } else {
        dispatch(
          getPersonalPropertyAsync(
            Object.keys(connectionParams).length ? connectionParams : undefined,
          ),
        );
      }
    }
  }, [
    dispatch,
    userRole,
    selectedBusinessId,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
    getConnectionTabQueryParams,
    selectedSharedBusiness?.id,
  ]);

  // Fetch personal or business properties on mount and when updated
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties, update_personal_property_status]);

  const fetchRealEstateOptions = useCallback(() => {
    if (isFromEmergencyAccess && currentConnectionUserId) {
      if (userRole) {
        const businessIdToUse =
          emergencyConnectionBusinessId || selectedBusinessId;
        if (businessIdToUse) {
          dispatch(
            getBusinessRealStateOverviewAsync({
              businessId: businessIdToUse,
              userId: currentConnectionUserId,
              ...getConnectionTabQueryParams(),
            }),
          );
        }
      } else {
        dispatch(
          getRealStateOverviewAsync({
            userId: currentConnectionUserId,
            ...getConnectionTabQueryParams(),
          }),
        );
      }
    } else {
      // The real-estate list here is only used to populate the move-property
      // dropdown. The /real-estates endpoint 403s when a businessId you don't
      // directly own is combined with an owner/shared param, so — same as
      // web — this always uses your own business (never the connection's
      // shared business) and never passes an owner/shared param.
      if (userRole && selectedBusinessId) {
        dispatch(
          getBusinessRealStateOverviewAsync({
            businessId: selectedBusinessId,
          }),
        );
      } else if (!userRole) {
        dispatch(getRealStateOverviewAsync(undefined));
      }
      // In business mode with no business selected, skip fetch
    }
  }, [
    dispatch,
    userRole,
    selectedBusinessId,
    isFromEmergencyAccess,
    currentConnectionUserId,
    emergencyConnectionBusinessId,
    getConnectionTabQueryParams,
    connectionTabSource,
    selectedSharedBusiness?.id,
  ]);

  // Fetch real estate data for move modal dropdown
  useFocusEffect(
    useCallback(() => {
      fetchRealEstateOptions();
    }, [fetchRealEstateOptions]),
  );

  // Reset add status after successful add and refresh data
  useEffect(() => {
    if (add_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setAddPersonalPropertyStatus());
      fetchProperties();
    }
  }, [add_personal_property_status, dispatch, fetchProperties]);

  // Reset delete status after successful delete and refresh data
  useEffect(() => {
    if (delete_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setDeletePersonalPropertyStatus());
      setDeleteModalVisible(false);
      setSelectedProperty(null);
      fetchProperties();
    }
  }, [delete_personal_property_status, dispatch, fetchProperties]);

  // Reset move status after successful move and refresh data
  useEffect(() => {
    if (move_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setMovePersonalPropertyStatus());
      setMoveModalVisible(false);
      setSelectedProperty(null);
      fetchProperties();
    }
  }, [move_personal_property_status, dispatch, fetchProperties]);

  useEffect(() => {
    if (update_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(setUpdatePersonalPropertyStatus());
      setDeleteModalVisible(false);
      setViewModalVisible(false);
      setSelectedProperty(null);
      fetchProperties();
    }
  }, [update_personal_property_status, dispatch, fetchProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    if (isFromEmergencyAccess && currentConnectionUserId) {
      if (userRole) {
        const businessIdToUse =
          emergencyConnectionBusinessId || selectedBusinessId;
        if (businessIdToUse) {
          dispatch(
            getBusinessPropertyAsync({
              businessId: businessIdToUse,
              userId: currentConnectionUserId,
              ...getConnectionTabQueryParams(),
            }),
          ).finally(() => {
            setRefreshing(false);
          });
        } else {
          setRefreshing(false);
        }
      } else {
        dispatch(
          getPersonalPropertyAsync({
            userId: currentConnectionUserId,
            ...getConnectionTabQueryParams(),
          }),
        ).finally(() => {
          setRefreshing(false);
        });
      }
    } else {
      const businessIdToUse =
        connectionTabSource === 'shared_with_you'
          ? selectedSharedBusiness?.id
          : selectedBusinessId;
      if (userRole && businessIdToUse) {
        dispatch(
          getBusinessPropertyAsync({
            businessId: businessIdToUse,
            ...getConnectionTabQueryParams(),
          }),
        ).finally(() => {
          setRefreshing(false);
        });
      } else if (!userRole) {
        dispatch(
          getPersonalPropertyAsync(getConnectionTabQueryParams()),
        ).finally(() => {
          setRefreshing(false);
        });
      } else {
        // Business mode with no business selected — nothing to refresh
        setRefreshing(false);
      }
    }
  };

  const handleShare = (property: PersonalPropertyType): void => {
    checkSubscription(() => {
      setSelectedProperty(property);
      setShareContext({ resourceType: 'property', resourceId: property?.id });
      setShareModalVisible(true);
    }, userRole ? 'business' : 'personal');
  };

  const handleShareAll = (): void => {
    checkSubscription(() => {
      setSelectedProperty(null);
      setShareContext({ resourceType: 'property' });
      setShareModalVisible(true);
    }, userRole ? 'business' : 'personal');
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

  const handleViewPress = (property: PersonalPropertyType): void => {
    setSelectedProperty(property);
    setViewingSharedOwner(null);
    setViewModalVisible(true);
  };

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (get_personal_property_status !== ASYNC_STATUS.SUCCEEDED) return;
    const propertyList: PersonalPropertyType[] = get_personal_property_data?.properties || get_personal_property_data || [];
    const target = propertyList.find((p: PersonalPropertyType) => Number(p.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      handleViewPress(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityId, get_personal_property_status]);

  // Auto-open the edit form when navigated here for "Update Record"
  const autoOpenedForEditRef = useRef(false);
  useEffect(() => {
    if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
    if (get_personal_property_status !== ASYNC_STATUS.SUCCEEDED) return;
    const propertyList: PersonalPropertyType[] = get_personal_property_data?.properties || get_personal_property_data || [];
    const target = propertyList.find((p: PersonalPropertyType) => Number(p.id) === Number(openEntityIdForEdit));
    if (target) {
      autoOpenedForEditRef.current = true;
      handleEditPress(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityIdForEdit, get_personal_property_status]);

  const handleMovePress = (
    e: GestureResponderEvent,
    property: PersonalPropertyType,
  ): void => {
    setSelectedProperty(property);
    setMoveModalVisible(true);
    e.preventDefault();
  };

  const handleEditPress = (property: PersonalPropertyType): void => {
    checkSubscription(() => navigation.navigate('EditPersonalProperty', {
      propertyId: property.id,
      ...(editOwnerUserId ? { ownerUserId: editOwnerUserId, property, ownerBusinessId: editOwnerBusinessId, ownerName: editOwnerName, isFromEmergencyAccess } : {}),
    }), userRole ? 'business' : 'personal');
  };

  const handleEditLoan = (): void => {
    if (!selectedProperty?.id) return;
    setViewModalVisible(false);
    checkSubscription(() => {
      navigation.navigate('EditPersonalProperty', {
        propertyId: selectedProperty.id,
        ...(editOwnerUserId ? { ownerUserId: editOwnerUserId, property: selectedProperty, ownerBusinessId: editOwnerBusinessId, ownerName: editOwnerName, isFromEmergencyAccess } : {}),
      });
    }, userRole ? 'business' : 'personal');
  };

  const handleEditInsurance = (): void => {
    if (!selectedProperty?.id) return;
    setViewModalVisible(false);
    checkSubscription(() => {
      navigation.navigate('EditPersonalProperty', {
        propertyId: selectedProperty.id,
        ...(editOwnerUserId ? { ownerUserId: editOwnerUserId, property: selectedProperty, ownerBusinessId: editOwnerBusinessId, ownerName: editOwnerName, isFromEmergencyAccess } : {}),
      });
    }, userRole ? 'business' : 'personal');
  };

  const handleEditWarranty = (): void => {
    if (!selectedProperty?.id) return;
    setViewModalVisible(false);
    checkSubscription(() => {
      navigation.navigate('EditPersonalProperty', {
        propertyId: selectedProperty.id,
        ...(editOwnerUserId ? { ownerUserId: editOwnerUserId, property: selectedProperty, ownerBusinessId: editOwnerBusinessId, ownerName: editOwnerName, isFromEmergencyAccess } : {}),
      });
    }, userRole ? 'business' : 'personal');
  };

  const buildUpdatePayload = (
    property: PersonalPropertyType,
    sectionToRemove?: 'loan' | 'insurance' | 'warranty',
  ) => {
    const payload: any = {
      name: property.name,
      category: property.category,
      attachment: Array.isArray(property.attachment)
        ? property.attachment
        : property.attachment
          ? [property.attachment]
          : [],
      modelSerial: property.modelserial || '',
      purchaseDate: property.purchasedate || null,
      price: property.price || 0,
      dateSoldDiscarded: property.datesolddiscarded || null,
      isAssigned: property.isassigned || false,
      assignedProperty: Number((property as any).assignedproperty || 0),
      isAddedToWallet: property.isaddedtowallet || false,
    };

    if (property.warranty && sectionToRemove !== 'warranty') {
      payload.warranty = {
        itemName: property.warranty.itemname || '',
        warrantyProvider: property.warranty.warrantyprovider || '',
        expiration: property.warranty.expiration || null,
        startDate: property.warranty.startdate || null,
        notes: property.warranty.notes || '',
        website: property.warranty.website || '',
        uploadAttachments: Array.isArray(property.warranty.uploadattachments)
          ? property.warranty.uploadattachments
          : property.warranty.uploadattachments
            ? [property.warranty.uploadattachments]
            : [],
      };
    }

    if (property.insurance && sectionToRemove !== 'insurance') {
      payload.insurance = {
        itemName: property.insurance.itemname || '',
        insuranceCarrier: property.insurance.insurancecarrier || '',
        policyNumber: property.insurance.policynumber || '',
        annualPremium: Number(property.insurance.annualpremium || 0),
        agentEmail: property.insurance.agentemail || '',
        startDate: property.insurance.startdate || null,
        renewalDate: property.insurance.renewaldate || null,
        endDate: property.insurance.enddate || null,
        dueDay: Number(property.insurance.dueday || 0),
        agent: property.insurance.agent || '',
        agentPhone: property.insurance.agentphone || '',
        uploadAttachments: Array.isArray(property.insurance.uploadattachments)
          ? property.insurance.uploadattachments
          : property.insurance.uploadattachments
            ? [property.insurance.uploadattachments]
            : [],
      };
    }

    if (property.loan && sectionToRemove !== 'loan') {
      payload.loan = {
        lenderProvider: property.loan.lenderprovider || '',
        lenderLocation: property.loan.lenderlocation || '',
        lenderPhoneNumber: property.loan.lenderphonenumber || '',
        lenderEmail: property.loan.lenderemail || '',
        accountNumber: property.loan.accountnumber || '',
        balance: Number(property.loan.balance || 0),
        estBalance: Number(property.loan.estbalance || 0),
        monthlyPayment: Number(property.loan.monthlypayment || 0),
        startDate: property.loan.startdate || null,
        endDate: property.loan.enddate || null,
        dueDay: Number(property.loan.dueday || 0),
        ratePercent: Number(property.loan.ratepercent || 0),
        bestName: property.loan.bestname || '',
        uploadAttachments: Array.isArray(property.loan.uploadattachments)
          ? property.loan.uploadattachments
          : property.loan.uploadattachments
            ? [property.loan.uploadattachments]
            : [],
      };
    }

    if (userRole && selectedBusinessId) {
      payload.businessId = selectedBusinessId;
    }

    return payload;
  };

  const handleDeleteLoan = (): void => {
    if (!selectedProperty?.id) return;
    setDeleteItemType('loan');
    setDeleteModalVisible(true);
  };

  const handleDeleteInsurance = (): void => {
    if (!selectedProperty?.id) return;
    setDeleteItemType('insurance');
    setDeleteModalVisible(true);
  };

  const handleDeleteWarranty = (): void => {
    if (!selectedProperty?.id) return;
    setDeleteItemType('warranty');
    setDeleteModalVisible(true);
  };

  const handleDeletePress = (property: PersonalPropertyType): void => {
    setSelectedProperty(property);
    setDeleteItemType('property');
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = (): void => {
    if (!selectedProperty?.id || deleteLoading) {
      return;
    }

    if (deleteItemType === 'property') {
      dispatch(deletePersonalPropertyAsync(selectedProperty.id));
      return;
    }

    const payload = buildUpdatePayload(selectedProperty, deleteItemType);
    dispatch(
      updatePersonalPropertyAsync({
        id: selectedProperty.id,
        data: payload,
      }),
    );
  };

  const handleMoveConfirm = (realEstateId: string): void => {
    if (selectedProperty?.id && realEstateId) {
      dispatch(
        movePersonalPropertyAsync({
          realEstateId: Number(realEstateId),
          propertyId: selectedProperty.id,
        }),
      );
    }
  };

  const renderSharedPropertyItem = (item: any, owner: SharedWithMeOwner) => {
    const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => {
          setViewingSharedOwner(owner);
          handleViewPress(item);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{item.name || item.nickname || item.streetaddress}</Text>
          <Text style={styles.propertyCategory}>{
            get_dropdown_options_data?.find(
              (option: any) =>
                String(option.value) === String(item.category),
            )?.label || '-'
          }</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('EditHistoryList', {
                entityType: 'Property',
                entityId: item.id,
                title: t('edit_history.title'),
              })
            }
          >
            <MaterialIcons name="history" size={25} color={themeColors.secondary} />
          </TouchableOpacity>
          {canWrite && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => checkSubscription(() => navigation.navigate('EditPersonalProperty', { propertyId: item.id, ownerUserId: owner.id }), userRole ? 'business' : 'personal')}
            >
              <Feather name="edit-2" size={18} color={themeColors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPropertyCard = ({
    item: property,
  }: {
    item: PersonalPropertyType;
  }) => (
    <TouchableOpacity
      onPress={() => handleViewPress(property)}
      key={property.id}
      style={styles.propertyCard}
    >
      <View style={styles.propertyInfo}>
        <Text style={[styles.propertyName]}>{property.name}</Text>
        <Text style={[styles.propertyCategory]}>
          {
            get_dropdown_options_data?.find(
              (option: any) =>
                String(option.value) === String(property.category),
            )?.label || '-'
          }
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('EditHistoryList', {
              entityType: 'Property',
              entityId: property.id,
              title: t('edit_history.title'),
            })
          }
        >
          <MaterialIcons
            name="history"
            size={25}
            color={themeColors.secondary}
          />
        </TouchableOpacity>
        {shouldAllowShare && (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleShare(property)}
            >
              <Image
                source={ICONS.SHARE_PRIMARY_ICON}
                style={[styles.shareIcon, { tintColor: themeColors.secondary }]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={e => handleMovePress(e, property)}
            >
              <Feather name="move" size={20} color={themeColors.secondary} />
            </TouchableOpacity>
          </>
        )}
        {getItemWriteAccess(property) && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEditPress(property)}
          >
            <Feather name="edit-2" size={18} color={themeColors.secondary} />
          </TouchableOpacity>
        )}
        {shouldAllowShare && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDeletePress(property)}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={20}
              color={themeColors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconCircle}>
        <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
      </View>
      <Text style={styles.emptyText}>
        {isFromEmergencyAccess
          ? t('emergency_access_tab.no_data_emergency')
          : `${t('personal_property.no_items_title')}. ${t(
            'personal_property.no_items_message',
          )}`}
      </Text>
    </View>
  );


  const renderListHeader = () => (
    <>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={ICONS.PERSONAL_BUILDING_ICON}
          style={styles.headerIcon}
        />

        {/* Title */}
        <Text style={[styles.title]}>
          {userRole
            ? t('business.sub_items.business_property')
            : t('personal_property.title')}
        </Text>
      </View>

      <View style={styles.buttonsRow}>
        {shouldAllowShare && (
          <PrimaryButton
            icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
            title={t('personal_property.add_item')}
            onPress={() =>
              checkSubscription(() => navigation.navigate(
                'AddPersonalProperty' as any,
                accessLevel
                  ? { ownerUserId: currentConnectionUserId }
                  : undefined,
              ), userRole ? 'business' : 'personal')
            }
            buttonStyle={styles.whiteButton}
            textStyle={styles.blackText}
          />
        )}

        {properties.length !== 0 && shouldAllowShare && (
          <PrimaryButton
            icon={<Fontisto name="share-a" size={13} color={colors.black} />}
            title={t('common.share')}
            onPress={handleShareAll}
            buttonStyle={[
              styles.whiteButton,
              { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) },
            ]}
            textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
          />
        )}
      </View>

      {/* Filter by Real Estate Property */}
      {properties.length > 0 && propertyFilterOptions.length > 0 && (
        <View style={styles.filterRow}>
          {/* All / Reset */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              !hasActivePropertyFilter && styles.filterButtonActive,
            ]}
            onPress={() => {
              setSelectedPropertyFilters([]);
              setShowPropertyFilterDropdown(false);
            }}
          >
            <Text
              style={[
                styles.filterText,
                !hasActivePropertyFilter && styles.filterTextActive,
              ]}
            >
              {t('utilities.all')}
            </Text>
          </TouchableOpacity>

          {/* By Property */}
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                (showPropertyFilterDropdown || hasActivePropertyFilter) &&
                styles.filterButtonActive,
              ]}
              onPress={() =>
                setShowPropertyFilterDropdown(prev => !prev)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  hasActivePropertyFilter && styles.filterTextActive,
                ]}
                numberOfLines={1}
              >
                {t('utilities.by_property')}
              </Text>
              {hasActivePropertyFilter && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {selectedPropertyFilters.length}
                  </Text>
                </View>
              )}
              <Entypo
                name={showPropertyFilterDropdown ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={themeColors.textPrimary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>

            {showPropertyFilterDropdown && (
              <View style={styles.inlineDropdown}>
                {propertyFilterOptions.length > 0 ? (
                  propertyFilterOptions.map(option => {
                    const isSelected = selectedPropertyFilters.includes(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedPropertyFilters(prev =>
                            isSelected
                              ? prev.filter(v => v !== option.value)
                              : [...prev, option.value],
                          );
                        }}
                      >
                        <View style={styles.checkboxWrap}>
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && {
                                backgroundColor: themeColors.primary,
                                borderColor: themeColors.primary,
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
                            styles.dropdownItemText,
                            isSelected && styles.dropdownItemTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>
                      {t('utilities.no_properties')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </>
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
          backButtonIconStyle={{ tintColor: themeColors.background }}
        />

        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing && properties.length !== 0}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
        >
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          ) : (
            <>
              {renderListHeader()}

              {/* Properties List */}
              <View style={styles.propertiesSection}>
                <FlatList
                  data={filteredProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                  ListEmptyComponent={renderEmptyComponent}
                  contentContainerStyle={
                    filteredProperties.length === 0
                      ? styles.emptyListContent
                      : undefined
                  }
                />
              </View>
            </>
          )}
          {showSharedWithMe && (
            <SharedWithMeSection
              thunkAction={getPersonalPropertySharedWithMeAsync}
              renderItem={renderSharedPropertyItem}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        // title={t('personal_property.share_personal_property')}
        title={userRole ? t('personal_property.share_business_property') : t('personal_property.share_personal_property')}
        resourceType={shareContext.resourceType}
        resourceId={shareContext.resourceId}
        businessId={currentBusinessId}
        loading={sharingLoading}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => !deleteLoading && setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        title={
          deleteItemType === 'property'
            ? t('personal_property.delete_confirm')
            : t('common.confirm')
        }
        message={
          deleteItemType === 'property'
            ? `Are you sure you want to delete ${selectedProperty?.name || 'this item'
            }?`
            : `Are you sure you want to remove ${deleteItemType} details from this property?`
        }
        isLoading={deleteLoading}
      />

      <ViewPersonalPropertyModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedProperty(null);
          setViewingSharedOwner(null);
        }}
        property={selectedProperty}
        actionable={
          viewingSharedOwner
            ? (selectedProperty?.accessLevel?.toLowerCase() === 'write' || selectedProperty?.accesslevel?.toLowerCase() === 'write')
            : (selectedProperty ? getItemWriteAccess(selectedProperty) : writeAccess)
        }
        ownerUserId={viewingSharedOwner ? viewingSharedOwner.id : (accessLevel ? currentConnectionUserId : undefined)}
        isLoading={false}
        onEditProperty={() =>
          selectedProperty && handleEditPress(selectedProperty)
        }
        onEditLoan={handleEditLoan}
        onEditInsurance={handleEditInsurance}
        onEditWarranty={handleEditWarranty}
        onDeleteLoan={(selectedProperty?.accessLevel || selectedProperty?.accesslevel) ? undefined : handleDeleteLoan}
        onDeleteInsurance={(selectedProperty?.accessLevel || selectedProperty?.accesslevel) ? undefined : handleDeleteInsurance}
        onDeleteWarranty={(selectedProperty?.accessLevel || selectedProperty?.accesslevel) ? undefined : handleDeleteWarranty}
        linkTabs={recordTabsWithExpenses(
          selectedProperty?.id ? { moduleKey: 'property', id: Number(selectedProperty.id) } : null,
          {
            canEdit: viewingSharedOwner ? false : (selectedProperty ? getItemWriteAccess(selectedProperty) : writeAccess),
            ownerUserId: viewingSharedOwner ? viewingSharedOwner.id : null,
            onNavigate: () => { setViewModalVisible(false); setSelectedProperty(null); setViewingSharedOwner(null); },
          },
        )}
      />

      <MovePropertyModal
        visible={moveModalVisible}
        onClose={() => {
          setMoveModalVisible(false);
          setSelectedProperty(null);
        }}
        onConfirm={handleMoveConfirm}
        propertyOptions={realEstateOptions}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default PersonalProperty;
