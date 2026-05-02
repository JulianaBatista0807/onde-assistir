const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models/User');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new AppError('Email already in use', { statusCode: 409, code: 'EMAIL_IN_USE' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user);
  return {
    user: { id: String(user._id), name: user.name, email: user.email },
    token,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid credentials', { statusCode: 401, code: 'INVALID_CREDENTIALS' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', { statusCode: 401, code: 'INVALID_CREDENTIALS' });

  const token = signToken(user);
  return {
    user: { id: String(user._id), name: user.name, email: user.email },
    token,
  };
}

module.exports = { register, login };

