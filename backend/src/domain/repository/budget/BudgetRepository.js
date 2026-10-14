const { NotImplementedError } = require('../../exception/shared/DomainError');

class BudgetRepository {
  async findByMonth(_yearMonth, _userId) {
    throw new NotImplementedError('BudgetRepository.findByMonth');
  }

  async save(_budget) {
    throw new NotImplementedError('BudgetRepository.save');
  }
}

module.exports = { BudgetRepository };
