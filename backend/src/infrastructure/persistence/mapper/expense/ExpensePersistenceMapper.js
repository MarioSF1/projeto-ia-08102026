const { Expense } = require('../../../../domain/entity/expense/Expense');
const { ExpensePersistenceEntity } = require('../../entity/expense/ExpensePersistenceEntity');

class ExpensePersistenceMapper {
  static toPersistence(domainExpense) {
    if (!domainExpense) return null;
    const p = domainExpense.toPrimitives();
    return new ExpensePersistenceEntity({
      id: p.id,
      user_id: p.userId,
      description: p.description,
      amount: p.amount,
      date: p.date,
      category: p.category,
      notes: p.notes || '',
      created_at: p.createdAt,
    });
  }

  static toDomain(persistenceEntity) {
    if (!persistenceEntity) return null;
    return Expense.fromPrimitives({
      id: persistenceEntity.id,
      userId: persistenceEntity.user_id,
      description: persistenceEntity.description,
      amount: Number(persistenceEntity.amount),
      date: persistenceEntity.date,
      category: persistenceEntity.category,
      notes: persistenceEntity.notes || '',
      createdAt: persistenceEntity.created_at,
    });
  }
}

module.exports = { ExpensePersistenceMapper };
