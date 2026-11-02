const { CurrencyConverterPort } = require('../../../domain/repository/external/CurrencyConverterPort');

const ALIASES = {
  DOLAR: 'USD',
  DÓLAR: 'USD',
  DOLARES: 'USD',
  DÓLARES: 'USD',
  'US$': 'USD',
  EURO: 'EUR',
  EUROS: 'EUR',
  '€': 'EUR',
  LIBRA: 'GBP',
  LIBRAS: 'GBP',
  'LIBRA ESTERLINA': 'GBP',
  '£': 'GBP',
  PESO: 'ARS',
  PESOS: 'ARS',
  'PESO ARGENTINO': 'ARS',
  'PESOS ARGENTINOS': 'ARS',
  'PESO CHILENO': 'CLP',
  'PESOS CHILENOS': 'CLP',
  'DOLAR CANADENSE': 'CAD',
  'DÓLAR CANADENSE': 'CAD',
  'DOLAR AUSTRALIANO': 'AUD',
  'DÓLAR AUSTRALIANO': 'AUD',
  IENE: 'JPY',
  IENES: 'JPY',
  YEN: 'JPY',
  '¥': 'JPY',
  'FRANCO SUICO': 'CHF',
  'FRANCO SUÍÇO': 'CHF',
  BITCOIN: 'BTC',
  ETHEREUM: 'ETH',
};

function normalizeCurrencyCode(raw) {
  if (!raw || typeof raw !== 'string') return 'USD';
  const cleaned = raw.trim().toUpperCase();
  if (ALIASES[cleaned]) return ALIASES[cleaned];
  // Remove caracteres especiais caso seja algo como "$USD" ou "EUR$"
  const stripped = cleaned.replace(/[^A-Z]/g, '');
  if (stripped.length === 3) return stripped;
  return ALIASES[stripped] || stripped || 'USD';
}

class AwesomeApiCurrencyConverterAdapter extends CurrencyConverterPort {
  constructor({ baseUrl = 'https://economia.awesomeapi.com.br/last', timeoutMs = 6000, fetchFn = fetch } = {}) {
    super();
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.fetchFn = fetchFn;
  }

  async getExchangeRate(fromCurrency, toCurrency = 'BRL') {
    const from = normalizeCurrencyCode(fromCurrency);
    const to = normalizeCurrencyCode(toCurrency);

    if (from === to) {
      return {
        fromCurrency: from,
        toCurrency: to,
        rate: 1.0,
        quotationName: `${from}/${to}`,
        source: 'AwesomeAPI',
        timestamp: new Date().toISOString(),
      };
    }

    const pair = `${from}-${to}`;
    const url = `${this.baseUrl}/${pair}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);

    try {
      const res = await this.fetchFn(url, { signal: ctrl.signal });
      if (!res.ok) {
        throw new Error(`AwesomeAPI respondeu HTTP ${res.status} para o par ${pair}`);
      }
      const data = await res.json();
      const key = `${from}${to}`;
      const quote = data[key];

      if (!quote || !quote.bid) {
        throw new Error(`Dados de cotação não encontrados na resposta da AwesomeAPI para ${pair}`);
      }

      const rate = parseFloat(quote.bid);
      if (Number.isNaN(rate) || rate <= 0) {
        throw new Error(`Cotação inválida retornada para ${pair}: ${quote.bid}`);
      }

      return {
        fromCurrency: from,
        toCurrency: to,
        rate,
        high: quote.high ? parseFloat(quote.high) : rate,
        low: quote.low ? parseFloat(quote.low) : rate,
        quotationName: quote.name || `${from}/${to}`,
        source: 'AwesomeAPI',
        timestamp: quote.create_date || new Date().toISOString(),
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`Tempo limite esgotado ao consultar cotação da moeda ${from} na AwesomeAPI`);
      }
      throw new Error(`Falha ao obter cotação de ${from} para ${to} via AwesomeAPI: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  async convert({ amount = 1, fromCurrency, toCurrency = 'BRL' }) {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 1;
    if (numAmount < 0) {
      throw new Error('O valor a ser convertido não pode ser negativo');
    }

    const quote = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = Math.round(numAmount * quote.rate * 100) / 100;

    return {
      amount: numAmount,
      fromCurrency: quote.fromCurrency,
      toCurrency: quote.toCurrency,
      rate: quote.rate,
      convertedAmount,
      quotationName: quote.quotationName,
      source: quote.source,
      timestamp: quote.timestamp,
    };
  }
}

module.exports = {
  AwesomeApiCurrencyConverterAdapter,
  normalizeCurrencyCode,
};
