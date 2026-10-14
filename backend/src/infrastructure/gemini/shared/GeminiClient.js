const { GeminiModelEnum } = require('../../../domain/enums/ai/GeminiModelEnum');

class GeminiClient {
  constructor({ apiKey, defaultModel = GeminiModelEnum.DEFAULT, timeoutMs = 15000 } = {}) {
    this.apiKey = apiKey;
    this.defaultModel = GeminiModelEnum.normalize(defaultModel);
    this.timeoutMs = timeoutMs;
  }

  buildUrl(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  }

  async _postToModel(model, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.buildUrl(model), {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini (${model}) respondeu ${res.status}: ${errText}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async generateJson(prompt, responseSchema, { model } = {}) {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY não configurada');

    const chain = GeminiModelEnum.buildFallbackChain(model || this.defaultModel);
    const primaryModel = chain[0];
    const errors = [];

    for (const candidateModel of chain) {
      try {
        const data = await this._postToModel(candidateModel, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.2,
          },
        });
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error(`Resposta vazia do modelo ${candidateModel}`);
        const parsed = JSON.parse(text);
        if (candidateModel !== primaryModel) {
          console.info(`[GeminiFallback] generateJson atendido pelo fallback "${candidateModel}" (solicitado: "${primaryModel}")`);
        }
        return parsed;
      } catch (err) {
        errors.push(`${candidateModel}: ${err.message}`);
        console.warn(
          `[GeminiFallback] Falha no modelo "${candidateModel}" (${err.message}). Tentando próximo modelo da fila...`
        );
      }
    }

    throw new Error(`Todos os modelos Gemini falharam: ${errors.join(' | ')}`);
  }

  async generateContent({ systemInstruction, contents, tools, temperature = 0.3, model } = {}) {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY não configurada');

    const chain = GeminiModelEnum.buildFallbackChain(model || this.defaultModel);
    const primaryModel = chain[0];
    const errors = [];

    const body = {
      contents,
      generationConfig: { temperature },
    };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    for (const candidateModel of chain) {
      try {
        const data = await this._postToModel(candidateModel, body);
        const content = data?.candidates?.[0]?.content;
        if (!content || !Array.isArray(content.parts)) {
          throw new Error(`Resposta vazia do modelo ${candidateModel}`);
        }
        const fallbackUsed = candidateModel !== primaryModel;
        if (fallbackUsed) {
          console.info(
            `[GeminiFallback] generateContent atendido pelo fallback "${candidateModel}" (solicitado: "${primaryModel}")`
          );
        }
        return {
          ...content,
          modelUsed: candidateModel,
          requestedModel: primaryModel,
          fallbackUsed,
        };
      } catch (err) {
        errors.push(`${candidateModel}: ${err.message}`);
        console.warn(
          `[GeminiFallback] Falha no modelo "${candidateModel}" (${err.message}). Tentando próximo modelo da fila...`
        );
      }
    }

    throw new Error(`Todos os modelos Gemini falharam: ${errors.join(' | ')}`);
  }
}

module.exports = { GeminiClient };
