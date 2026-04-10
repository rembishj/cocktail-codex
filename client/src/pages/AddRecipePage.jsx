import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, X, ChevronDown } from 'lucide-react'
import { api } from '../api/client'

const GLASS_TYPES = [
  'Rocks / Old Fashioned', 'Coupe', 'Martini', 'Highball', 'Collins',
  'Cocktail', 'Wine', 'Champagne Flute', 'Shot', 'Mug', 'Hurricane', 'Tiki',
]

const UNITS = ['oz', 'ml', 'cl', 'tsp', 'tbsp', 'dash', 'dashes', 'splash', 'drop', 'whole', 'slice', 'wedge', 'sprig', 'twist', 'cube', 'top']

const CATEGORIES = ['spirit', 'liqueur', 'wine', 'beer', 'mixer', 'juice', 'syrup', 'bitters', 'garnish', 'other']

export default function AddRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    description: '',
    instructions: '',
    glass_type: '',
  })
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingRecipe, setLoadingRecipe] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    api.getRecipe(id).then(recipe => {
      setForm({
        name: recipe.name,
        description: recipe.description || '',
        instructions: recipe.instructions || '',
        glass_type: recipe.glass_type || '',
      })
      setIngredients(recipe.ingredients.map(i => ({
        ingredient_id: i.ingredient_id,
        name: i.ingredient_name,
        amount: i.amount ? String(i.amount) : '',
        unit: i.unit || '',
        optional: i.optional,
        category: i.category,
      })))
    }).catch(() => navigate('/'))
      .finally(() => setLoadingRecipe(false))
  }, [id, isEdit, navigate])

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { ingredient_id: null, name: '', amount: '', unit: 'oz', optional: false, category: 'other' }])
  }

  function removeIngredient(idx) {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
  }

  function updateIngredient(idx, updates) {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, ...updates } : ing))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    try {
      // Ensure all ingredients exist in DB
      const resolvedIngredients = await Promise.all(
        ingredients
          .filter(i => i.name.trim())
          .map(async (ing) => {
            let ingredientId = ing.ingredient_id
            if (!ingredientId) {
              const created = await api.createIngredient({ name: ing.name.trim(), category: ing.category })
              ingredientId = created.id
            }
            return {
              ingredient_id: ingredientId,
              amount: ing.amount ? parseFloat(ing.amount) : null,
              unit: ing.unit || null,
              optional: ing.optional,
            }
          })
      )

      const payload = { ...form, ingredients: resolvedIngredients }
      if (isEdit) {
        await api.updateRecipe(id, payload)
        navigate(`/recipe/${id}`)
      } else {
        const recipe = await api.createRecipe(payload)
        navigate(`/recipe/${recipe.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingRecipe) return (
    <div className="max-w-md mx-auto px-4 pt-14 animate-pulse">
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-zinc-900 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur z-10 px-4 pt-12 pb-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Link to={isEdit ? `/recipe/${id}` : '/'} className="p-1 -ml-1 text-zinc-400 hover:text-zinc-200">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-zinc-100">{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Basic info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Old Fashioned"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Glass</label>
            <div className="relative">
              <select
                value={form.glass_type}
                onChange={e => setField('glass_type', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 appearance-none focus:outline-none focus:border-amber-500"
              >
                <option value="">Select glass...</option>
                {GLASS_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Description</label>
            <textarea
              placeholder="Brief description..."
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Ingredients</h2>
            <button type="button" onClick={addIngredient} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.length === 0 && (
              <button
                type="button"
                onClick={addIngredient}
                className="w-full py-4 border border-dashed border-zinc-800 rounded-xl text-sm text-zinc-600 hover:border-zinc-700 hover:text-zinc-500 transition-colors"
              >
                + Add first ingredient
              </button>
            )}

            {ingredients.map((ing, idx) => (
              <IngredientRow
                key={idx}
                ing={ing}
                onChange={updates => updateIngredient(idx, updates)}
                onRemove={() => removeIngredient(idx)}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Instructions</label>
          <textarea
            placeholder="Step-by-step instructions..."
            value={form.instructions}
            onChange={e => setField('instructions', e.target.value)}
            rows={5}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Recipe'}
        </button>
      </form>
    </div>
  )
}

function IngredientRow({ ing, onChange, onRemove }) {
  const [query, setQuery] = useState(ing.name || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showCategory, setShowCategory] = useState(!ing.ingredient_id)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  function handleNameChange(value) {
    setQuery(value)
    onChange({ name: value, ingredient_id: null })
    setShowSuggestions(true)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (value.trim().length < 1) { setSuggestions([]); return }
      const results = await api.getIngredients(value.trim())
      setSuggestions(results)
    }, 200)
  }

  function selectSuggestion(suggestion) {
    setQuery(suggestion.name)
    onChange({ name: suggestion.name, ingredient_id: suggestion.id, category: suggestion.category })
    setSuggestions([])
    setShowSuggestions(false)
    setShowCategory(false)
  }

  const showCreateOption = query.trim() && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase())

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        {/* Name input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ingredient name"
            value={query}
            onChange={e => handleNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
          />

          {showSuggestions && (suggestions.length > 0 || showCreateOption) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <span className="text-xs text-zinc-500">{s.category}</span>
                </button>
              ))}
              {showCreateOption && (
                <button
                  type="button"
                  onMouseDown={() => { onChange({ name: query.trim(), ingredient_id: null }); setShowSuggestions(false); setShowCategory(true) }}
                  className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:bg-zinc-700 border-t border-zinc-700"
                >
                  + Create "{query.trim()}"
                </button>
              )}
            </div>
          )}
        </div>

        {/* Amount */}
        <input
          type="number"
          placeholder="Amt"
          value={ing.amount}
          onChange={e => onChange({ amount: e.target.value })}
          min="0"
          step="0.25"
          className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100 text-center focus:outline-none focus:border-amber-500"
        />

        {/* Unit */}
        <div className="relative w-20">
          <select
            value={ing.unit}
            onChange={e => onChange({ unit: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100 appearance-none focus:outline-none focus:border-amber-500"
          >
            <option value="">—</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <button type="button" onClick={onRemove} className="p-2 text-zinc-600 hover:text-red-400">
          <X size={16} />
        </button>
      </div>

      {/* Category (for new ingredients) + Optional toggle */}
      <div className="flex items-center gap-3 px-1">
        {showCategory && !ing.ingredient_id && (
          <div className="relative flex-1">
            <select
              value={ing.category}
              onChange={e => onChange({ category: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 appearance-none focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none ml-auto">
          <input
            type="checkbox"
            checked={ing.optional}
            onChange={e => onChange({ optional: e.target.checked })}
            className="rounded accent-amber-500"
          />
          Optional
        </label>
      </div>
    </div>
  )
}
