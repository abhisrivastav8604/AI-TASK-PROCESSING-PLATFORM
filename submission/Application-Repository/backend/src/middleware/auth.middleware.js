const { verifyToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Token has expired.' : 'Invalid token.';
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });
    return next(err);
  }
};

module.exports = { protect };
