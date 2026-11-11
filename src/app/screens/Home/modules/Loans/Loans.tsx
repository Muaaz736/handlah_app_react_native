import { Image, ScrollView, Text, View, TouchableOpacity, } from 'react-native';
import { RecordStatusBadge } from '../../../../../components/records/RecordStatusBadge';
import { recordStatusOf, isInactive, INACTIVE_CARD_STYLE } from '../../../../../utils/recordStatus';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewDetailModal,
} from '../../../../../components/common';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { isIOS } from '../../../../../utils/helpers';
import type {
    Loan, ShareData,
} from './Loans.types';
import { LoansMainNavigationProp } from './Loans.types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteLoanAsync, getLoanAsync, getLoansSharedWithMeAsync } from '../../../../../redux/services/liabilitiesService';
import SharedWithMeSection from '../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import type { DetailModalData } from '../../../../../types/viewDetailModal.types';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makeLoansStyles } from './Loans.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';

const Loans = () => {
    const navigation = useNavigation<LoansMainNavigationProp>();
    const dispatch = useDispatch<AppDispatch>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeLoansStyles(themeColors as RoleTheme), [themeColors]);
    const { checkSubscription, GateModal } = useSubscriptionGate();
    const { selectedBusinessId } = useSelectedBusiness();
    const { get_loan_status, get_loan_data, delete_loan_status } = useSelector((state: any) => state.liabilities_slice);
    const { share_sync_status, selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);
    const { currentConnectionUserId, emergencyConnectionBusinessId, currentConnection } = useSelector((state: any) => state.connection_slice);
    const { user_data } = useSelector((state: any) => state.user_auth);
    const route = useRoute<any>();
    const { from, connectionTabSource, sharedWithUserId, ownerId, accessLevel, accessType, openEntityId, openEntityIdForEdit } = route.params || {};
    const isFromEmergencyAccess = from === 'emergency_access';
    // Who "the owner" is for the Assign To linkage rules — the connection
    // whose loan this is, when we're editing via Connection Detail or
    // emergency access.
    const editOwnerUserId = isFromEmergencyAccess
        ? currentConnectionUserId
        : (connectionTabSource === 'shared_with_you' ? ownerId : undefined);
    const editOwnerBusinessId = isFromEmergencyAccess
        ? emergencyConnectionBusinessId
        : (connectionTabSource === 'shared_with_you' ? selectedSharedBusiness?.id : undefined);
    const editOwnerName = currentConnection
        ? (currentConnection.receiveruserid === user_data?.id
            ? currentConnection?.senderuser?.firstname
            : currentConnection?.receiveruser?.firstname)
        : undefined;
    const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
    const writeAccess = getModuleWriteAccess({ isFromEmergencyAccess, accessType, accessLevel });
    const getItemWriteAccess = (item: any) =>
        getEntityWriteAccess({ isFromEmergencyAccess, accessType, moduleWriteAccess: writeAccess, entity: item });
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

    const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [shareContext, setShareContext] = useState<{
        resourceType: string;
        resourceId?: string | number;
    }>({ resourceType: 'loan' });
    const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
    const [viewModalData, setViewModalData] = useState<DetailModalData | null>(null);

    const isLoading: boolean = get_loan_status === ASYNC_STATUS.LOADING;
    const isDeleting: boolean = delete_loan_status === ASYNC_STATUS.LOADING;
    const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
    const currentBusinessId = isBusiness && selectedBusinessId ? selectedBusinessId : undefined;

    const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
    const loans: Loan[] = noBusinessInBusinessMode ? [] : (get_loan_data?.result?.loans || []);


    const totalMonthly: string = `$${noBusinessInBusinessMode ? 0 : (get_loan_data?.result?.totalmonthlyamount ?? 0)}`;
    const totalAnnual: string = `$${noBusinessInBusinessMode ? 0 : (get_loan_data?.result?.totalannuallyamount ?? 0)}`;
    const totalBalance: string = `$${noBusinessInBusinessMode ? 0 : (get_loan_data?.result?.totalbalance ?? 0)}`;

    const fetchLoans = () => {
        const connectionParams = getConnectionTabQueryParams();

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

        const arg = Object.keys(params).length ? params : undefined;

        dispatch(getLoanAsync(arg));
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchLoans();
        }, [isBusiness, selectedBusinessId, isFromEmergencyAccess, currentConnectionUserId, emergencyConnectionBusinessId])
    );

    const handleShare = (): void => {
        checkSubscription(() => {
            setShareContext({ resourceType: 'loan' });
            setShareModalVisible(true);
        }, isBusiness ? 'business' : 'personal');
    };

    const handleShareLoan = (shareData: ShareData): void => {
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
            setSelectedLoan(null);
        }
    }, [share_sync_status, dispatch]);

    useEffect(() => {
        if (share_sync_status === ASYNC_STATUS.ERROR) {
            dispatch(resetShareSyncStatus());
        }
    }, [share_sync_status, dispatch]);

    // Auto-open detail modal when navigated from a notification
    const autoOpenedRef = useRef(false);
    useEffect(() => {
        if (!openEntityId || autoOpenedRef.current) return;
        if (get_loan_status !== ASYNC_STATUS.SUCCEEDED) return;
        const target = loans.find((l: Loan) => Number(l.id) === Number(openEntityId));
        if (target) {
            autoOpenedRef.current = true;
            handleViewPress(target);
        }
    }, [openEntityId, get_loan_status]);

    // Auto-open the edit form when navigated here for "Update Record"
    const autoOpenedForEditRef = useRef(false);
    useEffect(() => {
        if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
        if (get_loan_status !== ASYNC_STATUS.SUCCEEDED) return;
        const target = loans.find((l: Loan) => Number(l.id) === Number(openEntityIdForEdit));
        if (target) {
            autoOpenedForEditRef.current = true;
            handleEditPress(target);
        }
    }, [openEntityIdForEdit, get_loan_status]);

    const handleEditPress = (loan: Loan): void => {
        if (!getItemWriteAccess(loan)) {
            return;
        }
        checkSubscription(() => navigation.navigate('AddLoan', {
            loan,
            isEdit: true,
            ...(editOwnerUserId ? { ownerUserId: editOwnerUserId } : {}),
            ...(editOwnerBusinessId ? { ownerBusinessId: editOwnerBusinessId } : {}),
            ...(editOwnerName ? { ownerName: editOwnerName } : {}),
            ...(isFromEmergencyAccess ? { isFromEmergencyAccess: true } : {}),
        }), isBusiness ? 'business' : 'personal');
    };

    const handleDeletePress = (loan: Loan): void => {
        if (!getItemWriteAccess(loan)) {
            return;
        }
        setSelectedLoan(loan);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = (): void => {
        if (selectedLoan?.id) {
            dispatch(deleteLoanAsync(selectedLoan.id)).then((action: any) => {
                if (action.type === deleteLoanAsync.fulfilled.type) {
                    const businessIdParam = isBusiness ? Object.keys(getConnectionTabQueryParams()).length > 0 ? selectedSharedBusiness.id : selectedBusinessId : undefined;
                    dispatch(getLoanAsync(businessIdParam ? { businessId: businessIdParam, ...getConnectionTabQueryParams() } : getConnectionTabQueryParams()));
                }
            });
        }
        setDeleteModalVisible(false);
        setSelectedLoan(null);
    };

    const handleViewPress = (loan: Loan): void => {
        const rawAttachments = (loan as any).additionalattachments || (loan as any).additionalAttachments;
        const additionalAttachments: string[] = rawAttachments
            ? Array.isArray(rawAttachments) ? rawAttachments : [rawAttachments]
            : [];

        // Resolve linked asset
        const realestate = (loan as any).realestate;
        const vehicle = (loan as any).vehicle;
        const property = (loan as any).property;

        const linkedAssetSection = (() => {
            if (realestate) {
                const address = [
                    realestate.streetaddress,
                    realestate.aptsuite,
                    realestate.city,
                    realestate.state,
                    realestate.zip,
                    realestate.country,
                ].filter(Boolean).join(', ');
                return {
                    title: t('loans.linked_real_estate') || 'Linked Real Estate',
                    rows: [
                        { label: t('loans.property_name') || 'Property Name', value: realestate.nickname || (t('common.na') || 'N/A') },
                        ...(address ? [{ label: t('loans.address') || 'Address', value: address }] : []),
                    ],
                };
            }
            if (vehicle) {
                return {
                    title: t('loans.linked_vehicle') || 'Linked Vehicle',
                    rows: [
                        { label: t('loans.vehicle_name') || 'Vehicle', value: [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || (t('common.na') || 'N/A') },
                        ...(vehicle.nickname ? [{ label: t('loans.nickname') || 'Nickname', value: vehicle.nickname }] : []),
                        ...(vehicle.plate ? [{ label: t('loans.license_plate') || 'License Plate', value: vehicle.plate }] : []),
                        ...(vehicle.vin ? [{ label: t('loans.vin') || 'VIN', value: vehicle.vin }] : []),
                    ],
                };
            }
            if (property) {
                return {
                    title: t('loans.linked_property') || 'Linked Property',
                    rows: [
                        { label: t('loans.property_name') || 'Property Name', value: property.name || (t('common.na') || 'N/A') },
                        ...(property.modelserial ? [{ label: t('loans.model_serial') || 'Model / Serial', value: property.modelserial }] : []),
                        ...(property.price !== undefined && property.price !== null ? [{ label: t('loans.price') || 'Price', value: formatCurrency(property.price) }] : []),
                    ],
                };
            }
            return null;
        })();

        const data: DetailModalData = {
            linkRecord: loan?.id ? { moduleKey: 'loan', id: Number(loan.id) } : null,
            title: loan.bestname || loan.lenderprovider || t('loans.loan'),
            subtitle: loan.lenderprovider || '',
            badge: loan.balance !== undefined ? formatCurrency(loan.balance) : undefined,
            rows: [
                {
                    left: { label: t('loans.best_name') || 'Purpose of Loan', value: loan.bestname || (t('common.na') || 'N/A') },
                },
                {
                    left: { label: t('loans.account_number') || 'Account Number', value: loan.accountnumber || (t('common.na') || 'N/A') },
                    right: { label: t('loans.monthly_payment') || 'Monthly Payment', value: formatCurrency(loan.monthlypayment) },
                },
                {
                    left: { label: t('loans.start_date') || 'Start Date', value: formatDate(loan.startdate) },
                    right: { label: t('loans.end_date') || 'End Date', value: formatDate(loan.enddate) },
                },
                {
                    left: { label: t('loans.due_day') || 'Due Day', value: loan.dueday ? String(loan.dueday) : (t('common.na') || 'N/A') },
                    right: { label: t('loans.rate_percent') || 'Rate %', value: loan.ratepercent !== undefined ? `${loan.ratepercent}%` : (t('common.na') || 'N/A') },
                },
                {
                    left: { label: t('loans.estimated_balance') || 'Est. Balance', value: loan.estbalance !== undefined ? formatCurrency(loan.estbalance) : (t('common.na') || 'N/A') },
                },
            ],
            sections: [
                ...(loan.lenderlocation || loan.lenderphonenumber || loan.lenderemail ? [{
                    title: t('loans.lender_details') || 'Lender Details',
                    rows: [
                        ...(loan.lenderlocation ? [{ label: t('loans.lender_location') || 'Location', value: loan.lenderlocation }] : []),
                        ...(loan.lenderphonenumber ? [{ label: t('loans.lender_phone') || 'Phone', value: loan.lenderphonenumber }] : []),
                        ...(loan.lenderemail ? [{ label: t('loans.lender_email') || 'Email', value: loan.lenderemail }] : []),
                    ],
                }] : []),
                ...(linkedAssetSection ? [linkedAssetSection] : []),
            ],
            imageIds: loan.uploadattachments ? (Array.isArray(loan.uploadattachments) ? loan.uploadattachments : [loan.uploadattachments]) : [],
            documentName: `${loan.bestname || loan.lenderprovider || 'Loan'}_attachment`,
        };
        setViewModalData(data);
        setViewModalVisible(true);
    };

    // Format date for display
    const formatDate = (dateString?: string): string => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return '-';
        }
    };

    // Format currency for display
    const formatCurrency = (value?: number): string => {
        if (value === undefined || value === null) return '$0.00';
        return `$${value.toFixed(2)}`;
    };

    const renderSharedLoanItem = (item: any, owner: SharedWithMeOwner) => {
        const canWrite = item.accessLevel === 'write' || item.accessLevel === 'full';
        const vehicleFullyTransferred = !!(item?.vehicle?.issold && item?.vehicle?.istransferred);
        return (
            <TouchableOpacity key={item.id} style={[styles.loanCard, isInactive(recordStatusOf(item)) && INACTIVE_CARD_STYLE]} onPress={() => handleViewPress(item)} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                    <View style={styles.loanInfo}>
                        <Text style={styles.loanName} ellipsizeMode="tail">{item.bestname || item.lenderprovider}</Text>
<RecordStatusBadge status={recordStatusOf(item)} />
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Loan', entityId: item.id, title: t('edit_history.title') })}
                        >
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                        </TouchableOpacity>
                        {canWrite && !vehicleFullyTransferred && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => checkSubscription(() => navigation.navigate('AddLoan' as any, { loan: item, isEdit: true, ownerUserId: owner.id, ownerName: owner.firstname }), isBusiness ? 'business' : 'personal')}
                            >
                                <Feather name="edit-2" size={20} color={themeColors.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.cardInfo}>
                    <View>
                        <Text style={styles.lenderText} numberOfLines={1} ellipsizeMode="tail">{item.lenderprovider}</Text>
                        <Text style={styles.paymentText}>
                            <Text style={[styles.paymentLabel, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>{t('loans.monthly_payment')}: </Text>
                            <Text style={styles.paymentValue}>{formatCurrency(item.monthlypayment)}</Text>
                        </Text>
                    </View>
                    <View style={[styles.balanceBadge, { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) }]}>
                        <Text style={styles.balanceText}>{formatCurrency(item.balance)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderLoanCard = (loan: Loan) => {
        const vehicleFullyTransferred = !!((loan as any)?.vehicle?.issold && (loan as any)?.vehicle?.istransferred);
        return (
        <TouchableOpacity key={loan.id} style={[styles.loanCard, isInactive(recordStatusOf(loan)) && INACTIVE_CARD_STYLE]} onPress={() => handleViewPress(loan)} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.loanInfo}>
                    <Text style={styles.loanName} ellipsizeMode="tail">{loan.bestname || loan.lenderprovider}</Text>
<RecordStatusBadge status={recordStatusOf(loan)} />

                </View>
                <View style={styles.actionButtons}>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditHistoryList', { entityType: 'Loan', entityId: loan.id, title: t('edit_history.title') })}
                    >
                        <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                    </TouchableOpacity>
                    {shouldAllowShare && !vehicleFullyTransferred && (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => checkSubscription(() => {
                                setShareContext({ resourceType: 'loan', resourceId: loan.id });
                                setShareModalVisible(true);
                            }, isBusiness ? 'business' : 'personal')}
                        >
                            <Image
                                source={ICONS.SHARE_PRIMARY_ICON}
                                style={[styles.actionIcon, { tintColor: themeColors.secondary }]}
                            />
                        </TouchableOpacity>
                    )}
                    {getItemWriteAccess(loan) && !vehicleFullyTransferred && (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleEditPress(loan)}
                        >
                            <Feather name="edit-2" size={20} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                    {shouldAllowShare && !vehicleFullyTransferred && (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleDeletePress(loan)}
                        >
                            <Feather name="trash-2" size={20} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.cardInfo}>
                <View style={styles.cardInfoLeft}>
                    <Text style={styles.lenderText} numberOfLines={1} ellipsizeMode="tail">{loan.lenderprovider}</Text>
                    <Text style={styles.paymentText}>
                        <Text style={[styles.paymentLabel, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>
                            {t('loans.monthly_payment')}:{' '}
                        </Text>
                        <Text style={styles.paymentValue}>{formatCurrency(loan.monthlypayment)}</Text>
                    </Text>
                    <Text style={styles.paymentText}>
                        <Text style={[styles.paymentLabel, { color: themeColors?.isDark ? themeColors.primary : themeColors.secondary }]}>
                            {t('loans.due_day')}:{' '}
                        </Text>
                        <Text style={styles.paymentValue}>{loan.dueday || '-'}</Text>
                    </Text>
                </View>
                <View
                    style={[
                        styles.balanceBadge,
                        { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                    ]}
                >
                    <Text style={styles.balanceText}>{formatCurrency(loan.balance)}</Text>
                </View>
            </View>
        </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
            locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
            style={styles.gradientContainer}
        >
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader
                    onBackPress={() =>
                        navigation.goBack()
                    }
                    containerStyle={[styles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
                    backButtonStyle={{ marginBottom: 0 }}
                    titleStyle={{ marginBottom: 0 }}
                    backButtonIconStyle={{ tintColor: themeColors.background }}
                />

                <ScrollView
                    style={commonStyles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.loanIconWrapper}>
                            <Image
                                source={ICONS.LOAN_SCREEN_ICON}
                                style={styles.loanIcon}
                            />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{t('loans.title')}</Text>
                    </View>

                    <View style={styles.buttonsRow}>
                        {shouldAllowShare && (
                            <PrimaryButton
                                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                                title={t('loans.add_loan')}
                                onPress={() => checkSubscription(() => navigation.navigate('AddLoan' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), isBusiness ? 'business' : 'personal')}
                                buttonStyle={styles.whiteButton}
                                textStyle={styles.blackText}
                            />
                        )}
                        {shouldAllowShare && loans.length > 0 && (
                            <PrimaryButton
                                icon={<Fontisto name="share-a" size={18} color={colors.black} />}
                                title={t('loans.share')}
                                onPress={handleShare}
                                buttonStyle={[styles.whiteButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                                textStyle={{color:themeColors?.isDark ? themeColors.background : themeColors.textPrimary}}
                            />
                        )}
                    </View>

                    {/* Totals Section */}
                    <View style={styles.totalsSection}>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalLabel}>{t('loans.total_monthly')}</Text>
                            <Text style={styles.totalValue}>{totalMonthly}</Text>
                        </View>
                        <View style={styles.totalItem}>
                            <Text style={styles.totalLabel}>{t('loans.total_annual')}</Text>
                            <Text style={styles.totalValue}>{totalAnnual}</Text>
                        </View>
                    </View>

                    {/* Loans List */}
                    <View style={styles.loansSection}>
                        {isLoading ? (
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyText}>{t('common.loading') || 'Loading...'}</Text>
                            </View>
                        ) : loans.length > 0 ? (
                            loans.map(renderLoanCard)
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyIconCircle}>
                                    <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
                                </View>
                                <Text style={styles.emptyText}>
                                    {isFromEmergencyAccess
                                        ? t('emergency_access_tab.no_data_emergency')
                                        : (t('loans.no_loans') || 'No Loans Added Yet. Click "+ Add Loan" To Get Started.')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Shared With Me */}
                    {!accessLevel && !isFromEmergencyAccess && !isBusiness && (
                        <SharedWithMeSection
                            thunkAction={getLoansSharedWithMeAsync}
                            renderItem={renderSharedLoanItem}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Modals */}
            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                onShare={handleShareLoan}
                title={t('loans.share_loan')}
                loading={sharingLoading}
                resourceType={shareContext.resourceType}
                resourceId={shareContext.resourceId}
                businessId={currentBusinessId}
            />

            <DeleteConfirmModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteConfirm}
                title={t('loans.delete_loan')}
                message={`${t('modals.delete_confirm') || 'Are you sure you want to delete'} ${selectedLoan?.bestname || selectedLoan?.lenderprovider || t('loans.this_loan') || 'this loan'}?`}
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

export default Loans;
