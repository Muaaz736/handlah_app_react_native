import { BusinessProjectItem } from '../../../../../types/reduxTypes/businessProjectsSlice.types';

export interface FormData {
  projectName: string;
  description: string;
  clients: string[];
  startDate: string;
  endDate: string;
  projectStatus: string;
  amount: string;
  notes: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface RouteParams {
  project?: BusinessProjectItem;
  isEdit?: boolean;
}
