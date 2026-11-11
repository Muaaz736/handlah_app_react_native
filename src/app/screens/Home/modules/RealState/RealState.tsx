import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
    Image,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { INACTIVE_CARD_STYLE } from '../../../../../utils/recordStatus';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    PrimaryButton,
    ShareModal,
    DeleteConfirmModal,
    ViewRealEstateModal,
} from '../../../../../components/common';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FONTS from '../../../../../utils/fonts';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import type {
    RealEstateScreenProps,
    RealEstateProperty,
    DeleteItemType,
    ShareData,
    Loan,
    Utility,
    Insurance,
    Rental,
    Warranty,
    PropertyItem,
    Service,
} from './realstate.types';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
    getRealStateOverviewAsync,
    getRealStateOverviewByIdAsync,
    deleteRealStateOverviewAsync,
    deleteRealStateLoanMortgageAsync,
    deleteRealStateUtilitiesAsync,
    deleteRealStateInsuranceAsync,
    deleteRealStateWarrantiesAsync,
    deleteRealStatePersonalPropertyAsync,
    deleteRealStateServiceWorkHistoryAsync,
    getBusinessRealStateOverviewAsync,
    getRealStateSharedWithMeAsync,
} from '../../../../../redux/services/assetsService';
import SharedWithMeSection from '../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';

import { makeRealEstateStyles, makeSharedStyles } from './RealState.styles';
import { useDispatch, useSelector } from 'react-redux';
import { ASYNC_STATUS } from '../../../../../config/constants';
import {
    setDeleteRealStateOverviewStatus,
    setDeleteRealStateLoanMortgageStatus,
    setDeleteRealStateUtilitiesStatus,
    setDeleteRealStateInsuranceStatus,
    setDeleteRealStateWarrantiesStatus,
    setDeleteRealStatePersonalPropertyStatus,
    setDeleteRealStateServiceWorkHistoryStatus
} from '../../../../../redux/slices/assetsSlice';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import { useLocationNameMaps, nameFromMap } from '../../../../../utils/locationNames';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';

const RealEstate: React.FC<RealEstateScreenProps> = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeSharedStyles(themeColors as RoleTheme),
            ...makeRealEstateStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { checkSubscription, GateModal } = useSubscriptionGate();
    const { selectedBusinessId } = useSelectedBusiness();
    const dispatch = useDispatch<AppDispatch>();

    const route = useRoute<any>();
    const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openParentEntityId, openServiceIdForEdit } = route.params || {};
    const isFromEmergencyAccess = from === 'emergency_access';
    const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
    const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
    const getItemWriteAccess = (item: any) => {
        return getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item })
    };
    const getConnectionTabQueryParams = () => {
        if (connectionTabSource === 'yours' && sharedWithUserId) {
            return { sharedWithUserId };
        }
        if (connectionTabSource === 'shared_with_you' && ownerId) {
            return { ownerId };
        }
        return {};
    };

    // Use a ref so fetchOverview never re-creates due to these values changing
    const isBusinessRoleRef = useRef(isBusinessRole());
    const selectedBusinessIdRef = useRef(selectedBusinessId);
    const emergencyConnectionBusinessIdRef = useRef<any>(null);
    const currentConnectionUserIdRef = useRef<any>(null);

    const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
    const [selectedProperty, setSelectedProperty] = useState<RealEstateProperty | null>(null);
    const [viewingSharedOwner, setViewingSharedOwner] = useState<SharedWithMeOwner | null>(null);
    const [deleteItemType, setDeleteItemType] = useState<DeleteItemType | null>(null);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [shareContext, setShareContext] = useState<{
        resourceType: string;
        resourceId?: number;
    }>({ resourceType: 'realestate' });

    const {
        get_real_state_overview_status,
        get_real_state_overview_data,
        get_real_state_overview_by_id_status,
        get_real_state_overview_by_id_data,
        delete_real_state_overview_status,
        delete_real_state_loan_mortgage_status,
        delete_real_state_utilities_status,
        delete_real_state_insurance_status,
        delete_real_state_warranties_status,
        delete_real_state_personal_property_status,
        delete_real_state_service_work_history_status
    } = useSelector((state: any) => state?.assets_slice);
    const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);

    const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);

    // Keep refs in sync without triggering re-renders
    useEffect(() => { selectedBusinessIdRef.current = selectedBusinessId; }, [selectedBusinessId]);
    useEffect(() => { emergencyConnectionBusinessIdRef.current = emergencyConnectionBusinessId; }, [emergencyConnectionBusinessId]);
    useEffect(() => { currentConnectionUserIdRef.current = currentConnectionUserId; }, [currentConnectionUserId]);

    const isLoading = get_real_state_overview_status === ASYNC_STATUS.LOADING;

    // In business mode with no business selected, show empty data
    const noBusinessInBusinessMode = isBusinessRole() && !selectedBusinessId && !isFromEmergencyAccess;
    const showSharedWithMe = !isBusinessRole() && !isFromEmergencyAccess && !connectionTabSource;

    // Resolve state/country IDs -> names for display (backend stores IDs).
    const { stateNames } = useLocationNameMaps(get_real_state_overview_data?.realestates || []);

    const properties: RealEstateProperty[] = noBusinessInBusinessMode ? [] : (get_real_state_overview_data?.realestates || []).map((item: any) => ({
        id: item.id,
        name: item.nickname || 'Property',
        address: `${item.streetaddress || ''}${item.aptsuite ? ', ' + item.aptsuite : ''}, ${item.city || ''}, ${nameFromMap(stateNames, item.state)}, ${item.zip || ''}`,
        propertyType: item.type || '',
        purchasePrice: item.purchaseprice || 0,
        currentValue: item.estcurrentvalue || 0,
        accessLevel: item.accesslevel || item.accessLevel || "write", // fallback to module-level access if not provided at entity level
        endSellDate: item.endselldate || item.endSellDate || null,
    }));

    // Sold / discarded (end/sell date before today), as on the website: badge, greyed card, listed last, and can be hidden.
    const [showSold, setShowSold] = useState(true);
    const hasSold = properties.some(p => isPropertySold(p.endSellDate));
    const displayedProperties = properties
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => showSold || !isPropertySold(p.endSellDate))
        .sort((a, b) => Number(isPropertySold(a.p.endSellDate)) - Number(isPropertySold(b.p.endSellDate)) || a.i - b.i)
        .map(({ p }) => p);

    const realStatePropertyData: any = get_real_state_overview_by_id_data?.realestates?.[0] || get_real_state_overview_by_id_data;
    const isViewLoading = get_real_state_overview_by_id_status === ASYNC_STATUS.LOADING;
    const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
    const currentBusinessId = isBusinessRole() ? selectedBusinessId : undefined;


    // Stable fetch — reads from refs so its identity never changes
    const fetchOverview = useCallback(() => {
        const businessRole = isBusinessRoleRef.current;
        const bizId = selectedBusinessIdRef.current;
        const emergencyBizId = emergencyConnectionBusinessIdRef.current;
        const connectionUserId = currentConnectionUserIdRef.current;

        if (businessRole) {
            const businessIdToUse = isFromEmergencyAccess ? (emergencyBizId || bizId) : Object.keys(getConnectionTabQueryParams()).length > 0 ? selectedSharedBusiness.id : bizId;
            if (!businessIdToUse) return;
            if (isFromEmergencyAccess && connectionUserId) {
                dispatch(getBusinessRealStateOverviewAsync({ businessId: businessIdToUse, userId: connectionUserId, ...getConnectionTabQueryParams() }));
            } else {
                dispatch(getBusinessRealStateOverviewAsync({ businessId: businessIdToUse, ...getConnectionTabQueryParams() }));
            }
        } else {
            if (isFromEmergencyAccess && connectionUserId) {
                dispatch(getRealStateOverviewAsync({ userId: connectionUserId, ...getConnectionTabQueryParams() }));
            } else {
                dispatch(getRealStateOverviewAsync(getConnectionTabQueryParams()));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isFromEmergencyAccess]);

    // Single focus effect — stable fetchOverview means this fires exactly once per focus
    useFocusEffect(useCallback(() => {
        fetchOverview();
    }, [fetchOverview]));

    // Delete success handlers
    useEffect(() => {
        if (delete_real_state_overview_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStateOverviewStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_overview_status]);

    useEffect(() => {
        if (delete_real_state_loan_mortgage_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStateLoanMortgageStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_loan_mortgage_status]);

    useEffect(() => {
        if (delete_real_state_utilities_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStateUtilitiesStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_utilities_status]);

    useEffect(() => {
        if (delete_real_state_insurance_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStateInsuranceStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_insurance_status]);

    useEffect(() => {
        if (delete_real_state_warranties_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStateWarrantiesStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_warranties_status]);

    useEffect(() => {
        if (delete_real_state_personal_property_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStatePersonalPropertyStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_personal_property_status]);

    useEffect(() => {
        if (delete_real_state_service_work_history_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(setDeleteRealStateServiceWorkHistoryStatus());
            fetchOverview();
            setViewModalVisible(false);
        }
    }, [delete_real_state_service_work_history_status]);

    const handleShare = useCallback((property?: RealEstateProperty) => {
        checkSubscription(() => {
            setShareContext({
                resourceType: 'realestate',
                resourceId: property?.id,
            });
            setShareModalVisible(true);
        }, isBusinessRole() ? 'business' : 'personal');
    }, [checkSubscription, isBusinessRole]);

    const handleShareProperty = useCallback((shareData: ShareData) => {
        const payload: any = {
            ...shareContext,
            users: shareData,
        };

        if (currentBusinessId) {
            payload.businessId = currentBusinessId;
        }

        dispatch(sharingSyncService(payload));
    }, [dispatch, shareContext, currentBusinessId]);

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

    // Fetches the full property record (serviceworkhistories, ...) without
    // opening the view modal — used both by handleViewPress and by the
    // "Update Record" deep-link flow, which needs this data loaded before it
    // can find the sub-record to edit but must not show the view modal.
    const fetchPropertyDetail = useCallback((property: RealEstateProperty) => {
        setSelectedProperty(property);
        setViewingSharedOwner(null);

        const businessRole = isBusinessRoleRef.current;
        const bizId = selectedBusinessIdRef.current;
        const emergencyBizId = emergencyConnectionBusinessIdRef.current;
        const connectionUserId = currentConnectionUserIdRef.current;

        if (isFromEmergencyAccess && connectionUserId) {
            if (businessRole) {
                const businessIdToUse = isFromEmergencyAccess ? (emergencyBizId || bizId) : Object.keys(getConnectionTabQueryParams()).length > 0 ? selectedSharedBusiness.id : bizId;
                if (businessIdToUse) {
                    dispatch(getRealStateOverviewByIdAsync({ id: property.id as any, businessId: businessIdToUse, userId: connectionUserId, ...getConnectionTabQueryParams() }));
                } else {
                    dispatch(getRealStateOverviewByIdAsync({ id: property.id as any, ...getConnectionTabQueryParams() }));
                }
            } else {
                dispatch(getRealStateOverviewByIdAsync({ id: property.id as any, userId: connectionUserId, ...getConnectionTabQueryParams() }));
            }
        } else {
            dispatch(getRealStateOverviewByIdAsync({ id: property.id as any, ...getConnectionTabQueryParams() }));
        }
    }, [dispatch, isFromEmergencyAccess]);

    const handleViewPress = useCallback((property: RealEstateProperty) => {
        fetchPropertyDetail(property);
        setViewModalVisible(true);
    }, [fetchPropertyDetail]);

    const autoOpenedRef = useRef(false);
    useEffect(() => {
        if ((!openEntityId && !openParentEntityId) || autoOpenedRef.current) return;
        if (get_real_state_overview_status !== ASYNC_STATUS.SUCCEEDED) return;
        const propList: RealEstateProperty[] = get_real_state_overview_data?.realestates?.map((item: any) => ({ ...item, id: item.id })) || [];
        const target =
            (openParentEntityId != null
                ? propList.find((p: RealEstateProperty) => Number(p.id) === Number(openParentEntityId))
                : undefined) ??
            (openEntityId != null
                ? propList.find((p: RealEstateProperty) => Number(p.id) === Number(openEntityId)) ??
                  propList.find((p: any) =>
                      (p.serviceworkhistories || []).some(
                          (r: any) => Number(r.id) === Number(openEntityId),
                      ),
                  )
                : undefined);
        if (target) {
            autoOpenedRef.current = true;
            // An "Update Record" deep link also carries openParentEntityId to
            // select the right property, but should land in the edit form, not
            // this view modal — still need the fetch though, since the edit
            // effect below depends on it.
            if (openServiceIdForEdit) {
                fetchPropertyDetail(target);
            } else {
                handleViewPress(target);
            }
        }
    }, [openEntityId, openParentEntityId, get_real_state_overview_status]);

    const autoOpenServiceEditRef = useRef<number | null>(null);
    useEffect(() => {
        if (!openServiceIdForEdit) return;
        if (autoOpenServiceEditRef.current === Number(openServiceIdForEdit)) return;
        if (get_real_state_overview_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
        const match = (realStatePropertyData?.serviceworkhistories || []).find(
            (s: any) => Number(s.id) === Number(openServiceIdForEdit),
        );
        if (match) {
            autoOpenServiceEditRef.current = Number(openServiceIdForEdit);
            (navigation as any).navigate('AddServicesWorkHistory', { service: match, isEdit: true });
        }
    }, [openServiceIdForEdit, get_real_state_overview_by_id_status, realStatePropertyData]);

    const handleEditPress = useCallback((property: RealEstateProperty): void => {
        checkSubscription(() => {
            const propertyData = get_real_state_overview_data?.realestates?.find(
                (item: any) => item.id.toString() === property.id.toString()
            );
            navigation.navigate('AddRealEstate', { property: propertyData, isEdit: true } as any);
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, get_real_state_overview_data, checkSubscription, isBusinessRole]);

    const handleEditSharedPress = useCallback((item: any, owner: SharedWithMeOwner): void => {
        checkSubscription(
            () => navigation.navigate('AddRealEstate', { property: item, isEdit: true, ownerUserId: owner.id } as any),
            isBusinessRole() ? 'business' : 'personal',
        );
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleDeletePress = useCallback((property: RealEstateProperty) => {
        setDeleteItemId(property.id);
        setSelectedProperty(property);
        setDeleteItemType('property');
        setDeleteModalVisible(true);
    }, []);

    const handleDeleteItem = useCallback((itemId: number, itemType: DeleteItemType) => {
        setDeleteItemId(itemId);
        setDeleteItemType(itemType);
        setDeleteModalVisible(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteItemType || !deleteItemId) return;
        try {
            switch (deleteItemType) {
                case 'property':
                    if (selectedProperty?.id) dispatch(deleteRealStateOverviewAsync(selectedProperty.id as any));
                    break;
                case 'loan':
                    dispatch(deleteRealStateLoanMortgageAsync(deleteItemId as any));
                    break;
                case 'utility':
                    dispatch(deleteRealStateUtilitiesAsync(deleteItemId as any));
                    break;
                case 'rental':
                    dispatch(deleteRealStateInsuranceAsync(deleteItemId as any));
                    break;
                case 'warranty':
                    dispatch(deleteRealStateWarrantiesAsync(deleteItemId as any));
                    break;
                case 'property_item':
                    dispatch(deleteRealStatePersonalPropertyAsync(deleteItemId as any));
                    break;
                case 'service':
                    dispatch(deleteRealStateServiceWorkHistoryAsync(deleteItemId as any));
                    break;
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
        setDeleteModalVisible(false);
        setSelectedProperty(null);
        setDeleteItemType(null);
        setDeleteItemId(null);
    }, [deleteItemType, deleteItemId, selectedProperty, dispatch]);

    const handleEditLoan = useCallback((loan: Loan) => {
        setViewModalVisible(false);
        checkSubscription(() => {
            navigation.navigate('AddLoanMortgage', { loan, isEdit: true, fromRealEstate: true });
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleEditUtility = useCallback((utility: Utility) => {
        setViewModalVisible(false);
        checkSubscription(() => {
            navigation.navigate('AddUtilities', { utility, isEdit: true });
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleEditInsurance = useCallback((insurance: any) => {
        setViewModalVisible(false);
        checkSubscription(() => {
            navigation.navigate('AddInsurance', { insurance, isEdit: true });
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleEditWarranty = useCallback((warranty: Warranty) => {
        setViewModalVisible(false);
        checkSubscription(() => {
            navigation.navigate('AddWarranties', { warranty, isEdit: true });
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleEditPropertyItem = useCallback((property: PropertyItem) => {
        setViewModalVisible(false);
        checkSubscription(() => {
            navigation.navigate('AddPersonalPropertyAtAddress', { property, isEdit: true });
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleEditService = useCallback((service: Service) => {
        setViewModalVisible(false);
        checkSubscription(() => {
            navigation.navigate('AddServicesWorkHistory', { service, isEdit: true });
        }, isBusinessRole() ? 'business' : 'personal');
    }, [navigation, checkSubscription, isBusinessRole]);

    const handleDeleteLoan = useCallback((loan: Loan) => {
        setViewModalVisible(false);
        handleDeleteItem(loan.id, 'loan');
    }, [handleDeleteItem]);

    const handleDeleteUtility = useCallback((utility: Utility) => {
        setViewModalVisible(false);
        handleDeleteItem(utility.id, 'utility');
    }, [handleDeleteItem]);

    const handleDeleteInsurance = useCallback((rental: Rental) => {
        setViewModalVisible(false);
        handleDeleteItem(rental.id, 'rental');
    }, [handleDeleteItem]);

    const handleDeleteWarranty = useCallback((warranty: Warranty) => {
        setViewModalVisible(false);
        handleDeleteItem(warranty.id, 'warranty');
    }, [handleDeleteItem]);

    const handleDeletePropertyItem = useCallback((property: PropertyItem) => {
        setViewModalVisible(false);
        handleDeleteItem(property.id, 'property_item');
    }, [handleDeleteItem]);

    const handleDeleteService = useCallback((service: Service) => {
        setViewModalVisible(false);
        handleDeleteItem(service.id, 'service');
    }, [handleDeleteItem]);

    const handleCloseViewModal = useCallback(() => {
        setViewModalVisible(false);
        setSelectedProperty(null);
        setViewingSharedOwner(null);
    }, []);

    const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

    const handleAddProperty = useCallback(() => {
        checkSubscription(() => navigation.navigate('AddRealEstate' as any, accessLevel ? { ownerUserId: currentConnectionUserId, from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } : {}), isBusinessRole() ? 'business' : 'personal');
    }, [navigation, accessLevel, currentConnectionUserId, from, connectionTabSource, sharedWithUserId, ownerId, accessType, checkSubscription, isBusinessRole]);

    const renderSharedRealEstateItem = (item: any, owner: SharedWithMeOwner) => {
        const canWrite = (item.accesslevel || item.accessLevel) === 'write';
        return (
            <TouchableOpacity
                style={styles.propertyCard}
                onPress={() => {
                    setSelectedProperty(item);
                    setViewModalVisible(true);
                    setViewingSharedOwner(owner);
                    dispatch(getRealStateOverviewByIdAsync({ id: item.id, ownerId: owner.id }));
                }}
                activeOpacity={0.7}
            >
                <View style={styles.propertyInfo}>
                    <Text style={styles.propertyName}>{item.name || item.nickname || item.streetaddress}</Text>
                    <Text style={styles.propertyAddress}>{item.address || item.streetaddress}</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'RealEstate', entityId: item.id, title: t('edit_history.title') })}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                    </TouchableOpacity>
                    {canWrite && (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleEditSharedPress(item, owner)}
                            activeOpacity={0.7}
                        >
                            <Feather name="edit-2" size={20} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderPropertyCard = useCallback((property: RealEstateProperty) => {
        const sold = isPropertySold(property.endSellDate);
        return (
            <TouchableOpacity onPress={() => handleViewPress(property)} key={property.id} style={[styles.propertyCard, sold && INACTIVE_CARD_STYLE]}>
                <View style={styles.propertyInfo}>
                    <Text style={styles.propertyName}>{property.name}</Text>
                    {sold && (
                        <View style={[styles.soldBadge, { backgroundColor: themeColors.primary }]}>
                            <Text style={styles.soldBadgeText}>{t('real_estate.sold_discarded')}</Text>
                        </View>
                    )}
                    <Text style={styles.propertyAddress}>{property.address}</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'RealEstate', entityId: property.id, title: t('edit_history.title') })}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                    </TouchableOpacity>
                    {shouldAllowShare && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(property)} activeOpacity={0.7}>
                            <Image source={ICONS.SHARE_PRIMARY_ICON} style={[styles.shareIcon, { tintColor: themeColors.secondary }]} />
                        </TouchableOpacity>
                    )}
                    {getItemWriteAccess(property) && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditPress(property)} activeOpacity={0.7}>
                            <Feather name="edit-2" size={20} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                    {shouldAllowShare && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePress(property)} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="delete-outline" size={22} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        )
    }, [themeColors.secondary, themeColors.primary, handleShare, handleViewPress, handleEditPress, handleDeletePress, navigation, t, isFromEmergencyAccess, writeAccess]);


    const getDeleteMessage = useCallback((): string => {
        if (deleteItemType === 'property' && selectedProperty) {
            return t('real_estate.delete_property_message', { name: selectedProperty.name });
        }
        return t('real_estate.delete_item_message');
    }, [deleteItemType, selectedProperty, t]);

    return (
        <LinearGradient
            colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
            locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
            style={styles.mainContainer}
        >
            <SafeAreaView style={styles.mainSafeArea}>
                <AuthHeader
                    onBackPress={handleBackPress}
                    containerStyle={styles.headerContainer}
                    backButtonStyle={styles.backButton}
                    titleStyle={styles.headerTitle}
                    backButtonIconStyle={styles.backButtonIcon}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.iconContainer}>
                        <Image source={ICONS.REAL_ESTATE_ICON} style={styles.icon} />
                        <Text style={styles.title}>{t('real_estate.title')}</Text>
                    </View>

                    <View style={styles.buttonsRow}>
                        {shouldAllowShare && (
                            <PrimaryButton
                                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                                title={t('real_estate.add_property')}
                                onPress={handleAddProperty}
                                buttonStyle={styles.addButton}
                                textStyle={styles.addButtonText}
                            />
                        )}
                        {(properties.length > 0 && shouldAllowShare) && (
                            <PrimaryButton
                                icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                                title={t('common.share')}
                                onPress={handleShare}
                                buttonStyle={[styles.shareButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                                textStyle={{color:themeColors?.isDark ? themeColors.background : themeColors.textPrimary}}
                            />
                        )}
                    </View>

                    {hasSold && (
                        <View style={styles.soldToggleRow}>
                            <Text style={styles.soldToggleLabel}>{t('real_estate.show_sold_discarded')}</Text>
                            <Switch
                                value={showSold}
                                onValueChange={setShowSold}
                                trackColor={{ false: themeColors.border, true: themeColors.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    )}

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={themeColors.primary} />
                            <Text style={styles.loadingText}>{t('common.loading')}</Text>
                        </View>
                    ) : (
                        <View style={styles.propertiesSection}>
                            <FlatList
                                data={displayedProperties}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => renderPropertyCard(item)}
                                ListEmptyComponent={
                                    <View style={styles.emptyStateContainer}>
                                        <View style={styles.emptyIconCircle}>
                                            <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
                                        </View>
                                        <Text style={styles.emptyText}>
                                            {isFromEmergencyAccess
                                                ? t('emergency_access_tab.no_data_emergency')
                                                : `${t('real_estate.no_properties_title')}. ${t('real_estate.no_properties_message')}`}
                                        </Text>
                                    </View>
                                }
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                    {showSharedWithMe && (
                        <SharedWithMeSection
                            thunkAction={getRealStateSharedWithMeAsync}
                            renderItem={renderSharedRealEstateItem}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>

            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                onShare={handleShareProperty}
                title={t('real_estate.share_real_estate')}
                resourceType={shareContext.resourceType}
                resourceId={shareContext.resourceId}
                businessId={currentBusinessId}
                loading={sharingLoading}
            />

            <DeleteConfirmModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteConfirm}
                title={t('real_estate.delete_property')}
                message={getDeleteMessage()}
            />

            <ViewRealEstateModal
                visible={viewModalVisible}
                onClose={handleCloseViewModal}
                property={realStatePropertyData}
                isLoading={isViewLoading}
                actionable={viewingSharedOwner
                    ? (realStatePropertyData?.accessLevel?.toLowerCase() === 'write' || realStatePropertyData?.accesslevel?.toLowerCase() === 'write')
                    : getItemWriteAccess(realStatePropertyData)}
                ownerUserId={viewingSharedOwner ? viewingSharedOwner.id : (accessLevel ? currentConnectionUserId : undefined)}
                onEditLoan={handleEditLoan}
                onEditUtility={handleEditUtility}
                onEditInsurance={handleEditInsurance}
                onEditWarranty={handleEditWarranty}
                onEditProperty={handleEditPropertyItem}
                onEditService={handleEditService}
                onDeleteLoan={handleDeleteLoan}
                onDeleteUtility={handleDeleteUtility}
                onDeleteInsurance={handleDeleteInsurance}
                onDeleteWarranty={handleDeleteWarranty}
                onDeleteProperty={handleDeletePropertyItem}
                onDeleteService={handleDeleteService}
                canDelete={!viewingSharedOwner && shouldAllowShare}
                linkTabs={{
                    record: realStatePropertyData?.id ? { moduleKey: 'realestate', id: Number(realStatePropertyData.id) } : null,
                    canEdit: viewingSharedOwner ? false : getItemWriteAccess(realStatePropertyData),
                    ownerUserId: viewingSharedOwner ? viewingSharedOwner.id : null,
                    onNavigate: handleCloseViewModal,
                }}
            />
            {GateModal}
        </LinearGradient>
    );
};

export default RealEstate;

/** Sold or discarded: its end/sell date is before today (same rule as the website). */
function isPropertySold(endSellDate?: string | null): boolean {
    if (!endSellDate) return false;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(endSellDate));
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(String(endSellDate));
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
}
