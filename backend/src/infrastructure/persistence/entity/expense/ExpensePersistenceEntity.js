class ExpensePersistenceEntity {
  constructor({ id = null, user_id = null, description, amount, date, category, notes = '', created_at }) {
    this.id = id != null ? Number(id) : null;
    this.user_id = user_id != null ? Number(user_id) : null;
    this.description = description;
    this.amount = Number(amount);
    this.date = date;
    this.category = category;
    this.notes = notes || '';
    this.created_at = created_at instanceof Date ? created_at.toISOString() : String(created_at);
    Object.freeze(this);
  }
}

module.exports = { ExpensePersistenceEntity };
