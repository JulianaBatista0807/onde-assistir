jest.mock('./tmdbClient', () => ({
  tmdbFetch: jest.fn(),
}));

const { tmdbFetch } = require('./tmdbClient');
const tmdbService = require('./tmdbService');

describe('tmdbService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TMDB_REGION = 'BR';
  });

  test('mapProviders maps BR flatrate providers', () => {
    const providers = tmdbService.mapProviders({
      BR: {
        flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' }],
        rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/apple.jpg' }],
      },
    });

    expect(providers).toEqual([
      { name: 'Netflix', type: 'subscription', logoUrl: 'https://image.tmdb.org/t/p/w45/netflix.jpg' },
      { name: 'Apple TV', type: 'rent', logoUrl: 'https://image.tmdb.org/t/p/w45/apple.jpg' },
    ]);
  });

  test('search merges movies and series when type is not set', async () => {
    tmdbFetch
      .mockResolvedValueOnce({
        results: [
          {
            id: 603,
            title: 'Matrix',
            original_title: 'The Matrix',
            overview: 'Simulação.',
            release_date: '1999-03-31',
            poster_path: '/matrix.jpg',
            popularity: 80,
          },
        ],
      })
      .mockResolvedValueOnce({
        results: [
          {
            id: 1396,
            name: 'Breaking Bad',
            original_name: 'Breaking Bad',
            overview: 'Químico vira traficante.',
            first_air_date: '2008-01-20',
            poster_path: '/bb.jpg',
            popularity: 90,
          },
        ],
      })
      .mockResolvedValue({ results: { BR: { flatrate: [{ provider_name: 'Netflix' }] } } });

    const result = await tmdbService.search({ q: 'matrix', limit: 2 });

    expect(tmdbFetch).toHaveBeenCalledWith('/search/movie', expect.objectContaining({ query: 'matrix' }));
    expect(tmdbFetch).toHaveBeenCalledWith('/search/tv', expect.objectContaining({ query: 'matrix' }));
    expect(result.source).toBe('tmdb');
    expect(result.region).toBe('BR');
    expect(result.results).toHaveLength(2);
    expect(result.results[0].title).toBe('Breaking Bad');
    expect(result.results[0].providers[0].name).toBe('Netflix');
  });
});
