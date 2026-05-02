const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function authRequired(req, _res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('Missing bearer token', { statusCode: 401, code: 'UNAUTHORIZED' }));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.auth = { userId: payload.sub };
    return next();
  } catch {
    return next(new AppError('Invalid token', { statusCode: 401, code: 'UNAUTHORIZED' }));
  }
}

module.exports = { authRequired };

