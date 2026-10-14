const { Category } = require('../../../domain/valueobject/expense/Category');
const { ExpenseRequestDto } = require('../../dto/expense/ExpenseRequestDto');

class ExpenseController {
  constructor({ registerExpense, updateExpense, listMonthlyExpenses, removeExpense }) {
    Object.assign(this, { registerExpense, updateExpense, listMonthlyExpenses, removeExpense });
  }

  categories(_req, res) {
    res.json(Category.all());
  }

  async list(req, res) {
    const input = ExpenseRequestDto.toListInput(req);
    res.json(await this.listMonthlyExpenses.execute(input));
  }

  async create(req, res) {
    const input = ExpenseRequestDto.toCreateInput(req);
    res.status(201).json(await this.registerExpense.execute(input));
  }

  async update(req, res) {
    const input = ExpenseRequestDto.toUpdateInput(req);
    res.json(await this.updateExpense.execute(input));
  }

  async remove(req, res) {
    const input = ExpenseRequestDto.toRemoveInput(req);
    await this.removeExpense.execute(input);
    res.status(204).end();
  }
}

module.exports = { ExpenseController };
