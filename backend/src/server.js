require('dotenv').config();

const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { limiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      // Allow if in the allowedOrigins list OR if no origins configured (dev)
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(
  morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    {
      stream: { write: (msg) => logger.http(msg.trim()) },
    },
  ),
);

app.use(limiter);

// Root health-check — Render probes HEAD / to detect an open port
app.all('/', (req, res) => res.status(200).json({ success: true, message: 'Server is running' }));
app.get('/health', (req, res) => res.status(200).json({ success: true, status: 'healthy' }));
app.get('/ready', (req, res) => res.status(200).json({ success: true, status: 'ready' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const start = async () => {
  await connectDB();

  const server = http.createServer(app);

  // Bind to 0.0.0.0 so Render's port scanner can detect the open port
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 15000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason });
    shutdown('unhandledRejection');
  });
};

start();

module.exports = app;
