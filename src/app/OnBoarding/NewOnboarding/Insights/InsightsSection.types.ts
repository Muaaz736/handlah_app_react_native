export interface InsightsSectionProps {
    spaceType: 'Personal' | 'Business';
    businessId?: number | null;
    accentColor: string;
    /** Called instead of navigating when the user taps "Get Started" on the
     * getting-started card, for hosts (e.g. the inline dashboard toggle) that
     * aren't a separate pushed screen and so have nothing to navigate back to. */
    onExit?: () => void;
}

export interface InsightsSectionRef {
    refresh: () => Promise<void>;
}

/** Fixed snooze durations approved for the picker — client-computed, no server enum. */
export const SNOOZE_MONTH_OPTIONS = [1, 3, 6, 9, 12] as const;
export type SnoozeMonths = (typeof SNOOZE_MONTH_OPTIONS)[number];
