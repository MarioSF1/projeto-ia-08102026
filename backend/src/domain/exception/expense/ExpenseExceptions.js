const { DomainError } = require('../shared/DomainError');

class DuplicateExpenseError extends DomainError {
  constructor() {
    super('gasto duplicado (mesma descrição, valor e data)');
  }
}

class ExpenseNotFoundError extends DomainError {
  constructor() {
    super('gasto não encontrado');
  }
}

module.exports = {
  DuplicateExpenseError,
  ExpenseNotFoundError,
};
