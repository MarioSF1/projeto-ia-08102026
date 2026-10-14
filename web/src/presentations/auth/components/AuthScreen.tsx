'use client';

import React, { FormEvent, useState } from 'react';
import { getErrorMessage } from '@/shared/utils/format';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-badge">GC</div>
          <div>
            <h1>GastoCerto IA</h1>
            <p className="muted">Seu agente pessoal de gestão financeira com Gemini</p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Entrar na conta
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Criar cadastro
          </button>
        </div>

        {error && <div className="msg error">{error}</div>}

        <form className="col" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field-group">
              <label className="label" htmlFor="auth-name">Seu nome</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Ex.: Mario Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
          )}

          <div className="field-group">
            <label className="label" htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="label" htmlFor="auth-password">Senha</label>
            <input
              id="auth-password"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting
              ? 'Processando...'
              : mode === 'login'
              ? 'Entrar e conversar com o Agente'
              : 'Criar conta e começar'}
          </button>
        </form>

        <div className="auth-highlights">
          <span>💬 Registre gastos conversando naturalmente</span>
          <span>📊 Visualize e edite tudo em tabela interativa</span>
          <span>✨ Insights personalizados com Google Gemini</span>
        </div>
      </div>
    </div>
  );
}
