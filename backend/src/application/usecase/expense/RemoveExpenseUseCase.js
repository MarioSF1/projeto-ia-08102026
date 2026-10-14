const { ExpenseNotFoundError } = require('../../../domain/exception/expense/ExpenseExceptions');

class RemoveExpenseUseCase {
  constructor({ expenses }) {
    this.expenses = expenses;
  }

  async execute({ id, userId = null } = {}) {
    if (!(await this.expenses.remove(Number(id), userId))) {
      throw new ExpenseNotFoundError();
    }
  }
}

module.exports = { RemoveExpenseUseCase, RemoveExpense: RemoveExpenseUseCase };
