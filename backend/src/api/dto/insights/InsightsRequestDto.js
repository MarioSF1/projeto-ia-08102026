class InsightsRequestDto {
  static toGenerateInput(req) {
    return {
      month: req.query?.month,
      userId: req.user?.id ?? null,
      model: req.query?.model || req.headers?.['x-gemini-model'] || undefined,
    };
  }
}

module.exports = { InsightsRequestDto };
