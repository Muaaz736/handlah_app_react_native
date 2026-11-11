import { Connection } from '../../../Connections/Connections.types';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export interface ConnectionUserDetailsRouteParams {
  connectionId: number;
  showSharedWithYouFirst?: boolean;
}

export interface EditConnectionData {
  [key: string]: any;
}
