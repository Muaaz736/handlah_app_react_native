import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import {
  submitOnboardingAsync,
  getOnboardingStatusAsync,
  getDashboardAsync,
  DashboardResponse,
} from '../services/onboardingService';

export interface OnboardingSliceState {
  submit_status: string;
  submit_error: string | null;
  status_status: string;
  personalComplete: boolean;
  businessComplete: boolean;
  dashboard_status: string;
  dashboard_data: DashboardResponse | null;
  dashboard_error: string | null;
}

const initialState: OnboardingSliceState = {
  submit_status: ASYNC_STATUS.IDLE,
  submit_error: null,
  status_status: ASYNC_STATUS.IDLE,
  personalComplete: false,
  businessComplete: false,
  dashboard_status: ASYNC_STATUS.IDLE,
  dashboard_data: null,
  dashboard_error: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    resetOnboardingSubmit: (state) => {
      state.submit_status = ASYNC_STATUS.IDLE;
      state.submit_error = null;
    },
    clearDashboard: (state) => {
      state.dashboard_status = ASYNC_STATUS.IDLE;
      state.dashboard_data = null;
      state.dashboard_error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit onboarding
      .addCase(submitOnboardingAsync.pending, (state) => {
        state.submit_status = ASYNC_STATUS.LOADING;
        state.submit_error = null;
      })
      .addCase(submitOnboardingAsync.fulfilled, (state) => {
        state.submit_status = ASYNC_STATUS.SUCCEEDED;
      })
      .addCase(submitOnboardingAsync.rejected, (state, action) => {
        state.submit_status = ASYNC_STATUS.ERROR;
        state.submit_error = action.payload as string;
      })

      // Get onboarding status
      .addCase(getOnboardingStatusAsync.pending, (state) => {
        state.status_status = ASYNC_STATUS.LOADING;
      })
      .addCase(getOnboardingStatusAsync.fulfilled, (state, action) => {
        state.status_status = ASYNC_STATUS.SUCCEEDED;
        state.personalComplete = action.payload.personalcomplete;
        state.businessComplete = action.payload.businesscomplete;
      })
      .addCase(getOnboardingStatusAsync.rejected, (state) => {
        state.status_status = ASYNC_STATUS.ERROR;
      })

      // Get dashboard
      .addCase(getDashboardAsync.pending, (state) => {
        state.dashboard_status = ASYNC_STATUS.LOADING;
        state.dashboard_error = null;
      })
      .addCase(getDashboardAsync.fulfilled, (state, action) => {
        state.dashboard_status = ASYNC_STATUS.SUCCEEDED;
        state.dashboard_data = action.payload;
      })
      .addCase(getDashboardAsync.rejected, (state, action) => {
        state.dashboard_status = ASYNC_STATUS.ERROR;
        state.dashboard_error = action.payload as string;
      });
  },
});

export const { resetOnboardingSubmit, clearDashboard } = onboardingSlice.actions;
export default onboardingSlice.reducer;
