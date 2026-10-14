const { ValidationError } = require('../../exception/shared/DomainError');
const { ChatRoleEnum } = require('../../enums/chat/ChatRoleEnum');

class ChatMessage {
  constructor({ id = null, userId = null, role, content, actions = [], createdAt }) {
    Object.assign(this, { id, userId, role, content, actions: actions || [], createdAt });
  }

  static create({ userId = null, role, content, actions = [] } = {}) {
    if (!ChatRoleEnum.isValid(role)) {
      throw new ValidationError('role deve ser user ou model');
    }
    const text = typeof content === 'string' ? content.trim() : '';
    if (!text) {
      throw new ValidationError('message não pode ser vazia');
    }
    if (text.length > 2000) {
      throw new ValidationError('message deve ter no máximo 2000 caracteres');
    }
    return new ChatMessage({
      userId,
      role,
      content: text,
      actions: Array.isArray(actions) ? actions : [],
      createdAt: new Date().toISOString(),
    });
  }

  assignId(id) {
    this.id = id;
  }

  toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      role: this.role,
      content: this.content,
      actions: this.actions,
      createdAt: this.createdAt,
    };
  }

  static fromPrimitives(p) {
    return new ChatMessage({
      id: p.id,
      userId: p.userId ?? null,
      role: p.role,
      content: p.content,
      actions: Array.isArray(p.actions) ? p.actions : [],
      createdAt: p.createdAt,
    });
  }
}

module.exports = { ChatMessage };
