const { collect } = require('../../exception/shared/DomainError');
const { Money } = require('../../valueobject/shared/Money');
const { YearMonth } = require('../../valueobject/shared/YearMonth');
const { BudgetStatusEnum } = require('../../enums/budget/BudgetStatusEnum');

const ALERT_PERCENT = 80;
const MAX_LIMIT = 1000000;

class Budget {
  constructor({ userId = null, month, limit }) {
    this.userId = userId;
    this.month = month;
    this.limit = limit;
  }

  static define(rawMonth, rawLimit, userId = null) {
    const v = collect({
      month: () => YearMonth.of(rawMonth),
      limit: () => Money.of(rawLimit, { max: MAX_LIMIT, field: 'limit' }),
    });
    return new Budget({ userId, ...v });
  }

  evaluate(spent) {
    const limit = this.limit.value;
    const percent = Math.round((spent / limit) * 100);
    const status =
      spent > limit
        ? BudgetStatusEnum.EXCEDIDO
        : percent >= ALERT_PERCENT
        ? BudgetStatusEnum.ALERTA
        : BudgetStatusEnum.OK;
    return { limit, spent, percent, status };
  }

  static none(spent) {
    return { limit: null, spent, percent: null, status: BudgetStatusEnum.SEM_ORCAMENTO };
  }
}

module.exports = { Budget };
