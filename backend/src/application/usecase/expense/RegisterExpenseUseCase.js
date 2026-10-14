const { Expense } = require('../../../domain/entity/expense/Expense');
const { Category } = require('../../../domain/valueobject/expense/Category');
const { DuplicateExpenseError } = require('../../../domain/exception/expense/ExpenseExceptions');
const { RegisterExpenseInputDto, ExpenseMutationOutputDto } = require('../../dto/expense/ExpenseDtos');

class RegisterExpenseUseCase {
  constructor({ expenses, classifier, budgetStatus }) {
    Object.assign(this, { expenses, classifier, budgetStatus });
  }

  async execute(rawInput = {}) {
    const dto = new RegisterExpenseInputDto(rawInput);
    const expense = Expense.create(dto);
    if (await this.expenses.existsDuplicate(expense)) {
      throw new DuplicateExpenseError();
    }

    const aiCategorized = expense.needsCategory;
    if (aiCategorized) {
      try {
        expense.categorize(await this.classifier.classify(expense.description, { model: dto.model }));
      } catch (err) {
        console.warn('Categorização falhou, usando "Outros":', err.message);
        expense.categorize(Category.OUTROS);
      }
    }

    await this.expenses.save(expense);
    return new ExpenseMutationOutputDto({
      expense: expense.toPrimitives(),
      aiCategorized,
      budget: await this.budgetStatus.forMonth(expense.month, expense.userId),
    });
  }
}

module.exports = { RegisterExpenseUseCase, RegisterExpense: RegisterExpenseUseCase };
