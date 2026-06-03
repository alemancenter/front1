import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface ChatbotContentLink {
  id: number;
  title: string;
  type: 'article' | 'post' | 'file' | string;
  description?: string;
  url: string;
}

export interface ChatbotAction {
  label: string;
  type: 'link' | 'message' | string;
  url?: string;
  message?: string;
  style?: 'primary' | 'secondary' | string;
}

export interface ChatbotHelpMedia {
  title: string;
  image_url: string;
  caption?: string;
}

export interface ChatbotMessageResponse {
  session_id: number;
  answer: string;
  intent: string;
  step?: string;
  confidence: number;
  source_type: string;
  links: ChatbotContentLink[];
  actions?: ChatbotAction[];
  suggestions: string[];
  message_id: number;
  ai_used?: boolean;
  ai_model?: string;
  help_media?: ChatbotHelpMedia[];
}

export interface ChatbotKnowledgeItem {
  id?: number;
  title: string;
  question: string;
  answer: string;
  category?: string;
  keywords?: string;
  country_code?: string;
  is_active?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatbotSessionMessage {
  id: number;
  role: 'user' | 'assistant' | string;
  message: string;
  intent?: string;
  confidence?: number;
  source_type?: string;
  metadata?: string;
  created_at: string;
}

export interface ChatbotSession {
  id: number;
  user_id?: number;
  guest_id?: string;
  country_code: string;
  status: string;
  last_intent?: string;
  current_intent?: string;
  current_step?: string;
  context_data?: string;
  created_at: string;
  updated_at: string;
  messages?: ChatbotSessionMessage[];
}

function payload<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T;
}

export const chatbotService = {
  async suggestions(): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>(API_ENDPOINTS.CHATBOT.SUGGESTIONS, undefined, { cache: 'no-store', suppressAuthRedirect: true });
    return payload<string[]>(response) || [];
  },

  async sendMessage(input: { message: string; session_id?: number; guest_id?: string; country_code?: string; page_url?: string }): Promise<ChatbotMessageResponse> {
    const response = await apiClient.post<{ data: ChatbotMessageResponse }>(API_ENDPOINTS.CHATBOT.MESSAGE, input, { timeout: 20000, retries: 1, suppressAuthRedirect: true });
    return payload<ChatbotMessageResponse>(response);
  },

  async feedback(input: { message_id: number; rating: 'helpful' | 'not_helpful'; comment?: string }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CHATBOT.FEEDBACK, input, { suppressAuthRedirect: true });
  },

  async sessions(limit = 50): Promise<ChatbotSession[]> {
    const response = await apiClient.get<{ data: ChatbotSession[] }>(API_ENDPOINTS.CHATBOT.DASHBOARD_SESSIONS, { limit }, { cache: 'no-store' });
    return payload<ChatbotSession[]>(response) || [];
  },

  async session(id: number | string): Promise<ChatbotSession> {
    const response = await apiClient.get<{ data: ChatbotSession }>(API_ENDPOINTS.CHATBOT.DASHBOARD_SESSION(id), undefined, { cache: 'no-store' });
    return payload<ChatbotSession>(response);
  },

  async knowledge(country = '', limit = 100): Promise<ChatbotKnowledgeItem[]> {
    const response = await apiClient.get<{ data: ChatbotKnowledgeItem[] }>(API_ENDPOINTS.CHATBOT.DASHBOARD_KNOWLEDGE, { country, limit }, { cache: 'no-store' });
    return payload<ChatbotKnowledgeItem[]>(response) || [];
  },

  async createKnowledge(item: ChatbotKnowledgeItem): Promise<ChatbotKnowledgeItem> {
    const response = await apiClient.post<{ data: ChatbotKnowledgeItem }>(API_ENDPOINTS.CHATBOT.DASHBOARD_KNOWLEDGE, item);
    return payload<ChatbotKnowledgeItem>(response);
  },

  async updateKnowledge(id: number | string, item: ChatbotKnowledgeItem): Promise<ChatbotKnowledgeItem> {
    const response = await apiClient.put<{ data: ChatbotKnowledgeItem }>(API_ENDPOINTS.CHATBOT.DASHBOARD_KNOWLEDGE_ITEM(id), item);
    return payload<ChatbotKnowledgeItem>(response);
  },

  async deleteKnowledge(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CHATBOT.DASHBOARD_KNOWLEDGE_ITEM(id));
  },
};

export default chatbotService;
