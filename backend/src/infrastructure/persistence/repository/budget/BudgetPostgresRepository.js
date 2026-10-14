const { BudgetPersistenceEntity } = require('../../entity/budget/BudgetPersistenceEntity');

class BudgetPostgresRepository {
  constructor(pg) {
    this.pg = pg;
  }

  async findByMonth(yearMonthStr, userId) {
    const res = await this.pg.query(
      `SELECT user_id, month, limit_amount FROM budgets WHERE user_id = $1 AND month = $2 LIMIT 1`,
      [Number(userId), yearMonthStr]
    );
    return res.rows[0] ? new BudgetPersistenceEntity(res.rows[0]) : null;
  }

  async upsert(persistenceEntity) {
    await this.pg.query(
      `INSERT INTO budgets (user_id, month, limit_amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month) DO UPDATE SET limit_amount = EXCLUDED.limit_amount`,
      [persistenceEntity.user_id, persistenceEntity.month, persistenceEntity.limit_amount]
    );
    return persistenceEntity;
  }
}

module.exports = { BudgetPostgresRepository };
