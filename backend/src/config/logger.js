const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, errors, json, colorize, printf,
} = format;

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = printf(({
  level, message, timestamp: ts, stack, ...meta
}) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}]: ${stack || message}${metaStr}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
    errors({ stack: true }),
    isDev
      ? combine(colorize(), devFormat)
      : json(),
  ),
  transports: [
    new transports.Console(),
  ],
  exitOnError: false,
});

module.exports = logger;
