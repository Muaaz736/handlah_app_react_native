import { ASYNC_STATUS } from '../../config/constants';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

// Common API Response Type
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success?: boolean;
}



// Complete AssetsState interface
export interface AssetsState {
    // ==================== overview API Initial States Types ====================


    add_bank_account_status: AsyncStatusType,
    add_bank_account_data: any,
    add_bank_account_error: string | null | undefined,

    get_bank_account_status: AsyncStatusType,
    get_bank_account_data: any,
    get_bank_account_error: string | null | undefined,

    update_bank_account_status: AsyncStatusType,
    update_bank_account_data: any,
    update_bank_account_error: string | null | undefined,

    delete_bank_account_status: AsyncStatusType,
    delete_bank_account_data: any,
    delete_bank_account_error: string | null | undefined,

    // ==================== overview API Initial States Types ====================
    add_real_state_overview_status: AsyncStatusType,
    add_real_state_overview_data: any,
    add_real_state_overview_error: string | null | undefined,

    get_real_state_overview_status: AsyncStatusType,
    get_real_state_overview_data: any,
    get_real_state_overview_error: string | null | undefined,

    get_real_state_overview_by_id_status: AsyncStatusType,
    get_real_state_overview_by_id_data: any,
    get_real_state_overview_by_id_error: string | null | undefined,

    update_real_state_overview_status: AsyncStatusType,
    update_real_state_overview_data: any,
    update_real_state_overview_error: string | null | undefined,

    delete_real_state_overview_status: AsyncStatusType,
    delete_real_state_overview_data: any,
    delete_real_state_overview_error: string | null | undefined,


    // ==================== loanmortgage API Initial States Types ====================

    add_real_state_loan_mortgage_status: AsyncStatusType,
    add_real_state_loan_mortgage_data: any
    add_real_state_loan_mortgage_error: string | null | undefined,

    get_real_state_loan_mortgage_status: AsyncStatusType,
    get_real_state_loan_mortgage_data: any
    get_real_state_loan_mortgage_error: string | null | undefined,

    get_real_state_loan_mortgage_by_id_status: AsyncStatusType,
    get_real_state_loan_mortgage_by_id_data: any
    get_real_state_loan_mortgage_by_id_error: string | null | undefined,

    update_real_state_loan_mortgage_status: AsyncStatusType,
    update_real_state_loan_mortgage_data: any
    update_real_state_loan_mortgage_error: string | null | undefined,

    delete_real_state_loan_mortgage_status: AsyncStatusType,
    delete_real_state_loan_mortgage_data: any
    delete_real_state_loan_mortgage_error: string | null | undefined,


    // ==================== Utilities API Initial States Types ====================

    add_real_state_utilities_status: AsyncStatusType,
    add_real_state_utilities_data: any,
    add_real_state_utilities_error: string | null | undefined,

    get_real_state_utilities_status: AsyncStatusType,
    get_real_state_utilities_data: any,
    get_real_state_utilities_error: string | null | undefined,

    get_real_state_utilities_by_id_status: AsyncStatusType,
    get_real_state_utilities_by_id_data: any,
    get_real_state_utilities_by_id_error: string | null | undefined,

    update_real_state_utilities_status: AsyncStatusType,
    update_real_state_utilities_data: any,
    update_real_state_utilities_error: string | null | undefined,

    delete_real_state_utilities_status: AsyncStatusType,
    delete_real_state_utilities_data: any,
    delete_real_state_utilities_error: string | null | undefined,

    // ==================== Insurance API Initial States Types ====================

    add_real_state_insurance_status: AsyncStatusType,
    add_real_state_insurance_data: any,
    add_real_state_insurance_error: string | null | undefined,
    
    get_real_state_insurance_status: AsyncStatusType,
    get_real_state_insurance_data: any,
    get_real_state_insurance_error: string | null | undefined,

    get_real_state_insurance_by_id_status: AsyncStatusType,
    get_real_state_insurance_by_id_data: any,
    get_real_state_insurance_by_id_error: string | null | undefined,

    update_real_state_insurance_status: AsyncStatusType,
    update_real_state_insurance_data: any,
    update_real_state_insurance_error: string | null | undefined,

    delete_real_state_insurance_status: AsyncStatusType,
    delete_real_state_insurance_data: any,
    delete_real_state_insurance_error: string | null | undefined,

    // ==================== Warranties API Initial States Types ====================

    add_real_state_warranties_status: AsyncStatusType,
    add_real_state_warranties_data: any,
    add_real_state_warranties_error: string | null | undefined,

    get_real_state_warranties_status: AsyncStatusType,
    get_real_state_warranties_data: any,
    get_real_state_warranties_error: string | null | undefined,

    get_real_state_warranties_by_id_status: AsyncStatusType,
    get_real_state_warranties_by_id_data: any,
    get_real_state_warranties_by_id_error: string | null | undefined,

    update_real_state_warranties_status: AsyncStatusType,
    update_real_state_warranties_data: any,
    update_real_state_warranties_error: string | null | undefined,

    delete_real_state_warranties_status: AsyncStatusType,
    delete_real_state_warranties_data: any,
    delete_real_state_warranties_error: string | null | undefined,

    // ==================== Personal Property API Initial States Types ====================

    add_real_state_personal_property_status: AsyncStatusType,
    add_real_state_personal_property_data: any,
    add_real_state_personal_property_error: string | null | undefined,

    get_real_state_personal_property_status: AsyncStatusType,
    get_real_state_personal_property_data: any,
    get_real_state_personal_property_error: string | null | undefined,

    get_real_state_personal_property_by_id_status: AsyncStatusType,
    get_real_state_personal_property_by_id_data: any,
    get_real_state_personal_property_by_id_error: string | null | undefined,

    update_real_state_personal_property_status: AsyncStatusType,
    update_real_state_personal_property_data: any,
    update_real_state_personal_property_error: string | null | undefined,
    
    delete_real_state_personal_property_status: AsyncStatusType,
    delete_real_state_personal_property_data: any,
    delete_real_state_personal_property_error: string | null | undefined,

    // ==================== Service Work History API Initial States Types ====================

    add_real_state_service_work_history_status: AsyncStatusType,
    add_real_state_service_work_history_data: any,
    add_real_state_service_work_history_error: string | null | undefined,
    
    get_real_state_service_work_history_status: AsyncStatusType,
    get_real_state_service_work_history_data: any,
    get_real_state_service_work_history_error: string | null | undefined,

    get_real_state_service_work_history_by_id_status: AsyncStatusType,
    get_real_state_service_work_history_by_id_data: any,
    get_real_state_service_work_history_by_id_error: string | null | undefined,

    update_real_state_service_work_history_status: AsyncStatusType,
    update_real_state_service_work_history_data: any,
    update_real_state_service_work_history_error: string | null | undefined,

    delete_real_state_service_work_history_status: AsyncStatusType,
    delete_real_state_service_work_history_data: any,
    delete_real_state_service_work_history_error: string | null | undefined,

    // ==================== Personal Property API Initial States Types ====================

    add_personal_property_status: AsyncStatusType,
    add_personal_property_data: any,
    add_personal_property_error: string | null | undefined,

    get_personal_property_status: AsyncStatusType,
    get_personal_property_data: any,
    get_personal_property_error: string | null | undefined,

    get_personal_property_by_id_status: AsyncStatusType,
    get_personal_property_by_id_data: any,
    get_personal_property_by_id_error: string | null | undefined,

    update_personal_property_status: AsyncStatusType,
    update_personal_property_data: any,
    update_personal_property_error: string | null | undefined,

    delete_personal_property_status: AsyncStatusType,
    delete_personal_property_data: any,
    delete_personal_property_error: string | null | undefined,

    // ==================== Vehicles API Initial States Types ====================

    add_vehicle_status: AsyncStatusType,
    add_vehicle_data: any,
    add_vehicle_error: string | null | undefined,

    get_vehicles_status: AsyncStatusType,
    get_vehicles_data: any,
    get_vehicles_error: string | null | undefined,

    get_vehicle_by_id_status: AsyncStatusType,
    get_vehicle_by_id_data: any,
    get_vehicle_by_id_error: string | null | undefined,

    update_vehicle_status: AsyncStatusType,
    update_vehicle_data: any,
    update_vehicle_error: string | null | undefined,

    delete_vehicle_status: AsyncStatusType,
    delete_vehicle_data: any,
    delete_vehicle_error: string | null | undefined,

    // ==================== Vehicle Service Records API Initial States Types ====================

    add_vehicle_service_records_bulk_status: AsyncStatusType,
    add_vehicle_service_records_bulk_data: any,
    add_vehicle_service_records_bulk_error: string | null | undefined,

    get_vehicle_service_records_status: AsyncStatusType,
    get_vehicle_service_records_data: any,
    get_vehicle_service_records_error: string | null | undefined,

    update_vehicle_service_record_status: AsyncStatusType,
    update_vehicle_service_record_data: any,
    update_vehicle_service_record_error: string | null | undefined,

    delete_vehicle_service_record_status: AsyncStatusType,
    delete_vehicle_service_record_data: any,
    delete_vehicle_service_record_error: string | null | undefined,

    // ==================== Vehicle Accidents API Initial States Types ====================

    add_vehicle_accidents_bulk_status: AsyncStatusType,
    add_vehicle_accidents_bulk_data: any,
    add_vehicle_accidents_bulk_error: string | null | undefined,

    get_vehicle_accidents_status: AsyncStatusType,
    get_vehicle_accidents_data: any,
    get_vehicle_accidents_error: string | null | undefined,

    update_vehicle_accident_status: AsyncStatusType,
    update_vehicle_accident_data: any,
    update_vehicle_accident_error: string | null | undefined,

    delete_vehicle_accident_status: AsyncStatusType,
    delete_vehicle_accident_data: any,
    delete_vehicle_accident_error: string | null | undefined,


    mark_vehicle_as_sold_status: AsyncStatusType,
    mark_vehicle_as_sold_data: any,
    mark_vehicle_as_sold_error: string | null | undefined,

    share_vehicle_status: AsyncStatusType,
    share_vehicle_data: any,
    share_vehicle_error: string | null | undefined,

    get_businesses_by_username_status: AsyncStatusType,
    get_businesses_by_username_data: any,
    get_businesses_by_username_error: string | null | undefined,

    incoming_vehicle_transfers_status: AsyncStatusType,
    incoming_vehicle_transfers_data: any,
    incoming_vehicle_transfers_error: string | null | undefined,

    accept_vehicle_transfer_status: AsyncStatusType,
    accept_vehicle_transfer_data: any,
    accept_vehicle_transfer_error: string | null | undefined,

    reject_vehicle_transfer_status: AsyncStatusType,
    reject_vehicle_transfer_data: any,
    reject_vehicle_transfer_error: string | null | undefined,

    move_personal_property_status: AsyncStatusType,
    move_personal_property_data: any,
    move_personal_property_error: string | null | undefined,

    vehicle_sale_transfer_status: AsyncStatusType,
    vehicle_sale_transfer_data: any,
    vehicle_sale_transfer_error: string | null | undefined,

    update_vehicle_sale_transfer_status: AsyncStatusType,
    update_vehicle_sale_transfer_data: any,
    update_vehicle_sale_transfer_error: string | null | undefined,
}


