const { AppError } = require('../utils/AppError');
const authService = require('../services/authService');

function assertString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppError(`Invalid field: ${field}`, { statusCode: 400, code: 'VALIDATION_ERROR' });
  }
  return value.trim();
}

async function register(req, res, next) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
    const email = assertString(req.body?.email, 'email').toLowerCase();
    const password = assertString(req.body?.password, 'password');

    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const email = assertString(req.body?.email, 'email').toLowerCase();
    const password = assertString(req.body?.password, 'password');

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };

