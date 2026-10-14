const { ChatMessage } = require('../../../../domain/entity/chat/ChatMessage');
const { ChatMessagePersistenceEntity } = require('../../entity/chat/ChatMessagePersistenceEntity');

class ChatMessagePersistenceMapper {
  static toPersistence(domainMessage) {
    if (!domainMessage) return null;
    const p = typeof domainMessage.toPrimitives === 'function' ? domainMessage.toPrimitives() : domainMessage;
    return new ChatMessagePersistenceEntity({
      id: p.id ?? null,
      user_id: p.userId ?? null,
      role: p.role,
      content: p.content,
      actions: Array.isArray(p.actions) ? p.actions : [],
      created_at: p.createdAt || new Date().toISOString(),
    });
  }

  static toDomain(persistenceEntity) {
    if (!persistenceEntity) return null;
    return ChatMessage.fromPrimitives({
      id: persistenceEntity.id,
      userId: persistenceEntity.user_id,
      role: persistenceEntity.role,
      content: persistenceEntity.content,
      actions: Array.isArray(persistenceEntity.actions) ? persistenceEntity.actions : [],
      createdAt: persistenceEntity.created_at,
    });
  }
}

module.exports = { ChatMessagePersistenceMapper };
