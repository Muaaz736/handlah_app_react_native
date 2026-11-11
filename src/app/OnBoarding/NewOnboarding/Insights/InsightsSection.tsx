import React, { FC, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    Alert,
    AppState,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useUserRole } from '../../../../hooks/useUserRole';
import { useSelectedBusiness } from '../../../../hooks/useSelectedBusiness';
import { RoleTheme } from '../../../../types/roleManager.types';
import { AppDispatch } from '../../../../types/store.types';
import { darkenColor } from '../../../../utils/roleManager';
import { showSuccessToast, showErrorToast } from '../../../../components/common';
import { ICONS } from '../../../../utils/Images';
import { getFavIcon } from '../DashboardPreviewUI/DashboardPreviewUI';
import { makeInsightsStyles } from './InsightsSection.styles';
import { InsightsSectionProps, InsightsSectionRef, SNOOZE_MONTH_OPTIONS } from './InsightsSection.types';
import { isGettingStartedInsight, resolveInsightTarget, resolveInsightEditTarget, resolveModuleTarget } from './insightNavigation';
import {
    getInsightsAsync,
    getInsightsSummaryAsync,
    dismissInsightAsync,
    snoozeInsightAsync,
    undismissInsightAsync,
    InsightDto,
    InsightGroupDto,
} from '../../../../redux/services/insightsService';
import { ASYNC_STATUS } from '../../../../config/constants';

const computeSnoozeUntil = (months: number): string => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
};

const formatDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '';
    }
};

const INSIGHT_ICON_MAP: Record<string, any> = {
    'fa-sack-dollar': ICONS.LOANS_PAYMENT_ICON,
    'fa-shield-halved': ICONS.INSURANCE_ICON,
    'fa-file-lines': ICONS.LEGAL_ICON,
    'fa-house': ICONS.REAL_ESTATE_ICON,
    'fa-passport': ICONS.IDENTITY_HUB_ICON,
    'fa-id-card': ICONS.IDENTITY_HUB_ICON,
    'fa-certificate': ICONS.IDENTITY_HUB_ICON,
    'fa-address-card': ICONS.BUSINESS_CONTACT_ICON,
    'fa-clipboard-check': ICONS.COMPLIANCE_VAULT_ICON,
};

const getInsightIcon = (faIcon: string): any => INSIGHT_ICON_MAP[faIcon] ?? getFavIcon(faIcon);

// "Personal Property" is the module's actual name/routekey everywhere (data,
// routing, icons) — only the Business-space label reads "Business Property".
const displayModuleName = (moduleName: string, spaceType: 'Personal' | 'Business'): string =>
    spaceType === 'Business' && moduleName === 'Personal Property' ? 'Business Property' : moduleName;

// Entity types whose linkage insights ("Link X") should go straight to the
// edit form instead of the usual read-only detail view/modal.
const LINKAGE_EDIT_ENTITY_TYPES = new Set(['personal_property', 'loan', 'insurance', 'warranty', 'business_project']);

// How many insight cards a module shows before collapsing behind "View more".
const MODULE_COLLAPSE_LIMIT = 3;

// The Getting Started (ROL-01) group carries no routekey of its own — it is a
// synthetic roll-up of every empty module.
const isGettingStartedGroup = (group: InsightGroupDto): boolean =>
    group.routekey === '' || group.insights.some(isGettingStartedInsight);

const clusterByCode = (insights: InsightDto[]): InsightDto[][] => {
    const order: string[] = [];
    const map = new Map<string, InsightDto[]>();
    insights.forEach(insight => {
        if (!map.has(insight.code)) {
            map.set(insight.code, []);
            order.push(insight.code);
        }
        map.get(insight.code)!.push(insight);
    });
    return order.map(code => map.get(code)!);
};


const InsightCardView: FC<{
    insight: InsightDto;
    accentColor: string;
    pending: boolean;
    onAction: (insight: InsightDto) => void;
    onMenu: (insight: InsightDto) => void;
}> = memo(({ insight, accentColor, pending, onAction, onMenu }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeInsightsStyles(themeColors as RoleTheme), [themeColors]);
    return (
        <View style={s.card}>
            <View style={[s.cardIconBox, { backgroundColor: accentColor + '20' }]}>
                <Image
                    source={getInsightIcon(insight.icon)}
                    style={[s.cardIconImg, { tintColor: accentColor }]}
                    resizeMode="contain"
                />
            </View>
            <View style={s.cardBody}>
                <Text style={s.cardTitle}>{insight.title}</Text>
                <Text style={s.cardMessage}>{insight.message}</Text>
                <View style={s.cardActionsRow}>
                    <TouchableOpacity
                        style={[s.cardActionBtn, { backgroundColor: accentColor }]}
                        activeOpacity={0.85}
                        onPress={() => onAction(insight)}
                        disabled={pending}
                    >
                        <Text style={s.cardActionBtnText}>{insight.actiontext}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={s.cardOverflowBtn}
                        activeOpacity={0.7}
                        onPress={() => onMenu(insight)}
                        disabled={pending}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Feather name="more-vertical" size={18} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
            {pending && (
                <View style={s.cardLoadingOverlay}>
                    <ActivityIndicator size="small" color={accentColor} />
                </View>
            )}
        </View>
    );
});
InsightCardView.displayName = 'InsightCardView';

// ── Getting Started (ROL-01) card — synthetic, no single routekey ─────────

const GettingStartedCardView: FC<{
    insight: InsightDto;
    accentColor: string;
    pending: boolean;
    onPress: () => void;
    onMenu: (insight: InsightDto) => void;
}> = memo(({ insight, accentColor, pending, onPress, onMenu }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeInsightsStyles(themeColors as RoleTheme), [themeColors]);
    return (
        <LinearGradient
            colors={[accentColor, darkenColor(accentColor, 0.25)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.gsCard}
        >
            <View style={s.gsCardContent}>
                <TouchableOpacity
                    onPress={() => onMenu(insight)}
                    style={{ position: 'absolute', top: 12, right: 12, padding: 4 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={pending}
                >
                    <Feather name="more-vertical" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={s.gsIconBox}>
                    <MaterialCommunityIcons name="rocket-launch-outline" size={22} color="#fff" />
                </View>
                <Text style={s.gsTitle}>{insight.title}</Text>
                <Text style={s.gsMessage}>{insight.message}</Text>
                <TouchableOpacity style={s.gsBtn} activeOpacity={0.85} onPress={onPress} disabled={pending}>
                    {pending
                        ? <ActivityIndicator size="small" color={accentColor} />
                        : <Text style={[s.gsBtnText, { color: accentColor }]}>{insight.actiontext || 'Get Started'}</Text>}
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
});
GettingStartedCardView.displayName = 'GettingStartedCardView';

// ── Module group header ─────────────────────────────────────────────────

const GroupHeader: FC<{ group: InsightGroupDto; accentColor: string; spaceType: 'Personal' | 'Business' }> = memo(({ group, accentColor, spaceType }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeInsightsStyles(themeColors as RoleTheme), [themeColors]);
    const icon = group.insights[0]?.icon ?? '';
    return (
        <View style={s.groupHeader}>
            <View style={[s.groupIconBox, { backgroundColor: accentColor + '20' }]}>
                <Image source={getInsightIcon(icon)} style={{ width: 15, height: 15, tintColor: accentColor }} resizeMode="contain" />
            </View>
            <Text style={s.groupTitle}>{displayModuleName(group.module, spaceType)}</Text>
            <View style={s.groupCountBadge}>
                <Text style={s.groupCountText}>{group.count}</Text>
            </View>
        </View>
    );
});
GroupHeader.displayName = 'GroupHeader';

// ── Snooze picker sheet — fixed 1/3/6/9/12 month options ───────────────────

const SnoozeSheet: FC<{
    visible: boolean;
    insight: InsightDto | null;
    onClose: () => void;
    onSelect: (insight: InsightDto, months: number) => void;
}> = ({ visible, insight, onClose, onSelect }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeInsightsStyles(themeColors as RoleTheme), [themeColors]);
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
            <View style={s.sheet}>
                <View style={s.handle} />
                <Text style={s.sheetTitle}>Remind me later</Text>
                {insight && <Text style={s.sheetSubtitle} numberOfLines={2}>{insight.title}</Text>}
                {SNOOZE_MONTH_OPTIONS.map(months => (
                    <TouchableOpacity
                        key={months}
                        style={s.snoozeOption}
                        activeOpacity={0.7}
                        onPress={() => insight && onSelect(insight, months)}
                    >
                        <Text style={s.snoozeOptionText}>{months} {months === 1 ? 'Month' : 'Months'}</Text>
                        <Text style={s.snoozeOptionDate}>{formatDate(computeSnoozeUntil(months))}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                    <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

// ── Main section ─────────────────────────────────────────────────────────

export const InsightsSection = forwardRef<InsightsSectionRef, InsightsSectionProps>(({ spaceType, businessId, accentColor, onExit }, ref) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeInsightsStyles(themeColors as RoleTheme), [themeColors]);
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<AppDispatch>();
    const { businesses } = useSelectedBusiness();

    const { feed_status, feed_data, summary_data } = useSelector((state: any) => state.insights_slice);

    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const [snoozeInsight, setSnoozeInsight] = useState<InsightDto | null>(null);
    const [snoozeVisible, setSnoozeVisible] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const toggleModuleExpanded = useCallback((moduleKey: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleKey)) next.delete(moduleKey);
            else next.add(moduleKey);
            return next;
        });
    }, []);

    const setPending = useCallback((id: string, isPending: boolean) => {
        setPendingIds(prev => {
            const next = new Set(prev);
            if (isPending) next.add(id); else next.delete(id);
            return next;
        });
    }, []);

    const fetchFeed = useCallback(
        () => dispatch(getInsightsAsync({ spaceType, businessId: businessId ?? undefined })),
        [dispatch, spaceType, businessId],
    );
    const fetchSummary = useCallback(
        () => dispatch(getInsightsSummaryAsync({ spaceType, businessId: businessId ?? undefined })),
        [dispatch, spaceType, businessId],
    );
    const refetchAll = useCallback(() => { fetchFeed(); fetchSummary(); }, [fetchFeed, fetchSummary]);

    useImperativeHandle(ref, () => ({
        refresh: async () => {
            await Promise.all([fetchFeed(), fetchSummary()]);
        },
    }), [fetchFeed, fetchSummary]);

    useFocusEffect(useCallback(() => { refetchAll(); }, [refetchAll]));

    useEffect(() => {
        const sub = AppState.addEventListener('change', state => {
            if (state === 'active') refetchAll();
        });
        return () => sub.remove();
    }, [refetchAll]);

    const handleUndo = useCallback(async (insight: InsightDto) => {
        setPending(insight.id, true);
        try {
            const restored = await dispatch(undismissInsightAsync({ insightId: insight.id })).unwrap();
            if (restored) {
                refetchAll();
                showSuccessToast('The card is back in your feed.', 'Restored');
            }
            // false → nothing to undo. Not an error — leave state as-is.
        } catch (e: any) {
            showErrorToast(typeof e === 'string' ? e : 'Failed to undo. Please try again.');
        } finally {
            setPending(insight.id, false);
        }
    }, [dispatch, refetchAll, setPending]);

    const handleDismiss = useCallback(async (insight: InsightDto) => {
        setPending(insight.id, true);
        try {
            const ok = await dispatch(dismissInsightAsync({ insightId: insight.id })).unwrap();
            if (ok) {
                refetchAll();
                Alert.alert('Insight dismissed', insight.title, [
                    { text: 'Undo', onPress: () => handleUndo(insight) },
                    { text: 'OK', style: 'cancel' },
                ]);
            }
            // false → the id didn't parse or isn't the caller's — no-op, not an error.
        } catch (e: any) {
            showErrorToast(typeof e === 'string' ? e : 'Failed to dismiss insight. Please try again.');
        } finally {
            setPending(insight.id, false);
        }
    }, [dispatch, refetchAll, setPending, handleUndo]);

    const handleSnoozeSelect = useCallback(async (insight: InsightDto, months: number) => {
        const until = computeSnoozeUntil(months);
        setSnoozeVisible(false);
        setPending(insight.id, true);
        try {
            const ok = await dispatch(snoozeInsightAsync({ insightId: insight.id, until })).unwrap();
            if (ok) {
                refetchAll();
                Alert.alert('Insight snoozed', `We'll remind you again around ${formatDate(until)}.`, [
                    { text: 'Undo', onPress: () => handleUndo(insight) },
                    { text: 'OK', style: 'cancel' },
                ]);
            }
        } catch (e: any) {
            showErrorToast(typeof e === 'string' ? e : 'Failed to snooze insight. Please try again.');
        } finally {
            setPending(insight.id, false);
        }
    }, [dispatch, refetchAll, setPending, handleUndo]);

    const openCardMenu = useCallback((insight: InsightDto) => {
        Alert.alert(insight.title, undefined, [
            { text: "Don't show this again", onPress: () => handleDismiss(insight) },
            { text: 'Remind me later', onPress: () => { setSnoozeInsight(insight); setSnoozeVisible(true); } },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }, [handleDismiss]);

    const handleAction = useCallback((insight: InsightDto) => {
        if (isGettingStartedInsight(insight)) {
            if (onExit) {
                onExit();
            } else {
                navigation.goBack();
            }
            return;
        }
        // Business-profile completeness insights have no generic entity-edit
        // route (AddBusinessDetails needs the full record, not just an id) —
        // look the business up locally and send it there directly.
        if (insight.entitytype?.toLowerCase() === 'business' && insight.entityid != null) {
            const business = businesses.find((b: any) => b.id === insight.entityid);
            if (business) {
                navigation.navigate('AddBusinessDetails' as never, {
                    businessDetails: {
                        businessName: business.businessname,
                        description: business.description,
                        ein: business.ein,
                        country: business.country,
                        countryname: business.countryname || business.countryName,
                        stateOfFormation: business.stateofformation,
                        statelabel: business.statelabel || business.stateLabel,
                        entityType: business.entitytype,
                        registeredAgentName: business.registeredagentname,
                        registeredAgentAddress: business.registeredagentaddress,
                        registeredAgentPhone: business.registeredagentphone,
                        principalBusinessAddress: business.principalbusinessaddress,
                    },
                    businessId: business.id,
                    isEdit: true,
                } as never);
                return;
            }
        }

        // Linkage insights normally deep-link to a read-only detail view/modal,
        // but a "Link X" insight on certain record types should go straight
        // to its edit form instead.
        const isEditFormLinkage = insight.family === 'linkage'
            && LINKAGE_EDIT_ENTITY_TYPES.has(insight.entitytype?.toLowerCase() ?? '');
        const target = insight.family === 'linkage' && !isEditFormLinkage
            ? resolveInsightTarget(insight)
            : resolveInsightEditTarget(insight, { spaceType, businessId });
        if (target) navigation.navigate(target.screen as never, target.params as never);
    }, [navigation, spaceType, businessId, onExit, businesses]);

    const handleViewAllInModule = useCallback((routekey: string) => {
        const target = resolveModuleTarget(routekey);
        if (target) navigation.navigate(target.screen as never, target.params as never);
    }, [navigation]);

    // Getting Started is the first-run call to action, so it leads the feed
    // wherever the API happens to place it. Everything else keeps its order.
    const groups: InsightGroupDto[] = useMemo(() => {
        const all = feed_data?.groups ?? [];
        const gsIndex = all.findIndex(isGettingStartedGroup);
        if (gsIndex <= 0) return all;
        return [all[gsIndex], ...all.slice(0, gsIndex), ...all.slice(gsIndex + 1)];
    }, [feed_data]);
    const summary = summary_data;
    const isLoading = feed_status === ASYNC_STATUS.LOADING && !feed_data;

    return (
        <View style={s.section}>
            <View style={s.headerRow}>
                <Text style={s.headerTitle}>Insights</Text>
            </View>

            {summary && (
                <View style={s.summaryCard}>
                    <View style={s.summaryStatsRow}>
                        <View style={[s.summaryStat, { backgroundColor: accentColor + '22' }]}>
                            <Text style={[s.summaryNum, { color: accentColor }]}>{summary.healthscore}%</Text>
                            <Text style={s.summaryLbl}>Health Score</Text>
                        </View>
                        <View style={[s.summaryStat, { backgroundColor: accentColor + '22' }]}>
                            <Text style={[s.summaryNum, { color: accentColor }]}>{summary.totalopen}</Text>
                            <Text style={s.summaryLbl}>Open</Text>
                        </View>
                        <View style={[s.summaryStat, { backgroundColor: accentColor + '22' }]}>
                            <Text style={[s.summaryNum, { color: accentColor }]}>{summary.highprioritycount}</Text>
                            <Text style={s.summaryLbl}>High Priority</Text>
                        </View>
                    </View>
                </View>
            )}

            {isLoading ? (
                <View style={s.emptyState}>
                    <ActivityIndicator size="small" color={accentColor} />
                </View>
            ) : groups.length === 0 ? (
                <View style={s.emptyState}>
                    <Feather name="check-circle" size={30} color={accentColor} />
                    <Text style={s.emptyText}>You're all caught up — no data gaps right now.</Text>
                </View>
            ) : (
                groups.map(group => {
                    if (isGettingStartedGroup(group)) {
                        const gs = group.insights[0];
                        if (!gs) return null;
                        return (
                            <GettingStartedCardView
                                key={`${group.module}-${gs.id}`}
                                insight={gs}
                                accentColor={accentColor}
                                pending={pendingIds.has(gs.id)}
                                onPress={() => handleAction(gs)}
                                onMenu={openCardMenu}
                            />
                        );
                    }

                    // Cap the number of *cards* shown, not clusters — a single
                    // cluster can hold several insights that share one code,
                    // so slicing by cluster could still show well over the
                    // limit. Split the boundary cluster if needed, and only
                    // show a cluster's own "+N more" sub-link once the whole
                    // cluster made it into view (avoids stacking two "more"
                    // messages on the same truncated cluster).
                    const clusters = clusterByCode(group.insights);
                    const totalCardCount = clusters.reduce((sum, c) => sum + c.length, 0);
                    const needsCollapse = totalCardCount > MODULE_COLLAPSE_LIMIT;
                    const isModuleExpanded = expandedModules.has(group.module);
                    let cardsShown = 0;
                    const renderClusters: { cluster: InsightDto[]; visibleInsights: InsightDto[] }[] = [];
                    for (const cluster of clusters) {
                        if (!needsCollapse || isModuleExpanded) {
                            renderClusters.push({ cluster, visibleInsights: cluster });
                            continue;
                        }
                        if (cardsShown >= MODULE_COLLAPSE_LIMIT) break;
                        const visibleInsights = cluster.slice(0, MODULE_COLLAPSE_LIMIT - cardsShown);
                        renderClusters.push({ cluster, visibleInsights });
                        cardsShown += visibleInsights.length;
                    }
                    const hiddenCardCount = totalCardCount - MODULE_COLLAPSE_LIMIT;
                    return (
                        <View key={group.module} style={s.groupBlock}>
                            <GroupHeader group={group} accentColor={accentColor} spaceType={spaceType} />
                            {renderClusters.map(({ cluster, visibleInsights }) => {
                                const first = cluster[0];
                                const clusterFullyVisible = visibleInsights.length === cluster.length;
                                const remaining = clusterFullyVisible ? first.affectedcount - cluster.length : 0;
                                return (
                                    <View key={first.code}>
                                        {visibleInsights.map(insight => (
                                            <InsightCardView
                                                key={insight.id}
                                                insight={insight}
                                                accentColor={accentColor}
                                                pending={pendingIds.has(insight.id)}
                                                onAction={handleAction}
                                                onMenu={openCardMenu}
                                            />
                                        ))}
                                        {remaining > 0 && (
                                            <TouchableOpacity
                                                style={s.moreLink}
                                                activeOpacity={0.7}
                                                onPress={() => handleViewAllInModule(group.routekey)}
                                            >
                                                <Text style={[s.moreLinkText, { color: accentColor }]}>
                                                    {`+${remaining} more · View all in ${displayModuleName(group.module, spaceType)}`}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                            {needsCollapse && (
                                <TouchableOpacity
                                    style={[s.moduleToggle, { backgroundColor: accentColor + '18' }]}
                                    activeOpacity={0.7}
                                    onPress={() => toggleModuleExpanded(group.module)}
                                >
                                    <Text style={[s.moduleToggleText, { color: accentColor }]}>
                                        {isModuleExpanded ? 'Show less' : `View more (${hiddenCardCount})`}
                                    </Text>
                                    <Feather
                                        name={isModuleExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={15}
                                        color={accentColor}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })
            )}

            <SnoozeSheet
                visible={snoozeVisible}
                insight={snoozeInsight}
                onClose={() => setSnoozeVisible(false)}
                onSelect={handleSnoozeSelect}
            />
        </View>
    );
});
InsightsSection.displayName = 'InsightsSection';

export default InsightsSection;
