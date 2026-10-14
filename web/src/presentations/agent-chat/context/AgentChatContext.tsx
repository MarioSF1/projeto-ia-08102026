'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { agentChatApi } from '@/infrastructure/agent-chat/agentChatApi';
import {
  DEFAULT_GEMINI_MODEL,
  getStoredGeminiModel,
  setStoredGeminiModel,
} from '@/infrastructure/http/httpClient';
import { getErrorMessage } from '@/shared/utils/format';
import { useExpenses } from '@/presentations/expenses/context/ExpensesContext';
import type { ChatMessage, GeminiModelOption } from '@/types';

const DEFAULT_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash (Padrão)',
    description: 'Modelo padrão mais recente, rápido e inteligente para uso geral e ferramentas.',
  },
  {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    description: 'Alta performance e equilíbrio para conversação e categorização financeira.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite',
    description: 'Versão leve e econômica de baixa latência, ideal para alta disponibilidade.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    description: 'Versão ultra leve de contingência para garantir disponibilidade contínua.',
  },
];

type AgentChatContextValue = {
  messages: ChatMessage[];
  availableModels: GeminiModelOption[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isLoadingHistory: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => Promise<void>;
};

const AgentChatContext = createContext<AgentChatContextValue | undefined>(undefined);

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const { refreshExpenses, setInsights } = useExpenses();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [availableModels, setAvailableModels] = useState<GeminiModelOption[]>(DEFAULT_MODEL_OPTIONS);
  const [selectedModel, setSelectedModelState] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedModelState(getStoredGeminiModel());
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model);
    setStoredGeminiModel(model);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoadingHistory(true);

    agentChatApi
      .listModels()
      .then((res) => {
        if (active && Array.isArray(res?.models) && res.models.length > 0) {
          setAvailableModels(res.models);
        }
      })
      .catch(() => {
        // Mantém lista padrão caso endpoint de modelos ainda não esteja disponível
      });

    agentChatApi
      .listHistory()
      .then((res) => {
        if (active) setMessages(res.messages || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoadingHistory(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isSending) return;

      setError(null);
      setIsSending(true);

      const optimisticUserMsg: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content: text,
        actions: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        const res = await agentChatApi.sendMessage(text, selectedModel);
        setMessages((prev) => [...prev, res.message]);

        if (res.actions && res.actions.length > 0) {
          let hasDataChanges = false;
          for (const action of res.actions) {
            if (action.type === 'insights_generated' && action.insights) {
              setInsights(action.insights);
            }
            if (
              action.type === 'expense_registered' ||
              action.type === 'expense_updated' ||
              action.type === 'expense_removed' ||
              action.type === 'budget_updated'
            ) {
              hasDataChanges = true;
            }
          }
          if (hasDataChanges) {
            await refreshExpenses();
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSending(false);
      }
    },
    [isSending, refreshExpenses, selectedModel, setInsights]
  );

  const clearHistory = useCallback(async () => {
    setError(null);
    try {
      await agentChatApi.clearHistory();
      setMessages([]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  return (
    <AgentChatContext.Provider
      value={{
        messages,
        availableModels,
        selectedModel,
        setSelectedModel,
        isLoadingHistory,
        isSending,
        error,
        sendMessage,
        clearHistory,
      }}
    >
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat(): AgentChatContextValue {
  const ctx = useContext(AgentChatContext);
  if (!ctx) throw new Error('useAgentChat deve ser utilizado dentro de um AgentChatProvider');
  return ctx;
}
