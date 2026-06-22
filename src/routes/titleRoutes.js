const express = require('express');

const { authRequired } = require('../middleware/auth');
const titleController = require('../controllers/titleController');

const router = express.Router();

router.get('/search', authRequired, titleController.search);

module.exports = { titleRoutes: router };
