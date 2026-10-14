const { ValidationError } = require('../../../domain/exception/shared/DomainError');
const { InvalidCredentialsError } = require('../../../domain/exception/user/UserExceptions');
const { AuthenticateUserInputDto, AuthOutputDto } = require('../../dto/auth/AuthDtos');

class AuthenticateUserUseCase {
  constructor({ users, passwordHasher, tokenService }) {
    Object.assign(this, { users, passwordHasher, tokenService });
  }

  async execute(rawInput = {}) {
    const dto = new AuthenticateUserInputDto(rawInput);
    const cleanEmail = typeof dto.email === 'string' ? dto.email.trim().toLowerCase() : '';
    if (!cleanEmail || typeof dto.password !== 'string' || !dto.password) {
      throw new ValidationError('email e password são obrigatórios');
    }

    const user = await this.users.findByEmail(cleanEmail);
    if (!user) throw new InvalidCredentialsError();

    const valid = await this.passwordHasher.verify(dto.password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();

    const publicUser = user.toPublic();
    const token = this.tokenService.sign(publicUser);
    return new AuthOutputDto({ user: publicUser, token });
  }
}

module.exports = { AuthenticateUserUseCase, AuthenticateUser: AuthenticateUserUseCase };
