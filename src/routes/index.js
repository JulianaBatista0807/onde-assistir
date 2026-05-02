const express = require('express');

const { authRoutes } = require('./authRoutes');
const { userRoutes } = require('./userRoutes');

function registerRoutes(app) {
  const router = express.Router();

  router.get('/health', (_req, res) => res.json({ ok: true }));

  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);

  app.use('/api', router);
}

module.exports = { registerRoutes };

