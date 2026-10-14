class ExpenseRequestDto {
  static toListInput(req) {
    return {
      month: req.query?.month,
      userId: req.user?.id ?? null,
    };
  }

  static toCreateInput(req) {
    const body = req.body || {};
    return {
      userId: req.user?.id ?? null,
      description: body.description,
      amount: body.amount,
      date: body.date,
      category: body.category,
      notes: body.notes,
      model: body.model || req.headers?.['x-gemini-model'] || undefined,
    };
  }

  static toUpdateInput(req) {
    const body = req.body || {};
    return {
      id: Number(req.params.id),
      userId: req.user?.id ?? null,
      description: body.description,
      amount: body.amount,
      date: body.date,
      category: body.category,
      notes: body.notes,
      model: body.model || req.headers?.['x-gemini-model'] || undefined,
    };
  }

  static toRemoveInput(req) {
    return {
      id: Number(req.params.id),
      userId: req.user?.id ?? null,
    };
  }
}

module.exports = { ExpenseRequestDto };
