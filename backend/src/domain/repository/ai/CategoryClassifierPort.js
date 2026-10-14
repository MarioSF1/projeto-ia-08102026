const { NotImplementedError } = require('../../exception/shared/DomainError');

class CategoryClassifierPort {
  async classify(_description) {
    throw new NotImplementedError('CategoryClassifierPort.classify');
  }
}

module.exports = { CategoryClassifierPort, CategoryClassifier: CategoryClassifierPort };
