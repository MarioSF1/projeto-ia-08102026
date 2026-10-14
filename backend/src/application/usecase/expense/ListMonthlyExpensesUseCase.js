const { YearMonth } = require('../../../domain/valueobject/shared/YearMonth');
const { Money } = require('../../../domain/valueobject/shared/Money');
const { MonthlyExpensesOutputDto } = require('../../dto/expense/ExpenseDtos');

class ListMonthlyExpensesUseCase {
  constructor({ expenses, budgetStatus }) {
    Object.assign(this, { expenses, budgetStatus });
  }

  async execute({ month, userId = null } = {}) {
    const ym = month ? YearMonth.of(month) : YearMonth.current();
    const list = (await this.expenses.findByMonth(ym, userId)).sort(
      (a, b) => b.date.value.localeCompare(a.date.value) || b.id - a.id
    );

    const groups = {};
    list.forEach((e) => {
      (groups[e.category.value] ||= []).push(e.amount);
    });
    const byCategory = Object.fromEntries(
      Object.entries(groups).map(([c, v]) => [c, Money.sum(v)])
    );

    return new MonthlyExpensesOutputDto({
      month: ym.value,
      expenses: list.map((e) => e.toPrimitives()),
      total: Money.sum(list.map((e) => e.amount)),
      byCategory,
      budget: await this.budgetStatus.forMonth(ym, userId),
    });
  }
}

module.exports = { ListMonthlyExpensesUseCase, ListMonthlyExpenses: ListMonthlyExpensesUseCase };
