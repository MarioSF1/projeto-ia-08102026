class DomainError extends Error {
  constructor(messages) {
    const errors = [].concat(messages);
    super(errors.join('; '));
    this.name = this.constructor.name;
    this.errors = errors;
  }
}

class ValidationError extends DomainError {}

class NotImplementedError extends DomainError {
  constructor(methodName) {
    super(`${methodName} não implementado`);
  }
}

function collect(rules) {
  const result = {};
  const errors = [];
  for (const [key, fn] of Object.entries(rules)) {
    try {
      result[key] = fn();
    } catch (e) {
      if (e instanceof ValidationError) errors.push(...e.errors);
      else throw e;
    }
  }
  if (errors.length) throw new ValidationError(errors);
  return result;
}

module.exports = { DomainError, ValidationError, NotImplementedError, collect };
