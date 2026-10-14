import { httpClient } from '@/infrastructure/http/httpClient';
import type {
  BudgetStatus,
  CreateExpenseInput,
  ExpenseMutationResponse,
  Insights,
  MonthlyExpensesData,
  UpdateExpenseInput,
} from '@/types';

export const expensesApi = {
  getCategories(): Promise<string[]> {
    return httpClient<string[]>('/categories');
  },

  listByMonth(month: string): Promise<MonthlyExpensesData> {
    return httpClient<MonthlyExpensesData>(`/expenses?month=${encodeURIComponent(month)}`);
  },

  create(input: CreateExpenseInput): Promise<ExpenseMutationResponse> {
    return httpClient<ExpenseMutationResponse>('/expenses', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateExpenseInput): Promise<ExpenseMutationResponse> {
    return httpClient<ExpenseMutationResponse>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return httpClient<void>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  setBudget(month: string, limit: number): Promise<BudgetStatus> {
    return httpClient<BudgetStatus>('/budget', {
      method: 'PUT',
      body: JSON.stringify({ month, limit }),
    });
  },

  generateInsights(month: string): Promise<Insights> {
    return httpClient<Insights>(`/insights?month=${encodeURIComponent(month)}`);
  },
};
