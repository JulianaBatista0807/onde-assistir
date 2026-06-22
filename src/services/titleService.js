const { AppError } = require('../utils/AppError');
const tmdbService = require('./tmdbService');

async function search({ q, type, limit = 20 }) {
  const query = typeof q === 'string' ? q.trim() : '';
  if (query.length < 2) {
    throw new AppError('Search query must have at least 2 characters', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: { fields: [{ field: 'q', message: 'Min length is 2' }] },
    });
  }

  if (type && !['movie', 'series'].includes(type)) {
    throw new AppError('Invalid type filter', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: { fields: [{ field: 'type', message: 'Must be movie or series' }] },
    });
  }

  return tmdbService.search({ q: query, type, limit });
}

module.exports = { search };
