require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] !== undefined ? process.env[name] : fallback;
  return value;
}

module.exports = {
  port: parseInt(required('PORT', '8080'), 10),
  serviceName: required('SERVICE_NAME', 'expense-backend'),
  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: parseInt(required('DB_PORT', '3306'), 10),
    user: required('DB_USER', 'expense_app'),
    password: required('DB_PASSWORD', ''),
    database: required('DB_NAME', 'expense_db'),
  },
  logLevel: required('LOG_LEVEL', 'info'),
  enableDebugRoutes: required('ENABLE_DEBUG_ROUTES', 'false') === 'true',
};
