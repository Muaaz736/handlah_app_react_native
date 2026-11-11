import { ASYNC_STATUS } from '../../config/constants';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

export interface ConnectionTypes {
  id: number;
  name: string;
  description: string;
  isactive: boolean;
  createdon: string;
  createdby: 1;
  updatedon: null;
  updatedby: null;
}

export interface HandlahUser {
  id: number;
  username: string;
  fullname: string;
  profilepicture: string;
}

export interface ConnectedUser {
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  email?: string;
  phonenumber?: string;
  profilepicture?: string | null;
}

export interface HandlahUsersResponse {
  users: HandlahUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ConnectionState {
  get_connection_types_status: AsyncStatusType;
  get_connection_types_data: ConnectionTypes[] | null;
  get_connection_types_error: string | null;

  get_connections_status: AsyncStatusType;
  get_connections_data: any[] | null;
  get_connections_error: string | null;

  get_handlah_users_status: AsyncStatusType;
  get_handlah_users_data: HandlahUsersResponse | null;
  get_handlah_users_error: string | null;

  create_connection_request_status: AsyncStatusType;
  create_connection_request_error: string | null;

  update_connection_status: AsyncStatusType;
  update_connection_error: string | null;

  get_connection_requests_sent_status: AsyncStatusType;
  get_connection_requests_sent_data: any[] | null;
  get_connection_requests_sent_error: string | null;

  get_connection_requests_received_status: AsyncStatusType;
  get_connection_requests_received_data: any[] | null;
  get_connection_requests_received_error: string | null;

  get_emergency_requests_status: AsyncStatusType;
  get_emergency_requests_data: any[] | null;
  get_emergency_requests_error: string | null;

  accept_connection_request_status: AsyncStatusType;
  accept_connection_request_error: string | null;

  decline_connection_request_status: AsyncStatusType;
  decline_connection_request_error: string | null;

  get_connection_by_id_status: AsyncStatusType;
  get_connection_by_id_data: any | null;
  get_connection_by_id_error: string | null;

  remove_connection_by_id_status: AsyncStatusType;
  remove_connection_by_id_error: null | string;

  approve_emergency_request_status: AsyncStatusType;
  approve_emergency_request_error: null | string;

  reject_emergency_request_status: AsyncStatusType;
  reject_emergency_request_error: null | string;

  currentConnection: any | null;
  currentConnectionUserId: number | null;
  emergencyConnectionBusinessId: number | null;

  initialconnectionRole: string | null;

  get_unshared_connected_users_status: AsyncStatusType;
  get_unshared_connected_users_data: any | null;
  get_unshared_connected_users_error: string | null;

  get_shared_connected_users_status: AsyncStatusType;
  get_shared_connected_users_data: any | null;
  get_shared_connected_users_error: string | null;

  get_connected_users_status: AsyncStatusType;
  get_connected_users_data: ConnectedUser[] | null;
  get_connected_users_error: string | null;

  connection_and_emergency_requests_count: number;

  is_personal_and_business_connection_status: AsyncStatusType;
  isPersonalAndBusinessConnection: boolean;
}
