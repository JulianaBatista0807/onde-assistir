const { AppError } = require('../utils/AppError');
const authService = require('../services/authService');

function validateRequiredStrings(body, fields) {
  const invalidFields = [];
  const values = {};

  for (const field of fields) {
    const value = body?.[field];
    if (typeof value !== 'string' || value.trim() === '') {
      invalidFields.push({ field, message: 'Required' });
      continue;
    }
    values[field] = value.trim();
  }

  if (invalidFields.length > 0) {
    throw new AppError('Validation error', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: { fields: invalidFields },
    });
  }

  return values;
}

async function register(req, res, next) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
    const { email, password } = validateRequiredStrings(req.body, ['email', 'password']);

    const result = await authService.register({ name, email: email.toLowerCase(), password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = validateRequiredStrings(req.body, ['email', 'password']);

    const result = await authService.login({ email: email.toLowerCase(), password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };

