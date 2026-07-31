const { randomUUID } = require('crypto');
const { childFor } = require('../logger');

module.exports = function requestId(req, res, next) {
  const reqId = randomUUID();
  req.reqId = reqId;
  req.log = childFor(reqId);
  res.setHeader('X-Request-Id', reqId);
  next();
};
