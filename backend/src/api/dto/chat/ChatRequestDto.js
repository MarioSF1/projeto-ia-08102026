class ChatRequestDto {
  static toSendMessageInput(req) {
    return {
      user: req.user,
      message: req.body?.message,
      model: req.body?.model || req.headers?.['x-gemini-model'] || undefined,
    };
  }

  static toUserIdInput(req) {
    return {
      userId: req.user?.id ?? null,
    };
  }
}

module.exports = { ChatRequestDto };
