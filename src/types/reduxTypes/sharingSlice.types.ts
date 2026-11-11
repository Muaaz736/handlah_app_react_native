import { ASYNC_STATUS } from "../../config/constants";

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

export interface SharingTypes {
    get_summary_status: AsyncStatusType;
    get_summary_data: any | null;
    get_summary_error: string | null;

    get_emergency_summary_status: AsyncStatusType,
    get_emergency_summary_data: any | null,
    get_emergency_summary_error: string | null;

    send_emergency_request_status: AsyncStatusType;
    send_emergency_request_data: any | null;
    send_emergency_request_error: string | null;

    share_sync_status: AsyncStatusType;
    share_sync_error: string | null;

    selectedSharedBusiness: any | null;

    selectedOwnBusiness: any | null;

    get_shared_by_users_status: AsyncStatusType;
    get_shared_by_users_data: any | null;
    get_shared_by_users_error: string | null;
}