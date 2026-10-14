class AuthRequestDto {
  static toRegisterInput(body = {}) {
    return {
      name: body.name,
      email: body.email,
      password: body.password,
    };
  }

  static toLoginInput(body = {}) {
    return {
      email: body.email,
      password: body.password,
    };
  }

  static toAuthResponse(result) {
    return {
      user: result.user,
      token: result.token,
    };
  }
}

module.exports = { AuthRequestDto };
