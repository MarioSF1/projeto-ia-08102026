const { ValidationError } = require('../../exception/shared/DomainError');

class Email {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }

  static of(raw) {
    const e = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) {
      throw new ValidationError('email inválido');
    }
    return new Email(e);
  }

  toString() {
    return this.value;
  }
}

module.exports = { Email };
