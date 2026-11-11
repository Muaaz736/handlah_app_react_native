import { Image, ScrollView, Text, View, TouchableOpacity, } from 'react-native';
import React, { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AuthHeader, PrimaryButton, ShareModal, DeleteConfirmModal, ViewBankAccountModal, showErrorToast,
} from '../../../../../components/common';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import colors, { getColorWithOpacity } from '../../../../../utils/colors';
import { ICONS } from '../../../../../utils/Images';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FONTS from '../../../../../utils/fonts';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../hooks/useSubscriptionGate';
import { isIOS, extractApiError } from '../../../../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { getBankAccountAsync, deleteBankAccountAsync, getBankAccountSharedWithMeAsync } from '../../../../../redux/services/assetsService';
import SharedWithMeSection from '../../../../../components/SharedWithMe/SharedWithMeSection';
import type { SharedWithMeOwner } from '../../../../../components/SharedWithMe/SharedWithMeSection';
import { authenticateWithAlert, biometricKeysExist } from '../../../../../utils/biometricServices';
import { unlockResourceWithBiometric } from '../../../../../utils/biometricUnlock';
import { BankingAccountCard } from './bankingOrFinance.types';
import { setGetBankAccountStatus } from '../../../../../redux/slices/assetsSlice';
import { useSelectedBusiness } from '../../../../../hooks/useSelectedBusiness';
import { sharingSyncService } from '../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../redux/slices/sharingSlice';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { getModuleWriteAccess, getEntityWriteAccess } from '../../../../../utils/accessLevel';
import { getDropdownOptionsAsync } from '../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../types/store.types';
import { makeCommonStyles, makeBankingFinanceStyles } from './BankingFinance.styles';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../utils/roleManager';
import { NetWorthSummary, AccountTag } from '../../../../../components/finance/NetWorthSummary';

const BankingFinance: FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<AppDispatch>();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors, isBusinessRole } = useUserRole();
    const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
    const styles = useMemo(() => makeBankingFinanceStyles(themeColors as RoleTheme), [themeColors]);
    const { checkSubscription, GateModal } = useSubscriptionGate();
    const { selectedBusinessId } = useSelectedBusiness();
    const { get_bank_account_status, add_bank_account_status, get_bank_account_data, delete_bank_account_status, update_bank_account_status } = useSelector((state: any) => state.assets_slice);
    const { share_sync_status } = useSelector((state: any) => state.sharing_slice);

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

    const { currentConnectionUserId, emergencyConnectionBusinessId } = useSelector((state: any) => state.connection_slice);
    const { selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice);

    const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
    const [selectedAccount, setSelectedAccount] = useState<BankingAccountCard | null>(null);
    const [shareContext, setShareContext] = useState<{
        resourceType: string;
        resourceId?: number;
    }>({ resourceType: 'bankaccount' });

    const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
    const isBusiness = isBusinessRole();
    const currentBusinessId = isBusiness ? selectedBusinessId : undefined;
    const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;

    const fetchBankAccounts = useCallback(() => {
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

        dispatch(getBankAccountAsync(Object.keys(params).length ? params : undefined));
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

    useFocusEffect(
        useCallback(() => {
            fetchBankAccounts();
        }, [fetchBankAccounts, update_bank_account_status, add_bank_account_status, delete_bank_account_status])
    );
    useEffect(() => {
        dispatch(setGetBankAccountStatus());
    }, [])

    const { get_dropdown_options_data } = useSelector((state: any) => state.user_auth);

    useFocusEffect(useCallback(() => {
        dispatch(getDropdownOptionsAsync('BankAccountType'));
    }, [dispatch]));

    // Format currency
    const formatCurrency = (amount: number | string) => {
        if (!amount && amount !== 0) return '$0.00';
        return `$${parseFloat(amount as any).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Get accounts from API data
    // In business mode with no business selected, show empty data
    const noBusinessInBusinessMode = isBusiness && !selectedBusinessId && !isFromEmergencyAccess;
    const accounts = noBusinessInBusinessMode ? [] : (
        get_bank_account_data?.bankaccounts
        || get_bank_account_data?.data?.bankaccounts
        || get_bank_account_data?.bankAccounts
        || get_bank_account_data?.data?.bankAccounts
        || []
    );

    const handleShare = (account?: BankingAccountCard) => {
        checkSubscription(() => {
            setShareContext({ resourceType: 'bankaccount', resourceId: account?.id });
            setShareModalVisible(true);
        }, isBusiness ? 'business' : 'personal');
    };

    const handleShareAccount = useCallback((shareData: any) => {
        const payload: any = {
            ...shareContext,
            users: shareData
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


    const handleViewPress = async (account: any) => {
        if (!account) return;

        const hasBiometricDevice = await biometricKeysExist();
        if (!hasBiometricDevice) {
            await authenticateWithAlert({
                promptMessage: 'Authenticate to view account details',
                cancelButtonText: 'Cancel',
                failureTitle: 'Authentication Failed',
                failureMessage: 'Authentication is required to view account details',
                okButtonText: 'OK',
                allowDeviceCredentials: true,
                onSuccess: () => {
                    setSelectedAccount(account);
                    setViewModalVisible(true);
                },
            });
            return;
        }

        try {
            const ownerUserId = accessLevel ? currentConnectionUserId : undefined;
            const unlockedData = await unlockResourceWithBiometric(
                'bankaccounts',
                Number(account.id),
                ownerUserId,
            );
            setSelectedAccount({ ...account, ...unlockedData });
            setViewModalVisible(true);
        } catch (err: any) {
            const message = String(err?.message || '').toLowerCase();
            if (message.includes('cancel')) return;
            showErrorToast(extractApiError(err, 'Failed to unlock bank account.'));
        }
    };

    const autoOpenedRef = useRef(false);
    useEffect(() => {
        if (!openEntityId || autoOpenedRef.current) return;
        if (get_bank_account_status !== ASYNC_STATUS.SUCCEEDED) return;
        const accountList = get_bank_account_data?.bankaccounts
            || get_bank_account_data?.data?.bankaccounts
            || get_bank_account_data?.bankAccounts
            || get_bank_account_data?.data?.bankAccounts
            || [];
        const target = accountList.find((a: any) => Number(a.id) === Number(openEntityId));
        if (target) {
            autoOpenedRef.current = true;
            handleViewPress(target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openEntityId, get_bank_account_status]);

    // Auto-open the edit form when navigated here for "Update Record"
    const autoOpenedForEditRef = useRef(false);
    useEffect(() => {
        if (!openEntityIdForEdit || autoOpenedForEditRef.current) return;
        if (get_bank_account_status !== ASYNC_STATUS.SUCCEEDED) return;
        const accountList = get_bank_account_data?.bankaccounts
            || get_bank_account_data?.data?.bankaccounts
            || get_bank_account_data?.bankAccounts
            || get_bank_account_data?.data?.bankAccounts
            || [];
        const target = accountList.find((a: any) => Number(a.id) === Number(openEntityIdForEdit));
        if (target) {
            autoOpenedForEditRef.current = true;
            handleEditPress(target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openEntityIdForEdit, get_bank_account_status]);

    const handleEditPress = (account: any, ownerUserId?: number) => {
        if (!account) return;

        checkSubscription(async () => {
            const hasBiometricDevice = await biometricKeysExist();
            if (!hasBiometricDevice) {
                await authenticateWithAlert({
                    promptMessage: 'Authenticate to edit account details',
                    cancelButtonText: 'Cancel',
                    failureTitle: 'Authentication Failed',
                    failureMessage: 'Authentication is required to edit account details',
                    okButtonText: 'OK',
                    allowDeviceCredentials: true,
                    onSuccess: () => {
                        navigation.navigate('AddBankAccount', { account, isEdit: true, ...(ownerUserId ? { ownerUserId } : {}) });
                    },
                });
                return;
            }

            try {
                const unlockedData = await unlockResourceWithBiometric(
                    'bankaccounts',
                    Number(account.id),
                    ownerUserId,
                );
                navigation.navigate('AddBankAccount', {
                    account: { ...account, ...unlockedData },
                    isEdit: true,
                    ...(ownerUserId ? { ownerUserId } : {}),
                });
            } catch (err: any) {
                const message = String(err?.message || '').toLowerCase();
                if (message.includes('cancel')) return;
                showErrorToast(extractApiError(err, 'Failed to unlock bank account.'));
            }
        }, isBusiness ? 'business' : 'personal');
    };

    const handleDeletePress = (account: any) => {
        setSelectedAccount(account);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAccount?.id) {
            setDeleteModalVisible(false);
            setSelectedAccount(null);
            return;
        }

        try {
            await dispatch(deleteBankAccountAsync(selectedAccount.id as any)).unwrap();
            fetchBankAccounts();
            setDeleteModalVisible(false);
            setSelectedAccount(null);
        } catch (error) {
            // Error toast is already shown by the slice
            setDeleteModalVisible(false);
            setSelectedAccount(null);
        }
    };

    const renderSharedBankAccountItem = (item: any, owner: SharedWithMeOwner) => {
        const canWrite = item.accessLevel === 'write' || item.accesslevel === 'write';
        return (
            <TouchableOpacity
                style={styles.accountCard}
                onPress={() => handleViewPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>
                            {item.institution} • {item.accountname}
                        </Text>
                        <Text style={styles.accountType}>
                            {item.type} • •••• {item.last4digits}
                        </Text>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('EditHistoryList', { entityType: 'BankAccount', entityId: item.id, title: t('edit_history.title') })}
                        >
                            <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                        </TouchableOpacity>
                        {canWrite && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => handleEditPress(item, owner.id)}
                            >
                                <Feather name="edit-2" size={20} color={themeColors.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderAccountCard = (account: any) => (
        <TouchableOpacity onPress={() => handleViewPress(account)} key={account.id} style={styles.accountCard}>
            <View style={styles.cardHeader}>
                <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>
                        {account.institution} • {account.accountname}
                    </Text>
                    <Text style={styles.accountType}>
                        {get_dropdown_options_data?.find((option: any) => String(option.value) === String(account.type))?.label || '-'} • •••• {account.last4digits}
                    </Text>
                    <View style={{ marginTop: 6 }}>
                        <AccountTag account={account} options={get_dropdown_options_data} />
                    </View>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditHistoryList', { entityType: 'BankAccount', entityId: account.id, title: t('edit_history.title') })}
                    >
                        <MaterialIcons name="history" size={24} color={themeColors.secondary} />
                    </TouchableOpacity>
                    {shouldAllowShare && (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleShare(account)}
                        >
                            <Image
                                source={ICONS.SHARE_PRIMARY_ICON}
                                style={[styles.actionIcon, { tintColor: themeColors.secondary }]}
                            />
                        </TouchableOpacity>
                    )}
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
                            <Feather name="trash-2" size={20} color={themeColors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View
                style={[
                    styles.balanceBadge,
                    { backgroundColor: themeColors?.isDark ? darkenColor(themeColors.primary, 0.4) : getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
            >
                <Text style={styles.balanceText}>{formatCurrency(account.currentbalance)}</Text>
            </View>
        </TouchableOpacity>
    );

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
                    containerStyle={[commonStyles.headerContainerStyle, { paddingTop: isIOS ? 0 : 20 }]}
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
                        <View style={styles.bankIconWrapper}>
                            <Image
                                source={ICONS.BANK_ICON}
                                style={styles.bankIcon}
                            />
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{t('banking_finance.title')}</Text>
                    </View>

                    <View style={styles.buttonsRow}>
                        {shouldAllowShare && (
                            <PrimaryButton
                                icon={<Entypo name="plus" size={20} color={themeColors.textPrimary} />}
                                title={t('banking_finance.add_account')}
                                onPress={() => checkSubscription(() => navigation.navigate('AddBankAccount' as any, accessLevel ? { ownerUserId: currentConnectionUserId } : undefined), isBusiness ? 'business' : 'personal')}
                                buttonStyle={styles.whiteButton}
                                textStyle={styles.blackText}
                            />
                        )}
                        {accounts.length !== 0 && shouldAllowShare && (
                            <PrimaryButton
                                icon={
                                    <Image
                                        source={ICONS.SHARE_ICON}
                                        style={styles.shareIcon}
                                    />
                                }
                                title={t('banking_finance.share')}
                                onPress={handleShare}
                                buttonStyle={[styles.whiteButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
                                textStyle={{color:themeColors?.isDark ? themeColors.background : themeColors.textPrimary}}
                            />
                        )}
                    </View>

                    {/* Accounts List */}
                    <View style={styles.accountsSection}>
                        <NetWorthSummary accounts={accounts} options={get_dropdown_options_data} />
                        {accounts.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyIconCircle}>
                                    <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
                                </View>
                                <Text style={styles.emptyText}>
                                    {isFromEmergencyAccess
                                        ? t('emergency_access_tab.no_data_emergency')
                                        : t('banking_finance.no_accounts')}
                                </Text>
                            </View>
                        ) : (
                            accounts.map(renderAccountCard)
                        )}
                    </View>
                    {showSharedWithMe && (
                        <SharedWithMeSection
                            thunkAction={getBankAccountSharedWithMeAsync}
                            renderItem={renderSharedBankAccountItem}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Modals */}
            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                onShare={handleShareAccount}
                title={t('banking_finance.share_account')}
                resourceType={shareContext.resourceType}
                resourceId={shareContext.resourceId}
                businessId={currentBusinessId}
                loading={sharingLoading}
            />

            <DeleteConfirmModal
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setSelectedAccount(null);
                }}
                onConfirm={handleDeleteConfirm}
                title={t('banking_finance.delete_account')}
                message={`${t('modals.delete_confirm')} ${selectedAccount?.accountname || 'this account'}?`}
            />

            <ViewBankAccountModal
                visible={viewModalVisible}
                onClose={() => {
                    setViewModalVisible(false);
                    setSelectedAccount(null);
                }}
                account={selectedAccount}
                linkTabs={{ record: selectedAccount?.id ? { moduleKey: 'bankaccount', id: Number(selectedAccount.id) } : null, canEdit: getItemWriteAccess(selectedAccount) }}
            />
            {GateModal}
        </LinearGradient>
    );
};

export default BankingFinance;


