import { ASYNC_STATUS } from '../../config/constants';

// API Response Types (matching backend - lowercase fields)
export interface BusinessProjectClientAPI {
  clientid: number;
  name: string;
  email: string;
}

export interface BusinessProjectItemAPI {
  id: number;
  businessid: number;
  clientids: number[];
  clients: BusinessProjectClientAPI[];
  projectname: string;
  description: string;
  startdate?: string; // ISO date string
  enddate?: string; // ISO date string
  projectstatus: number; // 1=Active, 2=On Hold, 3=Completed, 4=Cancelled
  additionaldetails: string;
  notes: string;
  attachmenturls: string[] | null;
  amount: number;
  businessname?: string;
  isdraft?: boolean;
  createdat?: string;
  updatedat?: string;
}

export interface BusinessProjectClient {
  clientId: number;
  name: string;
  email: string;
}

// App Types (camelCase for internal use)
export interface BusinessProjectItem {
  id: number;
  businessId: number;
  clientIds: number[];
  clients: BusinessProjectClient[];
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  projectStatus: number;
  additionalDetails: string;
  notes: string;
  attachmentUrls: string[];
  amount: number;
}

// API Request Types
export interface AddBusinessProjectPayload {
  businessId: number;
  clientIds: number[];
  projectName: string;
  description: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  projectStatus: number;
  additionalDetails: string;
  notes: string;
  attachmentUrls: string | string[];
  amount: number;
}

export interface UpdateBusinessProjectPayload {
  id: number;
  data: AddBusinessProjectPayload;
}

// Redux State Types
export interface BusinessProjectsState {
  get_business_projects_data: BusinessProjectItem[];
  get_business_projects_status: typeof ASYNC_STATUS[keyof typeof ASYNC_STATUS];
  get_business_projects_error: string | null;

  add_business_project_data: BusinessProjectItem | null;
  add_business_project_status: typeof ASYNC_STATUS[keyof typeof ASYNC_STATUS];
  add_business_project_error: string | null;

  update_business_project_data: BusinessProjectItem | null;
  update_business_project_status: typeof ASYNC_STATUS[keyof typeof ASYNC_STATUS];
  update_business_project_error: string | null;

  delete_business_project_status: typeof ASYNC_STATUS[keyof typeof ASYNC_STATUS];
  delete_business_project_error: string | null;
}
