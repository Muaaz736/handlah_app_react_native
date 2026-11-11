import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import { getPrivacyPolicyAsync, getTermsAsync, AppContentDto } from '../services/contentService';

interface ContentState {
  privacy_policy: AppContentDto | null;
  privacy_policy_status: string;
  privacy_policy_error: string | null;
  terms: AppContentDto | null;
  terms_status: string;
  terms_error: string | null;
}

const initialState: ContentState = {
  privacy_policy: null,
  privacy_policy_status: ASYNC_STATUS.IDLE,
  privacy_policy_error: null,
  terms: null,
  terms_status: ASYNC_STATUS.IDLE,
  terms_error: null,
};

const contentSlice = createSlice({
  name: 'content_slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Privacy Policy
    builder
      .addCase(getPrivacyPolicyAsync.pending, (state) => {
        state.privacy_policy_status = ASYNC_STATUS.LOADING;
        state.privacy_policy_error = null;
      })
      .addCase(getPrivacyPolicyAsync.fulfilled, (state, action) => {
        state.privacy_policy_status = ASYNC_STATUS.SUCCEEDED;
        state.privacy_policy = action.payload;
      })
      .addCase(getPrivacyPolicyAsync.rejected, (state, action) => {
        state.privacy_policy_status = ASYNC_STATUS.ERROR;
        state.privacy_policy_error = action.payload as string;
      });

    // Terms & Conditions
    builder
      .addCase(getTermsAsync.pending, (state) => {
        state.terms_status = ASYNC_STATUS.LOADING;
        state.terms_error = null;
      })
      .addCase(getTermsAsync.fulfilled, (state, action) => {
        state.terms_status = ASYNC_STATUS.SUCCEEDED;
        state.terms = action.payload;
      })
      .addCase(getTermsAsync.rejected, (state, action) => {
        state.terms_status = ASYNC_STATUS.ERROR;
        state.terms_error = action.payload as string;
      });
  },
});

export default contentSlice.reducer;
