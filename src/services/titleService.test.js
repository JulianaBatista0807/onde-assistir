jest.mock('./tmdbService', () => ({
  search: jest.fn(),
}));

const tmdbService = require('./tmdbService');
const titleService = require('./titleService');

describe('titleService.search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws when query is too short', async () => {
    await expect(titleService.search({ q: 'a' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  test('throws when type filter is invalid', async () => {
    await expect(titleService.search({ q: 'matrix', type: 'anime' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  test('delegates valid search to tmdbService', async () => {
    const payload = {
      query: 'matrix',
      total: 1,
      region: 'BR',
      source: 'tmdb',
      results: [{ id: 'movie-603', title: 'Matrix', type: 'movie', providers: [] }],
    };
    tmdbService.search.mockResolvedValue(payload);

    const result = await titleService.search({ q: 'matrix', type: 'movie', limit: 10 });

    expect(tmdbService.search).toHaveBeenCalledWith({ q: 'matrix', type: 'movie', limit: 10 });
    expect(result).toEqual(payload);
  });
});
