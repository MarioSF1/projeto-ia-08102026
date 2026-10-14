const { User } = require('../../../../domain/entity/user/User');
const { UserPersistenceEntity } = require('../../entity/user/UserPersistenceEntity');

class UserPersistenceMapper {
  static toPersistence(domainUser) {
    if (!domainUser) return null;
    const p = domainUser.toPrimitives();
    return new UserPersistenceEntity({
      id: p.id,
      name: p.name,
      email: p.email,
      password_hash: p.passwordHash,
      created_at: p.createdAt,
    });
  }

  static toDomain(persistenceEntity) {
    if (!persistenceEntity) return null;
    return User.fromPrimitives({
      id: persistenceEntity.id,
      name: persistenceEntity.name,
      email: persistenceEntity.email,
      passwordHash: persistenceEntity.password_hash,
      createdAt: persistenceEntity.created_at,
    });
  }
}

module.exports = { UserPersistenceMapper };
