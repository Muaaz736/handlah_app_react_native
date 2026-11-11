import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import { globalSearchAsync } from '../services/searchService';

export interface SearchResultItem {
  id: number;
  type: string;
  modulename: string;
  displayname: string;
  routekey: string;
  icon: string;
  categoryname: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  date: string | null;
}

export interface SearchResponse {
  search: string;
  totalresults: number;
  items: SearchResultItem[];
}

interface SearchState {
  global_search_status: string;
  global_search_data: SearchResponse | null;
  global_search_error: string | null | undefined;
}

const initialState: SearchState = {
  global_search_status: ASYNC_STATUS.IDLE,
  global_search_data: null,
  global_search_error: null,
};

const searchSlice = createSlice({
  name: 'search_slice',
  initialState,
  reducers: {
    resetSearchStatus: (state) => {
      state.global_search_status = ASYNC_STATUS.IDLE;
      state.global_search_data = null;
      state.global_search_error = null;
    },
    clearSearchResults: (state) => {
      state.global_search_data = null;
      state.global_search_status = ASYNC_STATUS.IDLE;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(globalSearchAsync.pending, (state) => {
        state.global_search_status = ASYNC_STATUS.LOADING;
        state.global_search_error = null;
      })
      .addCase(globalSearchAsync.fulfilled, (state, action: PayloadAction<SearchResponse>) => {
        state.global_search_status = ASYNC_STATUS.SUCCEEDED;
        state.global_search_data = action.payload;
      })
      .addCase(globalSearchAsync.rejected, (state, action) => {
        state.global_search_status = ASYNC_STATUS.ERROR;
        state.global_search_error = action.payload as string;
      });
  },
});

export const { resetSearchStatus, clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
