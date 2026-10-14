const { DomainError } = require('../shared/DomainError');

class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super('este e-mail já está cadastrado');
  }
}

class InvalidCredentialsError extends DomainError {
  constructor() {
    super('e-mail ou senha inválidos');
  }
}

class UnauthorizedError extends DomainError {
  constructor(msg = 'autenticação necessária') {
    super(msg);
  }
}

module.exports = {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UnauthorizedError,
};
