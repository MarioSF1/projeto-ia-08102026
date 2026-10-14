const { ValidationError } = require('../../exception/shared/DomainError');

class YearMonth {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }

  static of(raw) {
    if (typeof raw !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(raw)) {
      throw new ValidationError('month deve ser AAAA-MM');
    }
    return new YearMonth(raw);
  }

  static current() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return new YearMonth(`${y}-${m}`);
  }

  toString() {
    return this.value;
  }
}

module.exports = { YearMonth };
