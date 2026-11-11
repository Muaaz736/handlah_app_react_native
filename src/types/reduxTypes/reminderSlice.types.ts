import { ASYNC_STATUS } from "../../config/constants";

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

export interface ReminderTypes {
    get_reminder_status: AsyncStatusType;
    get_reminder_data: any | null;
    get_reminder_items: any[];
    /** Normalized grouped reminders (batches + singletons) for the list UI. */
    get_reminder_groups: any[];
    get_reminder_pagination: { page: number; pageSize: number; total: number; hasMore: boolean } | null;
    get_reminder_error: string | null;

    /** Shared status for secondary mutations: active toggle, batch update/delete. */
    reminder_action_status: AsyncStatusType;
    reminder_action_error: string | null;

    add_ad_hoc_reminder_status: AsyncStatusType;
    add_ad_hoc_reminder_data: any | null;
    add_ad_hoc_reminder_error: string | null;

    mark_completed_reminder_status: AsyncStatusType;
    mark_completed_reminder_data: any | null;
    mark_completed_reminder_error: string | null;

    pending_reminders_count: number;

    get_upcoming_reminders_status: AsyncStatusType;
    get_upcoming_reminders_data: any | null;
    get_upcoming_reminders_error: string | null;


    get_today_reminders_status: AsyncStatusType;
    get_today_reminders_data: any | null;
    get_today_reminders_error: string | null;
}