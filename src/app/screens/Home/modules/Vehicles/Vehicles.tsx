import {
    Image,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { INACTIVE_CARD_STYLE } from '../../../../../utils/recordStatus';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader,
    PrimaryButton,
    ShareModal,
    DeleteConfirmModal,
    ViewVehicleModal,
} from '../../../../../components/common';
import { makeVehiclesStyles } from './Vehicles.styles';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { isIOS } from '../../../../../utils/helpers';
import { Vehicle, ShareData, VehiclesNavigationProp } from './Vehicles.types';
import { orderVehicles } from '../../../../../utils/vehicleSort';
import { getVehiclesAsync, getVehicleByIdAsync, deleteVehicleAsync, getVehiclesSharedWithMeAsync, getIncomingVehicleTransfersAsync } from '../../../../../redux/services/assetsService';
import SharedWithMeSection from '../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { AppDispatch } from '../../../../../types/store.types';
import { darkenColor } from '../../../../../utils/roleManager';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { recordTabsWithExpenses } from '../../../../../components/recordLinks/recordTabs';

/** Sold / transferred vehicles are greyed out, like other inactive records. */
const SOLD_GREY = '#9A9E9A';

const Vehicles = (): React.ReactElement => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<VehiclesNavigationProp>();
    const { t } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(() => makeVehiclesStyles(themeColors as RoleTheme), [themeColors]);
    const { user_data } =
        useSelector((state: any) => state.user_auth);
    const { checkSubscription, GateModal } = useSubscriptionGate();
    const route = useRoute<any>();
    const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openEntityIdForEdit, openParentEntityId, openAccidentIdForEdit, openServiceRecordIdForEdit } = route.params || {};
    const isFromEmergencyAccess = from === 'emergency_access';
    const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
    const shouldShowReceiveButton = from === undefined && connectionTabSource === undefined;

    const getConnectionTabQueryParams = () => {
        if (connectionTabSource === 'yours' && sharedWithUserId) {
            return { sharedWithUserId };
        }
        if (connectionTabSource === 'shared_with_you' && ownerId) {
            return { ownerId };
        }
        return {};
    };

    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [viewingSharedOwner, setViewingSharedOwner] = useState<SharedWithMeOwner | null>(null);
    const [shareContext, setShareContext] = useState<{ resourceType: string; resourceId?: number }>({ resourceType: 'vehicle' });
    const [showSoldVehicles, setShowSoldVehicles] = useState(true);

    const { selectedBusinessId } = useSelectedBusiness();

    // Redux state
    const {
        get_vehicles_status,
        get_vehicles_data,
        get_vehicle_by_id_status,
        get_vehicle_by_id_data,
        delete_vehicle_status,
        incoming_vehicle_transfers_data,
    } = useSelector((state: any) => state.assets_slice);

    const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
    const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);

    const isLoading = get_vehicles_status === ASYNC_STATUS.LOADING;
    const isBusiness = isBusinessRole();
    const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
    const currentBusinessId = isBusiness ? selectedBusinessId : undefined;
    const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;

    const vehicles: Vehicle[] = (isBusiness && !selectedBusinessId && !isFromEmergencyAccess)
        ? []
        : (get_vehicles_data?.vehicles || []);

    const pendingReceiveCount: number = (
        (incoming_vehicle_transfers_data?.result?.transfers ?? []).filter((tr: any) => {
            if (tr.status !== 1) return false;
            return isBusiness && selectedBusinessId
                ? tr.tobusinessid === selectedBusinessId
                : !tr.tobusinessid;
        })
    ).length;

    const hasSoldVehicles = vehicles.some((vehicle) => vehicle.issold);
    // Same order as the website: active A–Z, then sold (not transferred), then sold and transferred.
    const displayedVehicles = orderVehicles(showSoldVehicles ? vehicles : vehicles.filter((vehicle) => !vehicle.issold));

    const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
    const getItemWriteAccess = (item: any) =>
        getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });

    useFocusEffect(useCallback(() => {
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

        dispatch(getVehiclesAsync(params));
    }, [dispatch, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId, selectedBusinessId, isBusiness, selectedSharedBusiness]));

    useFocusEffect(useCallback(() => {
        if (!shouldShowReceiveButton) return;
        const payload = isBusiness && selectedBusinessId ? { businessId: selectedBusinessId } : undefined;
        dispatch(getIncomingVehicleTransfersAsync(payload));
    }, [dispatch, shouldShowReceiveButton, isBusiness, selectedBusinessId]));

    // Handle delete success
    useEffect(() => {
        if (delete_vehicle_status === ASYNC_STATUS.SUCCEEDED) {
            setDeleteModalVisible(false);
            setSelectedVehicle(null);
            const params: any = getConnectionTabQueryParams();
            if (isFromEmergencyAccess && currentConnectionUserId) {
                (dispatch as any)(getVehiclesAsync({ userId: currentConnectionUserId, ...params }));
            } else if (isBusinessRole()) {
                (dispatch as any)(getVehiclesAsync({ businessId: selectedBusinessId, ...params }));
            } else {
                (dispatch as any)(getVehiclesAsync(params));
            }
        }
    }, [delete_vehicle_status, dispatch, isFromEmergencyAccess, currentConnectionUserId, selectedBusinessId]);

    const handleShare = useCallback((vehicle?: Vehicle) => {
        checkSubscription(() => {
            setShareContext({ resourceType: 'vehicle', resourceId: vehicle?.id });
            setShareModalVisible(true);
        }, isBusiness ? 'business' : 'personal');
    }, [checkSubscription, isBusiness]);

    const handleShareVehicle = useCallback((shareData: ShareData) => {
        const payload: any = { ...shareContext, users: shareData };
        if (currentBusinessId) payload.businessId = currentBusinessId;
        dispatch(sharingSyncService(payload));
    }, [dispatch, shareContext, currentBusinessId]);

    useEffect(() => {
        if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
            dispatch(resetShareSyncStatus());
            setShareModalVisible(false);
        } else if (share_sync_status === ASYNC_STATUS.ERROR) {
            dispatch(resetShareSyncStatus());
        }
    }, [share_sync_status, dispatch]);


    const fetchVehicleDetail = useCallback((vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setViewingSharedOwner(null);
        const params: any = { ...getConnectionTabQueryParams() };
        if (isBusiness && selectedBusinessId && !isFromEmergencyAccess) {
            if (connectionTabSource === "shared_with_you") {
                params.businessId = selectedSharedBusiness?.id;
            } else {
                params.businessId = selectedBusinessId;
            }
        }
        if (isFromEmergencyAccess && currentConnectionUserId) {
            params.userId = currentConnectionUserId;
            if (isBusiness) params.businessId = emergencyConnectionBusinessId;
        }
        (dispatch as any)(getVehicleByIdAsync({ ...params, id: vehicle.id }));
    }, [dispatch, isBusiness, selectedBusinessId, selectedSharedBusiness, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId]);

    const handleViewPress = useCallback((vehicle: Vehicle) => {
        fetchVehicleDetail(vehicle);
        setViewModalVisible(true);
    }, [fetchVehicleDetail]);

    const autoOpenedRef = useRef(false);
    useEffect(() => {
        if ((!openEntityId && !openParentEntityId) || autoOpenedRef.current) return;
        if (get_vehicles_status !== ASYNC_STATUS.SUCCEEDED) return;
        const vehicleList: Vehicle[] = get_vehicles_data?.vehicles || [];
        const target =
            (openParentEntityId != null
                ? vehicleList.find((v: Vehicle) => Number(v.id) === Number(openParentEntityId))
                : undefined) ??
            (openEntityId != null
                ? vehicleList.find((v: Vehicle) => Number(v.id) === Number(openEntityId)) ??
                vehicleList.find((v: any) =>
                    (v.servicerecords || []).some(
                        (r: any) => Number(r.id) === Number(openEntityId),
                    ),
                ) ??
                vehicleList.find((v: any) =>
                    (v.accidents || []).some(
                        (r: any) => Number(r.id) === Number(openEntityId),
                    ),
                )
                : undefined);
        if (target) {
            autoOpenedRef.current = true;

            if (openAccidentIdForEdit || openServiceRecordIdForEdit) {
                fetchVehicleDetail(target);
            } else {
                handleViewPress(target);
            }
        }
    }, [openEntityId, openParentEntityId, get_vehicles_status]);

    // Auto-open the edit form when navigated here for "Update Record"
    const autoOpenedForEditRef = useRef(false);
    useEffect(() => {
        if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
        if (get_vehicles_status !== ASYNC_STATUS.SUCCEEDED) return;
        const vehicleList: Vehicle[] = get_vehicles_data?.vehicles || [];
        const target = vehicleList.find((v: Vehicle) => Number(v.id) === Number(openEntityIdForEdit));
        if (target) {
            autoOpenedForEditRef.current = true;
            handleEditPress(target);
        }
    }, [openEntityIdForEdit, get_vehicles_status]);

    const autoOpenAccidentEditRef = useRef<number | null>(null);
    useEffect(() => {
        if (!openAccidentIdForEdit) return;
        if (autoOpenAccidentEditRef.current === Number(openAccidentIdForEdit)) return;
        if (get_vehicle_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
        const match = (get_vehicle_by_id_data?.accidents || []).find(
            (a: any) => Number(a.id) === Number(openAccidentIdForEdit),
        );
        if (match) {
            autoOpenAccidentEditRef.current = Number(openAccidentIdForEdit);
            (navigation as any).navigate('AddAccidents', {
                vehicleId: get_vehicle_by_id_data?.id ?? match.vehicleid,
                editAccident: match,
            });
        }
    }, [openAccidentIdForEdit, get_vehicle_by_id_status, get_vehicle_by_id_data]);
    const autoOpenServiceRecordEditRef = useRef<number | null>(null);
    useEffect(() => {
        if (!openServiceRecordIdForEdit) return;
        if (autoOpenServiceRecordEditRef.current === Number(openServiceRecordIdForEdit)) return;
        if (get_vehicle_by_id_status !== ASYNC_STATUS.SUCCEEDED) return;
        const match = (get_vehicle_by_id_data?.servicerecords || []).find(
            (r: any) => Number(r.id) === Number(openServiceRecordIdForEdit),
        );
        if (match) {
            autoOpenServiceRecordEditRef.current = Number(openServiceRecordIdForEdit);
            (navigation as any).navigate('AddServiceRecords', {
                vehicleId: get_vehicle_by_id_data?.id ?? match.vehicleid,
                editRecord: match,
            });
        }
    }, [openServiceRecordIdForEdit, get_vehicle_by_id_status, get_vehicle_by_id_data]);

    const handleEditPress = useCallback((vehicle: Vehicle) => {
        checkSubscription(() => navigation.navigate('AddVehicle', {
            vehicle,
            isEdit: true,
            ...(viewingSharedOwner ? { ownerUserId: viewingSharedOwner.id } : {}),
        } as any), isBusiness ? 'business' : 'personal');
    }, [navigation, viewingSharedOwner, checkSubscription, isBusiness]);

    const handleDeletePress = useCallback((vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setDeleteModalVisible(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (selectedVehicle?.id) {
            (dispatch as any)(deleteVehicleAsync(selectedVehicle.id));
        }
    }, [selectedVehicle, dispatch]);

    const renderSharedVehicleItem = (item: any, owner: SharedWithMeOwner) => {
        const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
        const vehicleFullyTransferred = !!(item?.issold && item?.istransferred);
        const vehicleName = `${item.make || ''} ${item.year || ''}${item.nickname ? ` - ${item.nickname}` : ''}`.trim();
        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedVehicle(item);
                    setViewingSharedOwner(owner);
                    dispatch(getVehicleByIdAsync({ id: item.id, ownerId: owner.id }));
                    setViewModalVisible(true);
                }}
                activeOpacity={0.7}
            >
                <View style={[styles.vehicleCard, item.issold && styles.vehicleCardSold, item.issold && INACTIVE_CARD_STYLE]}>
                    <View style={styles.vehicleInfo}>
                        <View style={styles.vehicleCardTopRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.vehicleName} numberOfLines={2}>{vehicleName}</Text>
                                {item.model && <Text style={styles.vehicleModel} numberOfLines={1}>{item.model}</Text>}
                                {item.vin && <Text style={styles.vehicleVin} numberOfLines={1}>VIN: {item.vin}</Text>}
                            </View>
                            {!vehicleFullyTransferred && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'Vehicle', entityId: item.id, title: t('edit_history.title') })}
                                    >
                                        <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                    {canWrite && (
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => checkSubscription(() => navigation.navigate('AddVehicle', { vehicle: item, isEdit: true, ownerUserId: owner.id } as any), isBusiness ? 'business' : 'personal')}
                                        >
                                            <Feather name="edit-2" size={18} color={themeColors.secondary} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                {vehicleFullyTransferred && (
                    <View style={[styles.soldBanner, { backgroundColor: SOLD_GREY }]}>
                        <Text style={styles.soldText}>{item?.istransferred ? t('vehicles.transferred') : t('vehicles.sold')}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderVehicleCard = useCallback((vehicle: Vehicle) => {
        const vehicleName = `${vehicle.make} ${vehicle.year}${vehicle.nickname ? ` - ${vehicle.nickname}` : ''}`;
        const serviceRecordsCount = vehicle.servicerecords?.length || 0;
        const accidentsCount = vehicle.accidents?.length || 0;

        return (
            <TouchableOpacity onPress={() => handleViewPress(vehicle)} key={vehicle.id}>
                <View
                    style={[
                        styles.vehicleCard,
                        vehicle.issold && styles.vehicleCardSold,
                        vehicle.issold && INACTIVE_CARD_STYLE,
                    ]}
                >
                    <View style={styles.vehicleInfo}>
                        <View style={styles.vehicleCardTopRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.vehicleName} numberOfLines={2}>{vehicleName}</Text>
                                <Text style={styles.vehicleModel} numberOfLines={1}>{vehicle.model}</Text>
                                {vehicle.vin && <Text style={styles.vehicleVin} numberOfLines={1}>VIN: {vehicle.vin}</Text>}
                            </View>
                            {!vehicle?.istransferred && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => (navigation as any).navigate('EditHistoryList', { entityType: 'Vehicle', entityId: vehicle.id, title: t('edit_history.title') })}
                                    >
                                        <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                    </TouchableOpacity>
                                    {shouldAllowShare && (
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(vehicle)}>
                                            <Image source={ICONS.SHARE_PRIMARY_ICON} style={[styles.actionIcon, { tintColor: themeColors.secondary }]} />
                                        </TouchableOpacity>
                                    )}
                                    {getItemWriteAccess(vehicle) && (
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditPress(vehicle)}>
                                            <Feather name="edit-2" size={18} color={themeColors.secondary} />
                                        </TouchableOpacity>
                                    )}
                                    {shouldAllowShare && (
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeletePress(vehicle)}>
                                            <Feather name="trash-2" size={18} color={themeColors.secondary} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View >
                        <View style={styles.badgesRow}>
                            <View style={[styles.badge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                <Text style={styles.badgeText}>
                                    {t('vehicles.service_records')} {serviceRecordsCount}
                                </Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                <Text style={styles.badgeText}>
                                    {t('vehicles.accidents')} {accidentsCount}
                                </Text>
                            </View>
                        </View>
                    </View >
                </View >
                {
                    vehicle?.latesttransfer &&
                    vehicle.id === vehicle.latesttransfer.vehicleid &&
                    (vehicle?.latesttransfer?.fromuserid === user_data.id || vehicle?.latesttransfer?.fromuserid === ownerId) && (
                        <View style={[styles.soldBanner, { backgroundColor: SOLD_GREY }]}>
                            <Text style={styles.soldText}>{vehicle?.istransferred ? t('vehicles.transferred') : t('vehicles.sold')}</Text>
                        </View>
                    )
                }
                {
                    isBusiness && vehicle?.latesttransfer?.tobusinessid && selectedBusinessId &&
                    vehicle.latesttransfer.tobusinessid === selectedBusinessId && (
                        <View style={[styles.soldBanner, { backgroundColor: themeColors.primary }]}>
                            <Text style={[styles.soldText, styles.soldTextColor]}>{`Received by ${vehicle.latesttransfer.fromusername}`}</Text>
                        </View>
                    )
                }
            </TouchableOpacity>
        );
    }, [handleShare, handleViewPress, handleEditPress, handleDeletePress, navigation, themeColors, t, themeColors, writeAccess]);

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
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.iconContainer}>
                        <Image source={ICONS.VEHICLE_SCREEN_ICON} style={styles.vehicleIcon} />
                        <Text style={[styles.title, { textAlign: 'center' }]}>{t('vehicles.title')}</Text>
                    </View>

                    <View style={[styles.buttonsRow, { flexDirection: 'row' }]}>
                        {shouldAllowShare && (
                            <PrimaryButton
                                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                                title={t('vehicles.add_vehicle')}
                                onPress={() => checkSubscription(() => navigation.navigate('AddVehicle' as any, accessLevel ? { ownerUserId: currentConnectionUserId, from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType } : undefined), isBusiness ? 'business' : 'personal')}
                                buttonStyle={styles.whiteButton}
                                textStyle={styles.blackText}
                            />
                        )}
                        {shouldShowReceiveButton && (
                            <PrimaryButton
                                title={pendingReceiveCount > 0
                                    ? `${t('vehicles.receive_vehicle')} (${pendingReceiveCount})`
                                    : t('vehicles.receive_vehicle')}
                                onPress={() => checkSubscription(() => navigation.navigate('ReceiveVehicle' as any), isBusiness ? 'business' : 'personal')}
                                buttonStyle={styles.whiteButton}
                                textStyle={styles.blackText}
                            />
                        )}
                        {shouldAllowShare && vehicles.length > 0 && (
                            <PrimaryButton
                                icon={<Fontisto name="share-a" size={13} color={colors.black} />}
                                title={t('common.share')}
                                onPress={() => handleShare()}
                                buttonStyle={[styles.shareActionButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                                textStyle={{ color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }}
                            />
                        )}
                    </View>

                    {hasSoldVehicles && (
                        <View style={styles.soldToggleRow}>
                            <Text style={styles.soldToggleLabel}>{t('vehicles.show_sold_vehicles')}</Text>
                            <Switch
                                value={showSoldVehicles}
                                onValueChange={setShowSoldVehicles}
                                trackColor={{ false: themeColors.border, true: themeColors.primary }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    )}

                    <View style={styles.vehiclesSection}>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={themeColors.primary} />
                                <Text style={styles.loadingText}>{t('common.loading')}</Text>
                            </View>
                        ) : displayedVehicles.length > 0 ? (
                            displayedVehicles.map(renderVehicleCard)
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyIconCircle}>
                                    <AntDesign name="exclamation" size={32} color="#888" />
                                </View>
                                <Text style={styles.emptyStateText}>
                                    {vehicles.length > 0
                                        ? t('vehicles.no_vehicles_match_filter')
                                        : t('vehicles.no_vehicles_empty_state')}
                                </Text>
                            </View>
                        )}
                    </View>
                    {showSharedWithMe && (
                        <SharedWithMeSection
                            thunkAction={getVehiclesSharedWithMeAsync}
                            renderItem={renderSharedVehicleItem}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>

            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                onShare={handleShareVehicle}
                title={t('vehicles.share_vehicle')}
                resourceType={shareContext.resourceType}
                resourceId={shareContext.resourceId}
                businessId={currentBusinessId}
                loading={sharingLoading}
            />

            <DeleteConfirmModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteConfirm}
                title={t('vehicles.delete_vehicle')}
                message={`${t('modals.delete_confirm')} ${selectedVehicle?.nickname || 'this vehicle'}?`}
                isLoading={delete_vehicle_status === ASYNC_STATUS.LOADING}
            />

            <ViewVehicleModal
                visible={viewModalVisible}
                onClose={() => {
                    setViewModalVisible(false);
                    setSelectedVehicle(null);
                    setViewingSharedOwner(null);
                }}
                actionable={viewingSharedOwner
                    ? ((get_vehicle_by_id_data || selectedVehicle)?.accessLevel?.toLowerCase() === 'write' || (get_vehicle_by_id_data || selectedVehicle)?.accesslevel?.toLowerCase() === 'write')
                    : getItemWriteAccess(get_vehicle_by_id_data || selectedVehicle)}
                vehicle={get_vehicle_by_id_data || selectedVehicle}
                isLoading={get_vehicle_by_id_status === ASYNC_STATUS.LOADING}
                accessLevel={get_vehicle_by_id_data?.accessLevel}
                ownerUserId={viewingSharedOwner ? viewingSharedOwner.id : (accessLevel ? currentConnectionUserId : undefined)}
                shareParams={route.params}
                canDelete={viewingSharedOwner
                    ? ((get_vehicle_by_id_data || selectedVehicle)?.accessLevel?.toLowerCase() === 'write' || (get_vehicle_by_id_data || selectedVehicle)?.accessLevel?.toLowerCase() === 'full')
                    : (shouldAllowShare && !selectedVehicle?.accessLevel)}
                linkTabs={recordTabsWithExpenses(
                    (get_vehicle_by_id_data || selectedVehicle)?.id ? { moduleKey: 'vehicle', id: Number((get_vehicle_by_id_data || selectedVehicle).id) } : null,
                    {
                        canEdit: viewingSharedOwner ? false : getItemWriteAccess(get_vehicle_by_id_data || selectedVehicle),
                        ownerUserId: viewingSharedOwner ? viewingSharedOwner.id : null,
                        onNavigate: () => { setViewModalVisible(false); setSelectedVehicle(null); setViewingSharedOwner(null); },
                    },
                )}
            />
            {GateModal}
        </LinearGradient>
    );
};

export default Vehicles;