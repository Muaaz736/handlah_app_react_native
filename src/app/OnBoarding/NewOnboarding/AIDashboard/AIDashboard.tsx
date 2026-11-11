import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { useUserRole } from '../../../../hooks/useUserRole';
import { DashboardPreviewLayout } from '../DashboardPreviewUI/DashboardPreviewUI';
import { MockAttentionItem } from '../DashboardPreviewUI/DashboardPreviewUI.types';
import InsightsSection from '../Insights/InsightsSection';
import { InsightsSectionRef } from '../Insights/InsightsSection.types';
import { resolveAttentionItemTarget, resolveEntityEditTarget } from '../../../../utils/notificationNavigator';
import colors from '../../../../utils/colors';
import { markDashboardItemDoneAsync, getDashboardAsync } from '../../../../redux/services/onboardingService';
import { AppDispatch } from '../../../../types/store.types';
import { CustomDateTimePicker } from '../../../../components/common';
import {
    fetchEntityGuidance,
    ReminderCardRequest,
    EntityGuidanceResponse,
    fetchEntityPortals,
    EntityPortalsResponse,
    EntityPortalsError,
} from '../../../screens/AiAssistant/modules/AiChatbot/api';
import { AIDashboardRoute, MarkDoneModalProps, GuidanceModalProps } from './AIDashboard.types';
import { makeAiDashboardStyles, makeMarkDoneModalStyles, makeGuidanceModalStyles } from './AIDashboard.styles';
import { enforceHttps } from '../../../../utils/httpsGuard';
import { RoleTheme } from '../../../../types/roleManager.types';

const REQUIRES_NEXT_DATE_TYPES = [
    'warranty',
    'insurance',
    'business_license',
    'compliance_record',
    'driver_license',
    'license_certification',
    'passport',
    'legal_document',
    'pet_vaccination',
    'pet_registration',
  'subscription',
    'loan_ending',
    'utility_ending',
    'bank_account_ending',
];

const NEXT_DATE_TYPES: string[] = REQUIRES_NEXT_DATE_TYPES;

const OPTIONAL_NEXT_DATE_TYPES = [
    'warranty',
    'insurance',
    'business_license',
    'compliance_record',
    'driver_license',
    'license_certification',
    'passport',
    'legal_document',
    'pet_vaccination',
    'pet_registration',
  'subscription',
    'loan_ending',
    'utility_ending',
    'bank_account_ending',
];

const toReminderCardRequest = (
    item: MockAttentionItem,
    opts?: { businessId?: number | null; accountType?: string },
): ReminderCardRequest => ({
    title: item.title,
    module: item.moduleName,
    description: item.expandedText,
    entityType: item.entityType,
    urgency: item.badgeType === 'green' ? 'Quick Win' : item.badgeType === 'orange' ? 'Upcoming' : 'Due today',
    daysLabel: item.badge,
    entityId: item.entityId,
    routeKey: item.routeKey,
    buttonText: item.buttonText,
    reminderId: item.reminderId,
    parentId: item.parentId ?? undefined,
    businessId: opts?.businessId ?? undefined,
    accountType: opts?.accountType,
});

const MarkDoneModal: React.FC<MarkDoneModalProps> = ({
    visible,
    item,
    accentColor,
    spaceType,
    businessId,
    onClose,
    onSuccess,
    ms,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateError, setDateError] = useState('');

   
    const showsNextDate = item ? NEXT_DATE_TYPES.includes(item.entityType) : false;
    const isNextDateOptional = item ? OPTIONAL_NEXT_DATE_TYPES.includes(item.entityType) : false;
    const isNextDateRequired = showsNextDate && !isNextDateOptional;

    const handleSubmit = useCallback(async () => {
        if (!item) return;
        if (isNextDateRequired && !selectedDate) {
            setDateError(t('ai_dashboard.mark_done.date_required'));
            return;
        }
        setDateError('');
        setIsSubmitting(true);
        try {
            const payload = {
                entityType: item.entityType,
                entityId: item.entityId,
                ...(item.batchId ? { batchId: item.batchId } : {}),
                reminderId: item.reminderId ?? undefined,
                nextDate: showsNextDate && selectedDate ? selectedDate.toISOString() : undefined,
            };
            await dispatch(markDashboardItemDoneAsync(payload)).unwrap();
            setSelectedDate(null);
            onSuccess();
        } catch (e) {
            Alert.alert(t('common.error'), t('ai_dashboard.mark_done.error_message'));
        } finally {
            setIsSubmitting(false);
        }
    }, [item, selectedDate, isNextDateRequired, showsNextDate, dispatch, onSuccess]);

    const handleClose = () => {
        setSelectedDate(null);
        setDateError('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={ms.overlay}
                activeOpacity={1}
                onPress={handleClose}
            />
            <View style={ms.sheet}>
                <View style={ms.handle} />
                <Text style={ms.title}>{t('ai_dashboard.mark_done.title')}</Text>
                {item && (
                    <Text style={ms.subtitle} numberOfLines={2}>
                        {item.title} — {item.moduleName}
                    </Text>
                )}

                {showsNextDate && (
                    <View style={ms.fieldBlock}>
                        <CustomDateTimePicker
                            label={
                                isNextDateOptional
                                    ? `${t('ai_dashboard.mark_done.next_due_label')}`
                                    : t('ai_dashboard.mark_done.next_due_label')
                            }
                            placeholder={t('ai_dashboard.mark_done.select_date_placeholder')}
                            value={selectedDate}
                            onChange={d => {
                                setSelectedDate(d instanceof Date ? d : new Date(d));
                                setDateError('');
                            }}
                            mode="date"
                            minimumDate={new Date()}
                            displayFormat="MM/DD/YYYY"
                            error={dateError || undefined}
                        />
                    </View>
                )}

                {!showsNextDate && (
                    <Text style={ms.confirmText}>
                        {t('ai_dashboard.mark_done.confirm_text')}
                    </Text>
                )}

                <TouchableOpacity
                    style={[ms.submitBtn, { backgroundColor: accentColor, opacity: isSubmitting ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={ms.submitBtnText}>{t('common.confirm')}</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={ms.cancelBtn}
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Text style={ms.cancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const GuidanceModal: React.FC<GuidanceModalProps> = ({ visible, item, accentColor, onClose, gm }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [guidance, setGuidance] = useState<EntityGuidanceResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const load = useCallback(async () => {
        if (!item) return;
        setStatus('loading');
        setGuidance(null);
        setErrorMsg('');
        try {
            const data = await fetchEntityGuidance(toReminderCardRequest(item));
            setGuidance(data);
            setStatus('success');
        } catch (e: any) {
            setErrorMsg(e?.message ?? 'Something went wrong. Please try again.');
            setStatus('error');
        }
    }, [item]);

    React.useEffect(() => {
        if (visible && item) { load(); }
    }, [visible, item]); // eslint-disable-line react-hooks/exhaustive-deps

    const hasList = (arr?: string[]) => Array.isArray(arr) && arr.length > 0;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={gm.overlay} activeOpacity={1} onPress={onClose} />
            <View style={gm.sheet}>
                <View style={gm.handle} />

                <View style={gm.header}>
                    <View style={[gm.iconCircle, { backgroundColor: accentColor + '20' }]}>
                        <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={accentColor} />
                    </View>
                    <View style={gm.headerText}>
                        <Text style={gm.headerTitle} numberOfLines={1}>{item?.title ?? t('ai_dashboard.guidance.title_fallback')}</Text>
                        <Text style={gm.headerSub} numberOfLines={1}>{item?.moduleName ?? ''}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name="x" size={20} color={colors.darkGray} />
                    </TouchableOpacity>
                </View>

                <View style={gm.divider} />

                {status === 'loading' && (
                    <View style={gm.center}>
                        <ActivityIndicator size="large" color={accentColor} />
                        <Text style={gm.loadingText}>{t('ai_dashboard.guidance.loading_text')}</Text>
                    </View>
                )}

                {status === 'error' && (
                    <View style={gm.center}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#E53E3E" />
                        <Text style={gm.errorText}>{errorMsg}</Text>
                        <TouchableOpacity
                            style={[gm.retryBtn, { borderColor: accentColor }]}
                            onPress={load}
                            activeOpacity={0.8}
                        >
                            <Text style={[gm.retryText, { color: accentColor }]}>{t('common.try_again')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {status === 'success' && guidance && (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={gm.scrollContent}
                    >
                        {hasList(guidance.checklist) && (
                            <View style={gm.section}>
                                <View style={gm.sectionHeader}>
                                    <MaterialCommunityIcons name="check-circle-outline" size={18} color={accentColor} />
                                    <Text style={[gm.sectionTitle, { color: accentColor }]}>{t('ai_dashboard.guidance.section_checklist')}</Text>
                                </View>
                                {guidance.checklist.map((step, i) => (
                                    <View key={i} style={gm.listItem}>
                                        <View style={[gm.bullet, { backgroundColor: accentColor }]} />
                                        <Text style={gm.listText}>{step}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasList(guidance.requiredDocuments) && (
                            <View style={gm.section}>
                                <View style={gm.sectionHeader}>
                                    <MaterialCommunityIcons name="file-document-outline" size={18} color={accentColor} />
                                    <Text style={[gm.sectionTitle, { color: accentColor }]}>{t('ai_dashboard.guidance.section_documents')}</Text>
                                </View>
                                {guidance.requiredDocuments.map((doc, i) => (
                                    <View key={i} style={gm.listItem}>
                                        <MaterialCommunityIcons name="paperclip" size={14} color={colors.gray} style={{ marginTop: 2 }} />
                                        <Text style={gm.listText}>{doc}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {hasList(guidance.guidance) && (
                            <View style={gm.section}>
                                <View style={gm.sectionHeader}>
                                    <MaterialCommunityIcons name="lightbulb-outline" size={18} color={accentColor} />
                                    <Text style={[gm.sectionTitle, { color: accentColor }]}>{t('ai_dashboard.guidance.section_guidance')}</Text>
                                </View>
                                {guidance.guidance.map((tip, i) => (
                                    <View key={i} style={gm.numberedItem}>
                                        <View style={[gm.numberCircle, { backgroundColor: accentColor }]}>
                                            <Text style={gm.numberText}>{i + 1}</Text>
                                        </View>
                                        <Text style={gm.listText}>{tip}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={[gm.closeBtn, { backgroundColor: accentColor }]}
                    onPress={onClose}
                    activeOpacity={0.85}
                >
                    <Text style={gm.closeBtnText}>{t('common.close')}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const AIDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute<AIDashboardRoute>();
    const { themeColors, isBusinessRole } = useUserRole();
    const aiDashboardStyles = useMemo(() => makeAiDashboardStyles(themeColors as RoleTheme), [themeColors]);
    const ms = useMemo(() => makeMarkDoneModalStyles(themeColors as RoleTheme), [themeColors]);
    const gm = useMemo(() => makeGuidanceModalStyles(themeColors as RoleTheme), [themeColors]);

    const spaceType: 'Personal' | 'Business' = route.params?.spaceType ?? 'Personal';
    const businessId: number | null = route.params?.businessId ?? null;

    const solidAccent = themeColors.primary.startsWith('#') && themeColors.primary.length > 7
        ? '#' + themeColors.primary.slice(1, 7)
        : themeColors.primary;

    const insightsRef = useRef<InsightsSectionRef>(null);
    const handleInsightsRefresh = useCallback(() => insightsRef.current?.refresh(), []);

    const [markDoneItem, setMarkDoneItem] = useState<MockAttentionItem | null>(null);
    const [isMarkDoneVisible, setIsMarkDoneVisible] = useState(false);

    const [guidanceItem, setGuidanceItem] = useState<MockAttentionItem | null>(null);
    const [isGuidanceVisible, setIsGuidanceVisible] = useState(false);

    const navigateToLegacyFlow = useCallback((item: MockAttentionItem) => {
        const target = resolveAttentionItemTarget(item);
        if (target) {
            navigation.navigate(target.screen as never, target.params as never);
        }
    }, [navigation]);

    const navigateToEntityEdit = useCallback((item: MockAttentionItem) => {
        const dashParams = { spaceType, businessId: businessId ?? null };
        const entityType = item.entityType?.toLowerCase();

        if (entityType === 'driver_license') {
            navigation.navigate('IdentityDriverLicenseForm' as never, {
                mode: 'edit',
                entityId: item.entityId,
                fromDashboard: true,
                dashboardParams: dashParams,
            } as never);
            return;
        }
        if (entityType === 'passport') {
            navigation.navigate('IdentityPassportForm' as never, {
                mode: 'edit',
                entityId: item.entityId,
                fromDashboard: true,
                dashboardParams: dashParams,
            } as never);
            return;
        }
        if (entityType === 'license_certification') {
            navigation.navigate('IdentityLicenseCertificationsForm' as never, {
                mode: 'edit',
                entityId: item.entityId,
                fromDashboard: true,
                dashboardParams: dashParams,
            } as never);
            return;
        }

        const target = resolveEntityEditTarget(item);
        if (target) {
            navigation.navigate(target.screen as never, target.params as never);
            return;
        }

        navigateToLegacyFlow(item);
    }, [navigation, spaceType, businessId, navigateToLegacyFlow]);

    const handleRedirectAction = useCallback(async (res: EntityPortalsResponse) => {
        const url = res.redirectUrl
            || res.relevantPortals?.[0]?.url
            || res.officialWebsites?.[0]?.url;
        if (url) {
            await Linking.openURL(enforceHttps(url));
        }
    }, []);

    const handlePopupAction = useCallback((res: EntityPortalsResponse, item: MockAttentionItem) => {
        const message = res.popupMessage || t('ai_dashboard.portals.no_link_message');
        Alert.alert(
            item.title,
            message,
            [
                {
                    text: t('ai_dashboard.portals.update_record'),
                    onPress: () => navigateToEntityEdit(item),
                },
                { text: t('common.ok'), style: 'cancel' },
            ],
        );
    }, [t, navigateToEntityEdit]);

    const handleNoneAction = useCallback(async (res: EntityPortalsResponse, item: MockAttentionItem) => {
        const url =
            res.officialWebsites?.[0]?.url ||
            res.relevantPortals?.[0]?.url;
        if (url) {
            await Linking.openURL(enforceHttps(url));
            return;
        }
        if (item.buttonText?.toLowerCase().startsWith('view')) {
            navigateToLegacyFlow(item);
            return;
        }
        navigation.navigate('Dashboard' as never, { screen: 'Reminders', params: { segment: 'reminders' } } as never);
    }, [navigation, navigateToLegacyFlow]);

    const showErrorWithRetry = useCallback((
        error: EntityPortalsError,
        retryFn: () => void,
    ) => {
        if (error.isAuthError) {
            Alert.alert(t('common.error'), error.message);
            return;
        }
        Alert.alert(
            t('common.error'),
            error.message,
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.try_again'), onPress: retryFn },
            ],
        );
    }, [t]);

    const handleActionButton = useCallback(async (item: MockAttentionItem) => {
        const doFetch = async () => {
            try {
                const req = toReminderCardRequest(item, {
                    businessId: businessId,
                    accountType: spaceType,
                });
                const res = await fetchEntityPortals(req);

                switch (res.action) {
                    case 'redirect':
                        await handleRedirectAction(res);
                        break;
                    case 'popup':
                        handlePopupAction(res, item);
                        break;
                    case 'none':
                    default:
                        await handleNoneAction(res, item);
                        break;
                }
            } catch (err) {
                if (err instanceof EntityPortalsError) {
                    showErrorWithRetry(err, doFetch);
                } else {
                    Alert.alert(
                        t('common.error'),
                        t('ai_dashboard.portals.fetch_error'),
                        [
                            { text: t('common.cancel'), style: 'cancel' },
                            { text: t('common.try_again'), onPress: doFetch },
                        ],
                    );
                }
            }
        };

        await doFetch();
    }, [
        navigation, businessId, spaceType, t,
        navigateToLegacyFlow, handleRedirectAction, handlePopupAction,
        handleNoneAction, showErrorWithRetry,
    ]);



    const handleView = useCallback((item: MockAttentionItem) => {
        const target = resolveAttentionItemTarget(item);
        if (target) {
            navigation.navigate(target.screen as never, target.params as never);
        }
    }, [navigation]);

    const handleViewChecklist = useCallback(async (item: MockAttentionItem) => {
        setGuidanceItem(item);
        setIsGuidanceVisible(true);
    }, []);

    const handleMarkDone = useCallback((item: MockAttentionItem) => {
        setMarkDoneItem(item);
        setIsMarkDoneVisible(true);
    }, []);

    const handleMarkSubItemDone = useCallback((reminderId: number, parentItem: MockAttentionItem) => {
        dispatch(markDashboardItemDoneAsync({
            entityType: parentItem.entityType,
            entityId: parentItem.entityId,
            reminderId,
        })).then(() => dispatch(getDashboardAsync({ spaceType, businessId: businessId ?? undefined } as any)));
    }, [dispatch, spaceType, businessId]);

    const handleMarkDoneSuccess = useCallback(() => {
        setIsMarkDoneVisible(false);
        setMarkDoneItem(null);
        dispatch(getDashboardAsync({ spaceType, businessId: businessId ?? undefined } as any));
    }, [dispatch, spaceType, businessId]);

    return (
        <SafeAreaView style={aiDashboardStyles.container} edges={['top', 'bottom']}>
            <View style={aiDashboardStyles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={aiDashboardStyles.backBtn}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={aiDashboardStyles.title}>{t('ai_dashboard.header_title')}</Text>
                <View style={aiDashboardStyles.headerSpacer} />
            </View>

            {isBusinessRole() ? (
                businessId ? (
                    <DashboardPreviewLayout
                        modules={[]}
                        accentColor={solidAccent}
                        secondaryColor={
                            themeColors.secondary ?? solidAccent + '33'
                        }
                        label=""
                        badge=""
                        hideFooter
                        disableSafeArea
                        spaceType={spaceType}
                        businessId={businessId}
                        onActionButton={handleActionButton}
                        onView={handleView}
                        onMarkDone={handleMarkDone}
                        onMarkSubItemDone={handleMarkSubItemDone}
                        onViewChecklist={handleViewChecklist}
                        insightsSlot={
                            <InsightsSection ref={insightsRef} spaceType={spaceType} businessId={businessId} accentColor={solidAccent} />
                        }
                        onInsightsRefresh={handleInsightsRefresh}
                    />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: colors.text }}>{t('ai_dashboard.no_business_selected')}</Text>
                    </View>
                )
            ) : (
                <DashboardPreviewLayout
                    modules={[]}
                    accentColor={solidAccent}
                    secondaryColor={
                        themeColors.secondary ?? solidAccent + '33'
                    }
                    label=""
                    badge=""
                    hideFooter
                    disableSafeArea
                    spaceType={spaceType}
                    onActionButton={handleActionButton}
                    onView={handleView}
                    onMarkDone={handleMarkDone}
                    onViewChecklist={handleViewChecklist}
                    insightsSlot={
                        <InsightsSection ref={insightsRef} spaceType={spaceType} businessId={businessId} accentColor={solidAccent} />
                    }
                    onInsightsRefresh={handleInsightsRefresh}
                />
            )}

            <MarkDoneModal
                visible={isMarkDoneVisible}
                item={markDoneItem}
                accentColor={solidAccent}
                spaceType={spaceType}
                businessId={businessId}
                onClose={() => setIsMarkDoneVisible(false)}
                onSuccess={handleMarkDoneSuccess}
                ms={ms}
            />

            <GuidanceModal
                visible={isGuidanceVisible}
                item={guidanceItem}
                accentColor={solidAccent}
                onClose={() => setIsGuidanceVisible(false)}
                gm={gm}
            />
        </SafeAreaView>
    );
};

export default AIDashboard;

