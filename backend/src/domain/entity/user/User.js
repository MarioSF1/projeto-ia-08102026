const { ValidationError, collect } = require('../../exception/shared/DomainError');
const { Email } = require('../../valueobject/user/Email');

function parseName(raw) {
  const n = typeof raw === 'string' ? raw.trim() : '';
  if (n.length < 2 || n.length > 80) {
    throw new ValidationError('name deve ter entre 2 e 80 caracteres');
  }
  return n;
}

class User {
  constructor({ id = null, name, email, passwordHash, createdAt }) {
    Object.assign(this, {
      id,
      name,
      email: email instanceof Email ? email.value : email,
      passwordHash,
      createdAt,
    });
  }

  static validateRegistration({ name, email, password } = {}) {
    return collect({
      name: () => parseName(name),
      email: () => Email.of(email).value,
      password: () => {
        if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
          throw new ValidationError('password deve ter entre 6 e 100 caracteres');
        }
        return password;
      },
    });
  }

  static create({ name, email, passwordHash } = {}) {
    const v = collect({
      name: () => parseName(name),
      email: () => Email.of(email).value,
    });
    if (!passwordHash) throw new ValidationError('passwordHash é obrigatório');
    return new User({ ...v, passwordHash, createdAt: new Date().toISOString() });
  }

  assignId(id) {
    this.id = id;
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
    };
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
    };
  }

  static fromPrimitives(p) {
    return new User({
      id: p.id,
      name: p.name,
      email: Email.of(p.email).value,
      passwordHash: p.passwordHash,
      createdAt: p.createdAt,
    });
  }
}

module.exports = { User };
