const { ChatMessagePersistenceEntity } = require('../../entity/chat/ChatMessagePersistenceEntity');

class ChatMessagePostgresRepository {
  constructor(pg) {
    this.pg = pg;
  }

  async insert(persistenceEntity) {
    const res = await this.pg.query(
      `INSERT INTO chat_messages (user_id, role, content, actions)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, user_id, role, content, actions, created_at`,
      [
        persistenceEntity.user_id,
        persistenceEntity.role,
        persistenceEntity.content,
        JSON.stringify(persistenceEntity.actions || []),
      ]
    );
    return new ChatMessagePersistenceEntity(res.rows[0]);
  }

  async findByUser(userId, limit = 50) {
    const res = await this.pg.query(
      `SELECT id, user_id, role, content, actions, created_at
       FROM (
         SELECT id, user_id, role, content, actions, created_at
         FROM chat_messages
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT $2
       ) sub
       ORDER BY id ASC`,
      [Number(userId), Number(limit)]
    );
    return res.rows.map((r) => new ChatMessagePersistenceEntity(r));
  }

  async deleteByUser(userId) {
    await this.pg.query(`DELETE FROM chat_messages WHERE user_id = $1`, [Number(userId)]);
  }
}

module.exports = { ChatMessagePostgresRepository };
