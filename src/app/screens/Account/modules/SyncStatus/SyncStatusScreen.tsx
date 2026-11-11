import React, { useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { makeSyncStatusStyles } from './SyncStatus.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { AuthHeader } from '../../../../../components/common';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { useUserRole } from '../../../../../hooks/useUserRole';
import { isIOS } from '../../../../../utils/helpers';
import {
    getSyncHistory,
    clearSyncHistory,
    removeHistoryEntry,
    SyncHistoryEntry,
    SyncStatus,
    REDO_ROUTE_MAP,
} from '../../../../../services/offline/SyncHistoryService';
import { triggerSync } from '../../../../../services/offline/OfflineSyncEngine';
import { getQueue, dequeue } from '../../../../../services/offline/OfflineQueueService';
import { RoleTheme } from '../../../../../types/roleManager.types';

type FilterTab = 'all' | 'pending' | 'success' | 'failed';

const SyncStatusScreen: React.FC = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeSyncStatusStyles(themeColors as RoleTheme), [themeColors]);

    const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const loadHistory = useCallback(async () => {
        try {
            const data = await getSyncHistory();
            setHistory(data);
        } catch {
            // Silently handle
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadHistory();
        }, [loadHistory]),
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHistory();
    }, [loadHistory]);

    const handleRetryAll = useCallback(() => {
        triggerSync();
        Alert.alert(
            t('sync_status.retry_started_title'),
            t('sync_status.retry_started_message'),
        );
    }, [t]);

    const handleClearHistory = useCallback(() => {
        Alert.alert(
            t('sync_status.clear_confirm_title'),
            t('sync_status.clear_confirm_message'),
            [
                { text: t('sync_status.cancel'), style: 'cancel' },
                {
                    text: t('sync_status.clear'),
                    style: 'destructive',
                    onPress: async () => {
                        await clearSyncHistory();
                        setHistory([]);
                    },
                },
            ],
        );
    }, [t]);

    const handleRemoveItem = useCallback(
        (item: SyncHistoryEntry) => {
            Alert.alert(
                t('sync_status.remove_item_title'),
                t('sync_status.remove_item_message'),
                [
                    { text: t('sync_status.cancel'), style: 'cancel' },
                    {
                        text: t('sync_status.remove'),
                        style: 'destructive',
                        onPress: async () => {
                            // Remove from history
                            await removeHistoryEntry(item.id);
                            // Also remove from pending queue if still there
                            if (item.status === 'pending' || item.status === 'failed') {
                                try {
                                    await dequeue(item.id);
                                } catch {
                                    // May not be in queue anymore
                                }
                            }
                            setHistory((prev) => prev.filter((e) => e.id !== item.id));
                        },
                    },
                ],
            );
        },
        [t],
    );

    const handleDiscardAndRedo = useCallback(
        (item: SyncHistoryEntry) => {
            const redoRoute = REDO_ROUTE_MAP[item.thunkTypePrefix];
            Alert.alert(
                t('sync_status.discard_title'),
                t('sync_status.discard_message'),
                [
                    { text: t('sync_status.cancel'), style: 'cancel' },
                    {
                        text: t('sync_status.discard_confirm'),
                        style: 'destructive',
                        onPress: async () => {
                            // Remove from history and queue
                            await removeHistoryEntry(item.id);
                            try {
                                await dequeue(item.id);
                            } catch {
                                // May not be in queue
                            }
                            setHistory((prev) => prev.filter((e) => e.id !== item.id));
                            // Navigate to the form so user can re-enter data
                            if (redoRoute) {
                                (navigation as any).navigate(redoRoute);
                            }
                        },
                    },
                ],
            );
        },
        [t, navigation],
    );

    const filteredHistory = history.filter((entry) => {
        if (activeTab === 'all') return true;
        return entry.status === activeTab;
    });

    const counts = {
        all: history.length,
        pending: history.filter((e) => e.status === 'pending').length,
        success: history.filter((e) => e.status === 'success').length,
        failed: history.filter((e) => e.status === 'failed').length,
    };

    const getStatusIcon = (status: SyncStatus) => {
        switch (status) {
            case 'pending':
                return <Feather name="clock" size={20} color={colors.warning} />;
            case 'success':
                return <Feather name="check-circle" size={20} color={colors.success} />;
            case 'failed':
                return <Feather name="x-circle" size={20} color={colors.error} />;
        }
    };

    const getStatusColor = (status: SyncStatus) => {
        switch (status) {
            case 'pending':
                return colors.warning;
            case 'success':
                return colors.success;
            case 'failed':
                return colors.error;
        }
    };

    const getStatusLabel = (status: SyncStatus) => {
        switch (status) {
            case 'pending':
                return t('sync_status.status_pending');
            case 'success':
                return t('sync_status.status_success');
            case 'failed':
                return t('sync_status.status_failed');
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderTab = (tab: FilterTab, label: string, count: number) => {
        const isActive = activeTab === tab;
        return (
            <TouchableOpacity
                key={tab}
                style={[
                    styles.tab,
                    isActive && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                ]}
                onPress={() => setActiveTab(tab)}
            >
                <Text
                    style={[
                        styles.tabText,
                        isActive && styles.tabTextActive,
                    ]}
                >
                    {label} ({count})
                </Text>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: SyncHistoryEntry }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                    {getStatusIcon(item.status)}
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.label}
                        </Text>
                        <Text style={[styles.cardStatus, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveItem(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close-circle-outline" size={22} color={colors.gray} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>{t('sync_status.queued_at')}:</Text>
                    <Text style={styles.cardValue}>{formatDate(item.queuedAt)}</Text>
                </View>
                {item.syncedAt && (
                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>
                            {item.status === 'success'
                                ? t('sync_status.synced_at')
                                : t('sync_status.last_attempt')}
                            :
                        </Text>
                        <Text style={styles.cardValue}>{formatDate(item.syncedAt)}</Text>
                    </View>
                )}
                {item.status === 'failed' && item.retryCount > 0 && (
                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>{t('sync_status.retries')}:</Text>
                        <Text style={[styles.cardValue, { color: colors.error }]}>
                            {item.retryCount}
                        </Text>
                    </View>
                )}
                {item.status === 'failed' && item.errorMessage && (
                    <View style={styles.errorRow}>
                        <Text style={styles.errorText} numberOfLines={2}>
                            {item.errorMessage}
                        </Text>
                    </View>
                )}
                {item.status === 'failed' && (
                    <TouchableOpacity
                        style={[styles.redoBtn, { borderColor: themeColors.primary }]}
                        onPress={() => handleDiscardAndRedo(item)}
                    >
                        <Feather name="edit" size={14} color={themeColors.primary} />
                        <Text style={[styles.redoBtnText, { color: themeColors.primary }]}>
                            {REDO_ROUTE_MAP[item.thunkTypePrefix]
                                ? t('sync_status.discard_and_redo')
                                : t('sync_status.discard_item')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="cloud-done" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>{t('sync_status.empty_title')}</Text>
            <Text style={styles.emptySubtitle}>{t('sync_status.empty_subtitle')}</Text>
        </View>
    );

    if (loading) {
        return (
            <ScreenWrapper scrollable={false} showShadow={false}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable={false} showShadow={false} containerStyle={styles.container}>
            <View style={styles.main}>
                <AuthHeader
                    title={t('sync_status.title')}
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()}
                    containerStyle={{ paddingTop: isIOS ? 0 : 20 }}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />

                {/* Summary Bar */}
                <View style={styles.summaryBar}>
                    <View style={styles.summaryItem}>
                        <Feather name="clock" size={16} color={colors.warning} />
                        <Text style={styles.summaryCount}>{counts.pending}</Text>
                        <Text style={styles.summaryLabel}>{t('sync_status.pending')}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Feather name="check-circle" size={16} color={colors.success} />
                        <Text style={styles.summaryCount}>{counts.success}</Text>
                        <Text style={styles.summaryLabel}>{t('sync_status.synced')}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Feather name="x-circle" size={16} color={colors.error} />
                        <Text style={styles.summaryCount}>{counts.failed}</Text>
                        <Text style={styles.summaryLabel}>{t('sync_status.failed')}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {(counts.pending > 0 || counts.failed > 0) && (
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}
                            onPress={handleRetryAll}
                        >
                            <Feather name="refresh-cw" size={16} color={themeColors.background} />
                            <Text style={styles.actionBtnText}>{t('sync_status.retry_all')}</Text>
                        </TouchableOpacity>
                        {history.length > 0 && (
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.clearBtn]}
                                onPress={handleClearHistory}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                                <Text style={[styles.actionBtnText, { color: colors.error }]}>
                                    {t('sync_status.clear_all')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Filter Tabs */}
                <View style={styles.tabRow}>
                    {renderTab('all', t('sync_status.tab_all'), counts.all)}
                    {renderTab('pending', t('sync_status.tab_pending'), counts.pending)}
                    {renderTab('success', t('sync_status.tab_success'), counts.success)}
                    {renderTab('failed', t('sync_status.tab_failed'), counts.failed)}
                </View>

                {/* List */}
                <FlatList
                    data={filteredHistory}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={themeColors.primary}
                        />
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

export default SyncStatusScreen;
