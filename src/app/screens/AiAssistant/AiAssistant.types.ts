import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/RootStackParamList.types';

export type AiAssistantNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AiAssistant'
>;

export type ViewState = 'initial' | 'thinking' | 'results' | 'notFound';

export interface ChatUIAction {
  type: 'none' | 'review' | 'list' | 'picker' | 'media_upload';
  step?: number;
  total_steps?: number;
  tool?: string;
  endpoint?: string;
  label?: string;
  entity?: string;
  required_fields?: string[];
  locked_fields?: string[];
  system_fields?: string[];
  payload?: Record<string, any>;
  displayPayload?: Record<string, any>;
  items?: Record<string, any>[];
  displayItems?: Record<string, any>[];
  picker_field?: string;
  picker_label?: string;
  // media_upload specific
  field?: string;
  mediatype?: string;
  is_array?: boolean;
  required?: boolean;
  description?: string;
  collected_ids?: string[];
  actions?: string[] | {
    confirm?: { label: string; event: string };
    cancel?: { label: string; event: string };
    done?: { label: string; event: string };
    skip?: { label: string; event: string };
  };
}

export interface ChatAPIResponse {
  conversation_id: string;
  message: string;
  status: 'complete' | 'awaiting_review' | 'awaiting_media' | 'awaiting_picker' | 'error' | 'cancelled';
  ui_action: ChatUIAction;
  actions_taken: string[];
  is_report?: boolean;
  intent?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  uiAction?: ChatUIAction;
  status?: ChatAPIResponse['status'];
}

export interface ChatRequestBody {
  message: string;
  conversation_id: string;
  user_id: number;
  mediaId?: string;
  business_id?: number | null;
}

export type ChatEventType =
  | 'tool_confirmed'
  | 'tool_skipped'
  | 'tool_cancelled'
  | 'tool_edited'
  | 'tool_picker_selected'
  | 'media_done'
  | 'media_skipped'
  | 'update_requested';

export interface ChatEventBody {
  conversation_id: string;
  user_id: number;
  event: ChatEventType;
  result?: any;
  confirmed_payload?: Record<string, any> | null;
  entity?: string | null;
  record_id?: string | number | null;
  picker_field?: string | null;
  picker_value?: string | number | null;
  business_id?: number | null;
}
