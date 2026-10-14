class GenerateInsightsInputDto {
  constructor({ month, userId = null, model } = {}) {
    this.month = month;
    this.userId = userId;
    this.model = model;
    Object.freeze(this);
  }
}

class InsightsOutputDto {
  constructor({ month, summary, attentionPoint, tips }) {
    this.month = month;
    this.summary = summary;
    this.attentionPoint = attentionPoint;
    this.tips = Array.isArray(tips) ? tips : [];
    Object.freeze(this);
  }
}

module.exports = {
  GenerateInsightsInputDto,
  InsightsOutputDto,
};
