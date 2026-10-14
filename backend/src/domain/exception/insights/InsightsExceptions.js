const { DomainError } = require('../shared/DomainError');

class InsightsNotAvailableError extends DomainError {}

module.exports = { InsightsNotAvailableError };
