-- Ingredients
INSERT INTO ingredients (name, category) VALUES
  ('Bourbon', 'spirit'),
  ('Rye Whiskey', 'spirit'),
  ('Gin', 'spirit'),
  ('Vodka', 'spirit'),
  ('White Rum', 'spirit'),
  ('Dark Rum', 'spirit'),
  ('Tequila Blanco', 'spirit'),
  ('Mezcal', 'spirit'),
  ('Cognac', 'spirit'),
  ('Campari', 'liqueur'),
  ('Sweet Vermouth', 'wine'),
  ('Dry Vermouth', 'wine'),
  ('Triple Sec', 'liqueur'),
  ('Cointreau', 'liqueur'),
  ('Aperol', 'liqueur'),
  ('Peach Schnapps', 'liqueur'),
  ('Simple Syrup', 'syrup'),
  ('Demerara Syrup', 'syrup'),
  ('Honey Syrup', 'syrup'),
  ('Grenadine', 'syrup'),
  ('Angostura Bitters', 'bitters'),
  ('Orange Bitters', 'bitters'),
  ('Peychaud''s Bitters', 'bitters'),
  ('Lime Juice', 'juice'),
  ('Lemon Juice', 'juice'),
  ('Orange Juice', 'juice'),
  ('Pineapple Juice', 'juice'),
  ('Grapefruit Juice', 'juice'),
  ('Club Soda', 'mixer'),
  ('Ginger Beer', 'mixer'),
  ('Tonic Water', 'mixer'),
  ('Prosecco', 'wine'),
  ('Champagne', 'wine'),
  ('Maraschino Cherry', 'garnish'),
  ('Orange Peel', 'garnish'),
  ('Lime Wedge', 'garnish'),
  ('Lemon Wedge', 'garnish'),
  ('Mint', 'garnish'),
  ('Salt', 'garnish'),
  ('Cucumber', 'garnish'),
  ('Egg White', 'other'),
  ('Heavy Cream', 'other'),
  ('Coffee Liqueur', 'liqueur'),
  ('Irish Whiskey', 'spirit'),
  ('Scotch Whisky', 'spirit'),
  ('Absinthe', 'spirit')
ON CONFLICT (name) DO NOTHING;

-- Recipes

-- Old Fashioned
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Old Fashioned',
    'A timeless whiskey cocktail — the original cocktail.',
    E'1. Add sugar and bitters to a rocks glass and muddle briefly.\n2. Add bourbon and stir.\n3. Add a large ice cube.\n4. Express orange peel over the glass and use as garnish.',
    'Rocks / Old Fashioned'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Bourbon', 2, 'oz', false),
  ('Demerara Syrup', 0.25, 'oz', false),
  ('Angostura Bitters', 2, 'dashes', false),
  ('Orange Bitters', 1, 'dash', true),
  ('Orange Peel', NULL, NULL, false),
  ('Maraschino Cherry', NULL, NULL, true)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Negroni
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Negroni',
    'Equal parts classic — bitter, sweet, and spirit-forward.',
    E'1. Combine all ingredients in a mixing glass with ice.\n2. Stir for 30 seconds until well-chilled.\n3. Strain into a rocks glass over a large ice cube.\n4. Garnish with an orange peel.',
    'Rocks / Old Fashioned'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Gin', 1, 'oz', false),
  ('Campari', 1, 'oz', false),
  ('Sweet Vermouth', 1, 'oz', false),
  ('Orange Peel', NULL, NULL, false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Margarita
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Margarita',
    'The quintessential tequila cocktail — tart, bright, and refreshing.',
    E'1. Salt the rim of a rocks glass if desired.\n2. Combine tequila, lime juice, and triple sec in a shaker with ice.\n3. Shake vigorously for 15 seconds.\n4. Strain over fresh ice.\n5. Garnish with a lime wedge.',
    'Rocks / Old Fashioned'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Tequila Blanco', 2, 'oz', false),
  ('Lime Juice', 1, 'oz', false),
  ('Triple Sec', 0.75, 'oz', false),
  ('Simple Syrup', 0.25, 'oz', true),
  ('Salt', NULL, NULL, true),
  ('Lime Wedge', NULL, NULL, false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Moscow Mule
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Moscow Mule',
    'Crisp and spicy with a satisfying ginger kick.',
    E'1. Fill a copper mug with ice.\n2. Add vodka and lime juice.\n3. Top with ginger beer.\n4. Stir gently and garnish with a lime wedge and fresh mint.',
    'Mug'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Vodka', 2, 'oz', false),
  ('Lime Juice', 0.75, 'oz', false),
  ('Ginger Beer', 4, 'oz', false),
  ('Lime Wedge', NULL, NULL, false),
  ('Mint', NULL, NULL, true)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Whiskey Sour
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Whiskey Sour',
    'A balanced classic with a silky texture when made with egg white.',
    E'1. Dry shake all ingredients without ice for 10 seconds.\n2. Add ice and shake vigorously for 15 seconds.\n3. Strain into a rocks glass over ice or coupe glass straight up.\n4. Garnish with a cherry and lemon wedge.',
    'Rocks / Old Fashioned'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Bourbon', 2, 'oz', false),
  ('Lemon Juice', 0.75, 'oz', false),
  ('Simple Syrup', 0.5, 'oz', false),
  ('Egg White', NULL, NULL, true),
  ('Angostura Bitters', 2, 'dashes', true),
  ('Maraschino Cherry', NULL, NULL, false),
  ('Lemon Wedge', NULL, NULL, false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Mojito
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Mojito',
    'Fresh, minty, and perfectly refreshing.',
    E'1. Muddle mint leaves and lime juice in a Collins glass.\n2. Add rum and simple syrup.\n3. Fill with ice.\n4. Top with club soda and stir gently.\n5. Garnish with a mint sprig and lime wedge.',
    'Collins'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('White Rum', 2, 'oz', false),
  ('Lime Juice', 1, 'oz', false),
  ('Simple Syrup', 0.75, 'oz', false),
  ('Mint', NULL, 'sprig', false),
  ('Club Soda', 2, 'oz', false),
  ('Lime Wedge', NULL, NULL, false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Aperol Spritz
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Aperol Spritz',
    'Italy''s favorite aperitivo — light, bubbly, and irresistible.',
    E'1. Fill a large wine glass with ice.\n2. Add Aperol and Prosecco.\n3. Top with a splash of club soda.\n4. Garnish with an orange wedge.',
    'Wine'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Aperol', 2, 'oz', false),
  ('Prosecco', 3, 'oz', false),
  ('Club Soda', 1, 'splash', false),
  ('Orange Peel', NULL, NULL, false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Daiquiri
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Daiquiri',
    'Simple, elegant, and endlessly refreshing. One of the great classics.',
    E'1. Combine rum, lime juice, and simple syrup in a shaker with ice.\n2. Shake hard for 15 seconds.\n3. Double strain into a chilled coupe.\n4. No garnish needed.',
    'Coupe'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('White Rum', 2, 'oz', false),
  ('Lime Juice', 0.75, 'oz', false),
  ('Simple Syrup', 0.5, 'oz', false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Espresso Martini
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Espresso Martini',
    'A coffee lover''s cocktail with a beautiful frothy top.',
    E'1. Brew a fresh espresso shot and let cool slightly.\n2. Combine vodka, coffee liqueur, espresso, and simple syrup in a shaker.\n3. Dry shake first, then add ice and shake vigorously.\n4. Double strain into a chilled martini glass.\n5. Garnish with 3 coffee beans.',
    'Martini'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Vodka', 1.5, 'oz', false),
  ('Coffee Liqueur', 1, 'oz', false),
  ('Simple Syrup', 0.25, 'oz', true)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;

-- Paloma
WITH r AS (
  INSERT INTO recipes (name, description, instructions, glass_type)
  VALUES (
    'Paloma',
    'Mexico''s most popular tequila drink — tart grapefruit and bubbly.',
    E'1. Salt the rim of a highball glass if desired.\n2. Add tequila and grapefruit juice over ice.\n3. Squeeze in lime juice.\n4. Top with club soda and stir gently.\n5. Garnish with a lime wedge.',
    'Highball'
  ) RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, optional)
SELECT r.id, i.id, vals.amount, vals.unit, vals.optional
FROM r, (VALUES
  ('Tequila Blanco', 2, 'oz', false),
  ('Grapefruit Juice', 3, 'oz', false),
  ('Lime Juice', 0.5, 'oz', false),
  ('Simple Syrup', 0.25, 'oz', true),
  ('Club Soda', 1, 'splash', false),
  ('Salt', NULL, NULL, true),
  ('Lime Wedge', NULL, NULL, false)
) AS vals(name, amount, unit, optional)
JOIN ingredients i ON i.name = vals.name;
