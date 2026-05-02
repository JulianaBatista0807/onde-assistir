jest.mock('../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

const authService = require('../services/authService');
const { login } = require('./authController');

describe('authController.login validation', () => {
  test('returns 400 with list of invalid fields when missing email or password', async () => {
    const req = { body: { email: '' } };
    const res = {};
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: { fields: expect.any(Array) },
    });
    expect(err.details.fields.map((f) => f.field).sort()).toEqual(['email', 'password']);
  });

  test('calls service and responds 200 for valid payload', async () => {
    authService.login.mockResolvedValue({ accessToken: 't', expiresAt: '2020-01-01T00:00:00.000Z' });

    const req = { body: { email: 'a@a.com', password: 'x' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await login(req, res, next);

    expect(authService.login).toHaveBeenCalledWith({ email: 'a@a.com', password: 'x' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ accessToken: 't', expiresAt: '2020-01-01T00:00:00.000Z' });
    expect(next).not.toHaveBeenCalled();
  });
});

