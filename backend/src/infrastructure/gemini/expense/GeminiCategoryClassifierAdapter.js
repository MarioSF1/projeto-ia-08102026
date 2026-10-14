const { CategoryClassifierPort } = require('../../../domain/repository/ai/CategoryClassifierPort');
const { Category } = require('../../../domain/valueobject/expense/Category');

class GeminiCategoryClassifierAdapter extends CategoryClassifierPort {
  constructor(client) {
    super();
    this.client = client;
  }

  async classify(description, { model } = {}) {
    const all = Category.all();
    const out = await this.client.generateJson(
      `Classifique o gasto "${description}" em exatamente uma categoria da lista: ${all.join(', ')}.`,
      { type: 'OBJECT', properties: { category: { type: 'STRING', enum: all } }, required: ['category'] },
      { model }
    );
    return all.includes(out.category) ? Category.of(out.category) : Category.OUTROS;
  }
}

module.exports = { GeminiCategoryClassifierAdapter, GeminiCategoryClassifier: GeminiCategoryClassifierAdapter };
