const app = require('./app');
const config = require('./config');
const { logger } = require('./logger');

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, `${config.serviceName} listening`);
});

function shutdown(signal) {
  logger.info({ signal }, 'shutting down');
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
