import { ASYNC_STATUS } from '../../config/constants';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

// Common API Response Type
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
}

// Complete LegalState interface
export interface LiabilitiesState {
    // Legal Initial State



    get_loan_status: AsyncStatusType,
    get_loan_data: any,
    get_loan_error: string | null | undefined;

    add_loan_status: AsyncStatusType,
    add_loan_data: any,
    add_loan_error: string | null | undefined;

    update_loan_status: AsyncStatusType,
    update_loan_data: any,
    update_loan_error: string | null | undefined;

    delete_loan_status: AsyncStatusType,
    delete_loan_data: any,
    delete_loan_error: string | null | undefined;

    link_loan_status: AsyncStatusType,
    link_loan_data: any,
    link_loan_error: string | null | undefined;

    add_loans_bulk_status: AsyncStatusType,
    add_loans_bulk_data: any,
    add_loans_bulk_error: string | null | undefined;

    // Utilities Initial State

    get_utilities_status: AsyncStatusType,
    get_utilities_data: any,
    get_utilities_error: string | null | undefined;

    add_utility_status: AsyncStatusType,
    add_utility_data: any,
    add_utility_error: string | null | undefined;

    update_utility_status: AsyncStatusType,
    update_utility_data: any,
    update_utility_error: string | null | undefined;

    delete_utility_status: AsyncStatusType,
    delete_utility_data: any,
    delete_utility_error: string | null | undefined;

    link_utility_status: AsyncStatusType,
    link_utility_data: any,
    link_utility_error: string | null | undefined;

    // Insurance Initial State

    get_insurances_status: AsyncStatusType,
    get_insurances_data: any,
    get_insurances_error: string | null | undefined;

    add_insurance_status: AsyncStatusType,
    add_insurance_data: any,
    add_insurance_error: string | null | undefined;

    update_insurance_status: AsyncStatusType,
    update_insurance_data: any,
    update_insurance_error: string | null | undefined;

    delete_insurance_status: AsyncStatusType,
    delete_insurance_data: any,
    delete_insurance_error: string | null | undefined;

    link_insurance_status: AsyncStatusType,
    link_insurance_data: any,
    link_insurance_error: string | null | undefined;

    add_insurances_bulk_status: AsyncStatusType,
    add_insurances_bulk_data: any,
    add_insurances_bulk_error: string | null | undefined;

    // Warranties Initial State

    get_warranties_status: AsyncStatusType,
    get_warranties_data: any,
    get_warranties_error: string | null | undefined;

    add_warranty_status: AsyncStatusType,
    add_warranty_data: any,
    add_warranty_error: string | null | undefined;

    update_warranty_status: AsyncStatusType,
    update_warranty_data: any,
    update_warranty_error: string | null | undefined;

    delete_warranty_status: AsyncStatusType,
    delete_warranty_data: any,
    delete_warranty_error: string | null | undefined;

    link_warranty_status: AsyncStatusType,
    link_warranty_data: any,
    link_warranty_error: string | null | undefined;

    add_warranties_bulk_status: AsyncStatusType,
    add_warranties_bulk_data: any,
    add_warranties_bulk_error: string | null | undefined;

}
