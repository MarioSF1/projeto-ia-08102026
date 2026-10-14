const { Budget } = require('../../../domain/entity/budget/Budget');
const { SetBudgetInputDto } = require('../../dto/budget/BudgetDtos');

class SetBudgetUseCase {
  constructor({ budgets, budgetStatus }) {
    Object.assign(this, { budgets, budgetStatus });
  }

  async execute(rawInput = {}) {
    const dto = new SetBudgetInputDto(rawInput);
    const budget = Budget.define(dto.month, dto.limit, dto.userId);
    await this.budgets.save(budget);
    return this.budgetStatus.forMonth(budget.month, dto.userId);
  }
}

module.exports = { SetBudgetUseCase, SetBudget: SetBudgetUseCase };
