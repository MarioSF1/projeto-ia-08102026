const { InsightsNotAvailableError } = require('../../exception/insights/InsightsExceptions');

const MIN_EXPENSES = 3;

class InsightsPolicy {
  static assertEligible(expenses) {
    if (!Array.isArray(expenses) || expenses.length < MIN_EXPENSES) {
      throw new InsightsNotAvailableError(`cadastre pelo menos ${MIN_EXPENSES} gastos no mês para gerar insights`);
    }
  }
}

module.exports = { InsightsPolicy, MIN_EXPENSES };
