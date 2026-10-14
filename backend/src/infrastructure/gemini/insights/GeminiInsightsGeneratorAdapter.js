const { InsightsGeneratorPort } = require('../../../domain/repository/ai/InsightsGeneratorPort');

class GeminiInsightsGeneratorAdapter extends InsightsGeneratorPort {
  constructor(client) {
    super();
    this.client = client;
  }

  async generate({ month, expenses, budgetLimit, model }) {
    const resumo = expenses
      .map((e) => `${e.date} | ${e.category} | R$ ${e.amount} | ${e.description}${e.notes ? ` (Obs: ${e.notes})` : ''}`)
      .join('\n');
    const prompt =
      `Você é um consultor financeiro pessoal. Analise os gastos de ${month}` +
      (budgetLimit ? ` (orçamento mensal: R$ ${budgetLimit})` : '') +
      `.\nGastos:\n${resumo}\n\nResponda em português do Brasil, de forma objetiva: um resumo de 2 frases, ` +
      `o principal ponto de atenção e de 2 a 3 dicas práticas de economia baseadas nesses dados.`;
    return this.client.generateJson(
      prompt,
      {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
          attentionPoint: { type: 'STRING' },
          tips: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['summary', 'attentionPoint', 'tips'],
      },
      { model }
    );
  }
}

module.exports = { GeminiInsightsGeneratorAdapter, GeminiInsightsGenerator: GeminiInsightsGeneratorAdapter };
