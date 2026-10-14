class SetBudgetInputDto {
  constructor({ month, limit, userId = null } = {}) {
    this.month = month;
    this.limit = limit;
    this.userId = userId;
    Object.freeze(this);
  }
}

class BudgetStatusOutputDto {
  constructor({ limit, spent, percent, status }) {
    this.limit = limit;
    this.spent = spent;
    this.percent = percent;
    this.status = status;
    Object.freeze(this);
  }
}

module.exports = {
  SetBudgetInputDto,
  BudgetStatusOutputDto,
};
