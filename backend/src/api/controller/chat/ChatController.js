const { ChatRequestDto } = require('../../dto/chat/ChatRequestDto');
const { GeminiModelEnum } = require('../../../domain/enums/ai/GeminiModelEnum');

class ChatController {
  constructor({ chatWithAgent }) {
    this.chatWithAgent = chatWithAgent;
  }

  listModels(req, res) {
    if (this.chatWithAgent && typeof this.chatWithAgent.listAvailableModels === 'function') {
      return res.json(this.chatWithAgent.listAvailableModels());
    }
    return res.json({
      defaultModel: GeminiModelEnum.DEFAULT,
      models: GeminiModelEnum.listMetadata(),
    });
  }

  async listMessages(req, res) {
    const input = ChatRequestDto.toUserIdInput(req);
    res.json({ messages: await this.chatWithAgent.listHistory(input) });
  }

  async sendMessage(req, res) {
    const input = ChatRequestDto.toSendMessageInput(req);
    res.json(await this.chatWithAgent.execute(input));
  }

  async clearMessages(req, res) {
    const input = ChatRequestDto.toUserIdInput(req);
    await this.chatWithAgent.clearHistory(input);
    res.status(204).end();
  }
}

module.exports = { ChatController };
