const { UserPersistenceEntity } = require('../../entity/user/UserPersistenceEntity');

class UserPostgresRepository {
  constructor(pg) {
    this.pg = pg;
  }

  async insert(persistenceEntity) {
    const res = await this.pg.query(
      `INSERT INTO users (name, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, password_hash, created_at`,
      [
        persistenceEntity.name,
        persistenceEntity.email,
        persistenceEntity.password_hash,
        persistenceEntity.created_at,
      ]
    );
    return new UserPersistenceEntity(res.rows[0]);
  }

  async findByEmail(email) {
    const res = await this.pg.query(
      `SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1`,
      [String(email).toLowerCase()]
    );
    return res.rows[0] ? new UserPersistenceEntity(res.rows[0]) : null;
  }

  async findById(id) {
    const res = await this.pg.query(
      `SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    return res.rows[0] ? new UserPersistenceEntity(res.rows[0]) : null;
  }
}

module.exports = { UserPostgresRepository };
