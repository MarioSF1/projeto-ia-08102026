function createAuthMiddleware(tokenService) {
  if (!tokenService) {
    return (req, _res, next) => {
      req.user = { id: null, name: 'Anônimo', email: '' };
      next();
    };
  }

  return (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
      req.user = tokenService.verify(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { createAuthMiddleware };
