const { NotImplementedError } = require('../../exception/shared/DomainError');

class CurrencyConverterPort {
  /**
   * Consulta a cotação de uma moeda estrangeira em relação a outra (padrão BRL).
   * @param {string} _fromCurrency
   * @param {string} [_toCurrency]
   * @returns {Promise<{ fromCurrency: string, toCurrency: string, rate: number, quotationName: string, source: string, timestamp: string }>}
   */
  async getExchangeRate(_fromCurrency, _toCurrency = 'BRL') {
    throw new NotImplementedError('CurrencyConverterPort.getExchangeRate');
  }

  /**
   * Converte um determinado valor monetário de uma moeda para outra.
   * @param {{ amount?: number, fromCurrency: string, toCurrency?: string }} _params
   * @returns {Promise<{ amount: number, fromCurrency: string, toCurrency: string, rate: number, convertedAmount: number, quotationName: string, source: string, timestamp: string }>}
   */
  async convert(_params) {
    throw new NotImplementedError('CurrencyConverterPort.convert');
  }
}

module.exports = {
  CurrencyConverterPort,
};
