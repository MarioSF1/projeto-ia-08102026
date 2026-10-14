const { NotImplementedError } = require('../../exception/shared/DomainError');

class FinancialAgentPort {
  async chat(_input) {
    throw new NotImplementedError('FinancialAgentPort.chat');
  }
}

module.exports = { FinancialAgentPort, FinancialAgent: FinancialAgentPort };
