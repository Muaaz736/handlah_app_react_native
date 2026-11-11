import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import { extractApiError } from '../../utils/helpers';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface SupportCategoryDto {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketReplyDto {
  id: number;
  ticketId: number;
  adminUserId?: number | null;
  adminName?: string | null;
  userId?: number | null;
  userFullName?: string | null;
  isAdminReply?: boolean;
  message: string;
  attachmentUrls: string[];
  createdAt: string;
}

export interface SupportTicketDto {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  categoryId: number | null;
  categoryName: string | null;
  otherCategoryText: string | null;
  subject: string;
  description: string;
  status: number; // 1=Open,2=InProgress,3=Resolved,4=Closed,5=Reopened
  priority: number | null; // 1=Low,2=Medium,3=High,4=Urgent
  attachmentUrls: string[];
  createdat: string;
  updatedAt: string;
}

export interface SupportTicketDetailDto extends SupportTicketDto {
  replies: SupportTicketReplyDto[];
}

export interface CreateSupportTicketPayload {
  categoryId?: number;
  otherCategoryText?: string;
  subject: string;
  description: string;
  attachmentUrls: string[];
}

export interface ReplyTicketPayload {
  ticketId: number;
  message: string;
  attachmentUrls?: string[];
}

export interface EditReplyPayload {
  ticketId: number;
  replyId: number;
  message: string;
  attachmentUrls?: string[];
}

export interface DeleteReplyPayload {
  ticketId: number;
  replyId: number;
}

// ─── Thunks ──────────────────────────────────────────────────────────────────

// GET /support/categories
export const getSupportCategoriesAsync = createAsyncThunk<SupportCategoryDto[], void>(
  TYPE_CONSTANTS.GET_SUPPORT_CATEGORIES_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.SUPPORT.GET_CATEGORIES);
      return (response.data?.items ?? response.data) as SupportCategoryDto[];
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load support categories.'));
    }
  },
);

// GET /support/tickets
export const getSupportTicketsAsync = createAsyncThunk<SupportTicketDto[], void>(
  TYPE_CONSTANTS.GET_SUPPORT_TICKETS_ASYNC,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.SUPPORT.GET_TICKETS);
      return (response.data?.items ?? response.data) as SupportTicketDto[];
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load support tickets.'));
    }
  },
);

// GET /support/tickets/{id}
export const getSupportTicketAsync = createAsyncThunk<SupportTicketDetailDto, number>(
  TYPE_CONSTANTS.GET_SUPPORT_TICKET_ASYNC,
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get(API_ENDPOINTS.SUPPORT.GET_TICKET(ticketId));
      return response.data as SupportTicketDetailDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load ticket details.'));
    }
  },
);

// POST /support/tickets
export const createSupportTicketAsync = createAsyncThunk<SupportTicketDto, CreateSupportTicketPayload>(
  TYPE_CONSTANTS.CREATE_SUPPORT_TICKET_ASYNC,
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiHandle.post(API_ENDPOINTS.SUPPORT.CREATE_TICKET, payload);
      return response.data as SupportTicketDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to submit support ticket.'));
    }
  },
);

// PUT /support/tickets/{id}/reopen
export const reopenSupportTicketAsync = createAsyncThunk<{ success: boolean; message: string }, number>(
  TYPE_CONSTANTS.REOPEN_SUPPORT_TICKET_ASYNC,
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await apiHandle.put(API_ENDPOINTS.SUPPORT.REOPEN_TICKET(ticketId));
      return response.data;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to reopen ticket.'));
    }
  },
);

// POST /support/tickets/{id}/reply
export const replySupportTicketAsync = createAsyncThunk<SupportTicketReplyDto, ReplyTicketPayload>(
  TYPE_CONSTANTS.REPLY_SUPPORT_TICKET_ASYNC,
  async ({ ticketId, message, attachmentUrls }, { rejectWithValue }) => {
    try {
      const response = await apiHandle.post(
        API_ENDPOINTS.SUPPORT.REPLY_TICKET(ticketId),
        { message, attachmentUrls: attachmentUrls ?? [] },
      );
      return response.data as SupportTicketReplyDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to send reply.'));
    }
  },
);

// PUT /support/tickets/{ticketId}/replies/{replyId}
export const editSupportReplyAsync = createAsyncThunk<SupportTicketReplyDto, EditReplyPayload>(
  TYPE_CONSTANTS.EDIT_SUPPORT_REPLY_ASYNC,
  async ({ ticketId, replyId, message, attachmentUrls }, { rejectWithValue }) => {
    try {
      const response = await apiHandle.put(
        API_ENDPOINTS.SUPPORT.EDIT_REPLY(ticketId, replyId),
        { message, attachmentUrls: attachmentUrls ?? [] },
      );
      return response.data as SupportTicketReplyDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to edit reply.'));
    }
  },
);

// DELETE /support/tickets/{ticketId}/replies/{replyId}
export const deleteSupportReplyAsync = createAsyncThunk<DeleteReplyPayload, DeleteReplyPayload>(
  TYPE_CONSTANTS.DELETE_SUPPORT_REPLY_ASYNC,
  async ({ ticketId, replyId }, { rejectWithValue }) => {
    try {
      await apiHandle.delete(API_ENDPOINTS.SUPPORT.DELETE_REPLY(ticketId, replyId));
      return { ticketId, replyId };
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to delete reply.'));
    }
  },
);
