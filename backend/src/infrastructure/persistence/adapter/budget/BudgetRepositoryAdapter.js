const { BudgetRepository } = require('../../../../domain/repository/budget/BudgetRepository');
const { BudgetPersistenceMapper } = require('../../mapper/budget/BudgetPersistenceMapper');

class BudgetRepositoryAdapter extends BudgetRepository {
  constructor(postgresRepo, mapper = BudgetPersistenceMapper) {
    super();
    this.postgresRepo = postgresRepo;
    this.mapper = mapper;
  }

  async findByMonth(yearMonth, userId) {
    const row = await this.postgresRepo.findByMonth(yearMonth.value, userId);
    return this.mapper.toDomain(row);
  }

  async save(domainBudget) {
    const persistenceEntity = this.mapper.toPersistence(domainBudget);
    await this.postgresRepo.upsert(persistenceEntity);
    return domainBudget;
  }
}

module.exports = { BudgetRepositoryAdapter };
