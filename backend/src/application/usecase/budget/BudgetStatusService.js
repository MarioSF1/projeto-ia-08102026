const { Budget } = require('../../../domain/entity/budget/Budget');
const { Money } = require('../../../domain/valueobject/shared/Money');
const { BudgetStatusOutputDto } = require('../../dto/budget/BudgetDtos');

class BudgetStatusService {
  constructor({ expenses, budgets }) {
    this.expenses = expenses;
    this.budgets = budgets;
  }

  async forMonth(yearMonth, userId = null) {
    const list = await this.expenses.findByMonth(yearMonth, userId);
    const spent = Money.sum(list.map((e) => e.amount));
    const budget = await this.budgets.findByMonth(yearMonth, userId);
    const evaluated = budget ? budget.evaluate(spent) : Budget.none(spent);
    return new BudgetStatusOutputDto(evaluated);
  }
}

module.exports = { BudgetStatusService };
