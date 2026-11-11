import { ASYNC_STATUS } from '../../config/constants';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

export interface BusinessDetailsPayload {
  businessName: string;
  description: string;
  ein: string;
  country: string;
  stateOfFormation: string;
  entityType: string;
  registeredAgentName: string;
  registeredAgentAddress: string;
  registeredAgentPhone: string;
  principalBusinessAddress: string;
}


export interface BusinessDetailsResponse {
  success: boolean;
  message: string;
  data: BusinessItem;
}


export interface BusinessItem {
  id: number;
  businessname: string;
  description: string;
  ein: string;
  country: string;
  stateofformation: string;
  entitytype: string;
  registeredagentname: string;
  registeredagentaddress: string;
  registeredagentphone: string;
  principalbusinessaddress: string;
  createdat: string;
  updatedat: string | null;
  countryname?: string;
  countryName?: string;
  statelabel?: string;
  stateLabel?: string;
}

// API returns array directly, not wrapped in {success, message, data}
export type GetBusinessResponse = BusinessItem[];


export interface UpdateBusinessParams {
  id: number | string;
  data: Partial<BusinessDetailsPayload>;
}


export interface DeleteBusinessResponse {
  success: boolean;
  message: string;
  deletedId: number | string;
}


export interface BusinessState {
  // Selected business
  selectedBusinessId: number | null;

  // Get businesses
  get_businesses_status: AsyncStatusType;
  get_businesses_data: BusinessItem[] | null;
  get_businesses_error: string | null;

  // Create business
  create_business_status: AsyncStatusType;
  create_business_data: BusinessDetailsResponse['data'] | null;
  create_business_error: string | null;

  // Update business
  update_business_status: AsyncStatusType;
  update_business_data: BusinessDetailsResponse['data'] | null;
  update_business_error: string | null;

  // Delete business
  delete_business_status: AsyncStatusType;
  delete_business_data: DeleteBusinessResponse | null;
  delete_business_error: string | null;

  get_business_by_id_status: AsyncStatusType;
  get_business_by_id_data: any | null;
  get_business_by_id_error: string | null;
}
