const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');

async function me(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) throw new AppError('Unauthorized', { statusCode: 401, code: 'UNAUTHORIZED' });

    const user = await User.findById(userId).lean();
    if (!user) throw new AppError('User not found', { statusCode: 404, code: 'USER_NOT_FOUND' });

    res.json({ user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { me };

