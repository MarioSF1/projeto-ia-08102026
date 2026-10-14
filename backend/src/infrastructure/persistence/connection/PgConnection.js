const { Pool } = require('pg');

class PgConnection {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
  }

  async query(text, params = []) {
    return this.pool.query(text, params);
  }

  async initSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        date VARCHAR(10) NOT NULL,
        category VARCHAR(40) NOT NULL,
        notes VARCHAR(300) NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);

      CREATE TABLE IF NOT EXISTS budgets (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        month VARCHAR(7) NOT NULL,
        limit_amount NUMERIC(12, 2) NOT NULL,
        PRIMARY KEY (user_id, month)
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        actions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, id);
    `);
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = { PgConnection };
