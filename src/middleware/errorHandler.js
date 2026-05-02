function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  const payload = {
    error: {
      code,
      message: status === 500 ? 'Internal server error' : err.message,
    },
  };

  if (status !== 500 && err.details) payload.error.details = err.details;

  res.status(status).json(payload);
}

module.exports = { errorHandler };

