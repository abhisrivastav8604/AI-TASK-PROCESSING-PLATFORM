const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const { JWT_SECRET, JWT_EXPIRES_IN = '7d' } = process.env;

if (!JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set!');
  process.exit(1);
}

const signToken = (userId) => jwt.sign(
  { sub: userId },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' },
);

const verifyToken = (token) => jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

module.exports = { signToken, verifyToken };
