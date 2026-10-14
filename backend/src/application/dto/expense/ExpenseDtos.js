class RegisterExpenseInputDto {
  constructor({ userId = null, description, amount, date, category, notes, model } = {}) {
    Object.assign(this, { userId, description, amount, date, category, notes, model });
    Object.freeze(this);
  }
}

class UpdateExpenseInputDto {
  constructor({ id, userId = null, description, amount, date, category, notes, model } = {}) {
    Object.assign(this, { id: Number(id), userId, description, amount, date, category, notes, model });
    Object.freeze(this);
  }
}

class ExpenseMutationOutputDto {
  constructor({ expense, aiCategorized, budget }) {
    this.expense = expense;
    this.aiCategorized = Boolean(aiCategorized);
    this.budget = budget;
    Object.freeze(this);
  }
}

class MonthlyExpensesOutputDto {
  constructor({ month, expenses, total, byCategory, budget }) {
    this.month = month;
    this.expenses = expenses;
    this.total = total;
    this.byCategory = byCategory;
    this.budget = budget;
    Object.freeze(this);
  }
}

module.exports = {
  RegisterExpenseInputDto,
  UpdateExpenseInputDto,
  ExpenseMutationOutputDto,
  MonthlyExpensesOutputDto,
};
