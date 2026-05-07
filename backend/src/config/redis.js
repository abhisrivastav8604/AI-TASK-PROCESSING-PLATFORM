const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisClient = () => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000);
      logger.warn(`Redis retry attempt ${times}, next retry in ${delay}ms`);
      return delay;
    },
    lazyConnect: true,
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('ready', () => logger.info('Redis ready'));
  client.on('error', (err) => logger.error('Redis error', { error: err.message }));
  client.on('close', () => logger.warn('Redis connection closed'));
  client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

  return client;
};

module.exports = { createRedisClient };
