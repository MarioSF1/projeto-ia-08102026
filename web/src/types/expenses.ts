export type Expense = {
  id: number;
  userId?: number | null;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  createdAt?: string;
};

export type BudgetStatus = {
  limit: number | null;
  spent: number;
  percent: number | null;
  status: 'ok' | 'alerta' | 'excedido' | 'sem_orcamento';
};

export type MonthlyExpensesData = {
  month: string;
  expenses: Expense[];
  total: number;
  byCategory: Record<string, number>;
  budget: BudgetStatus;
};

export type Insights = {
  month?: string;
  summary: string;
  attentionPoint: string;
  tips: string[];
};

export type CreateExpenseInput = {
  description: string;
  amount: number;
  date?: string;
  category?: string;
  notes?: string;
};

export type UpdateExpenseInput = {
  description?: string;
  amount?: number;
  date?: string;
  category?: string;
  notes?: string;
};

export type ExpenseMutationResponse = {
  expense: Expense;
  aiCategorized: boolean;
  budget: BudgetStatus;
};
