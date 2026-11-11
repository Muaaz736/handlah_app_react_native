import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import { DashboardSubItem } from '../../../../redux/services/onboardingService';

export interface Module {
    id: string;
    route: string;
    name: string;
    icon: any;
    category: string;
}

export type BadgeType = 'red' | 'orange' | 'green';
export type ChipId = 'all' | 'health' | 'wallet' | 'property' | 'business' | 'docs';

export interface MockAttentionItem {
    id: string;
    moduleId: string;
    moduleName: string;
    routeKey: string;
    icon: ImageSourcePropType;
    title: string;
    subtitle: string;
    badge: string;
    badgeType: BadgeType;
    chipId: Exclude<ChipId, 'all'>;
    expandedText: string;
    buttonText: string;
    reminderId: number | null;
    entityType: string;
    entityId: number;
    batchId: string | null;
    parentId?: number | null;
    items?: DashboardSubItem[];
}

export interface ChipDef {
    id: ChipId;
    label: string;
    featherIcon: string;
}

export interface DashboardPreviewLayoutProps {
    modules: Module[];
    accentColor: string;
    secondaryColor: string;
    label: string;
    badge: string;
    saveLabel?: string;
    onSave?: () => void;
    isSaveLoading?: boolean;
    addAnotherLabel?: string;
    onAddAnother?: () => void;
    hideFooter?: boolean;
    disableSafeArea?: boolean;
    /** Pass to fetch real dashboard data. Defaults to 'Personal'. */
    spaceType?: 'Personal' | 'Business';
    businessId?: number | null;
    onActionButton?: (item: MockAttentionItem) => Promise<void> | void;
    onView?: (item: MockAttentionItem) => void;
    onMarkDone?: (item: MockAttentionItem) => void;
    onMarkSubItemDone?: (reminderId: number, parentItem: MockAttentionItem) => void;
    onViewChecklist?: (item: MockAttentionItem) => Promise<void> | void;
    /** Frontend-only text filter applied to the "What needs attention" items. */
    searchQuery?: string;
    /** Optional content rendered between "What needs attention" and the Halo AI card — e.g. the Insight Engine section. */
    insightsSlot?: ReactNode;
    /** Shown at the top of the main dashboard view, above the briefing card (the personal daily brief). */
    topSlot?: ReactNode;
    /** Pull-to-refresh handler for the "Insights" tab (insightsSlot has no ScrollView of its own). */
    onInsightsRefresh?: () => Promise<any> | void;
}
