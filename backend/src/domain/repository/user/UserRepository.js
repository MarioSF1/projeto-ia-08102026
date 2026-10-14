const { NotImplementedError } = require('../../exception/shared/DomainError');

class UserRepository {
  async save(_user) {
    throw new NotImplementedError('UserRepository.save');
  }

  async findByEmail(_email) {
    throw new NotImplementedError('UserRepository.findByEmail');
  }

  async findById(_id) {
    throw new NotImplementedError('UserRepository.findById');
  }
}

module.exports = { UserRepository };
