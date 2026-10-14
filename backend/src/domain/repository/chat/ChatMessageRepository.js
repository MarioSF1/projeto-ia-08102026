const { NotImplementedError } = require('../../exception/shared/DomainError');

class ChatMessageRepository {
  async saveMessage(_msg) {
    throw new NotImplementedError('ChatMessageRepository.saveMessage');
  }

  async listByUser(_userId, _limit) {
    throw new NotImplementedError('ChatMessageRepository.listByUser');
  }

  async clearByUser(_userId) {
    throw new NotImplementedError('ChatMessageRepository.clearByUser');
  }
}

module.exports = { ChatMessageRepository };
