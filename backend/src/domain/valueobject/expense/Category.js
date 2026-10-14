const { ValidationError } = require('../../exception/shared/DomainError');
const { CategoryEnum } = require('../../enums/expense/CategoryEnum');

class Category {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }

  static of(raw) {
    if (!CategoryEnum.isValid(raw)) {
      throw new ValidationError(`category deve ser uma de: ${CategoryEnum.values().join(', ')}`);
    }
    return new Category(raw);
  }

  static all() {
    return CategoryEnum.values();
  }

  toString() {
    return this.value;
  }
}

Category.OUTROS = new Category(CategoryEnum.OUTROS);

module.exports = { Category };
