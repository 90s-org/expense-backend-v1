const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, icon, created_at FROM categories ORDER BY name ASC'
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, icon } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!icon || typeof icon !== 'string' || !icon.trim()) {
      return res.status(400).json({ error: 'icon is required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE name = ?',
      [name.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'category name already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, icon) VALUES (?, ?)',
      [name.trim(), icon.trim()]
    );
    const [rows] = await pool.query(
      'SELECT id, name, icon, created_at FROM categories WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'category name already exists' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'category not found' });
    }

    try {
      await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    } catch (err) {
      if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'category has expenses and cannot be deleted' });
      }
      throw err;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
