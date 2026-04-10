CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'other'
    CHECK (category IN ('spirit', 'liqueur', 'wine', 'beer', 'mixer', 'juice', 'syrup', 'bitters', 'garnish', 'other'))
);

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  glass_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  amount DECIMAL(8,2),
  unit VARCHAR(50),
  optional BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS cabinet (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE UNIQUE,
  in_stock BOOLEAN DEFAULT TRUE,
  notes TEXT
);
