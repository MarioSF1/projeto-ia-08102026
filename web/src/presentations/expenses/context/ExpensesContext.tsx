'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentLocalMonth, getErrorMessage } from '@/shared/utils/format';
import { expensesApi } from '@/infrastructure/expenses/expensesApi';
import type {
  CreateExpenseInput,
  ExpenseMutationResponse,
  Insights,
  MonthlyExpensesData,
  UpdateExpenseInput,
} from '@/types';

type FeedbackBanner = {
  type: 'info' | 'error';
  text: string;
} | null;

type ExpensesContextValue = {
  month: string;
  setMonth: (month: string) => void;
  data: MonthlyExpensesData | null;
  categories: string[];
  insights: Insights | null;
  setInsights: (insights: Insights | null) => void;
  isLoading: boolean;
  isGeneratingInsights: boolean;
  feedback: FeedbackBanner;
  clearFeedback: () => void;
  refreshExpenses: () => Promise<void>;
  createExpense: (input: CreateExpenseInput) => Promise<ExpenseMutationResponse>;
  updateExpense: (id: number, input: UpdateExpenseInput) => Promise<ExpenseMutationResponse>;
  removeExpense: (id: number) => Promise<void>;
  saveBudget: (limit: number) => Promise<void>;
  requestInsights: () => Promise<void>;
};

const ExpensesContext = createContext<ExpensesContextValue | undefined>(undefined);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonthState] = useState<string>(() => getCurrentLocalMonth());
  const [data, setData] = useState<MonthlyExpensesData | null>(null);
  const [categories, setCategories] = useState<string[]>([
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Compras',
    'Outros',
  ]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackBanner>(null);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  useEffect(() => {
    expensesApi
      .getCategories()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) setCategories(list);
      })
      .catch(() => {});
  }, []);

  const refreshExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await expensesApi.listByMonth(month);
      setData(res);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Erro ao carregar gastos: ' + getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  const setMonth = useCallback((newMonth: string) => {
    if (!newMonth) return;
    setInsights(null);
    setFeedback(null);
    setMonthState(newMonth);
  }, []);

  const createExpense = useCallback(
    async (input: CreateExpenseInput) => {
      setFeedback(null);
      const res = await expensesApi.create(input);
      if (res.aiCategorized) {
        setFeedback({
          type: 'info',
          text: `IA Gemini categorizou "${res.expense.description}" como ${res.expense.category}.`,
        });
      } else {
        setFeedback({
          type: 'info',
          text: `Gasto "${res.expense.description}" registrado na tabela com sucesso.`,
        });
      }
      await refreshExpenses();
      return res;
    },
    [refreshExpenses]
  );

  const updateExpense = useCallback(
    async (id: number, input: UpdateExpenseInput) => {
      setFeedback(null);
      const res = await expensesApi.update(id, input);
      setFeedback({
        type: 'info',
        text: `Gasto "${res.expense.description}" atualizado com sucesso.`,
      });
      await refreshExpenses();
      return res;
    },
    [refreshExpenses]
  );

  const removeExpense = useCallback(
    async (id: number) => {
      setFeedback(null);
      await expensesApi.remove(id);
      setFeedback({ type: 'info', text: 'Gasto removido da tabela.' });
      await refreshExpenses();
    },
    [refreshExpenses]
  );

  const saveBudget = useCallback(
    async (limit: number) => {
      setFeedback(null);
      await expensesApi.setBudget(month, limit);
      setFeedback({ type: 'info', text: 'Orçamento mensal atualizado!' });
      await refreshExpenses();
    },
    [month, refreshExpenses]
  );

  const requestInsights = useCallback(async () => {
    setFeedback(null);
    setIsGeneratingInsights(true);
    try {
      const result = await expensesApi.generateInsights(month);
      setInsights(result);
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [month]);

  return (
    <ExpensesContext.Provider
      value={{
        month,
        setMonth,
        data,
        categories,
        insights,
        setInsights,
        isLoading,
        isGeneratingInsights,
        feedback,
        clearFeedback,
        refreshExpenses,
        createExpense,
        updateExpense,
        removeExpense,
        saveBudget,
        requestInsights,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpenses deve ser utilizado dentro de um ExpensesProvider');
  return ctx;
}
