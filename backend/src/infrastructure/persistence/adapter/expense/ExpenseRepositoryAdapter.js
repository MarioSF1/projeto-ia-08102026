const { ExpenseRepository } = require('../../../../domain/repository/expense/ExpenseRepository');
const { ExpensePersistenceMapper } = require('../../mapper/expense/ExpensePersistenceMapper');

class ExpenseRepositoryAdapter extends ExpenseRepository {
  constructor(postgresRepo, mapper = ExpensePersistenceMapper) {
    super();
    this.postgresRepo = postgresRepo;
    this.mapper = mapper;
  }

  async save(domainExpense) {
    const persistenceEntity = this.mapper.toPersistence(domainExpense);
    const saved = await this.postgresRepo.insert(persistenceEntity);
    domainExpense.assignId(saved.id);
    return domainExpense;
  }

  async update(domainExpense) {
    const persistenceEntity = this.mapper.toPersistence(domainExpense);
    await this.postgresRepo.update(persistenceEntity);
    return domainExpense;
  }

  async findById(id, userId) {
    const row = await this.postgresRepo.findById(id, userId);
    return this.mapper.toDomain(row);
  }

  async findByMonth(yearMonth, userId) {
    const rows = await this.postgresRepo.findByMonth(yearMonth.value, userId);
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async existsDuplicate(domainExpense) {
    const persistenceEntity = this.mapper.toPersistence(domainExpense);
    return this.postgresRepo.existsDuplicate(persistenceEntity);
  }

  async remove(id, userId) {
    return this.postgresRepo.deleteById(id, userId);
  }
}

module.exports = { ExpenseRepositoryAdapter };
