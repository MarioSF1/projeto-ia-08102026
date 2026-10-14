const { ExpensePersistenceEntity } = require('../../entity/expense/ExpensePersistenceEntity');

class ExpensePostgresRepository {
  constructor(pg) {
    this.pg = pg;
  }

  async insert(persistenceEntity) {
    const res = await this.pg.query(
      `INSERT INTO expenses (user_id, description, amount, date, category, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, description, amount, date, category, notes, created_at`,
      [
        persistenceEntity.user_id,
        persistenceEntity.description,
        persistenceEntity.amount,
        persistenceEntity.date,
        persistenceEntity.category,
        persistenceEntity.notes || '',
        persistenceEntity.created_at,
      ]
    );
    return new ExpensePersistenceEntity(res.rows[0]);
  }

  async update(persistenceEntity) {
    await this.pg.query(
      `UPDATE expenses
       SET description = $1, amount = $2, date = $3, category = $4, notes = $5
       WHERE id = $6 AND user_id = $7`,
      [
        persistenceEntity.description,
        persistenceEntity.amount,
        persistenceEntity.date,
        persistenceEntity.category,
        persistenceEntity.notes || '',
        persistenceEntity.id,
        persistenceEntity.user_id,
      ]
    );
    return persistenceEntity;
  }

  async findById(id, userId) {
    const res = await this.pg.query(
      `SELECT id, user_id, description, amount, date, category, notes, created_at
       FROM expenses
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [Number(id), Number(userId)]
    );
    return res.rows[0] ? new ExpensePersistenceEntity(res.rows[0]) : null;
  }

  async findByMonth(yearMonthStr, userId) {
    const res = await this.pg.query(
      `SELECT id, user_id, description, amount, date, category, notes, created_at
       FROM expenses
       WHERE user_id = $1 AND date LIKE $2
       ORDER BY date DESC, id DESC`,
      [Number(userId), `${yearMonthStr}%`]
    );
    return res.rows.map((r) => new ExpensePersistenceEntity(r));
  }

  async existsDuplicate(persistenceEntity) {
    const params = [
      persistenceEntity.user_id,
      persistenceEntity.description.toLowerCase(),
      persistenceEntity.amount,
      persistenceEntity.date,
    ];
    let sql = `
      SELECT 1 FROM expenses
      WHERE user_id = $1
        AND LOWER(description) = $2
        AND amount = $3
        AND date = $4
    `;
    if (persistenceEntity.id != null) {
      params.push(persistenceEntity.id);
      sql += ` AND id <> $5`;
    }
    sql += ` LIMIT 1`;
    const res = await this.pg.query(sql, params);
    return res.rowCount > 0;
  }

  async deleteById(id, userId) {
    const res = await this.pg.query(
      `DELETE FROM expenses WHERE id = $1 AND user_id = $2`,
      [Number(id), Number(userId)]
    );
    return res.rowCount > 0;
  }
}

module.exports = { ExpensePostgresRepository };
