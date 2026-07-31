const express = require('express');
const { randomUUID } = require('crypto');
const { debugCardinalityTotal } = require('../metrics');

const router = express.Router();

router.get('/error', (req, res) => {
  req.log.error({ req_id: req.reqId }, 'debug/error: intentional failure');
  res.status(500).json({ error: 'intentional failure for drills' });
});

router.get('/slow', (req, res) => {
  const ms = parseInt(req.query.ms, 10) || 3000;
  setTimeout(() => {
    res.status(200).json({ slept_ms: ms });
  }, ms);
});

router.get('/cardinality', (req, res) => {
  debugCardinalityTotal.inc({ id: randomUUID() });
  res.status(200).json({ ok: true });
});

module.exports = router;
