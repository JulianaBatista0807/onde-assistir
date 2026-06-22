const dotenv = require('dotenv');

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),

  BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  TMDB_API_KEY: process.env.TMDB_API_KEY,
  TMDB_REGION: process.env.TMDB_REGION || 'BR',
  TMDB_LANGUAGE: process.env.TMDB_LANGUAGE || 'pt-BR',
};

module.exports = { env };

