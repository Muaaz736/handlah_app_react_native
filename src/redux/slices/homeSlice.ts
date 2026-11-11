import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import { getModuleCountsAsync, ModuleCountItem } from '../services/homeService';

interface HomeState {
  get_module_counts_status: string;
  get_module_counts_data: ModuleCountItem[] | null;
  get_module_counts_error: string | null;
}

const initialState: HomeState = {
  get_module_counts_status: ASYNC_STATUS.IDLE,
  get_module_counts_data: null,
  get_module_counts_error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getModuleCountsAsync.pending, (state) => {
        state.get_module_counts_status = ASYNC_STATUS.LOADING;
        state.get_module_counts_error = null;
      })
      .addCase(getModuleCountsAsync.fulfilled, (state, action) => {
        state.get_module_counts_status = ASYNC_STATUS.SUCCEEDED;
        const payload = action.payload as any;
        state.get_module_counts_data = payload?.modules ?? [];
      })
      .addCase(getModuleCountsAsync.rejected, (state, action) => {
        state.get_module_counts_status = ASYNC_STATUS.ERROR;
        state.get_module_counts_error = action.payload as string;
      });
  },
});

export default homeSlice.reducer;
