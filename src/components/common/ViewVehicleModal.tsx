import React, { useCallback, useMemo } from 'react';
import { RecordNotesView } from '../notes/RecordNotesView';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import colors, { getColorWithOpacity } from '../../utils/colors';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness';
import { useSubscriptionGate } from '../../hooks/useSubscriptionGate';
import { RemoteImage } from './index';
import { downloadAndOpenDocument, getDocumentUrl } from '../../utils/helpers';
import type { ViewVehicleModalProps } from '../../types/common.types';
import {
    deleteVehicleServiceRecordAsync,
    getVehicleByIdAsync
} from '../../redux/services/assetsService';
import {
    deleteInsuranceAsync,
    deleteLoanAsync,
    deleteWarrantyAsync
} from '../../redux/services/liabilitiesService';
import { getDropdownOptionsAsync, getVehicleAccidentsTypesAsync } from '../../redux/services/authService';
import { getBusinessesAsync } from '../../redux/services/businessService';
import MixedMediaDisplayer from './MixedMediaDisplayer';
import { makeViewVehicleModalStyles } from './ViewVehicleModal.styles';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';
import { RecordViewTabs, type RecordLinkTabsProp } from '../recordLinks/RecordViewTabs';
import { LinkedRecordsButton } from '../recordLinks/LinkedRecordsButton';
import CopyableText from './CopyableText';

const ViewVehicleModal: React.FC<ViewVehicleModalProps & RecordLinkTabsProp> = ({ linkTabs, visible, onClose, vehicle, isLoading, actionable = true, ownerUserId, shareParams, canDelete }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(() => makeViewVehicleModalStyles(themeColors as RoleTheme), [themeColors]);
    const { user_data } = useSelector((state: any) => state.user_auth);
    const { selectedBusinessId, businesses } = useSelectedBusiness();
    const { checkSubscription, GateModal } = useSubscriptionGate();

    const resolveTransferBusinessName = useCallback((transfer: any): string | null => {
        if (!transfer?.tobusinessid) return null;
        if (transfer.tobusinessname) return transfer.tobusinessname;
        const match = Array.isArray(businesses)
            ? businesses.find((b: any) => b?.id === transfer.tobusinessid)
            : null;
        return match?.businessname || null;
    }, [businesses]);

    const transferBusinessName = useMemo(
        () => resolveTransferBusinessName(vehicle?.latesttransfer),
        [vehicle?.latesttransfer, resolveTransferBusinessName],
    );

    const previousTransferBusinessName = useMemo(
        () => resolveTransferBusinessName(vehicle?.previoustransfer),
        [vehicle?.previoustransfer, resolveTransferBusinessName],
    );

    const isReceivedByCurrentBusiness = !!(
        isBusinessRole() &&
        selectedBusinessId &&
        vehicle?.latesttransfer?.tobusinessid === selectedBusinessId
    );

    const shouldShowSellTransfer = actionable && !ownerUserId && !vehicle?.istransferred;

    // Normalise to array of IDs
    const toIds = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.filter(Boolean);
        return [val];
    };


    const { get_dropdown_options_data, get_vehicle_accidents_types_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        (dispatch as any)(getVehicleAccidentsTypesAsync());
        (dispatch as any)(getDropdownOptionsAsync('VehicleServiceType'));
        (dispatch as any)(getBusinessesAsync());
    }, [dispatch]));

    const handleDownloadDocument = async (documentId: string) => {
        onClose();
        try {
            const fullUrl = getDocumentUrl(documentId);
            await downloadAndOpenDocument(fullUrl || 'document.pdf');
        } catch (error) {
            Alert.alert(t('common.error') || 'Error', t('bookmarks.download_failed') || 'Failed to download document');
        }
    };

    const renderAttachments = (val: any, label: string) => {
        const ids = toIds(val);
        if (ids.length === 0) return null;
        return (
            <>
                {ids.map((id, i) => (
                    <TouchableOpacity
                        key={i}
                        style={styles.attachmentRow}
                        onPress={() => handleDownloadDocument(id)}
                    >
                        <Text style={[styles.attachmentText, { color: themeColors.primary }]}>
                            {label}{ids.length > 1 ? ` ${i + 1}` : ''}
                        </Text>
                        <Ionicons name="download-outline" size={16} color={themeColors.primary} />
                    </TouchableOpacity>
                ))}
            </>
        );
    };

    const handleSellTransfer = (): void => {
        onClose();
        checkSubscription(() => {
            if (vehicle?.latesttransfer && vehicle.latesttransfer.isseller) {
                (navigation as any).navigate('SellTransferVehicle', { saleRecord: vehicle.latesttransfer });
            } else {
                (navigation as any).navigate('SellTransferVehicle', { vehicleId: vehicle?.id });
            }
        }, isBusinessRole() ? 'business' : 'personal');
    };

    const navigateToHistory = (entityType: string, entityId: number) => {
        onClose();
        (navigation as any).navigate('EditHistoryList', {
            entityType,
            entityId,
            title: t('edit_history.title'),
        });
    };

    const handleEditServiceRecord = (vehicleId: number, record: any) => {
        onClose();
        checkSubscription(() => (navigation as any).navigate('AddServiceRecords', {
            vehicleId,
            editRecord: record,
        }), isBusinessRole() ? 'business' : 'personal');
    };

    const handleDeleteServiceRecord = async (vehicleId: number, recordId: number) => {
        await (dispatch as any)(deleteVehicleServiceRecordAsync({ vehicleId, recordId }));
        (dispatch as any)(getVehicleByIdAsync({ id: vehicleId }));
    };

    const handleEditAccident = (vehicleId: number, accident: any) => {
        onClose();
        checkSubscription(() => (navigation as any).navigate('AddAccidents', {
            vehicleId,
            editAccident: accident,
        }), isBusinessRole() ? 'business' : 'personal');
    };

    const handleDeleteAccident = async (vehicleId: number, accidentId: number) => {
        (dispatch as any)(getVehicleByIdAsync({ id: vehicleId }));
    };

    const handleEditLoan = (loan: any) => {
        onClose();
        checkSubscription(() => (navigation as any).navigate('AddPurchaseFinancing', {
            vehicleId: loan.vehicleid,
            editLoan: loan,
        }), isBusinessRole() ? 'business' : 'personal');
    };

    const handleDeleteLoan = async (vehicleId: number, loanId: number) => {
        await (dispatch as any)(deleteLoanAsync(loanId));
        (dispatch as any)(getVehicleByIdAsync({ id: vehicleId }));
    };

    const handleEditInsurance = (insurance: any) => {
        onClose();
        checkSubscription(() => (navigation as any).navigate('AddVehicleInsurance', {
            vehicleId: insurance.vehicleid,
            editInsurance: insurance,
        }), isBusinessRole() ? 'business' : 'personal');
    };

    const handleDeleteInsurance = async (vehicleId: number, insuranceId: number) => {
        await (dispatch as any)(deleteInsuranceAsync(insuranceId));
        (dispatch as any)(getVehicleByIdAsync({ id: vehicleId }));
    };

    const handleEditWarranty = (warranty: any) => {
        onClose();
        checkSubscription(() => (navigation as any).navigate('AddVehicleWarranty', {
            vehicleId: warranty.vehicleid,
            editWarranty: warranty,
            shareParams,
        }), isBusinessRole() ? 'business' : 'personal');
    };

    const handleDeleteWarranty = async (vehicleId: number, warrantyId: number) => {
        await (dispatch as any)(deleteWarrantyAsync(warrantyId));
        (dispatch as any)(getVehicleByIdAsync({ id: vehicleId }));
    };

    if (!vehicle) return null;

    const vehicleName = `${vehicle.make} ${vehicle.year}${vehicle.nickname ? ` - ${vehicle.nickname}` : ''}`;
    const serviceRecords = vehicle.servicerecords || [];
    const accidents = vehicle.accidents || [];
    const loans = vehicle.loans || [];
    const insurances = vehicle.insurances || [];
    const warranties = vehicle.warranties || [];

    const totalServiceCost = serviceRecords.reduce((sum: number, record: any) => sum + (record.cost || 0), 0);

    const vehicleTypeDisplay = vehicle.vehicletypelabel === 'Other'
        ? (vehicle.vehicletypeother || vehicle.vehicletypelabel)
        : (vehicle.vehicletypelabel || '-');
    const registrationTypeDisplay = vehicle.registrationtypelabel === 'Other'
        ? (vehicle.registrationtypeother || vehicle.registrationtypelabel)
        : (vehicle.registrationtypelabel || '-');
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleAddNew = (screenName: string) => {
        onClose();
        checkSubscription(
            () => (navigation as any).navigate(screenName, { vehicleId: vehicle.id, addNew: true, ...(ownerUserId ? { ownerUserId } : {}) }),
            isBusinessRole() ? 'business' : 'personal',
        );
    }

    const renderTransferCard = (transfer: any, businessName: string | null) => (
        <View style={[styles.itemCard, { borderBottomWidth: 0 }]}>
            <View style={styles.detailsGrid}>
                {transfer.transferdate ? (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('vehicles.transfer_date')}</Text>
                        <Text style={styles.detailValue}>{formatDate(transfer.transferdate)}</Text>
                    </View>
                ) : null}
                {transfer.saleprice ? (
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('vehicles.sale_price')}</Text>
                        <Text style={styles.detailValue}>${transfer.saleprice.toLocaleString()}</Text>
                    </View>
                ) : null}
            </View>

            {transfer.trackingnumber ? (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('vehicles.tracking_number')}</Text>
                    <Text style={styles.detailValue}>{transfer.trackingnumber}</Text>
                </View>
            ) : null}

            {transfer.isseller ? (
                <>
                    {(transfer.touserfullname || transfer.tousername) ? (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('vehicles.buyer')}</Text>
                            <Text style={styles.detailValue}>
                                {transfer.touserfullname || transfer.tousername}
                                {transfer.touserfullname && transfer.tousername ? (
                                    <Text style={styles.detailValueMuted}> @{transfer.tousername}</Text>
                                ) : null}
                            </Text>
                        </View>
                    ) : null}
                    {businessName ? (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{t('vehicles.to_business')}</Text>
                            <Text style={styles.detailValue}>{businessName}</Text>
                        </View>
                    ) : null}
                </>
            ) : (
                (transfer.fullname || transfer.fromusername) ? (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t('vehicles.sold_by')}</Text>
                        <Text style={styles.detailValue}>
                            {transfer.fullname || transfer.fromusername}
                            {transfer.fullname && transfer.fromusername ? (
                                <Text style={styles.detailValueMuted}> @{transfer.fromusername}</Text>
                            ) : null}
                        </Text>
                    </View>
                ) : null
            )}

            {transfer.notes ? (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('vehicles.notes')}</Text>
                    <Text style={styles.detailValue}>{transfer.notes}</Text>
                </View>
            ) : null}
            {transfer.additionalcomments ? (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('vehicles.additional_comments')}</Text>
                    <Text style={styles.detailValue}>{transfer.additionalcomments}</Text>
                </View>
            ) : null}
            {transfer.ownershipdocumenturl?.length > 0 && (
                <MixedMediaDisplayer
                    attachmentIds={transfer.ownershipdocumenturl}
                    showDocHeading={false}
                />
            )}
        </View>
    );

    return (
        <>
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* <TouchableWithoutFeedback> */}
                <View style={styles.modalWrapper}>
                    <View style={styles.modalContainer}>

                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={themeColors.primary} />
                                <Text style={styles.loadingText}>{t('common.loading')}</Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                bounces={true}
                            >
                                <TouchableOpacity style={styles.xCloseButton} onPress={onClose}>
                                    <Text style={styles.xCloseButtonText}>✕</Text>
                                </TouchableOpacity>
                                <RecordViewTabs {...linkTabs} topInset={44} onNavigate={linkTabs?.onNavigate ?? onClose} showNotes={false}>
                                <View style={styles.vehicleCard}>
                                    <MixedMediaDisplayer
                                        attachmentIds={[
                                            ...(Array.isArray(vehicle?.attachmenturl) ? vehicle.attachmenturl : []),
                                            ...(Array.isArray(vehicle?.carfaxrecordurl) ? vehicle.carfaxrecordurl : []),
                                            ...(Array.isArray(vehicle?.additionalattachments) ? vehicle.additionalattachments : [])
                                        ]}
                                    />
                                    <View style={styles.vehicleHeader}>
                                        <View style={styles.vehicleHeaderText}>
                                            <Text style={styles.vehicleTitle}>
                                                {vehicleName}
                                            </Text>
                                            <View style={[styles.modelBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                <Text style={styles.modelBadgeText}>{vehicle.model}</Text>
                                            </View>
                                            {isReceivedByCurrentBusiness ? (
                                                <View style={[styles.modelBadge, { backgroundColor: themeColors.primary, marginTop: 6 }]}>
                                                    <Text style={[styles.modelBadgeText, { color: '#FFFFFF' }]}>
                                                        {`Received by ${vehicle.latesttransfer.fromusername}`}
                                                    </Text>
                                                </View>
                                            ) : vehicle.latesttransfer &&
                                                vehicle.id === vehicle.latesttransfer.vehicleid &&
                                                (vehicle.latesttransfer.fromuserid === user_data.id || vehicle.latesttransfer.fromuserid === ownerUserId) ? (
                                                <View style={[styles.modelBadge, { backgroundColor: vehicle.istransferred ? '#E57C00' : '#C0392B', marginTop: 6 }]}>
                                                    <Text style={[styles.modelBadgeText, { color: '#FFFFFF' }]}>
                                                        {vehicle.istransferred ? t('vehicles.transferred') : t('vehicles.sold')}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>

                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>{t('vehicles.vin')}</Text>
                                            <CopyableText style={styles.detailValue} value={vehicle.vin} label={t('vehicles.vin')} />
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>{t('vehicles.plate')}</Text>
                                            <CopyableText style={styles.detailValue} value={vehicle.plate} label={t('vehicles.plate')} />
                                        </View>
                                    </View>

                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>{t('vehicles.color')}</Text>
                                            <Text style={styles.detailValue}>{vehicle.color || 'N/A'}</Text>
                                        </View>
                                        {vehicle.condition ? (
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailLabel}>{t('vehicles.buy_condition')}</Text>
                                                <Text style={styles.detailValue}>{vehicle.condition}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    {vehicleTypeDisplay ? (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{t('vehicles.vehicle_type')}</Text>
                                            <Text style={styles.detailValue}>{vehicleTypeDisplay}</Text>
                                        </View>
                                    ) : null}

                                    {registrationTypeDisplay ? (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{t('vehicles.registration_type')}</Text>
                                            <Text style={styles.detailValue}>{registrationTypeDisplay}</Text>
                                        </View>
                                    ) : null}

                                    {vehicle.registeredaddress ? (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{t('vehicles.registered_address')}</Text>
                                            <Text style={styles.detailValue}>{vehicle.registeredaddress}</Text>
                                        </View>
                                    ) : null}

                                    {(vehicle.registrationdate || vehicle.registrationexpiry) ? (
                                        <View style={styles.detailsGrid}>
                                            {vehicle.registrationdate ? (
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>{t('vehicles.registration_date')}</Text>
                                                    <Text style={styles.detailValue}>{formatDate(vehicle.registrationdate)}</Text>
                                                </View>
                                            ) : null}
                                            {vehicle.registrationexpiry ? (
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>{t('vehicles.registration_expiry')}</Text>
                                                    <Text style={styles.detailValue}>{formatDate(vehicle.registrationexpiry)}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : null}

                                    {(vehicle.purchaseddate || vehicle.purchasedDate || vehicle.purchasedprice) ? (
                                        <View style={styles.detailsGrid}>
                                            {(vehicle.purchaseddate || vehicle.purchasedDate) ? (
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>{t('vehicles.purchased_date')}</Text>
                                                    <Text style={styles.detailValue}>{formatDate(vehicle.purchaseddate || vehicle.purchasedDate)}</Text>
                                                </View>
                                            ) : null}
                                            {vehicle.purchasedprice ? (
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>{t('vehicles.purchased_price')}</Text>
                                                    <Text style={styles.detailValue}>${vehicle.purchasedprice}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : null}

                                    {(vehicle.solddate || vehicle.soldDate || vehicle.buyerusername) ? (
                                        <View style={styles.detailsGrid}>
                                            {(vehicle.solddate || vehicle.soldDate) ? (
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>{t('vehicles.sold_date')}</Text>
                                                    <Text style={styles.detailValue}>{formatDate(vehicle.solddate || vehicle.soldDate)}</Text>
                                                </View>
                                            ) : null}
                                            {vehicle.buyerusername ? (
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>{t('vehicles.sold_to')}</Text>
                                                    <Text style={styles.detailValue}>{vehicle.buyerusername}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : null}

                                    {/* Notes stay editable here, even on a sold / transferred vehicle (its other details are read-only). */}
                                    {vehicle?.id ? (
                                        <RecordNotesView moduleKey="vehicle" recordId={Number(vehicle.id)} editable={linkTabs?.canEdit !== false} />
                                    ) : null}

                                    {/* Service Records */}
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTitleContainer}>
                                                <Text style={styles.sectionTitle}>{t('vehicles.service_records')} ({serviceRecords.length})</Text>
                                                {!vehicle?.istransferred && actionable && (
                                                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddServiceRecords')}>
                                                        <Feather name="plus" size={18} color={colors.black} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <Text style={styles.totalAmount}>{t('common.total')}: ${totalServiceCost.toFixed(2)}</Text>
                                        </View>

                                        {serviceRecords.map((record: any, index: number) => (
                                            <View key={record.id} style={[styles.itemCard, { borderBottomWidth: index === serviceRecords.length - 1 ? 0 : 0.5 }]}>
                                                <View style={styles.itemHeader}>
                                                    <Text style={styles.itemName}>
                                                        {Array.isArray(record.type)
                                                            ? (record.type.map((t: string) => get_dropdown_options_data?.find((option: any) => String(option.value) === String(t))?.label).filter(Boolean).join(', ') || '-')
                                                            : (get_dropdown_options_data?.find((option: any) => String(option.value) === String(record.type))?.label || '-')
                                                        }
                                                    </Text>

                                                    <View style={styles.itemActions}>
                                                        <View style={[styles.amountBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                            <Text style={styles.amountText}>${record.cost}</Text>
                                                        </View>

                                                        {!vehicle?.istransferred && (
                                                            <>
                                                                <LinkedRecordsButton
                                                                    record={record?.id ? { moduleKey: 'vehicleservice', id: Number(record.id) } : null}
                                                                    canEdit={!!actionable && !ownerUserId}
                                                                    ownerUserId={ownerUserId ?? null}
                                                                />
                                                                <TouchableOpacity
                                                                    style={styles.actionButton}
                                                                    onPress={() => navigateToHistory('VehicleServiceRecord', record.id)}
                                                                >
                                                                    <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                                                </TouchableOpacity>

                                                                {actionable && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleEditServiceRecord(vehicle.id, record)}
                                                                    >
                                                                        <Feather name="edit-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                                {canDelete && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleDeleteServiceRecord(vehicle.id, record.id)}
                                                                    >
                                                                        <Feather name="trash-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </>
                                                        )}
                                                    </View>
                                                </View>
                                                <Text style={styles.itemDetail}>{record.vendor} - {formatDate(record.date)}</Text>
                                                <Text style={styles.itemDetail}>{t('common.odometer')}: {record.odometer}</Text>
                                                {record.notes && <Text style={styles.itemNotes}>{record.notes}</Text>}
                                                {(Array.isArray(record.attachment) ? record.attachment.length > 0 : !!record.attachment) && (
                                                    <MixedMediaDisplayer
                                                        attachmentIds={record.attachment}
                                                        showDocHeading={false}
                                                    />
                                                )}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Accidents */}
                                    <View style={styles.section}>
                                        <View style={styles.sectionTitleContainer}>
                                            <Text style={styles.sectionTitle}>{t('vehicles.accidents')} ({accidents.length})</Text>
                                            {!vehicle?.istransferred && actionable && (
                                                <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddAccidents')}>
                                                    <Feather name="plus" size={18} color={colors.black} />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {accidents.map((accident: any, index: number) => (
                                            <View key={accident.id} style={[styles.itemCard, { borderBottomWidth: index === accidents.length - 1 ? 0 : 0.5 }]}>
                                                <View style={styles.itemHeader}>
                                                    <View>
                                                        <Text style={styles.itemName}>{accident.damage}</Text>
                                                        <Text style={styles.itemName}>{formatDate(accident.date)}</Text>
                                                    </View>
                                                    <View style={styles.itemActions}>

                                                        <View style={[styles.amountBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                            <Text style={styles.amountText}>${accident.totalrepaircost}</Text>
                                                        </View>
                                                        {!vehicle?.istransferred && (
                                                            <>
                                                                <LinkedRecordsButton
                                                                    record={accident?.id ? { moduleKey: 'vehicleaccident', id: Number(accident.id) } : null}
                                                                    canEdit={!!actionable && !ownerUserId}
                                                                    ownerUserId={ownerUserId ?? null}
                                                                />
                                                                <TouchableOpacity
                                                                    style={styles.actionButton}
                                                                    onPress={() => navigateToHistory('VehicleAccident', accident.id)}
                                                                >
                                                                    <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                                                </TouchableOpacity>
                                                                {actionable && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleEditAccident(vehicle.id, accident)}
                                                                    >
                                                                        <Feather name="edit-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                                {canDelete && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleDeleteAccident(vehicle.id, accident.id)}
                                                                    >
                                                                        <Feather name="trash-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </>
                                                        )}
                                                    </View>
                                                </View>
                                                <Text style={styles.itemDetail}>{t('vehicles.repair_dates')}: {" "}{formatDate(accident.repairdatefrom)} - {formatDate(accident.repairdateto)}</Text>
                                                <Text style={[styles.itemDetailGreen, { color: themeColors.primary }]}>{t('vehicles.insurance')}: {get_vehicle_accidents_types_data?.find((type: any) => String(type.value) === String(accident.insurancetype))?.label || '-'}</Text>
                                                <Text style={styles.itemDetail}>{t('vehicles.shop')}: {accident.shop}</Text>
                                                {accident.claimnumber && <Text style={styles.itemDetail}>{t('common.claim_number')}: {accident.claimnumber}</Text>}
                                                {(Array.isArray(accident.attachmentbefore) ? accident.attachmentbefore.length > 0 : !!accident.attachmentbefore) && (
                                                    <>
                                                        <Text style={styles.attachmentLabel}>{t('vehicles.before_photo')}</Text>
                                                        <RemoteImage
                                                            imageIds={Array.isArray(accident.attachmentbefore) ? accident.attachmentbefore : [accident.attachmentbefore]}
                                                            style={styles.cardAttachment}
                                                        />
                                                    </>
                                                )}
                                                {(Array.isArray(accident.attachmentafter) ? accident.attachmentafter.length > 0 : !!accident.attachmentafter) && (
                                                    <>
                                                        <Text style={styles.attachmentLabel}>{t('vehicles.after_photo')}</Text>
                                                        <RemoteImage
                                                            imageIds={Array.isArray(accident.attachmentafter) ? accident.attachmentafter : [accident.attachmentafter]}
                                                            style={styles.cardAttachment}
                                                        />
                                                    </>
                                                )}
                                                {(Array.isArray(accident.policereporturl) ? accident.policereporturl.length > 0 : !!accident.policereporturl) && (
                                                    <>
                                                        <Text style={styles.attachmentLabel}>{t('vehicles.police_report')}</Text>
                                                        <MixedMediaDisplayer
                                                            attachmentIds={accident.policereporturl}
                                                            showDocHeading={false}
                                                        />
                                                    </>
                                                )}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Loans */}
                                    <View style={styles.section}>
                                        <View style={styles.sectionTitleContainer}>
                                            <Text style={styles.sectionTitle}>{t('vehicles.purchase_financing_tab')}</Text>
                                            {!vehicle?.istransferred && actionable && (
                                                <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddPurchaseFinancing')}>
                                                    <Feather name="plus" size={18} color={colors.black} />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {loans.map((loan: any, index: number) => (
                                            <View key={loan.id} style={[styles.itemCard, { borderBottomWidth: index === loans.length - 1 ? 0 : 0.5 }]}>
                                                <View style={styles.itemHeader}>
                                                    <Text style={styles.itemName}>{loan.lenderprovider}</Text>

                                                    <View style={styles.itemActions}>
                                                        <View style={[styles.amountBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                            <Text style={styles.amountText}>${loan.monthlypayment}</Text>
                                                        </View>
                                                        {!vehicle?.istransferred && (
                                                            <>
                                                                <TouchableOpacity
                                                                    style={styles.actionButton}
                                                                    onPress={() => navigateToHistory('Loan', loan.id)}
                                                                >
                                                                    <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                                                </TouchableOpacity>
                                                                {actionable && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleEditLoan(loan)}
                                                                    >
                                                                        <Feather name="edit-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                                {canDelete && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleDeleteLoan(vehicle.id, loan.id)}
                                                                    >
                                                                        <Feather name="trash-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </>)}
                                                    </View>
                                                </View>
                                                <Text style={styles.itemDetail}>{loan.lenderlocation}</Text>
                                                <Text style={[styles.itemDetailGreen, { color: themeColors.primary }]}>{t('vehicles.phone')}: {loan.lenderphonenumber}</Text>
                                                <Text style={styles.itemDetail}>{t('common.email')}: {loan.lenderemail}</Text>
                                                <Text style={styles.itemDetail}>{t('vehicles.account_number')}: {loan.accountnumber} | {t('vehicles.balance')}: ${loan.balance}</Text>
                                                <Text style={styles.itemDetail}>{t('vehicles.est_balance')}: ${loan.estbalance}</Text>
                                                <Text style={styles.itemDetail}>{formatDate(loan.startdate)} - {formatDate(loan.enddate)} | {t('vehicles.due_day')}: {loan.dueday}</Text>
                                                <Text style={styles.itemDetail}>{t('vehicles.rate_percentage')}: {loan.ratepercent}%</Text>
                                                {loan.uploadattachments && loan.uploadattachments.length > 0 && (
                                                    <MixedMediaDisplayer
                                                        attachmentIds={loan.uploadattachments}
                                                        showDocHeading={false}
                                                    />
                                                )}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Insurance */}
                                    <View style={styles.section}>
                                        <View style={styles.sectionTitleContainer}>
                                            <Text style={styles.sectionTitle}>{t('vehicles.insurance_tab')}</Text>
                                            {!vehicle?.istransferred && actionable && (
                                                <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddVehicleInsurance')}>
                                                    <Feather name="plus" size={18} color={colors.black} />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {insurances.map((insurance: any, index: number) => (
                                            <View key={insurance.id} style={[styles.itemCard, { borderBottomWidth: index === insurances.length - 1 ? 0 : 0.5 }]}>
                                                <View style={styles.itemHeader}>
                                                    <Text style={styles.itemName}>{insurance.itemname}</Text>

                                                    <View style={styles.itemActions}>
                                                        <View style={[styles.amountBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                            <Text style={styles.amountText}>${insurance.annualpremium}</Text>
                                                        </View>
                                                        {!vehicle?.istransferred && (
                                                            <>
                                                                <TouchableOpacity
                                                                    style={styles.actionButton}
                                                                    onPress={() => navigateToHistory('Insurance', insurance.id)}
                                                                >
                                                                    <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                                                </TouchableOpacity>
                                                                {actionable && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleEditInsurance(insurance)}
                                                                    >
                                                                        <Feather name="edit-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                                {canDelete && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleDeleteInsurance(vehicle.id, insurance.id)}
                                                                    >
                                                                        <Feather name="trash-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </>
                                                        )}
                                                    </View>
                                                </View>
                                                <Text style={styles.itemDetail}>{insurance.insurancecarrier}</Text>
                                                <Text style={[styles.itemDetailGreen, { color: themeColors.primary }]}>{t('vehicles.phone')}: {insurance.agentphone}</Text>
                                                <Text style={styles.itemDetail}>{t('common.email')}: {insurance.agentemail}</Text>
                                                <Text style={styles.itemDetail}>{t('vehicles.policy')} #: {insurance.policynumber}</Text>
                                                <Text style={styles.itemDetail}>{t('common.agent_label')}: {insurance.agent}</Text>
                                                <Text style={styles.itemDetail}>{formatDate(insurance.startdate)} - {formatDate(insurance.enddate)} | {t('vehicles.due_day')}: {insurance.dueday}</Text>
                                                <Text style={styles.itemDetail}>{t('vehicles.renewal_date')}: {formatDate(insurance.renewaldate)}</Text>
                                                {/* {renderAttachments(insurance.uploadattachments, t('common.attachment_label') || 'Attachment')} */}
                                                {insurance.uploadattachments && insurance.uploadattachments.length > 0 && (
                                                    <MixedMediaDisplayer
                                                        attachmentIds={insurance.uploadattachments}
                                                        showDocHeading={false}
                                                    />
                                                )}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Warranties */}
                                    <View style={styles.section}>
                                        <View style={styles.sectionTitleContainer}>
                                            <Text style={styles.sectionTitle}>{t('vehicles.warranty_tab')}</Text>
                                            {!vehicle?.istransferred && actionable && (
                                                <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]} onPress={() => handleAddNew('AddVehicleWarranty')}>
                                                    <Feather name="plus" size={18} color={colors.black} />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {warranties.map((warranty: any, index: number) => (
                                            <View key={warranty.id} style={[styles.itemCard, { borderBottomWidth: index === warranties.length - 1 ? 0 : 0.5 }]}>
                                                <View style={styles.itemHeader}>
                                                    <Text style={styles.itemName}>{warranty.itemname}</Text>

                                                    <View style={styles.itemActions}>
                                                        <View style={[styles.dateBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                                                            <Text style={styles.dateBadgeText}>{formatDate(warranty.expiration)}</Text>
                                                        </View>
                                                        {!vehicle?.istransferred && (
                                                            <>
                                                                <TouchableOpacity
                                                                    style={styles.actionButton}
                                                                    onPress={() => navigateToHistory('Warranty', warranty.id)}
                                                                >
                                                                    <MaterialIcons name="history" size={22} color={themeColors.secondary} />
                                                                </TouchableOpacity>
                                                                {actionable && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleEditWarranty(warranty)}
                                                                    >
                                                                        <Feather name="edit-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                                {canDelete && (
                                                                    <TouchableOpacity
                                                                        style={styles.actionButton}
                                                                        onPress={() => handleDeleteWarranty(vehicle.id, warranty.id)}
                                                                    >
                                                                        <Feather name="trash-2" size={16} color={themeColors.secondary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </>)}
                                                    </View>
                                                </View>
                                                <Text style={styles.itemDetail}>{warranty.warrantyprovider}</Text>
                                                <Text style={styles.itemDetail}>{t('common.start_label')}: {formatDate(warranty.startdate)} - {t('common.exp_label')}: {formatDate(warranty.expiration)}</Text>
                                                {warranty.notes && <Text style={styles.itemNotes}>{warranty.notes}</Text>}
                                                {warranty.website && (
                                                    <View style={styles.attachmentRow}>
                                                        <Text style={styles.attachmentText}>{warranty.website}</Text>
                                                    </View>
                                                )}
                                                {warranty.uploadattachments && warranty.uploadattachments.length > 0 && (
                                                    <MixedMediaDisplayer
                                                        attachmentIds={warranty.uploadattachments}
                                                        showDocHeading={false}
                                                    />)}
                                            </View>
                                        ))}
                                    </View>

                                    {/* Sale / Transfer Details */}
                                    {vehicle.latesttransfer && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                {vehicle.istransferred ? t('vehicles.transfer_details') : t('vehicles.sale_details')}
                                            </Text>
                                            {renderTransferCard(vehicle.latesttransfer, transferBusinessName)}

                                            {vehicle.previoustransfer && (
                                                <>
                                                    <Text style={[styles.sectionTitle, styles.previousTransferTitle]}>
                                                        {t('vehicles.previous_transfer')}
                                                    </Text>
                                                    {renderTransferCard(vehicle.previoustransfer, previousTransferBusinessName)}
                                                </>
                                            )}
                                        </View>
                                    )}

                                    <View style={styles.actionButtonsContainer}>
                                        {shouldShowSellTransfer && (
                                            <TouchableOpacity style={[styles.sellButton, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.6) }]} onPress={handleSellTransfer}>
                                                <Text style={styles.sellButtonText}>{t('vehicles.sell_transfer_vehicle')}</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: themeColors.primary }]} onPress={onClose}>
                                            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
            </RecordViewTabs>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        </Modal >
        {GateModal}
        </>
    );
};

export default ViewVehicleModal;
