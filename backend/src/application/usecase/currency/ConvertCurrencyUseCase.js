const { ExternalServiceError } = require('../shared/ExternalServiceError');

class ConvertCurrencyUseCase {
  constructor({ currencyConverter }) {
    this.currencyConverter = currencyConverter;
  }

  async execute({ amount = 1, fromCurrency, toCurrency = 'BRL' }) {
    if (!fromCurrency) {
      throw new Error('A moeda de origem (fromCurrency) é obrigatória para a conversão');
    }

    try {
      return await this.currencyConverter.convert({
        amount,
        fromCurrency,
        toCurrency,
      });
    } catch (err) {
      throw new ExternalServiceError(err.message || 'Falha ao consultar cotação externa');
    }
  }
}

module.exports = { ConvertCurrencyUseCase };
