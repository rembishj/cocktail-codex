const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const pool = require('./db')
const recipesRouter = require('./routes/recipes')
const ingredientsRouter = require('./routes/ingredients')
const cabinetRouter = require('./routes/cabinet')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/recipes', recipesRouter)
app.use('/api/ingredients', ingredientsRouter)
app.use('/api/cabinet', cabinetRouter)

// Initialize DB schema on startup, seed if empty
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  try {
    await pool.query(schema)
    console.log('Database schema initialized')
  } catch (err) {
    console.error('Schema init error:', err.message)
  }

  // Seed classic cocktails if no recipes exist
  const { rows } = await pool.query('SELECT COUNT(*) FROM recipes')
  if (parseInt(rows[0].count) === 0) {
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
    try {
      await pool.query(seed)
      console.log('Database seeded with classic cocktails')
    } catch (err) {
      console.error('Seed error:', err.message)
    }
  }
}

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
