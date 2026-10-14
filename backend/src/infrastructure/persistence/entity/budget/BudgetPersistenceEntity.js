class BudgetPersistenceEntity {
  constructor({ user_id = null, month, limit_amount }) {
    this.user_id = user_id != null ? Number(user_id) : null;
    this.month = month;
    this.limit_amount = Number(limit_amount);
    Object.freeze(this);
  }
}

module.exports = { BudgetPersistenceEntity };
