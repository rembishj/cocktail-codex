const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/cabinet — all ingredients with in_stock status
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.id, i.name, i.category,
             COALESCE(c.in_stock, FALSE) AS in_stock,
             c.notes
      FROM ingredients i
      LEFT JOIN cabinet c ON c.ingredient_id = i.id
      ORDER BY i.category, i.name
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/cabinet/:ingredientId — toggle or set in_stock
router.put('/:ingredientId', async (req, res) => {
  const { in_stock, notes } = req.body
  try {
    const { rows } = await pool.query(`
      INSERT INTO cabinet (ingredient_id, in_stock, notes)
      VALUES ($1, $2, $3)
      ON CONFLICT (ingredient_id) DO UPDATE SET in_stock = $2, notes = $3
      RETURNING *
    `, [req.params.ingredientId, in_stock, notes || null])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
