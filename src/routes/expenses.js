const express = require('express');
const { pool } = require('../db');
const {
  expensesCreatedTotal,
  expensesDeletedTotal,
  expenseAmountRupeesTotal,
} = require('../metrics');

const router = express.Router();

const SELECT_JOINED = `
  SELECT
    e.id, e.category_id, e.amount, e.expense_date, e.notes,
    e.created_at, e.updated_at,
    c.name AS category_name, c.icon AS category_icon
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
`;

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

async function validateExpenseBody(body) {
  const { category_id, amount, expense_date, notes } = body || {};

  const categoryId = Number(category_id);
  if (!category_id || !Number.isInteger(categoryId)) {
    return 'category_id is required';
  }
  const [cat] = await pool.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (cat.length === 0) {
    return 'category_id does not exist';
  }

  const amountNum = Number(amount);
  if (amount === undefined || amount === null || Number.isNaN(amountNum) || amountNum <= 0) {
    return 'amount must be a number greater than 0';
  }

  if (!isValidDate(expense_date)) {
    return 'expense_date is required and must be a valid date (YYYY-MM-DD)';
  }

  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string' || notes.length > 500) {
      return 'notes must be a string of at most 500 characters';
    }
  }

  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT_JOINED} ORDER BY e.expense_date DESC, e.id DESC`);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const error = await validateExpenseBody(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const { category_id, amount, expense_date, notes } = req.body;
    const [result] = await pool.query(
      'INSERT INTO expenses (category_id, amount, expense_date, notes) VALUES (?, ?, ?, ?)',
      [Number(category_id), Number(amount), expense_date, notes || null]
    );

    const [rows] = await pool.query(`${SELECT_JOINED} WHERE e.id = ?`, [result.insertId]);

    expensesCreatedTotal.inc();
    expenseAmountRupeesTotal.inc(Number(amount));

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await pool.query('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'expense not found' });
    }

    const error = await validateExpenseBody(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const { category_id, amount, expense_date, notes } = req.body;
    await pool.query(
      'UPDATE expenses SET category_id = ?, amount = ?, expense_date = ?, notes = ? WHERE id = ?',
      [Number(category_id), Number(amount), expense_date, notes || null, id]
    );

    const [rows] = await pool.query(`${SELECT_JOINED} WHERE e.id = ?`, [id]);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await pool.query('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'expense not found' });
    }

    await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    expensesDeletedTotal.inc();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
