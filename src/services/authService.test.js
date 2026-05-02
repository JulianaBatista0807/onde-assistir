const bcrypt = require('bcryptjs');

jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const authService = require('./authService');

describe('authService.login', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('returns accessToken and expiresAt for valid credentials', async () => {
    const userDoc = { _id: 'u1', name: 'Ana', email: 'ana@example.com', passwordHash: 'hash', active: true, roles: [] };
    User.findOne.mockResolvedValue(userDoc);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await authService.login({ email: 'ana@example.com', password: '123456' });

    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
    expect(result).toHaveProperty('expiresAt');
    expect(typeof result.expiresAt).toBe('string');

    const decoded = jwt.decode(result.accessToken);
    expect(decoded).toMatchObject({ sub: 'u1' });
    expect(typeof decoded.exp).toBe('number');
  });

  test('rejects invalid password with 401 without revealing email existence', async () => {
    const userDoc = { _id: 'u1', name: 'Ana', email: 'ana@example.com', passwordHash: 'hash', active: true, roles: [] };
    User.findOne.mockResolvedValue(userDoc);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(authService.login({ email: 'ana@example.com', password: 'wrong' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  test('rejects missing/inactive user with 401', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(authService.login({ email: 'x@example.com', password: 'x' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });

    User.findOne.mockResolvedValue({ _id: 'u2', email: 'y@example.com', passwordHash: 'hash', active: false });
    await expect(authService.login({ email: 'y@example.com', password: 'x' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });
});

