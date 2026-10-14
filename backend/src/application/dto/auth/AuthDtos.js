class RegisterUserInputDto {
  constructor({ name, email, password } = {}) {
    this.name = name;
    this.email = email;
    this.password = password;
    Object.freeze(this);
  }
}

class AuthenticateUserInputDto {
  constructor({ email, password } = {}) {
    this.email = email;
    this.password = password;
    Object.freeze(this);
  }
}

class AuthOutputDto {
  constructor({ user, token }) {
    this.user = user;
    this.token = token;
    Object.freeze(this);
  }
}

module.exports = {
  RegisterUserInputDto,
  AuthenticateUserInputDto,
  AuthOutputDto,
};
