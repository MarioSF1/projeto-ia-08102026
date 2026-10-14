const { UserRepository } = require('../../../../domain/repository/user/UserRepository');
const { UserPersistenceMapper } = require('../../mapper/user/UserPersistenceMapper');

class UserRepositoryAdapter extends UserRepository {
  constructor(postgresRepo, mapper = UserPersistenceMapper) {
    super();
    this.postgresRepo = postgresRepo;
    this.mapper = mapper;
  }

  async save(domainUser) {
    const persistenceEntity = this.mapper.toPersistence(domainUser);
    const saved = await this.postgresRepo.insert(persistenceEntity);
    domainUser.assignId(saved.id);
    return domainUser;
  }

  async findByEmail(email) {
    const row = await this.postgresRepo.findByEmail(email);
    return this.mapper.toDomain(row);
  }

  async findById(id) {
    const row = await this.postgresRepo.findById(id);
    return this.mapper.toDomain(row);
  }
}

module.exports = { UserRepositoryAdapter };
