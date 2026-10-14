const { ValidationError } = require('../../exception/shared/DomainError');

const DEFAULT_MAX = 100000;

class Money {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }

  static of(raw, { max = DEFAULT_MAX, field = 'amount' } = {}) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0 || n > max) {
      throw new ValidationError(`${field} deve ser um número positivo (máx. ${max})`);
    }
    return new Money(Math.round(n * 100) / 100);
  }

  static sum(list) {
    return Math.round(list.reduce((s, m) => s + m.value, 0) * 100) / 100;
  }
}

module.exports = { Money };
