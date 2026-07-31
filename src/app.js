const express = require('express');
const config = require('./config');
const { register } = require('./metrics');
const requestId = require('./middleware/requestId');
const httpMetrics = require('./middleware/httpMetrics');

const categoriesRouter = require('./routes/categories');
const expensesRouter = require('./routes/expenses');
const healthRouter = require('./routes/health');
const debugRouter = require('./routes/debug');

const app = express();

app.use(express.json());
app.use(requestId);
app.use(httpMetrics);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/health', healthRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/expenses', expensesRouter);

if (config.enableDebugRoutes) {
  app.use('/debug', debugRouter);
} else {
  app.use('/debug', (req, res) => res.status(404).json({ error: 'not found' }));
}

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (req.log) {
    req.log.error({ err, req_id: req.reqId }, 'unhandled error');
  }
  res.status(500).json({ error: 'internal server error' });
});

module.exports = app;
