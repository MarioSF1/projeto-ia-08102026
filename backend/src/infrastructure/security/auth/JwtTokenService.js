const crypto = require('crypto');
const { UnauthorizedError } = require('../../../domain/exception/user/UserExceptions');

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

class JwtTokenService {
  constructor({ secret = 'gastocerto-dev-secret-key', expiresInHours = 168 } = {}) {
    this.secret = secret;
    this.expiresInSeconds = Number(expiresInHours) * 3600;
  }

  sign(user) {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64UrlEncode(
      JSON.stringify({
        sub: user.id,
        name: user.name,
        email: user.email,
        iat: now,
        exp: now + this.expiresInSeconds,
      })
    );
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  verify(token) {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError('token não informado');
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedError('token malformado');
    }
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', this.secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new UnauthorizedError('token inválido');
    }

    let decoded;
    try {
      decoded = JSON.parse(base64UrlDecode(payload));
    } catch {
      throw new UnauthorizedError('payload do token inválido');
    }

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && now > decoded.exp) {
      throw new UnauthorizedError('sessão expirada, faça login novamente');
    }

    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
    };
  }
}

module.exports = { JwtTokenService };
