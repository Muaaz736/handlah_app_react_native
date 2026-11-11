import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
    RefreshControl,
    AppState,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../hooks/useUserRole';
import { CustomTabs } from '../../../../components/common';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../../../../utils/colors';
import FONTS from '../../../../utils/fonts';
import { ICONS } from '../../../../utils/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeS, CHIP_W, CHIP_H } from './DashboardPreviewUI.styles';
import {
    Module,
    BadgeType,
    ChipId,
    MockAttentionItem,
    ChipDef,
    DashboardPreviewLayoutProps,
} from './DashboardPreviewUI.types';
import { getDashboardAsync, DashboardAttentionItem, DashboardFavorite, DashboardSubItem } from '../../../../redux/services/onboardingService';
import { AppDispatch } from '../../../../types/store.types';
import { ASYNC_STATUS } from '../../../../config/constants';
import { RoleTheme } from '../../../../types/roleManager.types';
import { darkenColor } from '../../../../utils/roleManager';

export type { Module, DashboardPreviewLayoutProps };

const FA_ICON_TO_LOCAL: Record<string, any> = {
    'fa-user-circle': ICONS.IDENTITY_HUB_ICON,
    'fa-heartbeat': ICONS.HEALTH_TRACKER_ICON,
    'fa-wallet': ICONS.WALLET_ICON,
    'fa-paw': ICONS.PETS_ICON,
    'fa-gavel': ICONS.LEGAL_ICON,
    'fa-home': ICONS.PERSONAL_BUILDING_ICON,
    'fa-building': ICONS.REAL_ESTATE_ICON,
    'fa-car': ICONS.VEHICLE_ICON,
    'fa-university': ICONS.BANKING_FINANCE_ICON,
    'fa-money-bill-wave': ICONS.LOANS_PAYMENT_ICON,
    'fa-bolt': ICONS.UTILITIES_ICON,
    'fa-shield-alt': ICONS.INSURANCE_ICON,
    'fa-briefcase': ICONS.PROJECTS_ICON,
    'fa-file': ICONS.LEGAL_ICON,
    'fa-tag': ICONS.SUBSCRIPTION_ICON,
};

export const getFavIcon = (faIcon: string): any =>
    FA_ICON_TO_LOCAL[faIcon] ?? ICONS.REMINDERS_ICON;

const MODULE_CHIP_MAP: Record<string, Exclude<ChipId, 'all'>> = {
    Reminders: 'health',
    Health: 'health',
    Pets: 'health',
    Medications: 'health',
    Surgeries: 'health',
    Warranties: 'property',
    'Real Estate': 'property',
    Vehicles: 'property',
    'Personal Property': 'property',
    Loans: 'wallet',
    Banking: 'wallet',
    Utilities: 'wallet',
    Insurances: 'wallet',
    Subscriptions: 'wallet',
    Legal: 'docs',
    Documents: 'docs',
    Wallet: 'wallet',
    Projects: 'business',
    Business: 'business',
    Licenses: 'business',
    Compliance: 'business',
    Contacts: 'business',
};

const MODULE_ICON_MAP: Record<string, any> = {
    Reminders: ICONS.REMINDERS_ICON,
    Warranties: ICONS.COMPLIANCE_VAULT_ICON,
    Loans: ICONS.LOANS_PAYMENT_ICON,
    'Real Estate': ICONS.REAL_ESTATE_ICON,
    Vehicles: ICONS.VEHICLE_ICON,
    Banking: ICONS.BANKING_FINANCE_ICON,
    Utilities: ICONS.UTILITIES_ICON,
    Insurances: ICONS.INSURANCE_ICON,
    Legal: ICONS.LEGAL_ICON,
    Documents: ICONS.LEGAL_ICON,
    Pets: ICONS.PETS_ICON,
    Health: ICONS.HEALTH_TRACKER_ICON,
    Projects: ICONS.PROJECTS_ICON,
    Business: ICONS.PROJECTS_ICON,
    Licenses: ICONS.COMPLIANCE_VAULT_ICON,
    Compliance: ICONS.COMPLIANCE_VAULT_ICON,
    Contacts: ICONS.BUSINESS_CONTACT_ICON,
};

const getModuleIcon = (moduleName: string): any =>
    MODULE_ICON_MAP[moduleName] ?? ICONS.REMINDERS_ICON;

const getChipId = (moduleName: string): Exclude<ChipId, 'all'> =>
    MODULE_CHIP_MAP[moduleName] ?? 'wallet';

const urgencyToBadgeType = (urgency: string): BadgeType => {
    if (urgency === 'Quick Win') return 'green';
    if (urgency === 'Upcoming') return 'orange';
    return 'red';
};

const ALL_CHIP: ChipDef =
    { id: 'all', label: 'All', featherIcon: 'grid' };

const BADGE_COLORS: Record<BadgeType, { bg: string; text: string }> = {
    red: { bg: '#FFEAEA', text: '#E53E3E' },
    orange: { bg: '#FFF5E4', text: '#D97706' },
    green: { bg: '#F0FDF4', text: '#166534' },
};

const CircularProgress: FC<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    color: string;
}> = memo(({ progress, size = 82, strokeWidth = 10, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - progress / 100);

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E8EDF0"
                    strokeWidth={strokeWidth}
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circ} ${circ}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${size / 2},${size / 2}`}
                />
            </Svg>
            <Text style={{ fontSize: 16, fontFamily: FONTS.display_bold, color }}>
                {progress}%
            </Text>
        </View>
    );
});
CircularProgress.displayName = 'CircularProgress';


const BriefingCard: FC<{
    accentColor: string;
    needAttention: number;
    quickWins: number;
    upcoming: number;
    progress: number;
}> = memo(({ accentColor, needAttention, quickWins, upcoming, progress }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeS(themeColors as RoleTheme), [themeColors]);
    return (
        <View style={[s.card, s.briefCard]}>
            <View style={s.briefTop}>
                <View style={s.briefText}>
                    <Text style={[s.briefCaption, { color: accentColor }]}>TODAY'S BRIEFING</Text>
                    <Text style={s.briefTitle}>Clean, Clear, And Ready To Handle.</Text>
                    <Text style={s.briefSubtitle}>
                        {`You Have ${needAttention} Priority Item${needAttention !== 1 ? 's' : ''}, ${quickWins} Quick Win${quickWins !== 1 ? 's' : ''}, And ${upcoming} Upcoming Deadline${upcoming !== 1 ? 's' : ''} This Week.`}
                    </Text>
                </View>
                <CircularProgress progress={progress} color={accentColor} />
            </View>

            <View style={s.statsRow}>
                <View style={[s.statBox, { backgroundColor: accentColor + '22' }]}>
                    <Text style={[s.statNum, { color: accentColor }]}>{needAttention}</Text>
                    <Text style={s.statLbl}>Need Attention</Text>
                </View>
                <View style={[s.statBox, { backgroundColor: accentColor + '22' }]}>
                    <Text style={[s.statNum, { color: accentColor }]}>{quickWins}</Text>
                    <Text style={s.statLbl}>Quick Wins</Text>
                </View>
                <View style={[s.statBox, { backgroundColor: accentColor + '22' }]}>
                    <Text style={[s.statNum, { color: accentColor }]}>{upcoming}</Text>
                    <Text style={s.statLbl}>Upcoming</Text>
                </View>
            </View>
        </View>
    );
});
BriefingCard.displayName = 'BriefingCard';


const FavoriteChip: FC<{
    chip: ChipDef;
    selected: boolean;
    accentColor: string;
    onPress: () => void;
}> = memo(({ chip, selected, accentColor, onPress }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeS(themeColors as RoleTheme), [themeColors]);
    if (selected) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.82}
                style={[
                    s.chip,
                    {
                        width: CHIP_W,
                        height: CHIP_H,
                        backgroundColor: themeColors?.isDark ? darkenColor(accentColor, 0.4) : accentColor,
                        borderWidth: 0,
                        shadowColor: accentColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.42,
                        shadowRadius: 10,
                        elevation: 7,
                    },
                ]}
            >
                <LinearGradient
                    colors={themeColors?.isDark ? [darkenColor(accentColor, 0.4), darkenColor(accentColor, 0.2)] : [accentColor, accentColor + '10']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 0.7 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
                <View style={{ height: "60%", width: "80%", backgroundColor: themeColors.surface, justifyContent: 'center', alignItems: 'center', borderRadius: 14 }}>
                    <Feather name={chip.featherIcon} size={23} color={accentColor} />
                </View>
                <Text style={[s.chipLabel, { color: themeColors.background }]}>{chip.label}</Text>
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                s.chip,
                {
                    width: CHIP_W,
                    height: CHIP_H,
                    backgroundColor: accentColor + '22',
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    shadowColor: '#000',
                },
            ]}
        >
            <LinearGradient
                colors={[accentColor + '40', accentColor + "40"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.7 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <View style={{ height: "60%", width: "80%", backgroundColor: themeColors.surface, justifyContent: 'center', alignItems: 'center', borderRadius: 14 }}>
                <Feather name={chip.featherIcon} size={23} color={themeColors.secondary} />
            </View>
            <Text style={[s.chipLabel, { color: themeColors.surface }]}>{chip.label}</Text>
        </TouchableOpacity>
    );
});
FavoriteChip.displayName = 'FavoriteChip';


const FavoriteModuleTile: FC<{
    fav: DashboardFavorite;
    accentColor: string;
    selected: boolean;
    onPress: () => void;
}> = memo(({ fav, accentColor, selected, onPress }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeS(themeColors as RoleTheme), [themeColors]);
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            style={[
                s.chip,
                selected
                    ? {
                        width: CHIP_W,
                        height: CHIP_H,
                        backgroundColor: themeColors?.isDark ? darkenColor(accentColor, 0.4) : accentColor,
                        borderWidth: 0,
                        shadowColor: accentColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.42,
                        shadowRadius: 10,
                        elevation: 7,
                    }
                    : {
                        width: CHIP_W,
                        height: CHIP_H,
                        backgroundColor: accentColor + '22',
                        borderWidth: 1,
                        borderColor: themeColors.border,
                        shadowColor: '#000',
                    },
            ]}
        >
            <LinearGradient
                colors={selected ? themeColors?.isDark ? [darkenColor(accentColor, 0.4), darkenColor(accentColor, 0.2)] : [accentColor, accentColor + '10'] : [accentColor + '40', accentColor + '40']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.7 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <View style={{ height: '60%', width: '80%', backgroundColor: themeColors.surface, justifyContent: 'center', alignItems: 'center', borderRadius: 14 }}>
                <Image
                    source={getFavIcon(fav.icon)}
                    style={{ width: 32, height: 32, tintColor: selected ? accentColor : themeColors.secondary }}
                    resizeMode="contain"
                />
            </View>
            <Text style={[s.chipLabel, { color: selected ? themeColors.background : themeColors.surface }]} numberOfLines={1}>
                {fav.name}
            </Text>
        </TouchableOpacity>
    );
});
FavoriteModuleTile.displayName = 'FavoriteModuleTile';


const SubItemRow: FC<{
    subItem: DashboardSubItem;
    accentColor: string;
    markedDone: boolean;
    onMarkDone?: (subItemId: number) => void;
}> = memo(({ subItem, accentColor, markedDone, onMarkDone }) => {
    const { t } = useTranslation();
    const isIntervalRow = subItem.id < 0;
    const dateStr = useMemo(() => {
        try {
            const d = new Date(subItem.reminderdate);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return ''; }
    }, [subItem.reminderdate]);

    const status = markedDone ? 'dismissed' : String(subItem.rowstatus || '').toLowerCase();
    const closedLabel = status === 'dismissed' ? t('reminders_screen.closed_dismissed', { defaultValue: 'Dismissed' })
        : status === 'completed' ? t('reminders_screen.closed_completed', { defaultValue: 'Completed' })
        : status === 'expired' ? t('reminders_screen.closed_expired', { defaultValue: 'Expired' }) : null;
    const isDone = !closedLabel && (subItem.iscompleted || markedDone);

    return (
        <View style={subItemStyles.row}>
            <View style={subItemStyles.info}>
                <Text style={subItemStyles.title} numberOfLines={1}>{subItem.title}</Text>
                <Text style={subItemStyles.meta} numberOfLines={1}>
                    {dateStr}{subItem.remindertime ? ` · ${subItem.remindertime}` : ''}
                </Text>
            </View>
            {closedLabel ? (
                <View style={[subItemStyles.doneTag, { backgroundColor: '#ECECEF' }]}>
                    <Feather name="x-circle" size={13} color="#5F6368" />
                    <Text style={[subItemStyles.doneTagText, { color: '#5F6368' }]}>{closedLabel}</Text>
                </View>
            ) : isDone ? (
                <View style={[subItemStyles.doneTag, { backgroundColor: '#F0FDF4' }]}>
                    <Feather name="check-circle" size={13} color="#166534" />
                    <Text style={subItemStyles.doneTagText}>Done</Text>
                </View>
            ) : isIntervalRow ? (
                <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.dismiss')}
                    style={subItemStyles.dismissBtn}
                    onPress={() => onMarkDone?.(subItem?.id)}
                >
                    <Feather name="x" size={16} color="#9CA3AF" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[subItemStyles.markDoneBtn, { borderColor: accentColor }]}
                    activeOpacity={0.75}
                    onPress={() => onMarkDone?.(subItem?.id)}
                >
                    <Text style={[subItemStyles.markDoneBtnText, { color: accentColor }]}>Mark as Done</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});
SubItemRow.displayName = 'SubItemRow';

const subItemStyles = StyleSheet.create({
    dismissBtn: { padding: 6, borderRadius: 8 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    info: { flex: 1, marginRight: 8 },
    title: { fontSize: 13, fontFamily: FONTS.display_semi_bold, color: colors.text, marginBottom: 2 },
    meta: { fontSize: 11, fontFamily: FONTS.display_regular, color: colors.description },
    markDoneBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    markDoneBtnText: { fontSize: 11, fontFamily: FONTS.display_semi_bold },
    doneTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
    },
    doneTagText: { fontSize: 11, fontFamily: FONTS.display_semi_bold, color: '#166534' },
});

const attDateTimeStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    text: { fontSize: 11, fontFamily: FONTS.display_medium, color: colors.description },
});

const AttentionItemCard: FC<{
    item: MockAttentionItem;
    expanded: boolean;
    accentColor: string;
    onToggle: () => void;
    onActionButton?: (item: MockAttentionItem) => Promise<void> | void;
    onView?: (item: MockAttentionItem) => void;
    onMarkDone?: (item: MockAttentionItem) => void;
    onMarkSubItemDone?: (reminderId: number, parentItem: MockAttentionItem) => void;
    onViewChecklist?: (item: MockAttentionItem) => Promise<void> | void;
}> = memo(({ item, expanded, accentColor, onToggle, onActionButton, onView, onMarkDone, onMarkSubItemDone, onViewChecklist }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeS(themeColors as RoleTheme), [themeColors]);
    const badge = BADGE_COLORS[item.badgeType];
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isChecklistLoading, setIsChecklistLoading] = useState(false);
    const [doneSubIds, setDoneSubIds] = useState<Set<number>>(new Set());

    const handleActionPress = useCallback(async () => {
        if (!onActionButton || isActionLoading) return;
        setIsActionLoading(true);
        try { await onActionButton(item); } finally { setIsActionLoading(false); }
    }, [onActionButton, item, isActionLoading]);

    const handleChecklistPress = useCallback(async () => {
        if (!onViewChecklist || isChecklistLoading) return;
        setIsChecklistLoading(true);
        try { await onViewChecklist(item); } finally { setIsChecklistLoading(false); }
    }, [onViewChecklist, item, isChecklistLoading]);

    const handleSubItemMarkDone = useCallback((subItemId: number) => {
        setDoneSubIds(prev => new Set(prev).add(subItemId));
        onMarkSubItemDone?.(subItemId, item);
    }, [onMarkSubItemDone, item]);

    const hasSubItems = !!item.batchId && item.items && item.items.length > 0;
    const visibleSubItems = hasSubItems
        ? item.items!.filter(sub => sub.id < 0 || (!sub.iscompleted && !doneSubIds.has(sub.id)))
        : [];

    const singleSubItem = !item.batchId && item.items?.[0];
    const singleDate = singleSubItem ? singleSubItem.reminderdate : null;
    const singleTime = singleSubItem ? singleSubItem.remindertime : null;
    const formattedSingleDate = useMemo(() => {
        if (!singleDate) return null;
        try {
            const d = new Date(singleDate);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return null; }
    }, [singleDate]);

    return (
        <View style={s.attCard}>
            <TouchableOpacity onPress={onToggle} style={s.attRow} activeOpacity={0.75}>
                <View style={s.attIconBox}>
                    <Image
                        source={item.icon}
                        style={[s.attIcon, { tintColor: accentColor }]}
                    />
                </View>
                <View style={s.attContent}>
                    <Text style={s.attItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={s.attSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    {!item.batchId && (formattedSingleDate || singleTime) && (
                        <View style={attDateTimeStyles.row}>
                            {!!formattedSingleDate && (
                                <View style={attDateTimeStyles.item}>
                                    <Feather name="calendar" size={11} color={colors.description} />
                                    <Text style={attDateTimeStyles.text}>{formattedSingleDate}</Text>
                                </View>
                            )}
                            {!!singleTime && (
                                <View style={attDateTimeStyles.item}>
                                    <Feather name="clock" size={11} color={colors.description} />
                                    <Text style={attDateTimeStyles.text}>{singleTime}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={[s.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[s.badgeText, { color: badge.text }]}>{item.badge}</Text>
                </View>
                <Feather
                    name={expanded ? 'chevron-down' : 'chevron-right'}
                    size={18}
                    color={colors.darkGray}
                    style={{ marginLeft: 4 }}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={s.expandBody}>
                    <Text style={s.expandText}>{item.expandedText}</Text>

                    {visibleSubItems.length > 0 && (
                        <View style={{ marginBottom: 14 }}>
                            {visibleSubItems.map(sub => (
                                <SubItemRow
                                    key={sub.id}
                                    subItem={sub}
                                    accentColor={accentColor}
                                    markedDone={doneSubIds.has(sub.id)}
                                    onMarkDone={handleSubItemMarkDone}
                                />
                            ))}
                        </View>
                    )}

                    <View style={s.expandActionsCol}>
                        <View style={s.expandActions}>
                            <TouchableOpacity
                                style={[s.actionFilled, { backgroundColor: accentColor, opacity: isActionLoading ? 0.7 : 1 }]}
                                activeOpacity={0.8}
                                onPress={handleActionPress}
                                disabled={isActionLoading}
                            >
                                {isActionLoading
                                    ? <ActivityIndicator size="small" color={themeColors.background} />
                                    : <Text style={s.actionFilledText}>{item.buttonText || 'View'}</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.actionOutline, { flex: 1, borderColor: accentColor }]}
                                activeOpacity={0.8}
                                onPress={() => onView?.(item)}
                            >
                                <Text style={[s.actionOutlineText, { color: accentColor }]}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[s.actionLightFill, { backgroundColor: accentColor + '28', opacity: isChecklistLoading ? 0.7 : 1 }]}
                            activeOpacity={0.8}
                            onPress={handleChecklistPress}
                            disabled={isChecklistLoading}
                        >
                            {isChecklistLoading
                                ? <ActivityIndicator size="small" color={accentColor} />
                                : <Text style={[s.actionLightFillText, { color: accentColor }]}>View Checklist</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={s.actionMarkDone}
                            activeOpacity={0.8}
                            onPress={() => onMarkDone?.(item)}
                        >
                            <Text style={s.actionMarkDoneText}>Mark as Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
});
AttentionItemCard.displayName = 'AttentionItemCard';


const HaloInsightCard: FC<{
    secondaryColor: string;
    itemCount: number;
    urgentCount: number;
}> = memo(({ secondaryColor, itemCount, urgentCount }) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeS(themeColors as RoleTheme), [themeColors]);
    return (
        <View style={[s.haloCard, { backgroundColor: secondaryColor }]}>
            <Text style={s.haloLabel}>Halo AI insight</Text>
            <Text style={s.haloText}>
                {urgentCount > 0
                    ? `You have ${urgentCount} urgent item${urgentCount !== 1 ? 's' : ''} that need immediate attention. Resolving your highest-priority items will take less than 10 minutes with NCHRG's guided checklists.`
                    : `Your ${itemCount} tracked item${itemCount !== 1 ? 's' : ''} are looking healthy. Keep reviewing upcoming deadlines to stay ahead of every task — NCHRG will keep you notified.`}
            </Text>
        </View>
    );
});
HaloInsightCard.displayName = 'HaloInsightCard';


export const DashboardPreviewLayout: FC<DashboardPreviewLayoutProps> = ({
    modules,
    accentColor,
    secondaryColor,
    label,
    badge,
    saveLabel,
    onSave,
    isSaveLoading = false,
    addAnotherLabel,
    onAddAnother,
    hideFooter = false,
    disableSafeArea = false,
    spaceType = 'Personal',
    businessId,
    onActionButton,
    onView,
    onMarkDone,
    onMarkSubItemDone,
    onViewChecklist,
    searchQuery,
    insightsSlot,
    topSlot,
    onInsightsRefresh,
}) => {
    const { themeColors } = useUserRole();
    const s = useMemo(() => makeS(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();
    const { dashboard_data, dashboard_status } = useSelector(
        (state: any) => state.onboarding_slice,
    );
    const isDashboardLoading = dashboard_status === ASYNC_STATUS.LOADING;
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = useCallback(
        () => dispatch(getDashboardAsync({ spaceType, businessId: businessId ?? undefined } as any)),
        [dispatch, spaceType, businessId],
    );

    useFocusEffect(useCallback(() => {
        fetchDashboard();
    }, [fetchDashboard]));

    useEffect(() => {
        const sub = AppState.addEventListener('change', state => {
            if (state === 'active') fetchDashboard();
        });
        return () => sub.remove();
    }, [fetchDashboard]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchDashboard();
        } finally {
            setRefreshing(false);
        }
    }, [fetchDashboard]);

    const [insightsRefreshing, setInsightsRefreshing] = useState(false);
    const onInsightsRefreshPress = useCallback(async () => {
        setInsightsRefreshing(true);
        try {
            await onInsightsRefresh?.();
        } finally {
            setInsightsRefreshing(false);
        }
    }, [onInsightsRefresh]);

    const solidAccent = accentColor.startsWith('#') && accentColor.length > 7
        ? '#' + accentColor.slice(1, 7)
        : accentColor;

    const [selectedFavId, setSelectedFavId] = useState<number | 'all'>('all');

    const showViewTabs = !!insightsSlot;
    const [activeView, setActiveView] = useState<number>(0);

    const allItems = useMemo<MockAttentionItem[]>(() => {
        if (dashboard_data) {
            let idx = 0;
            const mapItem = (badgeType: BadgeType) => (i: DashboardAttentionItem): MockAttentionItem => ({
                id: `${badgeType}-${i.entitytype}-${i.entityid}-${idx++}`,
                moduleId: i.module.toLowerCase(),
                moduleName: i.module,
                routeKey: i.routekey ?? '',
                icon: getModuleIcon(i.module),
                title: i.title,
                subtitle: `${i.module} · ${i.description}`,
                badge: i.dayslabel,
                badgeType,
                chipId: getChipId(i.module),
                expandedText: i.description,
                buttonText: i.buttontext ?? 'View',
                reminderId: i.reminderid ?? null,
                entityType: i.entitytype,
                entityId: i.entityid,
                batchId: i.batchid ?? (i as any).batchId ?? null,
                parentId: i.parententityid ?? i.parentid ?? null,
                items: i.items,
            });
            return [
                ...(dashboard_data.needattention as DashboardAttentionItem[]).map(mapItem('red')),
                ...(dashboard_data.quickwins as DashboardAttentionItem[]).map(mapItem('green')),
                ...(dashboard_data.upcoming as DashboardAttentionItem[]).map(mapItem('orange')),
            ];
        }
        return [];
    }, [dashboard_data]);


    const needAttention = dashboard_data?.briefing?.needattentioncount
        ?? allItems.filter(i => i.badgeType === 'red').length;
    const quickWins = dashboard_data?.briefing?.quickwinscount
        ?? allItems.filter(i => i.badgeType === 'green').length;
    const upcoming = dashboard_data?.briefing?.upcomingcount
        ?? allItems.filter(i => i.badgeType === 'orange').length;
    const progress = Math.round((1 / (needAttention + 1)) * 100);

    const [expandedItemId, setExpandedItemId] = useState<string | null>(
        () => allItems[0]?.id ?? null,
    );

    const favoriteTiles = useMemo<DashboardFavorite[]>(() => {
        if (dashboard_data?.favorites?.length) {
            return [...dashboard_data.favorites].sort(
                (a, b) => a.displayorder - b.displayorder,
            );
        }
        return modules.map((mod, idx) => ({
            id: idx + 1,
            name: mod.name,
            icon: 'fa-home',
            route: mod.route,
            tabcategoryid: 1,
            categoryname: mod.category,
            displayorder: idx + 1,
            isfavorite: true,
            createdat: '',
            updatedat: '',
        }));
    }, [dashboard_data, modules]);


    const activeModuleNames = useMemo<Set<string> | null>(() => {
        if (selectedFavId === 'all') return null;
        const fav = favoriteTiles.find(f => f.id === selectedFavId);
        if (!fav) return null;
        const favLower = fav.name.toLowerCase();
        const matched = new Set<string>();
        allItems.forEach(item => {
            const modLower = item.moduleName.toLowerCase();
            if (favLower.includes(modLower) || modLower.includes(favLower)) {
                matched.add(item.moduleName);
            }
        });
        return matched;
    }, [selectedFavId, favoriteTiles, allItems]);

    const filteredItems = useMemo<MockAttentionItem[]>(() => {
        let items = activeModuleNames
            ? allItems.filter(i => activeModuleNames.has(i.moduleName))
            : allItems;
        const q = searchQuery?.trim().toLowerCase();
        if (q) {
            items = items.filter(
                i =>
                    i.title?.toLowerCase().includes(q) ||
                    i.subtitle?.toLowerCase().includes(q),
            );
        }
        return items;
    }, [allItems, activeModuleNames, searchQuery]);

    const handleToggle = useCallback((id: string) => {
        setExpandedItemId(prev => (prev === id ? null : id));
    }, []);

    const Wrapper = disableSafeArea ? View : SafeAreaView;

    return (
        <Wrapper style={s.container}>
            {showViewTabs && (
                <CustomTabs
                    tabs={[{ label: 'Advanced Dashboard' }, { label: 'Insights' }]}
                    activeTab={activeView}
                    onTabChange={setActiveView}
                    showIcons={false}
                    containerStyle={s.viewTabsContainer}
                />
            )}

            {showViewTabs && activeView === 1 ? (
                <ScrollView
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                    refreshControl={
                        <RefreshControl
                            refreshing={insightsRefreshing}
                            onRefresh={onInsightsRefreshPress}
                            tintColor={solidAccent}
                            colors={[solidAccent]}
                        />
                    }
                >
                    {insightsSlot}
                </ScrollView>
            ) : (
            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={solidAccent}
                        colors={[solidAccent]}
                    />
                }
            >
                {!hideFooter && (
                    <View style={s.header}>
                        <Text style={s.headerLabel}>{label}</Text>
                        <View style={[s.headerBadge, { backgroundColor: accentColor }]}>
                            <Text style={s.headerBadgeText}>{badge}</Text>
                        </View>
                    </View>
                )}

                {topSlot}

                <BriefingCard
                    accentColor={solidAccent}
                    needAttention={needAttention}
                    quickWins={quickWins}
                    upcoming={upcoming}
                    progress={progress}
                />

                <View style={s.favSection}>
                    <View style={s.favHeader}>
                        <Text style={s.favTitle}>Favorites</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.chipsRow}
                    >
                        <FavoriteChip
                            chip={ALL_CHIP}
                            selected={selectedFavId === 'all'}
                            accentColor={solidAccent}
                            onPress={() => setSelectedFavId('all')}
                        />
                        {favoriteTiles.map(fav => (
                            <FavoriteModuleTile
                                key={fav.id}
                                fav={fav}
                                accentColor={solidAccent}
                                selected={selectedFavId === fav.id}
                                onPress={() => setSelectedFavId(fav.id)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={s.attSection}>
                    <Text style={s.attSectionTitle}>What needs attention</Text>
                    {isDashboardLoading ? (
                        <View style={s.emptyState}>
                            <ActivityIndicator size="small" color={solidAccent} />
                        </View>
                    ) : filteredItems.length === 0 ? (
                        <View style={s.emptyState}>
                            <Feather name="check-circle" size={36} color={accentColor} />
                            <Text style={s.emptyText}>All clear in this category!</Text>
                        </View>
                    ) : (
                        filteredItems.map(item => (
                            <AttentionItemCard
                                key={item.id}
                                item={item}
                                expanded={expandedItemId === item.id}
                                accentColor={solidAccent}
                                onToggle={() => handleToggle(item.id)}
                                onActionButton={onActionButton}
                                onView={onView}
                                onMarkDone={onMarkDone}
                                onMarkSubItemDone={onMarkSubItemDone}
                                onViewChecklist={onViewChecklist}
                            />
                        ))
                    )}
                </View>

                <HaloInsightCard
                    secondaryColor={secondaryColor}
                    itemCount={allItems.length}
                    urgentCount={needAttention}
                />
            </ScrollView>
            )}

            {!hideFooter && (onSave || onAddAnother) && (
                <View style={s.footer}>
                    {onAddAnother && addAnotherLabel && (
                        <TouchableOpacity
                            style={[s.outlineBtn, { borderColor: accentColor }]}
                            onPress={onAddAnother}
                            activeOpacity={0.8}
                        >
                            <Text style={[s.outlineBtnText, { color: accentColor }]}>
                                {addAnotherLabel}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {onSave && saveLabel && (
                        <TouchableOpacity
                            style={[s.saveBtn, { backgroundColor: accentColor, opacity: isSaveLoading ? 0.7 : 1 }]}
                            onPress={onSave}
                            disabled={isSaveLoading}
                            activeOpacity={0.85}
                        >
                            {isSaveLoading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={s.saveBtnText}>{saveLabel}</Text>
                            }
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </Wrapper>
    );
};

export default DashboardPreviewLayout;
