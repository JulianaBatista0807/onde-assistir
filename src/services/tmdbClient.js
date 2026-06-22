const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdbFetch(path, params = {}) {
  if (!env.TMDB_API_KEY) {
    throw new AppError('TMDB API key not configured', {
      statusCode: 503,
      code: 'TMDB_NOT_CONFIGURED',
    });
  }

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', env.TMDB_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url);

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.status_message || 'TMDB request failed';
    throw new AppError(message, {
      statusCode: res.status === 401 ? 502 : 502,
      code: 'TMDB_ERROR',
      details: { status: data?.status_code },
    });
  }

  return data;
}

module.exports = { tmdbFetch };
