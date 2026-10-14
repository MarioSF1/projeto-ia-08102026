class ExternalServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExternalServiceError';
    this.errors = [message];
  }
}

module.exports = { ExternalServiceError };
