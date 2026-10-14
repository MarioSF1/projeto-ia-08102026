class BudgetRequestDto {
  static toSetBudgetInput(req) {
    const body = req.body || {};
    return {
      month: body.month,
      limit: body.limit,
      userId: req.user?.id ?? null,
    };
  }
}

module.exports = { BudgetRequestDto };
