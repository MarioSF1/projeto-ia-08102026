import type { BudgetStatus, Expense, Insights } from './expenses';

export type GeminiModelOption = {
  id: string;
  label: string;
  description: string;
};

export type AgentAction =
  | { type: 'expense_registered'; expense: Expense; budget: BudgetStatus }
  | { type: 'expense_updated'; expense: Expense; budget: BudgetStatus }
  | { type: 'expense_removed'; id: number }
  | { type: 'budget_updated'; month: string; budget: BudgetStatus }
  | { type: 'insights_generated'; insights: Insights }
  | { type: 'model_info'; modelUsed: string; requestedModel?: string; fallbackUsed?: boolean };

export type ChatMessage = {
  id: number;
  userId?: number | null;
  role: 'user' | 'model';
  content: string;
  actions?: AgentAction[];
  createdAt: string;
};

export type ChatSendResponse = {
  reply: string;
  actions: AgentAction[];
  message: ChatMessage;
  modelUsed?: string;
  requestedModel?: string;
  fallbackUsed?: boolean;
};
