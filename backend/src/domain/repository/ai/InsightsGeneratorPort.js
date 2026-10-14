const { NotImplementedError } = require('../../exception/shared/DomainError');

class InsightsGeneratorPort {
  async generate(_input) {
    throw new NotImplementedError('InsightsGeneratorPort.generate');
  }
}

module.exports = { InsightsGeneratorPort, InsightsGenerator: InsightsGeneratorPort };
