'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { formatBRL, formatDateBR, getErrorMessage, getTodayLocalISO } from '@/shared/utils/format';
import { useExpenses } from '../context/ExpensesContext';
import type { Expense } from '@/types';

export function ExpensesTableView() {
  const {
    data,
    categories,
    insights,
    isLoading,
    isGeneratingInsights,
    feedback,
    clearFeedback,
    createExpense,
    updateExpense,
    removeExpense,
    requestInsights,
  } = useExpenses();

  // Estados do formulário de novo lançamento direto na tabela
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => getTodayLocalISO());
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNew, setSavingNew] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estados de filtro da tabela
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Estados de edição inline na tabela
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const filteredExpenses = useMemo(() => {
    const list = data?.expenses ?? [];
    return list.filter((item) => {
      const matchesCat = !categoryFilter || item.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.description.toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [data?.expenses, categoryFilter, searchQuery]);

  async function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    clearFeedback();
    setSavingNew(true);
    try {
      await createExpense({
        description,
        amount: Number(amount.replace(',', '.')),
        date: date || undefined,
        category: category || undefined,
        notes: notes || undefined,
      });
      setDescription('');
      setAmount('');
      setNotes('');
      setCategory('');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSavingNew(false);
    }
  }

  function startEditing(expense: Expense) {
    setEditingId(expense.id);
    setEditDescription(expense.description);
    setEditAmount(String(expense.amount));
    setEditDate(expense.date);
    setEditCategory(expense.category);
    setEditNotes(expense.notes || '');
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function handleSaveEdit(id: number) {
    setFormError(null);
    setSavingEdit(true);
    try {
      await updateExpense(id, {
        description: editDescription,
        amount: Number(editAmount.replace(',', '.')),
        date: editDate,
        category: editCategory,
        notes: editNotes,
      });
      setEditingId(null);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: number) {
    setFormError(null);
    try {
      await removeExpense(id);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  return (
    <div className="table-feature-container">
      {feedback && (
        <div className={`msg ${feedback.type}`} onClick={clearFeedback}>
          {feedback.text}
        </div>
      )}
      {formError && <div className="msg error">{formError}</div>}

      {/* Card para adicionar novo gasto/anotação diretamente na tabela */}
      <section className="card">
        <div className="card-header-row">
          <div>
            <h2 className="section-title">Novo Lançamento na Tabela</h2>
            <p className="muted">
              Preencha manualmente ou deixe a categoria em branco para a IA Gemini classificar automaticamente.
            </p>
          </div>
          <button
            type="button"
            className="btn-purple"
            onClick={requestInsights}
            disabled={isGeneratingInsights}
          >
            {isGeneratingInsights ? 'Analisando com Gemini...' : '✨ Gerar Insights do Mês'}
          </button>
        </div>

        <form className="expense-form-grid" onSubmit={handleAddSubmit}>
          <div className="field-group">
            <label className="label">Descrição *</label>
            <input
              type="text"
              placeholder="Ex.: Almoço executivo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Valor (R$) *</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 42,90"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="label">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">✨ Automática (IA Gemini)</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field-group field-notes">
            <label className="label">Anotação / Observação</label>
            <input
              type="text"
              placeholder="Ex.: Reunião com o grupo do trabalho da faculdade (pago no Pix)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
            />
          </div>

          <div className="field-group field-submit">
            <button type="submit" className="btn-primary" disabled={savingNew}>
              {savingNew ? 'Salvando...' : '+ Adicionar à Tabela'}
            </button>
          </div>
        </form>
      </section>

      {/* Painel de Insights caso gerados */}
      {insights && (
        <section className="card insights-card">
          <div className="insights-header">
            <h3>✨ Análise do Consultor Gemini</h3>
            <button type="button" className="btn-link" onClick={() => requestInsights()}>
              Atualizar análise
            </button>
          </div>
          <div className="insights-grid">
            <div>
              <span className="label">Resumo do Mês</span>
              <p>{insights.summary}</p>
            </div>
            <div>
              <span className="label">Ponto de Atenção</span>
              <p>{insights.attentionPoint}</p>
            </div>
          </div>
          <div>
            <span className="label">Dicas Práticas de Economia</span>
            <ul className="insights-tips">
              {insights.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Tabela de Gastos e Anotações */}
      <section className="card">
        <div className="table-toolbar">
          <div>
            <h2 className="section-title">
              Tabela de Gastos e Anotações ({filteredExpenses.length})
            </h2>
            <p className="muted">
              Exibe todos os gastos informados diretamente aqui ou através da conversa natural com o Agente.
            </p>
          </div>

          <div className="table-filters">
            <input
              type="search"
              placeholder="Buscar por descrição ou anotação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="muted">Carregando registros...</p>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-table-state">
            <p>Nenhum gasto encontrado para este mês ou filtro.</p>
            <span className="muted">
              Você pode adicionar gastos no formulário acima ou conversar naturalmente com o Agente!
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Anotações / Detalhes</th>
                  <th className="col-right">Valor</th>
                  <th className="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id} className={isEditing ? 'editing-row' : ''}>
                      <td className="muted">#{item.id}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        ) : (
                          formatDateBR(item.date)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        ) : (
                          <strong>{item.description}</strong>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="category-badge">{item.category}</span>
                        )}
                      </td>
                      <td className="notes-cell">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="Adicionar anotação..."
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                        ) : item.notes ? (
                          <span className="notes-text">{item.notes}</span>
                        ) : (
                          <span className="notes-empty">— Sem anotação</span>
                        )}
                      </td>
                      <td className="col-right amount-cell">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                          />
                        ) : (
                          <strong>{formatBRL(item.amount)}</strong>
                        )}
                      </td>
                      <td className="col-actions">
                        {isEditing ? (
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn-small"
                              disabled={savingEdit}
                              onClick={() => handleSaveEdit(item.id)}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-small"
                              onClick={cancelEditing}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn-icon"
                              title="Editar gasto ou anotação"
                              onClick={() => startEditing(item)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn-icon danger"
                              title="Remover gasto"
                              onClick={() => handleDelete(item.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
