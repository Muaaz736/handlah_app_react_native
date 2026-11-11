export interface RouteParams {
  soldToUsername?: string;
  date?: string;
  vehicleId?: number;
  transferId?: number;
  additionalcomments?: string;
  attachmentids?: string[];
  resetOnBack?: boolean;
}

export interface UploadData {
  [key: string]: any;
}
