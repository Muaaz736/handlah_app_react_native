import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import { extractApiError } from '../../utils/helpers';

export interface AppContentDto {
  id: number;
  type: number; // 0 = TermsAndConditions, 1 = PrivacyPolicy
  content: string; // HTML string from CKEditor
  version: string;
  isActive: boolean;
  effectiveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// GET /content/privacy-policy
export const getPrivacyPolicyAsync = createAsyncThunk<AppContentDto, void>(
  TYPE_CONSTANTS.GET_PRIVACY_POLICY_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.CONTENT.GET_PRIVACY_POLICY);
      return response.data as AppContentDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load Privacy Policy.'));
    }
  },
);

// GET /content/terms
export const getTermsAsync = createAsyncThunk<AppContentDto, void>(
  TYPE_CONSTANTS.GET_TERMS_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.CONTENT.GET_TERMS);
      return response.data as AppContentDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load Terms & Conditions.'));
    }
  },
);
