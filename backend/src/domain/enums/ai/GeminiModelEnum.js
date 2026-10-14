const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

const GEMINI_MODELS_METADATA = Object.freeze([
  Object.freeze({
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash (Padrão)',
    description: 'Modelo padrão mais recente, rápido e inteligente para uso geral e ferramentas.',
  }),
  Object.freeze({
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    description: 'Alta performance e equilíbrio para conversação e categorização financeira.',
  }),
  Object.freeze({
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite',
    description: 'Versão leve e econômica de baixa latência, ideal para alta disponibilidade.',
  }),
  Object.freeze({
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    description: 'Versão ultra leve de contingência para garantir disponibilidade contínua.',
  }),
]);

// Ordem de prioridade para fallback automático caso o modelo escolhido falhe
const FALLBACK_PRIORITY_ORDER = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
]);

const ALLOWED_MODEL_IDS = Object.freeze(GEMINI_MODELS_METADATA.map((m) => m.id));

const GeminiModelEnum = Object.freeze({
  GEMINI_3_8_FLASH: 'gemini-3.8-flash',
  GEMINI_3_6_FLASH: 'gemini-3.6-flash',
  GEMINI_3_5_FLASH_LITE: 'gemini-3.5-flash-lite',
  GEMINI_3_1_FLASH_LITE: 'gemini-3.1-flash-lite',
  DEFAULT: DEFAULT_GEMINI_MODEL,

  values() {
    return ALLOWED_MODEL_IDS;
  },

  listMetadata() {
    return GEMINI_MODELS_METADATA;
  },

  isValid(model) {
    return typeof model === 'string' && ALLOWED_MODEL_IDS.includes(model.trim());
  },

  normalize(model) {
    if (typeof model === 'string' && model.trim().length > 0) {
      return model.trim();
    }
    return DEFAULT_GEMINI_MODEL;
  },

  buildFallbackChain(preferredModel) {
    const primary = this.normalize(preferredModel);
    const chain = [primary];
    for (const candidate of FALLBACK_PRIORITY_ORDER) {
      if (!chain.includes(candidate)) {
        chain.push(candidate);
      }
    }
    return chain;
  },
});

module.exports = { GeminiModelEnum };
