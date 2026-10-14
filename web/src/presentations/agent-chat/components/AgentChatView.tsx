'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { formatBRL } from '@/shared/utils/format';
import { useAuth } from '@/presentations/auth/context/AuthContext';
import { useAgentChat } from '../context/AgentChatContext';
import type { AgentAction } from '@/types';

const QUICK_PROMPTS = [
  'Gastei R$ 38,90 no almoço hoje com o pessoal da faculdade',
  'Gastei 24,50 de Uber para ir para a aula hoje',
  'Definir meu orçamento deste mês para R$ 2.000',
  'Quais foram meus gastos deste mês até agora?',
  'Me dê insights e dicas para economizar neste mês',
];

function renderActionBadge(action: AgentAction, idx: number) {
  switch (action.type) {
    case 'expense_registered':
      return (
        <div key={idx} className="agent-action-pill success">
          ✅ <strong>Anotei na tabela:</strong> {action.expense.description} ({formatBRL(action.expense.amount)}) ·{' '}
          <em>{action.expense.category}</em>
          {action.expense.notes ? ` — "${action.expense.notes}"` : ''}
        </div>
      );
    case 'expense_updated':
      return (
        <div key={idx} className="agent-action-pill info">
          ✏️ <strong>Gasto atualizado (#{action.expense.id}):</strong> {action.expense.description} (
          {formatBRL(action.expense.amount)})
        </div>
      );
    case 'expense_removed':
      return (
        <div key={idx} className="agent-action-pill warn">
          🗑️ <strong>Gasto #{action.id} removido da tabela</strong>
        </div>
      );
    case 'budget_updated':
      return (
        <div key={idx} className="agent-action-pill info">
          🎯 <strong>Orçamento definido:</strong> {formatBRL(action.budget.limit ?? 0)} ({action.budget.percent ?? 0}% usado)
        </div>
      );
    case 'insights_generated':
      return (
        <div key={idx} className="agent-action-pill purple">
          ✨ <strong>Insights gerados!</strong> {action.insights.attentionPoint}
        </div>
      );
    case 'model_info':
    default:
      return null;
  }
}

export function AgentChatView({ onSwitchToTable }: { onSwitchToTable?: () => void }) {
  const { user } = useAuth();
  const {
    messages,
    availableModels,
    selectedModel,
    setSelectedModel,
    isLoadingHistory,
    isSending,
    error,
    sendMessage,
    clearHistory,
  } = useAgentChat();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const currentModelMeta = availableModels.find((m) => m.id === selectedModel);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  }

  return (
    <section className="chat-card card">
      <div className="chat-header">
        <div className="chat-agent-title">
          <div className="agent-avatar">✨</div>
          <div>
            <h2 className="section-title">Agente Financeiro Pessoal (Gemini)</h2>
            <p className="muted">
              Passe seus gastos com observações, defina metas ou peça análises em linguagem natural.
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <div className="model-selector-box" title={currentModelMeta?.description || 'Fallback automático ativo'}>
            <label htmlFor="gemini-model-select" className="model-selector-label">
              🤖 Modelo (Fallback Auto):
            </label>
            <select
              id="gemini-model-select"
              className="model-selector-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isSending}
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {onSwitchToTable && (
            <button type="button" className="btn-secondary btn-small" onClick={onSwitchToTable}>
              📊 Ver Tabela Completa
            </button>
          )}
          {messages.length > 0 && (
            <button
              type="button"
              className="btn-link danger-text"
              onClick={clearHistory}
              title="Limpar conversa"
            >
              Limpar histórico
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages-area">
        {isLoadingHistory ? (
          <p className="muted">Carregando conversa com o agente...</p>
        ) : messages.length === 0 ? (
          <div className="chat-welcome">
            <h3>Olá, {user?.name?.split(' ')[0] || 'tudo bem'}! 👋</h3>
            <p className="muted">
              Sou seu agente pessoal de gestão financeira. Você pode escolher o modelo do Gemini acima (caso o modelo
              escolhido atinja limite ou falhe, faço <strong>fallback automático</strong> para outro modelo da fila) e
              conversar comigo naturalmente para anotar despesas ou pedir conselhos.
            </p>
            <div className="quick-prompts">
              <span className="label">Experimente clicar em um exemplo:</span>
              <div className="quick-prompts-grid">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="prompt-chip"
                    onClick={() => sendMessage(prompt)}
                    disabled={isSending}
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const modelInfo = msg.actions?.find(
              (a): a is Extract<AgentAction, { type: 'model_info' }> => a.type === 'model_info'
            );
            const visibleActions = msg.actions?.filter((a) => a.type !== 'model_info') || [];

            return (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.role === 'user' ? 'user-row' : 'model-row'}`}
              >
                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
                  <div className="bubble-sender">
                    <span>{msg.role === 'user' ? 'Você' : '✨ Agente GastoCerto'}</span>
                    {msg.role === 'model' && modelInfo && (
                      <span
                        className={`model-badge ${modelInfo.fallbackUsed ? 'fallback' : ''}`}
                        title={
                          modelInfo.fallbackUsed
                            ? `Modelo solicitado (${modelInfo.requestedModel}) falhou/indisponível. Respondido automaticamente via fallback (${modelInfo.modelUsed}).`
                            : `Respondido pelo modelo selecionado (${modelInfo.modelUsed})`
                        }
                      >
                        {modelInfo.fallbackUsed
                          ? `⚡ Fallback: ${modelInfo.modelUsed}`
                          : `🤖 ${modelInfo.modelUsed}`}
                      </span>
                    )}
                  </div>
                  <div className="bubble-text">{msg.content}</div>

                  {visibleActions.length > 0 && (
                    <div className="bubble-actions">
                      {visibleActions.map((act, i) => renderActionBadge(act, i))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="chat-bubble-row model-row">
            <div className="chat-bubble model-bubble typing-bubble">
              <div className="bubble-sender">
                <span>✨ Agente GastoCerto</span>
                <span className="model-badge">🤖 {selectedModel}</span>
              </div>
              <div className="muted">Analisando e atualizando seus registros...</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <div className="msg error">{error}</div>}

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ex.: Gastei 45 reais no mercado comprando itens para o jantar..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <button type="submit" className="btn-primary" disabled={isSending || !input.trim()}>
          {isSending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </section>
  );
}
