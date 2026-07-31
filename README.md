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

## Run as a systemd service (backend EC2)

Deploys the app to `/opt/expense-backend` and runs it under a dedicated
system user, managed by `expense-backend.service`.

```bash
# one-time setup
sudo useradd --system --shell /sbin/nologin --no-create-home expense-backend
sudo mkdir -p /opt/expense-backend
sudo cp -r src package.json expense-backend.service /opt/expense-backend/
sudo cp .env.example /opt/expense-backend/.env   # then edit DB_HOST/DB_PASSWORD etc.

cd /opt/expense-backend
sudo npm install --omit=dev
sudo chown -R expense-backend:expense-backend /opt/expense-backend
sudo chmod 600 /opt/expense-backend/.env

sudo cp expense-backend.service /etc/systemd/system/expense-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now expense-backend
```

**Start / stop / restart / status:**
```bash
sudo systemctl start expense-backend
sudo systemctl stop expense-backend
sudo systemctl restart expense-backend
sudo systemctl status expense-backend --no-pager
```

**Logs** (the app's own pino JSON lines, captured by journald):
```bash
sudo journalctl -u expense-backend -f
```

**After editing `.env` or the unit file**, `daemon-reload` then `restart` —
a plain `restart` alone won't pick up unit-file changes:
```bash
sudo systemctl daemon-reload
sudo systemctl restart expense-backend
```

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
expense-backend.service   # systemd unit, deploy to /etc/systemd/system/
```
