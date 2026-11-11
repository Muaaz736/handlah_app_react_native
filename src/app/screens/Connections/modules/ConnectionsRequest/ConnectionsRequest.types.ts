export type RequestStatus = 'Pending' | 'Accepted' | 'Declined' | 'Emergency';

export interface Request {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: RequestStatus;
  message?: string;
  [key: string]: any;
}

export interface RequestTab {
  key: string;
  label: string;
  count: number;
}

export interface RequestsData {
  received: Request[];
  sent: Request[];
  emergency: Request[];
  [key: string]: Request[];
}
