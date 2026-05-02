const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models/User');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function buildJwtPayload(user) {
  const payload = { sub: String(user._id) };
  if (Array.isArray(user.roles) && user.roles.length > 0) payload.roles = user.roles;
  return payload;
}

function createAccessToken(user) {
  const accessToken = jwt.sign(buildJwtPayload(user), env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const decoded = jwt.decode(accessToken);
  const expiresAt =
    decoded && typeof decoded === 'object' && typeof decoded.exp === 'number'
      ? new Date(decoded.exp * 1000).toISOString()
      : undefined;

  return { accessToken, expiresAt };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new AppError('Email already in use', { statusCode: 409, code: 'EMAIL_IN_USE' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, active: true, roles: [] });

  const { accessToken, expiresAt } = createAccessToken(user);
  return {
    user: { id: String(user._id), name: user.name, email: user.email },
    accessToken,
    expiresAt,
    token: accessToken,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || user.active === false) {
    throw new AppError('Invalid credentials', { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', { statusCode: 401, code: 'INVALID_CREDENTIALS' });

  const { accessToken, expiresAt } = createAccessToken(user);
  return {
    user: { id: String(user._id), name: user.name, email: user.email },
    accessToken,
    expiresAt,
    token: accessToken,
  };
}

module.exports = { register, login };

