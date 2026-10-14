class SendChatMessageInputDto {
  constructor({ user, message, model } = {}) {
    this.user = user;
    this.message = message;
    this.model = model;
    Object.freeze(this);
  }
}

class ChatOutputDto {
  constructor({ reply, actions, message, modelUsed, requestedModel, fallbackUsed }) {
    this.reply = reply;
    this.actions = actions || [];
    this.message = message;
    this.modelUsed = modelUsed || null;
    this.requestedModel = requestedModel || null;
    this.fallbackUsed = Boolean(fallbackUsed);
    Object.freeze(this);
  }
}

module.exports = {
  SendChatMessageInputDto,
  ChatOutputDto,
};
