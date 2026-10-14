const { ValidationError } = require('../../domain/exception/shared/DomainError');
const {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UnauthorizedError,
} = require('../../domain/exception/user/UserExceptions');
const {
  DuplicateExpenseError,
  ExpenseNotFoundError,
} = require('../../domain/exception/expense/ExpenseExceptions');
const { InsightsNotAvailableError } = require('../../domain/exception/insights/InsightsExceptions');
const { ExternalServiceError } = require('../../application/usecase/shared/ExternalServiceError');

function statusFor(err) {
  if (err instanceof ValidationError) return 400;
  if (err instanceof InvalidCredentialsError || err instanceof UnauthorizedError) return 401;
  if (err instanceof ExpenseNotFoundError) return 404;
  if (err instanceof DuplicateExpenseError || err instanceof EmailAlreadyInUseError) return 409;
  if (err instanceof InsightsNotAvailableError) return 422;
  if (err instanceof ExternalServiceError) return 502;
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandlerMiddleware(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ errors: ['JSON inválido'] });
  }
  const status = statusFor(err);
  if (status) {
    return res.status(status).json({ errors: err.errors });
  }
  console.error(err);
  return res.status(500).json({ errors: ['erro interno'] });
}

module.exports = { errorHandlerMiddleware, statusFor };
