const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/ingredients
router.get('/', async (req, res) => {
  const { search } = req.query
  try {
    let query = 'SELECT * FROM ingredients'
    const params = []
    if (search) {
      params.push(`%${search}%`)
      query += ` WHERE name ILIKE $1`
    }
    query += ' ORDER BY name'
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ingredients
router.post('/', async (req, res) => {
  const { name, category } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO ingredients (name, category) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category
       RETURNING *`,
      [name, category || 'other']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/ingredients/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ingredients WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
