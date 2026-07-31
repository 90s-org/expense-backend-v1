const {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpRequestsInFlight,
} = require('../metrics');

function routeTemplate(req) {
  if (req.route && req.baseUrl !== undefined) {
    return req.baseUrl + req.route.path;
  }
  return req.path;
}

module.exports = function httpMetrics(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime.bigint();
  httpRequestsInFlight.inc();

  res.on('finish', () => {
    httpRequestsInFlight.dec();
    const route = routeTemplate(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestDurationSeconds.observe(labels, durationSeconds);

    req.log.info({
      method: req.method,
      route,
      status: res.statusCode,
      duration_ms: Math.round(durationSeconds * 1000),
      req_id: req.reqId,
    }, 'request completed');
  });

  next();
};
