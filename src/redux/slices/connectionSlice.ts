import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import {
  acceptConnectionRequestAsync,
  approveEmergencyRequestAsync,
  declineConnectionRequestAsync,
  getConnectionAsync,
  getConnectionbyIdAsync,
  getConnectionRequestsReceivedAsync,
  getConnectionRequestsSentAsync,
  getConnectionTypesAsync,
  getConnectedUsersAsync,
  getEmergencyconnectionsAsync,
  getHandlahUsersAsync,
  getSharedConnectedUsersAsync,
  getUnsharedConnectedUsersAsync,
  rejectEmergencyRequestAsync,
  removeConnectionAsync,
  requestConnectionAsync,
  updateConnectionAsync,
  checkBothSideConnection,
} from '../services/connectionService';
import { ConnectionState } from '../../types/reduxTypes/connectionSlice.types';
import { showErrorToast } from '../../components/common';

const initialState: ConnectionState = {
  get_connection_types_status: ASYNC_STATUS.IDLE,
  get_connection_types_data: null,
  get_connection_types_error: null,

  get_connections_status: ASYNC_STATUS.IDLE,
  get_connections_data: null,
  get_connections_error: null,

  get_handlah_users_status: ASYNC_STATUS.IDLE,
  get_handlah_users_data: null,
  get_handlah_users_error: null,

  create_connection_request_status: ASYNC_STATUS.IDLE,
  create_connection_request_error: null,

  update_connection_status: ASYNC_STATUS.IDLE,
  update_connection_error: null,

  get_connection_requests_sent_status: ASYNC_STATUS.IDLE,
  get_connection_requests_sent_data: null,
  get_connection_requests_sent_error: null,

  get_emergency_requests_status: ASYNC_STATUS.IDLE,
  get_emergency_requests_data: null,
  get_emergency_requests_error: null,

  get_connection_requests_received_status: ASYNC_STATUS.IDLE,
  get_connection_requests_received_data: null,
  get_connection_requests_received_error: null,

  accept_connection_request_status: ASYNC_STATUS.IDLE,
  accept_connection_request_error: null,

  decline_connection_request_status: ASYNC_STATUS.IDLE,
  decline_connection_request_error: null,

  get_connection_by_id_status: ASYNC_STATUS.IDLE,
  get_connection_by_id_data: null,
  get_connection_by_id_error: null,

  remove_connection_by_id_status: ASYNC_STATUS.IDLE,
  remove_connection_by_id_error: null,

  approve_emergency_request_status: ASYNC_STATUS.IDLE,
  approve_emergency_request_error: null,

  reject_emergency_request_status: ASYNC_STATUS.IDLE,
  reject_emergency_request_error: null,

  currentConnection: null,
  currentConnectionUserId: null,
  emergencyConnectionBusinessId: null,
  initialconnectionRole: null,

  get_unshared_connected_users_status: ASYNC_STATUS.IDLE,
  get_unshared_connected_users_data: null,
  get_unshared_connected_users_error: null,

  get_shared_connected_users_status: ASYNC_STATUS.IDLE,
  get_shared_connected_users_data: null,
  get_shared_connected_users_error: null,

  get_connected_users_status: ASYNC_STATUS.IDLE,
  get_connected_users_data: null,
  get_connected_users_error: null,


  connection_and_emergency_requests_count: 0,

  is_personal_and_business_connection_status: ASYNC_STATUS.IDLE,
  isPersonalAndBusinessConnection: false,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    resetHandlahUsers(state) {
      state.get_handlah_users_status = ASYNC_STATUS.IDLE;
      state.get_handlah_users_data = null;
      state.get_handlah_users_error = null;
    },
    resetAcceptDeclineStatus(state) {
      state.accept_connection_request_status = ASYNC_STATUS.IDLE;
      state.accept_connection_request_error = null;
      state.decline_connection_request_status = ASYNC_STATUS.IDLE;
      state.decline_connection_request_error = null;
    },
    resetRemoveConnectionStatus(state) {
      state.remove_connection_by_id_status = ASYNC_STATUS.IDLE;
      state.remove_connection_by_id_error = null;
    },
    setCurrentConnection(state, action) {
      state.currentConnection = action.payload.connectionData;
      if (action.payload.currentConnectionUserId) {
        state.currentConnectionUserId = action.payload.currentConnectionUserId;
      }
    },
    setEmergencyConnectionBusinessId(state, action) {
      state.emergencyConnectionBusinessId = action.payload;
    },
    resetShareModalState(state) {
      state.get_unshared_connected_users_status = ASYNC_STATUS.IDLE;
      state.get_unshared_connected_users_data = null;
      state.get_unshared_connected_users_error = null;

      state.get_shared_connected_users_status = ASYNC_STATUS.IDLE;
      state.get_shared_connected_users_data = null;
      state.get_shared_connected_users_error = null;
    },
    resetConnectedUsers(state) {
      state.get_connected_users_status = ASYNC_STATUS.IDLE;
      state.get_connected_users_data = null;
      state.get_connected_users_error = null;
    },
    setInitialConnectionRole(state, action) {
      state.initialconnectionRole = action.payload;
    },
    setConnectionAndEmergencyRequestsCount(state, action) {
      state.connection_and_emergency_requests_count = action.payload;
    },
    resetIsPersonalAndBusinessConnection(state) {
      if (__DEV__) { console.log('Resetting both side connection check result.'); }
      state.isPersonalAndBusinessConnection = false;
    }
  },
  extraReducers: builder => {
    // =========>>>>>>> getConnectionTypesAsync
    builder.addCase(getConnectionTypesAsync.pending, (state, { payload }) => {
      state.get_connection_types_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getConnectionTypesAsync.fulfilled, (state, { payload }) => {
      state.get_connection_types_status = ASYNC_STATUS.SUCCEEDED;
      state.get_connection_types_data = payload?.connectiontypes;
    });
    builder.addCase(getConnectionTypesAsync.rejected, (state, action) => {
      state.get_connection_types_status = ASYNC_STATUS.ERROR;
      state.get_connection_types_error = action.payload as string;
    });

    // =========>>>>>>> getConnectionsAsync
    builder.addCase(getConnectionAsync.pending, (state, { payload }) => {
      state.get_connections_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getConnectionAsync.fulfilled, (state, { payload }) => {
      state.get_connections_status = ASYNC_STATUS.SUCCEEDED;
      state.get_connections_data = payload?.connections;
    });
    builder.addCase(getConnectionAsync.rejected, (state, action) => {
      state.get_connections_status = ASYNC_STATUS.ERROR;
      state.get_connections_error = action.payload as string;
    });

    // =========>>>>>>> getconnectionbyIdAsync
    builder.addCase(getConnectionbyIdAsync.pending, (state, { payload }) => {
      state.get_connection_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getConnectionbyIdAsync.fulfilled, (state, { payload }) => {
      state.get_connection_by_id_status = ASYNC_STATUS.SUCCEEDED;
      state.get_connection_by_id_data = payload;
    });
    builder.addCase(getConnectionbyIdAsync.rejected, (state, action) => {
      state.get_connection_by_id_status = ASYNC_STATUS.ERROR;
      // state.get_connection_by_id_data = null;
      state.get_connection_by_id_error = action.payload as string;
    });

    // =========>>>>>>> getHandlahUsersAsync
    builder.addCase(getHandlahUsersAsync.pending, (state, action) => {
      state.get_handlah_users_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getHandlahUsersAsync.fulfilled, (state, action) => {
      state.get_handlah_users_status = ASYNC_STATUS.SUCCEEDED;
      const incoming = action.payload as any;
      const page = incoming?.page ?? 1;
      const existingUsers =
        page === 1 ? [] : state.get_handlah_users_data?.users ?? [];
      state.get_handlah_users_data = {
        users: [...existingUsers, ...(incoming?.users ?? [])],
        totalCount: incoming?.totalcount ?? incoming?.totalCount ?? 0,
        page: incoming?.page ?? 1,
        pageSize: incoming?.pagesize ?? incoming?.pageSize ?? 10,
        totalPages: incoming?.totalpages ?? incoming?.totalPages ?? 1,
      };
    });
    builder.addCase(getHandlahUsersAsync.rejected, (state, action) => {
      state.get_handlah_users_status = ASYNC_STATUS.ERROR;
      state.get_handlah_users_error = action.payload as string;
    });

    // =========>>>>>>> requestConnectionAsync
    builder.addCase(requestConnectionAsync.pending, state => {
      state.create_connection_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(requestConnectionAsync.fulfilled, state => {
      state.create_connection_request_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(requestConnectionAsync.rejected, (state, action) => {
      state.create_connection_request_status = ASYNC_STATUS.ERROR;
      state.create_connection_request_error = action.payload as string;
      showErrorToast(action.payload as string);
    });

    // =========>>>>>>> updateConnectionAsync
    builder.addCase(updateConnectionAsync.pending, state => {
      state.update_connection_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(updateConnectionAsync.fulfilled, state => {
      state.update_connection_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(updateConnectionAsync.rejected, (state, action) => {
      state.update_connection_status = ASYNC_STATUS.ERROR;
      state.update_connection_error = action.payload as string;
    });

    // =========>>>>>>> getConnectionRequestsSentAsync
    builder.addCase(getConnectionRequestsSentAsync.pending, state => {
      state.get_connection_requests_sent_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getConnectionRequestsSentAsync.fulfilled,
      (state, action) => {
        state.get_connection_requests_sent_status = ASYNC_STATUS.SUCCEEDED;
        state.get_connection_requests_sent_data = action.payload as any[];
      },
    );
    builder.addCase(
      getConnectionRequestsSentAsync.rejected,
      (state, action) => {
        state.get_connection_requests_sent_status = ASYNC_STATUS.ERROR;
        state.get_connection_requests_sent_error = action.payload as string;
      },
    );

    // =========>>>>>>> getConnectionRequestsReceivedAsync
    builder.addCase(getConnectionRequestsReceivedAsync.pending, state => {
      state.get_connection_requests_received_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getConnectionRequestsReceivedAsync.fulfilled,
      (state, action) => {
        state.get_connection_requests_received_status = ASYNC_STATUS.SUCCEEDED;
        state.get_connection_requests_received_data = action.payload as any[];
      },
    );
    builder.addCase(
      getConnectionRequestsReceivedAsync.rejected,
      (state, action) => {
        state.get_connection_requests_received_status = ASYNC_STATUS.ERROR;
        state.get_connection_requests_received_error = action.payload as string;
      },
    );

    // =========>>>>>>> getEmergencyconnectionsAsync
    builder.addCase(getEmergencyconnectionsAsync.pending, state => {
      state.get_emergency_requests_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getEmergencyconnectionsAsync.fulfilled, (state, action) => {
      state.get_emergency_requests_status = ASYNC_STATUS.SUCCEEDED;
      state.get_emergency_requests_data = action.payload as any[];
    });
    builder.addCase(getEmergencyconnectionsAsync.rejected, (state, action) => {
      state.get_emergency_requests_status = ASYNC_STATUS.ERROR;
      state.get_emergency_requests_error = action.payload as string;
    });

    // =========>>>>>>> acceptConnectionRequestAsync
    builder.addCase(acceptConnectionRequestAsync.pending, state => {
      state.accept_connection_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(acceptConnectionRequestAsync.fulfilled, (state, action) => {
      state.accept_connection_request_status = ASYNC_STATUS.SUCCEEDED;
      state.connection_and_emergency_requests_count = Math.max(0, state.connection_and_emergency_requests_count - 1);
    });
    builder.addCase(acceptConnectionRequestAsync.rejected, (state, action) => {
      state.accept_connection_request_status = ASYNC_STATUS.ERROR;
      state.accept_connection_request_error = action.payload as string;
    });

    // =========>>>>>>> declineConnectionRequestAsync
    builder.addCase(declineConnectionRequestAsync.pending, state => {
      state.decline_connection_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      declineConnectionRequestAsync.fulfilled,
      (state, action) => {
        state.decline_connection_request_status = ASYNC_STATUS.SUCCEEDED;
        state.connection_and_emergency_requests_count = Math.max(0, state.connection_and_emergency_requests_count - 1);
      },
    );
    builder.addCase(declineConnectionRequestAsync.rejected, (state, action) => {
      state.decline_connection_request_status = ASYNC_STATUS.ERROR;
      state.decline_connection_request_error = action.payload as string;
    });

    // =========>>>>>>> removeConnectionAsync
    builder.addCase(removeConnectionAsync.pending, state => {
      state.remove_connection_by_id_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(removeConnectionAsync.fulfilled, (state, action) => {
      state.remove_connection_by_id_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(removeConnectionAsync.rejected, (state, action) => {
      state.remove_connection_by_id_status = ASYNC_STATUS.ERROR;
      state.remove_connection_by_id_error = action.payload as string;
    });

    // =========>>>>>>> acceptEmergencyRequestAsync
    builder.addCase(approveEmergencyRequestAsync.pending, state => {
      state.approve_emergency_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(approveEmergencyRequestAsync.fulfilled, (state, action) => {
      state.approve_emergency_request_status = ASYNC_STATUS.SUCCEEDED;
      state.connection_and_emergency_requests_count = Math.max(0, state.connection_and_emergency_requests_count - 1);
    });
    builder.addCase(approveEmergencyRequestAsync.rejected, (state, action) => {
      state.approve_emergency_request_status = ASYNC_STATUS.ERROR;
      state.approve_emergency_request_error = action.payload as string;
    });

    // =========>>>>>>> rejectEmergencyRequestAsync
    builder.addCase(rejectEmergencyRequestAsync.pending, state => {
      state.reject_emergency_request_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(rejectEmergencyRequestAsync.fulfilled, (state, action) => {
      state.reject_emergency_request_status = ASYNC_STATUS.SUCCEEDED;
    });
    builder.addCase(rejectEmergencyRequestAsync.rejected, (state, action) => {
      state.reject_emergency_request_status = ASYNC_STATUS.ERROR;
      state.reject_emergency_request_error = action.payload as string;
    });

    // =========>>>>>>> getUnsharedConnectedUsersAsync
    builder.addCase(getUnsharedConnectedUsersAsync.pending, state => {
      state.get_unshared_connected_users_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(
      getUnsharedConnectedUsersAsync.fulfilled,
      (state, action) => {
        state.get_unshared_connected_users_status = ASYNC_STATUS.SUCCEEDED;
        state.get_unshared_connected_users_data =
          action.payload?.connectedusers;
      },
    );
    builder.addCase(
      getUnsharedConnectedUsersAsync.rejected,
      (state, action) => {
        state.get_unshared_connected_users_status = ASYNC_STATUS.ERROR;
        state.get_unshared_connected_users_error = action.payload as string;
      },
    );

    // =========>>>>>>> getSharedConnectedUsersAsync
    builder.addCase(getSharedConnectedUsersAsync.pending, state => {
      state.get_shared_connected_users_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getSharedConnectedUsersAsync.fulfilled, (state, action) => {
      state.get_shared_connected_users_status = ASYNC_STATUS.SUCCEEDED;
      state.get_shared_connected_users_data = action.payload;
    });
    builder.addCase(getSharedConnectedUsersAsync.rejected, (state, action) => {
      state.get_shared_connected_users_status = ASYNC_STATUS.ERROR;
      state.get_shared_connected_users_error = action.payload as string;
    });

    // =========>>>>>>> getConnectedUsersAsync
    builder.addCase(getConnectedUsersAsync.pending, state => {
      state.get_connected_users_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(getConnectedUsersAsync.fulfilled, (state, action) => {
      state.get_connected_users_status = ASYNC_STATUS.SUCCEEDED;
      state.get_connected_users_data = action.payload?.connectedusers ?? [];
    });
    builder.addCase(getConnectedUsersAsync.rejected, (state, action) => {
      state.get_connected_users_status = ASYNC_STATUS.ERROR;
      state.get_connected_users_error = action.payload as string;
    });

    // =========>>>>>>> check if both side connection or not for ConnectionUserDetails screen toggle
    builder.addCase(checkBothSideConnection.pending, state => {
      state.is_personal_and_business_connection_status = ASYNC_STATUS.LOADING;
    });
    builder.addCase(checkBothSideConnection.fulfilled, (state, { payload }) => {
      state.is_personal_and_business_connection_status = ASYNC_STATUS.SUCCEEDED;
      state.isPersonalAndBusinessConnection =
        payload?.data !== '';
    });
    builder.addCase(checkBothSideConnection.rejected, (state, action) => {
      state.is_personal_and_business_connection_status = ASYNC_STATUS.ERROR;
    });
  },
});

export const {
  resetHandlahUsers,
  resetAcceptDeclineStatus,
  resetRemoveConnectionStatus,
  setCurrentConnection,
  setEmergencyConnectionBusinessId,
  resetShareModalState,
  resetConnectedUsers,
  setInitialConnectionRole,
  setConnectionAndEmergencyRequestsCount,
  resetIsPersonalAndBusinessConnection
} = connectionSlice.actions;
export default connectionSlice.reducer;
