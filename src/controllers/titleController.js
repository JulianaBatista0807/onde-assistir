const titleService = require('../services/titleService');

async function search(req, res, next) {
  try {
    const { q, type, limit } = req.query;
    const result = await titleService.search({ q, type, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { search };
