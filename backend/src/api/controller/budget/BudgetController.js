const { BudgetRequestDto } = require('../../dto/budget/BudgetRequestDto');

class BudgetController {
  constructor({ setBudget }) {
    this.setBudget = setBudget;
  }

  async updateBudget(req, res) {
    const input = BudgetRequestDto.toSetBudgetInput(req);
    res.json(await this.setBudget.execute(input));
  }
}

module.exports = { BudgetController };
