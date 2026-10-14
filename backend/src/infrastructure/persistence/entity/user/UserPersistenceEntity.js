class UserPersistenceEntity {
  constructor({ id = null, name, email, password_hash, created_at }) {
    this.id = id != null ? Number(id) : null;
    this.name = name;
    this.email = email;
    this.password_hash = password_hash;
    this.created_at = created_at instanceof Date ? created_at.toISOString() : String(created_at);
    Object.freeze(this);
  }
}

module.exports = { UserPersistenceEntity };
