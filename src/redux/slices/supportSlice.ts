import { createSlice } from '@reduxjs/toolkit';
import { ASYNC_STATUS } from '../../config/constants';
import {
  getSupportCategoriesAsync,
  getSupportTicketsAsync,
  getSupportTicketAsync,
  createSupportTicketAsync,
  reopenSupportTicketAsync,
  replySupportTicketAsync,
  editSupportReplyAsync,
  deleteSupportReplyAsync,
  SupportCategoryDto,
  SupportTicketDto,
  SupportTicketDetailDto,
} from '../services/supportService';

interface SupportState {
  categories: SupportCategoryDto[];
  categories_status: string;
  tickets: SupportTicketDto[];
  tickets_status: string;
  ticket_detail: SupportTicketDetailDto | null;
  ticket_detail_status: string;
  create_ticket_status: string;
  create_ticket_error: string | null;
  reopen_ticket_status: string;
  reopen_ticket_error: string | null;
  reply_status: string;
  reply_error: string | null;
  edit_reply_status: string;
  edit_reply_error: string | null;
  delete_reply_status: string;
  delete_reply_error: string | null;
  error: string | null;
}

const initialState: SupportState = {
  categories: [],
  categories_status: ASYNC_STATUS.IDLE,
  tickets: [],
  tickets_status: ASYNC_STATUS.IDLE,
  ticket_detail: null,
  ticket_detail_status: ASYNC_STATUS.IDLE,
  create_ticket_status: ASYNC_STATUS.IDLE,
  create_ticket_error: null,
  reopen_ticket_status: ASYNC_STATUS.IDLE,
  reopen_ticket_error: null,
  reply_status: ASYNC_STATUS.IDLE,
  reply_error: null,
  edit_reply_status: ASYNC_STATUS.IDLE,
  edit_reply_error: null,
  delete_reply_status: ASYNC_STATUS.IDLE,
  delete_reply_error: null,
  error: null,
};

const supportSlice = createSlice({
  name: 'support_slice',
  initialState,
  reducers: {
    resetCreateTicketStatus: (state) => {
      state.create_ticket_status = ASYNC_STATUS.IDLE;
      state.create_ticket_error = null;
    },
    resetReopenTicketStatus: (state) => {
      state.reopen_ticket_status = ASYNC_STATUS.IDLE;
      state.reopen_ticket_error = null;
    },
    resetReplyStatus: (state) => {
      state.reply_status = ASYNC_STATUS.IDLE;
      state.reply_error = null;
    },
    resetEditReplyStatus: (state) => {
      state.edit_reply_status = ASYNC_STATUS.IDLE;
      state.edit_reply_error = null;
    },
    resetDeleteReplyStatus: (state) => {
      state.delete_reply_status = ASYNC_STATUS.IDLE;
      state.delete_reply_error = null;
    },
    clearTicketDetail: (state) => {
      state.ticket_detail = null;
      state.ticket_detail_status = ASYNC_STATUS.IDLE;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(getSupportCategoriesAsync.pending, (state) => {
        state.categories_status = ASYNC_STATUS.LOADING;
      })
      .addCase(getSupportCategoriesAsync.fulfilled, (state, action) => {
        state.categories_status = ASYNC_STATUS.SUCCEEDED;
        state.categories = action.payload;
      })
      .addCase(getSupportCategoriesAsync.rejected, (state, action) => {
        state.categories_status = ASYNC_STATUS.ERROR;
        state.error = action.payload as string;
      });

    // Tickets list
    builder
      .addCase(getSupportTicketsAsync.pending, (state) => {
        state.tickets_status = ASYNC_STATUS.LOADING;
      })
      .addCase(getSupportTicketsAsync.fulfilled, (state, action) => {
        state.tickets_status = ASYNC_STATUS.SUCCEEDED;
        state.tickets = action.payload;
      })
      .addCase(getSupportTicketsAsync.rejected, (state, action) => {
        state.tickets_status = ASYNC_STATUS.ERROR;
        state.error = action.payload as string;
      });

    // Ticket detail
    builder
      .addCase(getSupportTicketAsync.pending, (state) => {
        state.ticket_detail_status = ASYNC_STATUS.LOADING;
      })
      .addCase(getSupportTicketAsync.fulfilled, (state, action) => {
        state.ticket_detail_status = ASYNC_STATUS.SUCCEEDED;
        state.ticket_detail = action.payload;
      })
      .addCase(getSupportTicketAsync.rejected, (state, action) => {
        state.ticket_detail_status = ASYNC_STATUS.ERROR;
        state.error = action.payload as string;
      });

    // Create ticket
    builder
      .addCase(createSupportTicketAsync.pending, (state) => {
        state.create_ticket_status = ASYNC_STATUS.LOADING;
        state.create_ticket_error = null;
      })
      .addCase(createSupportTicketAsync.fulfilled, (state, action) => {
        state.create_ticket_status = ASYNC_STATUS.SUCCEEDED;
        state.tickets.unshift(action.payload);
      })
      .addCase(createSupportTicketAsync.rejected, (state, action) => {
        state.create_ticket_status = ASYNC_STATUS.ERROR;
        state.create_ticket_error = action.payload as string;
      });

    // Reopen ticket
    builder
      .addCase(reopenSupportTicketAsync.pending, (state) => {
        state.reopen_ticket_status = ASYNC_STATUS.LOADING;
      })
      .addCase(reopenSupportTicketAsync.fulfilled, (state) => {
        state.reopen_ticket_status = ASYNC_STATUS.SUCCEEDED;
        if (state.ticket_detail) {
          state.ticket_detail.status = 5; // Reopened
        }
      })
      .addCase(reopenSupportTicketAsync.rejected, (state, action) => {
        state.reopen_ticket_status = ASYNC_STATUS.ERROR;
        state.reopen_ticket_error = action.payload as string;
      });

    // Reply to ticket
    builder
      .addCase(replySupportTicketAsync.pending, (state) => {
        state.reply_status = ASYNC_STATUS.LOADING;
        state.reply_error = null;
      })
      .addCase(replySupportTicketAsync.fulfilled, (state, action) => {
        state.reply_status = ASYNC_STATUS.SUCCEEDED;
        if (state.ticket_detail) {
          state.ticket_detail.replies.push(action.payload);
        }
      })
      .addCase(replySupportTicketAsync.rejected, (state, action) => {
        state.reply_status = ASYNC_STATUS.ERROR;
        state.reply_error = action.payload as string;
      });

    // Edit reply
    builder
      .addCase(editSupportReplyAsync.pending, (state) => {
        state.edit_reply_status = ASYNC_STATUS.LOADING;
        state.edit_reply_error = null;
      })
      .addCase(editSupportReplyAsync.fulfilled, (state, action) => {
        state.edit_reply_status = ASYNC_STATUS.SUCCEEDED;
        if (state.ticket_detail) {
          const idx = state.ticket_detail.replies.findIndex(r => r.id === action.payload.id);
          if (idx !== -1) {
            state.ticket_detail.replies[idx] = action.payload;
          }
        }
      })
      .addCase(editSupportReplyAsync.rejected, (state, action) => {
        state.edit_reply_status = ASYNC_STATUS.ERROR;
        state.edit_reply_error = action.payload as string;
      });

    // Delete reply
    builder
      .addCase(deleteSupportReplyAsync.pending, (state) => {
        state.delete_reply_status = ASYNC_STATUS.LOADING;
        state.delete_reply_error = null;
      })
      .addCase(deleteSupportReplyAsync.fulfilled, (state, action) => {
        state.delete_reply_status = ASYNC_STATUS.SUCCEEDED;
        if (state.ticket_detail) {
          state.ticket_detail.replies = state.ticket_detail.replies.filter(
            r => r.id !== action.payload.replyId,
          );
        }
      })
      .addCase(deleteSupportReplyAsync.rejected, (state, action) => {
        state.delete_reply_status = ASYNC_STATUS.ERROR;
        state.delete_reply_error = action.payload as string;
      });
  },
});

export const {
  resetCreateTicketStatus,
  resetReopenTicketStatus,
  resetReplyStatus,
  resetEditReplyStatus,
  resetDeleteReplyStatus,
  clearTicketDetail,
} = supportSlice.actions;
export default supportSlice.reducer;
