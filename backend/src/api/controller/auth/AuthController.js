const { AuthRequestDto } = require('../../dto/auth/AuthRequestDto');

class AuthController {
  constructor({ registerUser, authenticateUser }) {
    Object.assign(this, { registerUser, authenticateUser });
  }

  async register(req, res) {
    const input = AuthRequestDto.toRegisterInput(req.body);
    const result = await this.registerUser.execute(input);
    res.status(201).json(AuthRequestDto.toAuthResponse(result));
  }

  async login(req, res) {
    const input = AuthRequestDto.toLoginInput(req.body);
    const result = await this.authenticateUser.execute(input);
    res.json(AuthRequestDto.toAuthResponse(result));
  }

  me(req, res) {
    res.json({ user: req.user });
  }
}

module.exports = { AuthController };
