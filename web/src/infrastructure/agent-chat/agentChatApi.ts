import { httpClient } from '@/infrastructure/http/httpClient';
import type { ChatMessage, ChatSendResponse, GeminiModelOption } from '@/types';

export const agentChatApi = {
  listModels(): Promise<{ defaultModel: string; models: GeminiModelOption[] }> {
    return httpClient<{ defaultModel: string; models: GeminiModelOption[] }>('/chat/models');
  },

  listHistory(): Promise<{ messages: ChatMessage[] }> {
    return httpClient<{ messages: ChatMessage[] }>('/chat/messages');
  },

  sendMessage(message: string, model?: string): Promise<ChatSendResponse> {
    return httpClient<ChatSendResponse>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ message, model }),
    });
  },

  clearHistory(): Promise<void> {
    return httpClient<void>('/chat/messages', {
      method: 'DELETE',
    });
  },
};
