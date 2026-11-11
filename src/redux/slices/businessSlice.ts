import { createSlice } from '@reduxjs/toolkit';
import {
  showErrorToast,
  showSuccessToast,
} from '../../components/common';
import {
  getBusinessesAsync,
  createBusinessAsync,
  updateBusinessAsync,
  deleteBusinessAsync,
  getBusinessByIdAsync,
} from '../services/businessService';
import { ASYNC_STATUS } from '../../config/constants';
import { BusinessState } from '../../types/reduxTypes/businessSlice.types';

const initialState: BusinessState = {
  // Selected business
  selectedBusinessId: null,

  // Get businesses
  get_businesses_status: ASYNC_STATUS.IDLE,
  get_businesses_data: null,
  get_businesses_error: null,

  // Create business
  create_business_status: ASYNC_STATUS.IDLE,
  create_business_data: null,
  create_business_error: null,

  // Update business
  update_business_status: ASYNC_STATUS.IDLE,
  update_business_data: null,
  update_business_error: null,

  // Delete business
  delete_business_status: ASYNC_STATUS.IDLE,
  delete_business_data: null,
  delete_business_error: null,

  get_business_by_id_status: ASYNC_STATUS.IDLE,
  get_business_by_id_data: null,
  get_business_by_id_error: null,
};

const businessSlice = createSlice({
  name: 'business',
  initialState: initialState,
  reducers: {
    setSelectedBusinessId: (state, action) => {
      state.selectedBusinessId = action.payload;
    },
    resetCreateBusinessStatus: (state) => {
      state.create_business_status = ASYNC_STATUS.IDLE;
      state.create_business_error = null;
    },
    resetUpdateBusinessStatus: (state) => {
      state.update_business_status = ASYNC_STATUS.IDLE;
      state.update_business_error = null;
    },
    resetDeleteBusinessStatus: (state) => {
      state.delete_business_status = ASYNC_STATUS.IDLE;
      state.delete_business_error = null;
    },
  },
  extraReducers: builder => {
    // =========>>>>>>> Get Businesses
    builder.addCase(getBusinessesAsync.pending, (state) => {
      state.get_businesses_status = ASYNC_STATUS.LOADING;
      state.get_businesses_error = null;
    });
    builder.addCase(getBusinessesAsync.fulfilled, (state, { payload }) => {
      state.get_businesses_status = ASYNC_STATUS.SUCCEEDED;
      // Safely handle payload with comprehensive checks
      const businessArray = Array.isArray(payload) ? payload : [];
      state.get_businesses_data = businessArray;
      state.get_businesses_error = null;

      // Auto-select the first business if none is selected, or if the
      // persisted selection no longer exists in the fetched list (e.g. it
      // was deleted, or is stale from a different account on this device).
      const selectionStillValid = businessArray.some(
        (b: any) => b?.id === state.selectedBusinessId,
      );
      if (!selectionStillValid && businessArray.length > 0 && businessArray[0]?.id) {
        state.selectedBusinessId = businessArray[0].id;
      }
    });
    builder.addCase(getBusinessesAsync.rejected, (state, action) => {
      state.get_businesses_status = ASYNC_STATUS.ERROR;
      state.get_businesses_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Create Business
    builder.addCase(createBusinessAsync.pending, (state) => {
      state.create_business_status = ASYNC_STATUS.LOADING;
      state.create_business_error = null;
    });
    builder.addCase(createBusinessAsync.fulfilled, (state, { payload }) => {
      state.create_business_status = ASYNC_STATUS.SUCCEEDED;
      state.create_business_data = payload?.data || null;
      state.create_business_error = null;

      // Add the new business to the list with null checks
      if (payload?.data) {
        if (Array.isArray(state.get_businesses_data)) {
          state.get_businesses_data = [...state.get_businesses_data, payload.data];
        } else {
          state.get_businesses_data = [payload.data];
        }

        // Auto-select the newly created business
        if (payload.data.id) {
          state.selectedBusinessId = payload.data.id;
        }
      }

      showSuccessToast(payload?.message || 'Business created successfully');
    });
    builder.addCase(createBusinessAsync.rejected, (state, action) => {
      state.create_business_status = ASYNC_STATUS.ERROR;
      state.create_business_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Update Business
    builder.addCase(updateBusinessAsync.pending, (state) => {
      state.update_business_status = ASYNC_STATUS.LOADING;
      state.update_business_error = null;
    });
    builder.addCase(updateBusinessAsync.fulfilled, (state, { payload }) => {
      state.update_business_status = ASYNC_STATUS.SUCCEEDED;
      state.update_business_data = payload?.data || null;
      state.update_business_error = null;

      // Update the business in the list with null checks
      if (payload?.data && Array.isArray(state.get_businesses_data)) {
        state.get_businesses_data = state.get_businesses_data.map(business =>
          business?.id === payload.data.id ? payload.data : business
        );
      }

      showSuccessToast(payload?.message || 'Business updated successfully');
    });
    builder.addCase(updateBusinessAsync.rejected, (state, action) => {
      state.update_business_status = ASYNC_STATUS.ERROR;
      state.update_business_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Delete Business
    builder.addCase(deleteBusinessAsync.pending, (state) => {
      state.delete_business_status = ASYNC_STATUS.LOADING;
      state.delete_business_error = null;
    });
    builder.addCase(deleteBusinessAsync.fulfilled, (state, { payload }) => {
      state.delete_business_status = ASYNC_STATUS.SUCCEEDED;
      state.delete_business_data = payload || null;
      state.delete_business_error = null;

      // Remove the business from the list with null checks
      if (payload?.deletedId && Array.isArray(state.get_businesses_data)) {
        state.get_businesses_data = state.get_businesses_data.filter(
          business => business?.id !== payload.deletedId
        );

        // If deleted business was selected, clear selection
        if (state.selectedBusinessId === payload.deletedId) {
          state.selectedBusinessId = state.get_businesses_data.length > 0
            ? state.get_businesses_data[0]?.id || null
            : null;
        }
      }

      showSuccessToast(payload?.message || 'Business deleted successfully');
    });
    builder.addCase(deleteBusinessAsync.rejected, (state, action) => {
      state.delete_business_status = ASYNC_STATUS.ERROR;
      state.delete_business_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> Get Business By ID
    builder.addCase(getBusinessByIdAsync.pending, (state) => {
      state.get_business_by_id_status = ASYNC_STATUS.LOADING;
      state.get_business_by_id_error = null;
    });
    builder.addCase(getBusinessByIdAsync.fulfilled, (state, { payload }) => {
      state.get_business_by_id_status = ASYNC_STATUS.SUCCEEDED;
      state.get_business_by_id_data = payload || null;
      state.get_business_by_id_error = null;
    });
    builder.addCase(getBusinessByIdAsync.rejected, (state, action) => {
      state.get_business_by_id_status = ASYNC_STATUS.ERROR;
      state.get_business_by_id_error = action.payload as string;
    });
  },
});

export const {
  setSelectedBusinessId,
  resetCreateBusinessStatus,
  resetUpdateBusinessStatus,
  resetDeleteBusinessStatus,
} = businessSlice.actions;

export default businessSlice.reducer;
