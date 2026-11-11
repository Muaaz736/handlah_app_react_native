import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import {
  getInsightsAsync,
  getInsightsSummaryAsync,
  InsightsResponseDto,
  InsightsSummaryDto,
} from '../services/insightsService';


export interface InsightsSliceState {
  feed_status: string;
  feed_data: InsightsResponseDto | null;
  feed_error: string | null;

  summary_status: string;
  summary_data: InsightsSummaryDto | null;
  summary_error: string | null;
}

const initialState: InsightsSliceState = {
  feed_status: ASYNC_STATUS.IDLE,
  feed_data: null,
  feed_error: null,

  summary_status: ASYNC_STATUS.IDLE,
  summary_data: null,
  summary_error: null,
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Main grouped feed
      .addCase(getInsightsAsync.pending, state => {
        state.feed_status = ASYNC_STATUS.LOADING;
        state.feed_error = null;
      })
      .addCase(getInsightsAsync.fulfilled, (state, action) => {
        state.feed_status = ASYNC_STATUS.SUCCEEDED;
        state.feed_data = action.payload;
      })
      .addCase(getInsightsAsync.rejected, (state, action) => {
        state.feed_status = ASYNC_STATUS.ERROR;
        state.feed_error = action.payload as string;
      })

      // Header-badge summary
      .addCase(getInsightsSummaryAsync.pending, state => {
        state.summary_status = ASYNC_STATUS.LOADING;
        state.summary_error = null;
      })
      .addCase(getInsightsSummaryAsync.fulfilled, (state, action) => {
        state.summary_status = ASYNC_STATUS.SUCCEEDED;
        state.summary_data = action.payload;
      })
      .addCase(getInsightsSummaryAsync.rejected, (state, action) => {
        state.summary_status = ASYNC_STATUS.ERROR;
        state.summary_error = action.payload as string;
      });
  },
});

export default insightsSlice.reducer;
