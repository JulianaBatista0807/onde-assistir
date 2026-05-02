const express = require('express');

const { authRequired } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/me', authRequired, userController.me);

module.exports = { userRoutes: router };

