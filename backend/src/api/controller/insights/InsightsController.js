const { InsightsRequestDto } = require('../../dto/insights/InsightsRequestDto');

class InsightsController {
  constructor({ generateInsights }) {
    this.generateInsights = generateInsights;
  }

  async generate(req, res) {
    const input = InsightsRequestDto.toGenerateInput(req);
    res.json(await this.generateInsights.execute(input));
  }
}

module.exports = { InsightsController };
