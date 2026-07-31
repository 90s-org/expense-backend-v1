const pino = require('pino');
const config = require('./config');

const logger = pino({
  level: config.logLevel,
  base: { service: config.serviceName },
  timestamp: pino.stdTimeFunctions.isoTime,
});

function childFor(reqId) {
  return logger.child({ req_id: reqId });
}

module.exports = { logger, childFor };
