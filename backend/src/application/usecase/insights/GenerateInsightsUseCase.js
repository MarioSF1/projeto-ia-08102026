const { YearMonth } = require('../../../domain/valueobject/shared/YearMonth');
const { InsightsPolicy } = require('../../../domain/entity/insights/InsightsPolicy');
const { ExternalServiceError } = require('../shared/ExternalServiceError');
const { GenerateInsightsInputDto, InsightsOutputDto } = require('../../dto/insights/InsightsDtos');

class GenerateInsightsUseCase {
  constructor({ expenses, budgets, generator }) {
    Object.assign(this, { expenses, budgets, generator });
  }

  async execute(rawInput = {}) {
    const dto = new GenerateInsightsInputDto(rawInput);
    const ym = dto.month ? YearMonth.of(dto.month) : YearMonth.current();
    const list = await this.expenses.findByMonth(ym, dto.userId);
    InsightsPolicy.assertEligible(list);
    const budget = await this.budgets.findByMonth(ym, dto.userId);

    try {
      const result = await this.generator.generate({
        month: ym.value,
        expenses: list.map((e) => e.toPrimitives()),
        budgetLimit: budget ? budget.limit.value : null,
        model: dto.model,
      });
      return new InsightsOutputDto({ month: ym.value, ...result });
    } catch (err) {
      console.error(err.message);
      throw new ExternalServiceError('não foi possível gerar insights agora, tente novamente');
    }
  }
}

module.exports = { GenerateInsightsUseCase, GenerateInsights: GenerateInsightsUseCase };
