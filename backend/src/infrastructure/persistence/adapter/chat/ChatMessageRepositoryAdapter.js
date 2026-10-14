const { ChatMessageRepository } = require('../../../../domain/repository/chat/ChatMessageRepository');
const { ChatMessagePersistenceMapper } = require('../../mapper/chat/ChatMessagePersistenceMapper');

class ChatMessageRepositoryAdapter extends ChatMessageRepository {
  constructor(postgresRepo, mapper = ChatMessagePersistenceMapper) {
    super();
    this.postgresRepo = postgresRepo;
    this.mapper = mapper;
  }

  async saveMessage(domainMessage) {
    const persistenceEntity = this.mapper.toPersistence(domainMessage);
    const saved = await this.postgresRepo.insert(persistenceEntity);
    return this.mapper.toDomain(saved);
  }

  async listByUser(userId, limit = 50) {
    const rows = await this.postgresRepo.findByUser(userId, limit);
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async clearByUser(userId) {
    await this.postgresRepo.deleteByUser(userId);
  }
}

module.exports = { ChatMessageRepositoryAdapter };
