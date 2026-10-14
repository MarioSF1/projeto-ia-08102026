const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

class PasswordHasher {
  async hash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, keyHex] = storedHash.split(':');
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }
}

module.exports = { PasswordHasher };
