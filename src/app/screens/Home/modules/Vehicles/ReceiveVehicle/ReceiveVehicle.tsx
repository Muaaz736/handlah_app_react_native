import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeCommonStyles } from '../Vehicles.styles';
import { makeReceiveVehicleStyles } from './ReceiveVehicle.styles';

import { AuthHeader } from '../../../../../../components/common';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../../../../utils/colors';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../../utils/helpers';
import { IncomingVehicleTransfer } from './ReceiveVehicle.types';
import {
    getIncomingVehicleTransfersAsync,
    acceptVehicleTransferAsync,
    rejectVehicleTransferAsync,
} from '../../../../../../redux/services/assetsService';
import {
    resetAcceptVehicleTransferStatus,
    resetRejectVehicleTransferStatus,
} from '../../../../../../redux/slices/assetsSlice';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import MixedMediaDisplayer from '../../../../../../components/common/MixedMediaDisplayer';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';


const ReceiveVehicle = (): React.ReactElement => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(
        () => ({
            ...makeCommonStyles(themeColors as RoleTheme),
            ...makeReceiveVehicleStyles(themeColors as RoleTheme),
        }),
        [themeColors]
    );
    const { selectedBusinessId } = useSelectedBusiness();
    const dispatch = useDispatch<AppDispatch>();

    const [actioningId, setActioningId] = useState<number | null>(null);

    const assetsState = useSelector((state: any) => state.assets_slice);
    const transfersStatus = assetsState?.incoming_vehicle_transfers_status;
    const transfers: IncomingVehicleTransfer[] =
        (assetsState?.incoming_vehicle_transfers_data?.result?.transfers ?? []).filter(
            (t: IncomingVehicleTransfer) => {
                if (t.status !== 1) return false;
                return isBusinessRole() && selectedBusinessId
                    ? t.tobusinessid === selectedBusinessId
                    : !t.tobusinessid;
            },
        );
    const isLoading = transfersStatus === ASYNC_STATUS.LOADING;

    const acceptStatus = assetsState?.accept_vehicle_transfer_status;
    const rejectStatus = assetsState?.reject_vehicle_transfer_status;

    const fetchTransfers = useCallback(() => {
        const payload = isBusinessRole() && selectedBusinessId
            ? { businessId: selectedBusinessId }
            : undefined;
        dispatch(getIncomingVehicleTransfersAsync(payload));
    }, [dispatch, isBusinessRole, selectedBusinessId]);

    useEffect(() => {
        fetchTransfers();
    }, []);

    // On accept success — refetch & reset
    useEffect(() => {
        if (acceptStatus === ASYNC_STATUS.SUCCEEDED) {
            dispatch(resetAcceptVehicleTransferStatus());
            setActioningId(null);
            fetchTransfers();
        } else if (acceptStatus === ASYNC_STATUS.ERROR) {
            dispatch(resetAcceptVehicleTransferStatus());
            setActioningId(null);
        }
    }, [acceptStatus, dispatch, fetchTransfers]);

    // On reject success — refetch & reset
    useEffect(() => {
        if (rejectStatus === ASYNC_STATUS.SUCCEEDED) {
            dispatch(resetRejectVehicleTransferStatus());
            setActioningId(null);
            fetchTransfers();
        } else if (rejectStatus === ASYNC_STATUS.ERROR) {
            dispatch(resetRejectVehicleTransferStatus());
            setActioningId(null);
        }
    }, [rejectStatus, dispatch, fetchTransfers]);

    const handleAccept = useCallback((transferId: number) => {
        setActioningId(transferId);
        dispatch(acceptVehicleTransferAsync({ transferId }));
    }, [dispatch]);

    const handleReject = useCallback((transferId: number) => {
        setActioningId(transferId);
        dispatch(rejectVehicleTransferAsync({ transferId }));
    }, [dispatch]);

    const isActioning = acceptStatus === ASYNC_STATUS.LOADING || rejectStatus === ASYNC_STATUS.LOADING;

    const formatDate = (dateStr: string): string => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };



    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    title={t('vehicles.receive_vehicle')}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={{
                        paddingHorizontal: 16,
                        marginBottom: 0,
                        paddingTop: isIOS ? 0 : 20,
                    }}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{
                        marginBottom: 0,
                        marginTop: 20,
                        textAlign: 'left',
                    }}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={fetchTransfers}
                            tintColor={themeColors.primary}
                        />
                    }
                >
                    {transfers.length === 0 ? (
                        <Text
                            style={[
                                styles.fromText,
                                { textAlign: 'center', marginTop: 40, color: colors.gray },
                            ]}
                        >
                            {t('vehicles.no_incoming_transfers')}
                        </Text>
                    ) : (
                        transfers.map((transfer: any) => {
                            const isThis = actioningId === transfer.id && isActioning;
                            return (
                                <View key={transfer.id} style={[styles.transferCard, { marginBottom: 16 }]}>
                                    {/* Tracking number badge */}
                                    <View style={styles.vehicleHeader}>
                                        <Text style={[styles.vehicleName, { textAlign: 'left' }]}>
                                            {transfer.trackingnumber}
                                        </Text>
                                    </View>

                                    {/* From */}
                                    <Text style={[styles.fromText, { textAlign: 'left', marginBottom: 8 }]}>
                                        {t('vehicles.from')}:{' '}
                                        <Text style={[styles.emailText, { color: themeColors.secondary }]}>
                                            {transfer.fromusername}
                                        </Text>
                                    </Text>


                                    {transfer.vehicle.make && (
                                        <Text style={[styles.fromText, { textAlign: 'left', marginBottom: 8 }]}>
                                            {t('vehicles.make')}:{' '}
                                            <Text style={styles.emailText}>{transfer.vehicle.make}</Text>
                                        </Text>
                                    )}
                                    {transfer.vehicle.model && (
                                        <Text style={[styles.fromText, { textAlign: 'left', marginBottom: 8 }]}>
                                            {t('vehicles.model')}:{' '}
                                            <Text style={styles.emailText}>{transfer.vehicle.model}</Text>
                                        </Text>
                                    )}
                                    {/* Sale price */}
                                    {transfer.saleprice > 0 && (
                                        <Text style={[styles.fromText, { textAlign: 'left', marginBottom: 8 }]}>
                                            {t('vehicles.sale_price')}:{' '}
                                            <Text style={styles.emailText}>${transfer.saleprice}</Text>
                                        </Text>
                                    )}

                                    {/* Transfer date */}
                                    <Text style={[styles.fromText, { textAlign: 'left', marginBottom: 8 }]}>
                                        {t('vehicles.date')}:{' '}
                                        <Text style={styles.emailText}>{formatDate(transfer.transferdate)}</Text>
                                    </Text>

                                    {/* Notes */}
                                    {!!transfer.notes && (
                                        <Text style={[styles.fromText, { textAlign: 'left', marginBottom: 16 }]}>
                                            {transfer.notes}
                                        </Text>
                                    )}
                                    {transfer?.ownershipdocumenturl && transfer?.ownershipdocumenturl?.length > 0 && (
                                        <MixedMediaDisplayer attachmentIds={transfer?.ownershipdocumenturl} />
                                    )}

                                    {/* Action Buttons */}
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={[styles.cancelButton, { borderColor: themeColors.primary }]}
                                            onPress={() => handleReject(transfer.id)}
                                            disabled={isActioning}
                                            activeOpacity={0.7}
                                        >
                                            {isThis && rejectStatus === ASYNC_STATUS.LOADING ? (
                                                <ActivityIndicator size="small" color={themeColors.secondary} />
                                            ) : (
                                                <Text style={[styles.cancelButtonText, { color: themeColors.secondary }]}>
                                                    {t('vehicles.cancel')}
                                                </Text>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.acceptButton, { backgroundColor: themeColors.darkGreen }]}
                                            onPress={() => handleAccept(transfer.id)}
                                            disabled={isActioning}
                                            activeOpacity={0.7}
                                        >
                                            {isThis && acceptStatus === ASYNC_STATUS.LOADING ? (
                                                <ActivityIndicator size="small" color={colors.white} />
                                            ) : (
                                                <Text style={styles.acceptButtonText}>
                                                    {t('vehicles.accept_receive')}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default ReceiveVehicle;

