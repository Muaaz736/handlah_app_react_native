import type { ChatAPIResponse } from '../../AiAssistant.types';

export interface IChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  aiResponse?: ChatAPIResponse | null;
  imageUri?: string;
  documentUri?: string;
  documentName?: string;
}

export interface IChatbotScreenProps {}