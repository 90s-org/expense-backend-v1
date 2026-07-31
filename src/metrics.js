const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'HTTP requests currently in flight',
  registers: [register],
});

const expensesCreatedTotal = new client.Counter({
  name: 'expenses_created_total',
  help: 'Total number of expenses created',
  registers: [register],
});

const expensesDeletedTotal = new client.Counter({
  name: 'expenses_deleted_total',
  help: 'Total number of expenses deleted',
  registers: [register],
});

const expenseAmountRupeesTotal = new client.Counter({
  name: 'expense_amount_rupees_total',
  help: 'Sum of expense amounts (rupees) created',
  registers: [register],
});

const debugCardinalityTotal = new client.Counter({
  name: 'debug_cardinality_total',
  help: 'Debug counter used to demonstrate a cardinality explosion',
  labelNames: ['id'],
  registers: [register],
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpRequestsInFlight,
  expensesCreatedTotal,
  expensesDeletedTotal,
  expenseAmountRupeesTotal,
  debugCardinalityTotal,
};
