const { Category } = require('../../../domain/valueobject/expense/Category');
const { DuplicateExpenseError, ExpenseNotFoundError } = require('../../../domain/exception/expense/ExpenseExceptions');
const { UpdateExpenseInputDto, ExpenseMutationOutputDto } = require('../../dto/expense/ExpenseDtos');

class UpdateExpenseUseCase {
  constructor({ expenses, classifier, budgetStatus }) {
    Object.assign(this, { expenses, classifier, budgetStatus });
  }

  async execute(rawInput = {}) {
    const dto = new UpdateExpenseInputDto(rawInput);
    const existing = await this.expenses.findById(dto.id, dto.userId);
    if (!existing) throw new ExpenseNotFoundError();

    const prevDescription = existing.description;
    existing.update({
      description: dto.description,
      amount: dto.amount,
      date: dto.date,
      category: dto.category,
      notes: dto.notes,
    });

    if (await this.expenses.existsDuplicate(existing)) {
      throw new DuplicateExpenseError();
    }

    let aiCategorized = false;
    const descriptionChanged = dto.description !== undefined && existing.description !== prevDescription;
    if (existing.needsCategory || (descriptionChanged && dto.category === undefined)) {
      aiCategorized = true;
      try {
        existing.categorize(await this.classifier.classify(existing.description, { model: dto.model }));
      } catch (err) {
        console.warn('Categorização na edição falhou, usando "Outros":', err.message);
        existing.categorize(Category.OUTROS);
      }
    }

    await this.expenses.update(existing);
    return new ExpenseMutationOutputDto({
      expense: existing.toPrimitives(),
      aiCategorized,
      budget: await this.budgetStatus.forMonth(existing.month, existing.userId),
    });
  }
}

module.exports = { UpdateExpenseUseCase, UpdateExpense: UpdateExpenseUseCase };
