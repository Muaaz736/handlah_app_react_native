import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import { getFaqsAsync, FaqDto } from '../services/faqsService';

interface FaqsState {
  faqs: FaqDto[];
  faqs_status: string;
  faqs_error: string | null;
}

const initialState: FaqsState = {
  faqs: [],
  faqs_status: ASYNC_STATUS.IDLE,
  faqs_error: null,
};

const faqsSlice = createSlice({
  name: 'faqs_slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFaqsAsync.pending, (state) => {
        state.faqs_status = ASYNC_STATUS.LOADING;
        state.faqs_error = null;
      })
      .addCase(getFaqsAsync.fulfilled, (state, action) => {
        state.faqs_status = ASYNC_STATUS.SUCCEEDED;
        state.faqs = action.payload.items;
      })
      .addCase(getFaqsAsync.rejected, (state, action) => {
        state.faqs_status = ASYNC_STATUS.ERROR;
        state.faqs_error = action.payload as string;
      });
  },
});

export default faqsSlice.reducer;
