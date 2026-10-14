'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/presentations/auth/context/AuthContext';
import { AuthScreen } from '@/presentations/auth/components/AuthScreen';
import { ExpensesProvider, useExpenses } from '@/presentations/expenses/context/ExpensesContext';
import { BudgetHeaderSummary } from '@/presentations/expenses/components/BudgetHeaderSummary';
import { ExpensesTableView } from '@/presentations/expenses/components/ExpensesTableView';
import { AgentChatProvider } from '@/presentations/agent-chat/context/AgentChatContext';
import { AgentChatView } from '@/presentations/agent-chat/components/AgentChatView';

type ActiveView = 'chat' | 'table' | 'split';

function AuthenticatedWorkspace() {
  const { user, logout } = useAuth();
  const { data } = useExpenses();
  // Logo ao logar, o usuário já entra direto na conversa com o Agente
  const [activeView, setActiveView] = useState<ActiveView>('chat');

  const count = data?.expenses?.length ?? 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-badge">GC</div>
          <div>
            <strong>GastoCerto IA</strong>
            <span className="topbar-subtitle">Agente Pessoal de Gestão Financeira</span>
          </div>
        </div>

        <nav className="view-switcher" aria-label="Modo de visualização">
          <button
            type="button"
            className={`nav-tab ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            💬 Conversar com o Agente
          </button>
          <button
            type="button"
            className={`nav-tab ${activeView === 'table' ? 'active' : ''}`}
            onClick={() => setActiveView('table')}
          >
            📊 Tabela de Gastos e Anotações ({count})
          </button>
          <button
            type="button"
            className={`nav-tab desktop-only ${activeView === 'split' ? 'active' : ''}`}
            onClick={() => setActiveView('split')}
          >
            ⚡ Visão Lado a Lado
          </button>
        </nav>

        <div className="topbar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button type="button" className="btn-secondary btn-small" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="workspace-container">
        <BudgetHeaderSummary />

        {activeView === 'chat' && (
          <AgentChatView onSwitchToTable={() => setActiveView('table')} />
        )}

        {activeView === 'table' && <ExpensesTableView />}

        {activeView === 'split' && (
          <div className="split-workspace">
            <div className="split-col">
              <AgentChatView />
            </div>
            <div className="split-col">
              <ExpensesTableView />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AppContent() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="auth-wrapper">
        <p className="muted">Carregando GastoCerto IA...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <ExpensesProvider>
      <AgentChatProvider>
        <AuthenticatedWorkspace />
      </AgentChatProvider>
    </ExpensesProvider>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
