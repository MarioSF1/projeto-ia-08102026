const { Budget } = require('../../../../domain/entity/budget/Budget');
const { BudgetPersistenceEntity } = require('../../entity/budget/BudgetPersistenceEntity');

class BudgetPersistenceMapper {
  static toPersistence(domainBudget) {
    if (!domainBudget) return null;
    return new BudgetPersistenceEntity({
      user_id: domainBudget.userId,
      month: domainBudget.month.value,
      limit_amount: domainBudget.limit.value,
    });
  }

  static toDomain(persistenceEntity) {
    if (!persistenceEntity) return null;
    return Budget.define(
      persistenceEntity.month,
      Number(persistenceEntity.limit_amount),
      persistenceEntity.user_id
    );
  }
}

module.exports = { BudgetPersistenceMapper };
