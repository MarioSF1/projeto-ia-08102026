'use client';

import React, { FormEvent, useState } from 'react';
import { formatBRL, formatMonthLabel, getErrorMessage } from '@/shared/utils/format';
import { useExpenses } from '../context/ExpensesContext';

const STATUS_META = {
  ok: { color: '#0d9488', bg: '#ccfbf1', text: 'Dentro do orçamento' },
  alerta: { color: '#d97706', bg: '#fef3c7', text: 'Atenção: acima de 80% do orçamento' },
  excedido: { color: '#dc2626', bg: '#fee2e2', text: 'Orçamento excedido!' },
  sem_orcamento: { color: '#6b7280', bg: '#f3f4f6', text: 'Sem orçamento definido' },
} as const;

export function BudgetHeaderSummary() {
  const { month, setMonth, data, saveBudget } = useExpenses();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const budget = data?.budget;
  const statusInfo = STATUS_META[budget?.status ?? 'sem_orcamento'];
  const progressPercent = budget?.percent != null ? Math.min(budget.percent, 100) : 0;

  async function handleBudgetSubmit(e: FormEvent) {
    e.preventDefault();
    setBudgetError(null);
    try {
      const value = Number(budgetInput.replace(',', '.'));
      await saveBudget(value);
      setEditingBudget(false);
      setBudgetInput('');
    } catch (err) {
      setBudgetError(getErrorMessage(err));
    }
  }

  return (
    <section className="summary-strip" style={{ borderLeft: `5px solid ${statusInfo.color}` }}>
      <div className="summary-main">
        <div className="summary-month-picker">
          <label htmlFor="month-select" className="label">Mês de referência</label>
          <input
            id="month-select"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="month-input"
          />
          <span className="month-human">{formatMonthLabel(month)}</span>
        </div>

        <div className="summary-numbers">
          <div>
            <span className="label">Total gasto no mês</span>
            <div className="big">{formatBRL(data?.total ?? 0)}</div>
          </div>

          <div className="summary-budget-box">
            <div className="summary-budget-header">
              <span
                className="status-pill"
                style={{ color: statusInfo.color, background: statusInfo.bg }}
              >
                {statusInfo.text}
              </span>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setEditingBudget((v) => !v);
                  setBudgetInput(budget?.limit ? String(budget.limit) : '');
                }}
              >
                {budget?.limit ? 'Alterar meta' : 'Definir meta'}
              </button>
            </div>

            {budget?.limit ? (
              <>
                <div className="muted">
                  Meta mensal: <strong>{formatBRL(budget.limit)}</strong> ({budget.percent}% utilizado)
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%`, background: statusInfo.color }}
                  />
                </div>
              </>
            ) : (
              <div className="muted">Defina um limite mensal aqui ou peça ao Agente no chat.</div>
            )}

            {editingBudget && (
              <form className="budget-inline-form" onSubmit={handleBudgetSubmit}>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex.: 2500,00"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  required
                />
                <button type="submit" className="btn-small">Salvar</button>
              </form>
            )}
            {budgetError && <span className="inline-error">{budgetError}</span>}
          </div>
        </div>
      </div>

      {data && Object.keys(data.byCategory).length > 0 && (
        <div className="category-chips">
          {Object.entries(data.byCategory).map(([cat, val]) => (
            <span key={cat} className="cat-chip">
              <strong>{cat}:</strong> {formatBRL(val)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
