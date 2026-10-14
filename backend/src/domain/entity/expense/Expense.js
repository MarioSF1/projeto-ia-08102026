const { ValidationError, collect } = require('../../exception/shared/DomainError');
const { Money } = require('../../valueobject/shared/Money');
const { YearMonth } = require('../../valueobject/shared/YearMonth');
const { ExpenseDate } = require('../../valueobject/expense/ExpenseDate');
const { Category } = require('../../valueobject/expense/Category');

function parseDescription(raw) {
  const d = typeof raw === 'string' ? raw.trim() : '';
  if (d.length < 3 || d.length > 100) {
    throw new ValidationError('description deve ter entre 3 e 100 caracteres');
  }
  return d;
}

function parseNotes(raw) {
  if (raw === undefined || raw === null) return '';
  if (typeof raw !== 'string') throw new ValidationError('notes deve ser texto');
  const n = raw.trim();
  if (n.length > 300) throw new ValidationError('notes deve ter no máximo 300 caracteres');
  return n;
}

class Expense {
  constructor({ id = null, userId = null, description, amount, date, category = null, notes = '', createdAt }) {
    Object.assign(this, { id, userId, description, amount, date, category, notes, createdAt });
  }

  static create({ userId = null, description, amount, date, category, notes } = {}) {
    const v = collect({
      description: () => parseDescription(description),
      amount: () => Money.of(amount),
      date: () => ExpenseDate.of(date),
      category: () => (category ? Category.of(category) : null),
      notes: () => parseNotes(notes),
    });
    return new Expense({ userId, ...v, createdAt: new Date().toISOString() });
  }

  update({ description, amount, date, category, notes } = {}) {
    const v = collect({
      description: () => (description !== undefined ? parseDescription(description) : this.description),
      amount: () => (amount !== undefined ? Money.of(amount) : this.amount),
      date: () => (date !== undefined ? ExpenseDate.of(date) : this.date),
      category: () => (category !== undefined ? (category ? Category.of(category) : null) : this.category),
      notes: () => (notes !== undefined ? parseNotes(notes) : this.notes),
    });
    Object.assign(this, v);
    return this;
  }

  get month() {
    return YearMonth.of(this.date.value.slice(0, 7));
  }

  get needsCategory() {
    return this.category === null;
  }

  categorize(category) {
    this.category = category instanceof Category ? category : Category.of(category);
  }

  assignId(id) {
    this.id = id;
  }

  isDuplicateOf(other) {
    return (
      (this.id === null || this.id !== other.id) &&
      this.userId === other.userId &&
      this.description.toLowerCase() === other.description.toLowerCase() &&
      this.amount.value === other.amount.value &&
      this.date.value === other.date.value
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      description: this.description,
      amount: this.amount.value,
      date: this.date.value,
      category: this.category ? this.category.value : null,
      notes: this.notes || '',
      createdAt: this.createdAt,
    };
  }

  static fromPrimitives(p) {
    return new Expense({
      id: p.id,
      userId: p.userId ?? null,
      description: p.description,
      amount: Money.of(p.amount),
      date: ExpenseDate.of(p.date),
      category: p.category ? Category.of(p.category) : null,
      notes: p.notes || '',
      createdAt: p.createdAt,
    });
  }
}

module.exports = { Expense };
