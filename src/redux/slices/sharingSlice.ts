import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import { SharingTypes } from '../../types/reduxTypes/sharingslice.types';
import {
  getConnectionEmergencySummary,
  getConnectionSharingsummary,
  getSharedByUsers,
  sendEmergencyRequest,
  sharingSyncService,
} from '../services/sharingService';
import { showErrorToast, showSuccessToast } from '../../components/common';

const initialState: SharingTypes = {
  get_summary_status: ASYNC_STATUS.IDLE,
  get_summary_data: null,
  get_summary_error: null,

  get_emergency_summary_status: ASYNC_STATUS.IDLE,
  get_emergency_summary_data: null,
  get_emergency_summary_error: null,

  send_emergency_request_status: ASYNC_STATUS.IDLE,
  send_emergency_request_data: null,
  send_emergency_request_error: null,

  share_sync_status: ASYNC_STATUS.IDLE,
  share_sync_error: null,

  selectedSharedBusiness: null,
  selectedOwnBusiness: null,

  get_shared_by_users_status: ASYNC_STATUS.IDLE,
  get_shared_by_users_data: null,
  get_shared_by_users_error: null,

};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    resetShareSyncStatus: state => {
      state.share_sync_status = ASYNC_STATUS.IDLE;
      state.share_sync_error = null;
    },
    setSelectedSharedBusiness: (state, { payload }) => {
      state.selectedSharedBusiness = payload;
    },
    setSelectedOwnBusiness: (state, { payload }) => {
      state.selectedOwnBusiness = payload;
    },
  },
  extraReducers: builder => {
    // =========>>>>>>> getConnectionTypesAsync
    builder.addCase(
      getConnectionSharingsummary.pending,
      (state, { payload }) => {
        state.get_summary_status = ASYNC_STATUS.LOADING;
      },
    );
    builder.addCase(
      getConnectionSharingsummary.fulfilled,
      (state, { payload }) => {
        state.get_summary_status = ASYNC_STATUS.SUCCEEDED;
        state.get_summary_data = payload;
      },
    );
    builder.addCase(getConnectionSharingsummary.rejected, (state, action) => {
      state.get_summary_status = ASYNC_STATUS.ERROR;
      state.get_summary_error = action.payload as string;
    });

    // =========>>>>>>> getEmergencySummaryAsync
    builder.addCase(
      getConnectionEmergencySummary.pending,
      (state, { payload }) => {
        state.get_emergency_summary_status = ASYNC_STATUS.LOADING;
      },
    );
    builder.addCase(
      getConnectionEmergencySummary.fulfilled,
      (state, { payload }) => {
        state.get_emergency_summary_status = ASYNC_STATUS.SUCCEEDED;
        state.get_emergency_summary_data = payload;
      },
    );
    builder.addCase(getConnectionEmergencySummary.rejected, (state, action) => {
      state.get_emergency_summary_status = ASYNC_STATUS.ERROR;
      state.get_emergency_summary_error = action.payload as string;
    });

    // =========>>>>>>> sendEmergencyRequestAsync
    builder.addCase(sendEmergencyRequest.pending, (state, { payload }) => {
      state.send_emergency_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(sendEmergencyRequest.fulfilled, (state, { payload }) => {
      state.send_emergency_request_status = ASYNC_STATUS.SUCCEEDED;
      state.send_emergency_request_data = payload;
    });
    builder.addCase(sendEmergencyRequest.rejected, (state, action) => {
      state.send_emergency_request_status = ASYNC_STATUS.ERROR;
      state.send_emergency_request_error = action.payload as string;
    });

    // =========>>>>>>> sharingServiceAsync
    builder.addCase(sharingSyncService.pending, (state, { payload }) => {
      state.share_sync_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(sharingSyncService.fulfilled, (state, { payload }) => {
      state.share_sync_status = ASYNC_STATUS.SUCCEEDED;
      showSuccessToast('Shared Successfully');
    });
    builder.addCase(sharingSyncService.rejected, (state, action) => {
      state.share_sync_status = ASYNC_STATUS.ERROR;
      state.share_sync_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> getSharedByUsersAsync
    builder.addCase(getSharedByUsers.pending, (state, { payload }) => {
      state.get_shared_by_users_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getSharedByUsers.fulfilled, (state, { payload }) => {
      state.get_shared_by_users_status = ASYNC_STATUS.SUCCEEDED;
      state.get_shared_by_users_data = payload;
    });
    builder.addCase(getSharedByUsers.rejected, (state, action) => {
      state.get_shared_by_users_status = ASYNC_STATUS.ERROR;
      state.get_shared_by_users_error = action.payload as string;
      showErrorToast(action.payload as string);
    });
  },
});

export const { resetShareSyncStatus, setSelectedSharedBusiness, setSelectedOwnBusiness } = sharingSlice.actions;
export default sharingSlice.reducer;
