const { User } = require('../../../domain/entity/user/User');
const { EmailAlreadyInUseError } = require('../../../domain/exception/user/UserExceptions');
const { RegisterUserInputDto, AuthOutputDto } = require('../../dto/auth/AuthDtos');

class RegisterUserUseCase {
  constructor({ users, passwordHasher, tokenService }) {
    Object.assign(this, { users, passwordHasher, tokenService });
  }

  async execute(rawInput = {}) {
    const dto = new RegisterUserInputDto(rawInput);
    const { name, email, password } = User.validateRegistration(dto);
    const existing = await this.users.findByEmail(email);
    if (existing) throw new EmailAlreadyInUseError();

    const passwordHash = await this.passwordHasher.hash(password);
    const user = User.create({ name, email, passwordHash });
    await this.users.save(user);

    const publicUser = user.toPublic();
    const token = this.tokenService.sign(publicUser);
    return new AuthOutputDto({ user: publicUser, token });
  }
}

module.exports = { RegisterUserUseCase, RegisterUser: RegisterUserUseCase };
