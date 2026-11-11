import { ASYNC_STATUS } from '../../config/constants';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

// API Request Payload for adding/updating business contact
export interface BusinessContactPayload {
  businessId: number;
  fullName: string;
  role: string;
  companyTeam: string;
  status: string;
  emailAddress: string;
  phoneNumber: string;
  manager: string;
  location: string;
  tags: string;
  contactType: number;
  isPrimary: boolean;
  isReference: boolean;
}

// Business Contact Item from API (API returns lowercase fields)
export interface BusinessContactItemAPI {
  id: number;
  businessid: number;
  businessname?: string;
  fullname: string;
  role: string;
  companyteam: string;
  status: string;
  emailaddress: string;
  phonenumber: string;
  manager: string;
  location: string;
  tags: string;
  contacttype: number;
  isprimary: boolean;
  isreference: boolean;
  createdat?: string;
  updatedat?: string | null;
}

// Business Contact Item for App (normalized camelCase)
export interface BusinessContactItem {
  id: number;
  businessId: number;
  businessName?: string;
  fullName: string;
  role: string;
  companyTeam: string;
  status: string;
  emailAddress: string;
  phoneNumber: string;
  manager: string;
  location: string;
  tags: string;
  contactType: number;
  isPrimary: boolean;
  isReference: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

// API Response for single business contact (add/update)
export interface BusinessContactResponse {
  success: boolean;
  message: string;
  data: BusinessContactItem;
}

// API Response for getting all business contacts
export type GetBusinessContactsResponse = BusinessContactItemAPI[];

// Update params for partial updates
export interface UpdateBusinessContactParams {
  id: number;
  data: Partial<BusinessContactPayload>;
}

// Delete response
export interface DeleteBusinessContactResponse {
  success: boolean;
  message: string;
  deletedId?: number;
}

// Redux State
export interface BusinessContactsState {
  // Get business contacts
  get_business_contacts_status: AsyncStatusType;
  get_business_contacts_data: BusinessContactItem[] | null;
  get_business_contacts_error: string | null;

  // Add business contact
  add_business_contact_status: AsyncStatusType;
  add_business_contact_data: BusinessContactItem | null;
  add_business_contact_error: string | null;

  // Update business contact
  update_business_contact_status: AsyncStatusType;
  update_business_contact_data: BusinessContactItem | null;
  update_business_contact_error: string | null;

  // Delete business contact
  delete_business_contact_status: AsyncStatusType;
  delete_business_contact_data: DeleteBusinessContactResponse | null;
  delete_business_contact_error: string | null;
}
