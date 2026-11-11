import { getValidAccessToken as getAccessToken } from '../../../../../config/apiHandle';
import { BASEURL } from '../../../../../config/apiHandle';
import { ENV } from '../../../../../config/env';
import type {
  ChatAPIResponse,
  ChatRequestBody,
  ChatEventBody,
  ChatEventType,
} from '../../AiAssistant.types';
import { resolveChatbotResponse } from './chatPayloadResolver';

const BASE_URL = ENV.AI_BASE_URL;

export const ENDPOINTS = {
  chat: '/chat',
  actionChat: '/chat',
  chatEvent: '/chat/event',
  questionLog: '/ai-question-log',
  entityGuidance: '/entity/guidance',
  entityPortals: '/entity/portals',
};


export async function uploadChatMedia(
  uri: string,
  mimeType: string = 'image/jpeg',
  fileName: string = `chat_media_${Date.now()}`,
): Promise<string | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const formData = new FormData();
    formData.append('file', { uri, type: mimeType, name: fileName } as any);

    const response = await fetch(`${BASEURL}image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data?.id ?? null;
  } catch {
    return null;
  }
}


export async function getAuthToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}


interface SimpleChatRequest {
  question: string;
  session_id: string;
}

interface SimpleChatResponse {
  answer: string;
}

export async function sendSimpleChatMessage(question: string): Promise<string> {
  const url = `${BASE_URL}${ENDPOINTS.chat}`;
  const body: SimpleChatRequest = { question, session_id: '12345' };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Chat API request failed (${res.status}): ${errText}`);
  }

  const data: SimpleChatResponse = await res.json();
  return data.answer || '';
}


export async function sendChatMessage(
  message: string,
  conversationId: string,
  userId: number,
  mediaId?: string | null,
  businessId?: number | null,
): Promise<ChatAPIResponse> {
  const token = await getAuthToken();

  const body: ChatRequestBody = {
    message,
    conversation_id: conversationId,
    user_id: userId,
    ...(mediaId ? { mediaId } : {}),
    ...(businessId ? { business_id: businessId } : {}),
  };

  const response = await fetch(`${BASE_URL}${ENDPOINTS.actionChat}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const data: ChatAPIResponse = await response.json();
  return (await resolveChatbotResponse(data)) as ChatAPIResponse;
}

export async function sendChatEvent(
  conversationId: string,
  userId: number,
  event: ChatEventType,
  options?: {
    result?: any;
    confirmed_payload?: Record<string, any> | null;
    entity?: string | null;
    record_id?: string | number | null;
    picker_field?: string | null;
    picker_value?: string | number | null;
    businessId?: number | null;
  },
): Promise<ChatAPIResponse> {
  const token = await getAuthToken();

  const body: ChatEventBody = {
    conversation_id: conversationId,
    user_id: userId,
    event,
    result: options?.result ?? null,
    confirmed_payload: options?.confirmed_payload ?? null,
    entity: options?.entity ?? null,
    record_id: options?.record_id ?? null,
    picker_field: options?.picker_field ?? null,
    picker_value: options?.picker_value ?? null,
    ...(options?.businessId ? { business_id: options.businessId } : {}),
  };

  const response = await fetch(`${BASE_URL}${ENDPOINTS.chatEvent}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Event request failed: ${response.status}`);
  }

  const data: ChatAPIResponse = await response.json();
  return (await resolveChatbotResponse(data)) as ChatAPIResponse;
}


// Entity Portals & Guidance

export interface ReminderCardRequest {
  title?: string;
  module: string;
  description: string;
  entityType: string;
  urgency?: string;
  daysLabel?: string;
  icon?: string;
  entityId?: number;
  routeKey?: string;
  buttonText?: string;
  reminderId?: number | null;
  parentId?: number | null;
  businessId?: number | null;
  accountType?: string;
  recordSnapshot?: Record<string, any> | null;
}

export interface EntityPortal {
  name: string;
  url: string;
  type?: string;
}

export type EntityPortalAction = 'redirect' | 'popup' | 'none';

export interface EntityPortalsResponse {
  entityType: string;
  action: EntityPortalAction;
  popupMessage: string | null;
  redirectUrl: string | null;
  redirectQuery: string | null;
  ruleMatched: boolean;
  officialWebsites: EntityPortal[];
  relevantPortals: EntityPortal[];
}

export interface EntityGuidanceResponse {
  entityType: string;
  checklist: string[];
  requiredDocuments: string[];
  guidance: string[];
}

export class EntityPortalsError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number | null,
    public readonly isAuthError: boolean = false,
    public readonly isServerError: boolean = false,
    public readonly isTimeout: boolean = false,
  ) {
    super(message);
    this.name = 'EntityPortalsError';
  }
}

export async function fetchEntityPortals(
  req: ReminderCardRequest,
): Promise<EntityPortalsResponse> {
  const token = await getAuthToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${ENDPOINTS.entityPortals}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new EntityPortalsError(
        'Request timed out. Please check your connection and try again.',
        null,
        false,
        false,
        true,
      );
    }
    throw new EntityPortalsError(
      'Network error. Please check your connection and try again.',
      null,
      false,
      false,
      true,
    );
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    if (response.status === 401) {
      throw new EntityPortalsError(
        'Your session has expired. Please log in again.',
        401,
        true,
      );
    }
    if (response.status === 502) {
      throw new EntityPortalsError(
        'The service is temporarily unavailable. Please try again in a moment.',
        502,
        false,
        true,
      );
    }
    throw new EntityPortalsError(
      `Something went wrong (${response.status}). Please try again.`,
      response.status,
      false,
      response.status >= 500,
    );
  }
  const data = await response.json();
  return data;
}

export async function fetchEntityGuidance(
  req: ReminderCardRequest,
): Promise<EntityGuidanceResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}${ENDPOINTS.entityGuidance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData?.detail || `Entity guidance request failed: ${response.status}`,
    );
  }
  return response.json();
}

// Question Log

export async function sendQuestionLog(
  message: string,
  conversationId: string,
  mediaId?: string | null,
): Promise<void> {
  try {
    const token = await getAuthToken();
    await fetch(`${BASEURL}${ENDPOINTS.questionLog}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        conversationId,
        ...(mediaId ? { mediaId } : {}),
      }),
    });
  } catch {
    // silent — do not surface errors to the user
  }
}
