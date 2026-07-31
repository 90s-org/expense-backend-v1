const express = require('express');
const { healthCheck } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const healthy = await healthCheck();
  if (healthy) {
    return res.status(200).json({ status: 'ok' });
  }
  return res.status(503).json({ status: 'degraded' });
});

module.exports = router;
