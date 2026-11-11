import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import { extractApiError } from '../../utils/helpers';

export interface FaqDto {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetFaqsResponse {
  items: FaqDto[];
}

// GET /faqs — anonymous endpoint, no auth required
export const getFaqsAsync = createAsyncThunk<GetFaqsResponse, void>(
  TYPE_CONSTANTS.GET_FAQS_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.FAQS.GET_FAQS);
      return response.data as GetFaqsResponse;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load FAQs.'));
    }
  },
);
