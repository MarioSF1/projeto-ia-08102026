class ChatMessagePersistenceEntity {
  constructor({ id = null, user_id = null, role, content, actions = [], created_at }) {
    this.id = id != null ? Number(id) : null;
    this.user_id = user_id != null ? Number(user_id) : null;
    this.role = role;
    this.content = content;
    this.actions = Array.isArray(actions) ? actions : [];
    this.created_at = created_at instanceof Date ? created_at.toISOString() : String(created_at);
    Object.freeze(this);
  }
}

module.exports = { ChatMessagePersistenceEntity };
