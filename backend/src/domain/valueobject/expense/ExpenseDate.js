const { ValidationError } = require('../../exception/shared/DomainError');

class ExpenseDate {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }

  static today() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  static of(raw) {
    const v = raw || ExpenseDate.today();
    const d = new Date(v + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(d) || d.toISOString().slice(0, 10) !== v) {
      throw new ValidationError('date deve estar no formato AAAA-MM-DD');
    }
    if (v > ExpenseDate.today()) {
      throw new ValidationError('date não pode ser no futuro');
    }
    return new ExpenseDate(v);
  }
}

module.exports = { ExpenseDate };
