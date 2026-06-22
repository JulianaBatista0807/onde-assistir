const { env } = require('../config/env');
const { tmdbFetch } = require('./tmdbClient');

const PROVIDER_TYPE_MAP = {
  flatrate: 'subscription',
  rent: 'rent',
  buy: 'buy',
};

function extractYear(dateStr) {
  if (!dateStr) return undefined;
  const year = Number(dateStr.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function buildPosterUrl(path) {
  if (!path) return undefined;
  return `https://image.tmdb.org/t/p/w342${path}`;
}

function mapMovieResult(item) {
  return {
    tmdbId: item.id,
    id: `movie-${item.id}`,
    title: item.title,
    originalTitle: item.original_title,
    type: 'movie',
    year: extractYear(item.release_date),
    synopsis: item.overview || undefined,
    posterUrl: buildPosterUrl(item.poster_path),
    popularity: item.popularity ?? 0,
    providers: [],
  };
}

function mapSeriesResult(item) {
  return {
    tmdbId: item.id,
    id: `series-${item.id}`,
    title: item.name,
    originalTitle: item.original_name,
    type: 'series',
    year: extractYear(item.first_air_date),
    synopsis: item.overview || undefined,
    posterUrl: buildPosterUrl(item.poster_path),
    popularity: item.popularity ?? 0,
    providers: [],
  };
}

function mapProviders(watchData) {
  if (!watchData) return [];

  const regionData = watchData[env.TMDB_REGION];
  if (!regionData) return [];

  const providers = [];

  for (const [bucket, providerType] of Object.entries(PROVIDER_TYPE_MAP)) {
    const list = regionData[bucket];
    if (!Array.isArray(list)) continue;

    for (const provider of list) {
      providers.push({
        name: provider.provider_name,
        type: providerType,
        logoUrl: provider.logo_path ? `https://image.tmdb.org/t/p/w45${provider.logo_path}` : undefined,
      });
    }
  }

  const seen = new Set();
  return providers.filter((p) => {
    const key = `${p.name}:${p.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchWatchProviders(type, tmdbId) {
  const path = type === 'series' ? `/tv/${tmdbId}/watch/providers` : `/movie/${tmdbId}/watch/providers`;
  const data = await tmdbFetch(path);
  return mapProviders(data.results);
}

async function searchMovies(query, limit) {
  const data = await tmdbFetch('/search/movie', {
    query,
    language: env.TMDB_LANGUAGE,
    include_adult: 'false',
    page: 1,
  });

  return (data.results || []).slice(0, limit).map(mapMovieResult);
}

async function searchSeries(query, limit) {
  const data = await tmdbFetch('/search/tv', {
    query,
    language: env.TMDB_LANGUAGE,
    include_adult: 'false',
    page: 1,
  });

  return (data.results || []).slice(0, limit).map(mapSeriesResult);
}

async function attachProviders(results) {
  return Promise.all(
    results.map(async (item) => {
      try {
        const providers = await fetchWatchProviders(item.type, item.tmdbId);
        return { ...item, providers };
      } catch {
        return { ...item, providers: [] };
      }
    }),
  );
}

async function search({ q, type, limit = 20 }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 20);

  let results;

  if (type === 'movie') {
    results = await searchMovies(q, safeLimit);
  } else if (type === 'series') {
    results = await searchSeries(q, safeLimit);
  } else {
    const perType = Math.ceil(safeLimit / 2);
    const [movies, series] = await Promise.all([searchMovies(q, perType), searchSeries(q, perType)]);
    results = [...movies, ...series]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, safeLimit);
  }

  const withProviders = await attachProviders(results);

  return {
    query: q,
    total: withProviders.length,
    region: env.TMDB_REGION,
    source: 'tmdb',
    results: withProviders.map(({ popularity, ...item }) => item),
  };
}

module.exports = {
  search,
  mapMovieResult,
  mapSeriesResult,
  mapProviders,
  extractYear,
};
