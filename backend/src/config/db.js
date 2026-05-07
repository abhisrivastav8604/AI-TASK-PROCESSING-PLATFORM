const mongoose = require('mongoose');
const logger = require('./logger');

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

const connectDB = async (retries = 5, delay = 1000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (retries === 0) {
      logger.error('MongoDB connection failed after all retries. Exiting.', { error: err.message });
      process.exit(1);
    }
    logger.warn(`MongoDB connection failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((res) => { setTimeout(res, delay); });
    return connectDB(retries - 1, Math.min(delay * 2, 30000));
  }
};

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error', { error: err.message }));

module.exports = connectDB;
