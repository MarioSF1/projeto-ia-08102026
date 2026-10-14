const { ChatMessage } = require('../../../domain/entity/chat/ChatMessage');
const { ChatRoleEnum } = require('../../../domain/enums/chat/ChatRoleEnum');
const { GeminiModelEnum } = require('../../../domain/enums/ai/GeminiModelEnum');
const { ExternalServiceError } = require('../shared/ExternalServiceError');
const { SendChatMessageInputDto, ChatOutputDto } = require('../../dto/chat/ChatDtos');

class ChatWithAgentUseCase {
  constructor({
    chatMessages,
    agent,
    registerExpense,
    updateExpense,
    removeExpense,
    listMonthlyExpenses,
    setBudget,
    generateInsights,
  }) {
    Object.assign(this, {
      chatMessages,
      agent,
      registerExpense,
      updateExpense,
      removeExpense,
      listMonthlyExpenses,
      setBudget,
      generateInsights,
    });
  }

  listAvailableModels() {
    return {
      defaultModel: GeminiModelEnum.DEFAULT,
      models: GeminiModelEnum.listMetadata(),
    };
  }

  async listHistory({ userId }) {
    const list = await this.chatMessages.listByUser(userId, 50);
    return list.map((m) => (typeof m.toPrimitives === 'function' ? m.toPrimitives() : m));
  }

  async clearHistory({ userId }) {
    await this.chatMessages.clearByUser(userId);
  }

  async execute(rawInput = {}) {
    const dto = new SendChatMessageInputDto(rawInput);
    const userId = dto.user?.id ?? null;
    const preferredModel = GeminiModelEnum.normalize(dto.model);

    const userChatMessage = ChatMessage.create({
      userId,
      role: ChatRoleEnum.USER,
      content: dto.message,
      actions: [],
    });

    const historyEntities = await this.chatMessages.listByUser(userId, 20);
    const history = historyEntities.map((m) => (typeof m.toPrimitives === 'function' ? m.toPrimitives() : m));

    await this.chatMessages.saveMessage(userChatMessage);

    const actions = [];
    const safeTool = (fn) => async (args = {}) => {
      try {
        const res = await fn(args);
        return { ok: true, ...res };
      } catch (err) {
        return { ok: false, error: err.message || 'Erro ao executar operação' };
      }
    };

    const tools = {
      register_expense: safeTool(async (args) => {
        const result = await this.registerExpense.execute({
          userId,
          description: args.description,
          amount: args.amount,
          date: args.date,
          category: args.category,
          notes: args.notes,
          model: preferredModel,
        });
        actions.push({ type: 'expense_registered', expense: result.expense, budget: result.budget });
        return result;
      }),
      update_expense: safeTool(async (args) => {
        const result = await this.updateExpense.execute({
          userId,
          id: args.id,
          description: args.description,
          amount: args.amount,
          date: args.date,
          category: args.category,
          notes: args.notes,
          model: preferredModel,
        });
        actions.push({ type: 'expense_updated', expense: result.expense, budget: result.budget });
        return result;
      }),
      remove_expense: safeTool(async (args) => {
        await this.removeExpense.execute({ userId, id: args.id });
        actions.push({ type: 'expense_removed', id: Number(args.id) });
        return { removedId: Number(args.id) };
      }),
      list_monthly_expenses: safeTool(async (args) => {
        return this.listMonthlyExpenses.execute({ userId, month: args.month });
      }),
      set_monthly_budget: safeTool(async (args) => {
        const budget = await this.setBudget.execute({
          userId,
          month: args.month,
          limit: args.limit,
        });
        actions.push({ type: 'budget_updated', month: args.month, budget });
        return { month: args.month, budget };
      }),
      generate_monthly_insights: safeTool(async (args) => {
        const insights = await this.generateInsights.execute({
          userId,
          month: args.month,
          model: preferredModel,
        });
        actions.push({ type: 'insights_generated', insights });
        return insights;
      }),
    };

    let reply;
    let modelUsed = preferredModel;
    let requestedModel = preferredModel;
    let fallbackUsed = false;

    try {
      const out = await this.agent.chat({
        user: dto.user,
        message: userChatMessage.content,
        history,
        tools,
        model: preferredModel,
      });
      reply = out.reply;
      if (out.modelUsed) modelUsed = out.modelUsed;
      if (out.requestedModel) requestedModel = out.requestedModel;
      if (out.fallbackUsed) fallbackUsed = Boolean(out.fallbackUsed);
    } catch (err) {
      console.error('Erro no agente conversacional:', err.message);
      throw new ExternalServiceError('não foi possível conversar com o agente financeiro agora, tente novamente');
    }

    actions.push({
      type: 'model_info',
      modelUsed,
      requestedModel,
      fallbackUsed,
    });

    const modelChatMessage = ChatMessage.create({
      userId,
      role: ChatRoleEnum.MODEL,
      content: reply,
      actions,
    });
    const savedAssistantMsg = await this.chatMessages.saveMessage(modelChatMessage);
    const messagePrimitives =
      typeof savedAssistantMsg.toPrimitives === 'function'
        ? savedAssistantMsg.toPrimitives()
        : savedAssistantMsg;

    return new ChatOutputDto({
      reply,
      actions,
      message: messagePrimitives,
      modelUsed,
      requestedModel,
      fallbackUsed,
    });
  }
}

module.exports = { ChatWithAgentUseCase, ChatWithAgent: ChatWithAgentUseCase };
