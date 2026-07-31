# expense-backend-v1

Spec 2 of 3 — Node.js/Express backend for the 3-tier Expense Tracker.
REST API + Prometheus metrics + structured JSON logs + failure-injection routes.

## Run

```bash
cp .env.example .env   # edit DB_HOST / DB_PASSWORD to point at your MySQL instance
npm install
npm start
```

Requires the `expense-mysql-v1` schema already loaded on the target MySQL host.

## Endpoints

### Categories
```bash
curl http://localhost:8080/api/categories
curl -X POST http://localhost:8080/api/categories -H 'Content-Type: application/json' \
  -d '{"name":"Food","icon":"utensils"}'
curl -X DELETE http://localhost:8080/api/categories/1
```

### Expenses
```bash
curl http://localhost:8080/api/expenses
curl -X POST http://localhost:8080/api/expenses -H 'Content-Type: application/json' \
  -d '{"category_id":1,"amount":250.50,"expense_date":"2026-07-31","notes":"lunch"}'
curl -X PUT http://localhost:8080/api/expenses/1 -H 'Content-Type: application/json' \
  -d '{"category_id":1,"amount":300,"expense_date":"2026-07-31","notes":"lunch (updated)"}'
curl -X DELETE http://localhost:8080/api/expenses/1
```

### Operational
```bash
curl http://localhost:8080/health     # 200 {"status":"ok"} or 503 {"status":"degraded"}
curl http://localhost:8080/metrics    # Prometheus exposition format
```

### Debug (only when ENABLE_DEBUG_ROUTES=true)
```bash
curl http://localhost:8080/debug/error          # always 500
curl "http://localhost:8080/debug/slow?ms=3000" # sleeps then 200
curl http://localhost:8080/debug/cardinality    # increments a labeled counter with a random UUID
```

## Observability notes

- `route` label on HTTP metrics is always the Express route template (`/api/expenses/:id`),
  never the raw path — confirm by hitting `/api/expenses/1` and `/api/expenses/2` and checking
  `/metrics` collapses them into one series.
- Every log line is JSON and carries `service`, `req_id`; one summary line is logged per
  request on completion (`method`, `route`, `status`, `duration_ms`).
- `/metrics` is excluded from the HTTP request metrics/logs so it doesn't pollute its own numbers.

## Project structure
```
src/
  config.js
  db.js
  logger.js
  metrics.js
  middleware/
    requestId.js
    httpMetrics.js
  routes/
    categories.js
    expenses.js
    health.js
    debug.js
  app.js
  server.js
```
