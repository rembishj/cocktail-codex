const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/recipes — list with optional filters
router.get('/', async (req, res) => {
  const { search, ingredients: ingredientsParam, canMake } = req.query
  // ingredients param is comma-separated IDs: "1,4,7"
  const ingredientIds = ingredientsParam
    ? ingredientsParam.split(',').map(Number).filter(Boolean)
    : []
  try {
    let query = `
      SELECT DISTINCT r.id, r.name, r.description, r.glass_type, r.created_at,
        (
          SELECT COUNT(*) = 0
          FROM recipe_ingredients ri
          WHERE ri.recipe_id = r.id
            AND ri.optional = FALSE
            AND ri.ingredient_id NOT IN (
              SELECT ingredient_id FROM cabinet WHERE in_stock = TRUE
            )
        ) AS can_make
      FROM recipes r
    `
    const params = []
    const conditions = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`r.name ILIKE $${params.length}`)
    }

    // All selected ingredients must exist in the recipe
    if (ingredientIds.length > 0) {
      params.push(ingredientIds)
      conditions.push(`(
        SELECT COUNT(DISTINCT ri_f.ingredient_id)
        FROM recipe_ingredients ri_f
        WHERE ri_f.recipe_id = r.id
          AND ri_f.ingredient_id = ANY($${params.length})
      ) = ${ingredientIds.length}`)
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    if (canMake === 'true') {
      const prefix = conditions.length ? ' AND ' : ' WHERE '
      query += prefix + `NOT EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        WHERE ri2.recipe_id = r.id
          AND ri2.optional = FALSE
          AND ri2.ingredient_id NOT IN (
            SELECT ingredient_id FROM cabinet WHERE in_stock = TRUE
          )
      )`
    }

    query += ' ORDER BY r.created_at DESC'

    const { rows } = await pool.query(query, params)

    // Attach ingredients to each recipe
    const recipeIds = rows.map(r => r.id)
    if (recipeIds.length === 0) return res.json([])

    const ingResult = await pool.query(`
      SELECT ri.recipe_id, ri.amount, ri.unit, ri.optional,
             i.id AS ingredient_id, i.name AS ingredient_name, i.category,
             EXISTS(SELECT 1 FROM cabinet c WHERE c.ingredient_id = i.id AND c.in_stock = TRUE) AS in_stock
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE ri.recipe_id = ANY($1)
    `, [recipeIds])

    const ingMap = {}
    for (const ing of ingResult.rows) {
      if (!ingMap[ing.recipe_id]) ingMap[ing.recipe_id] = []
      ingMap[ing.recipe_id].push(ing)
    }

    const result = rows.map(r => ({ ...r, ingredients: ingMap[r.id] || [] }))
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*,
        (
          SELECT COUNT(*) = 0
          FROM recipe_ingredients ri
          WHERE ri.recipe_id = r.id
            AND ri.optional = FALSE
            AND ri.ingredient_id NOT IN (
              SELECT ingredient_id FROM cabinet WHERE in_stock = TRUE
            )
        ) AS can_make
      FROM recipes r WHERE r.id = $1
    `, [req.params.id])

    if (!rows[0]) return res.status(404).json({ error: 'Not found' })

    const ingResult = await pool.query(`
      SELECT ri.amount, ri.unit, ri.optional,
             i.id AS ingredient_id, i.name AS ingredient_name, i.category,
             EXISTS(SELECT 1 FROM cabinet c WHERE c.ingredient_id = i.id AND c.in_stock = TRUE) AS in_stock
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE ri.recipe_id = $1
      ORDER BY ri.id
    `, [req.params.id])

    res.json({ ...rows[0], ingredients: ingResult.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/recipes
router.post('/', async (req, res) => {
  const { name, description, instructions, glass_type, ingredients } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `INSERT INTO recipes (name, description, instructions, glass_type) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, description || null, instructions || null, glass_type || null]
    )
    const recipe = rows[0]

    for (const ing of (ingredients || [])) {
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional) VALUES ($1,$2,$3,$4,$5)`,
        [recipe.id, ing.ingredient_id, ing.amount || null, ing.unit || null, ing.optional || false]
      )
    }

    await client.query('COMMIT')
    res.status(201).json(recipe)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PUT /api/recipes/:id
router.put('/:id', async (req, res) => {
  const { name, description, instructions, glass_type, ingredients } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `UPDATE recipes SET name=$1, description=$2, instructions=$3, glass_type=$4 WHERE id=$5 RETURNING *`,
      [name, description || null, instructions || null, glass_type || null, req.params.id]
    )
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }) }

    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id=$1', [req.params.id])

    for (const ing of (ingredients || [])) {
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional) VALUES ($1,$2,$3,$4,$5)`,
        [req.params.id, ing.ingredient_id, ing.amount || null, ing.unit || null, ing.optional || false]
      )
    }

    await client.query('COMMIT')
    res.json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
