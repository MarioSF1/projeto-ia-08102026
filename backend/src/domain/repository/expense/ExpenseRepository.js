const { NotImplementedError } = require('../../exception/shared/DomainError');

class ExpenseRepository {
  async save(_expense) {
    throw new NotImplementedError('ExpenseRepository.save');
  }

  async update(_expense) {
    throw new NotImplementedError('ExpenseRepository.update');
  }

  async findById(_id, _userId) {
    throw new NotImplementedError('ExpenseRepository.findById');
  }

  async findByMonth(_yearMonth, _userId) {
    throw new NotImplementedError('ExpenseRepository.findByMonth');
  }

  async existsDuplicate(_expense) {
    throw new NotImplementedError('ExpenseRepository.existsDuplicate');
  }

  async remove(_id, _userId) {
    throw new NotImplementedError('ExpenseRepository.remove');
  }
}

module.exports = { ExpenseRepository };
