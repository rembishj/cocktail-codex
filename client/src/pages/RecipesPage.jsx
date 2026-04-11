import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import RecipeCard from '../components/RecipeCard'

// Pick the spirit with the largest amount (or first listed) as the category header
function getBaseSpirit(recipe) {
  const spirits = recipe.ingredients
    .filter(i => i.category === 'spirit' && !i.optional)
    .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
  return spirits[0]?.ingredient_name || 'Other'
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [allIngredients, setAllIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [canMake, setCanMake] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState([]) // [{ id, name }]
  const [showFilters, setShowFilters] = useState(false)
  const [ingSearch, setIngSearch] = useState('')
  const [showIngDropdown, setShowIngDropdown] = useState(false)
  const [collapsed, setCollapsed] = useState({})
  const ingInputRef = useRef(null)

  const grouped = useMemo(() => {
    const groups = {}
    for (const recipe of recipes) {
      const spirit = getBaseSpirit(recipe)
      if (!groups[spirit]) groups[spirit] = []
      groups[spirit].push(recipe)
    }
    // Sort: alphabetical, "Other" always last
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => {
        if (a === 'Other') return 1
        if (b === 'Other') return -1
        return a.localeCompare(b)
      })
    )
  }, [recipes])

  function toggleCollapse(spirit) {
    setCollapsed(prev => ({ ...prev, [spirit]: !prev[spirit] }))
  }

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getRecipes({
        search: search || undefined,
        canMake: canMake ? 'true' : undefined,
        ingredients: selectedIngredients.length ? selectedIngredients.map(i => i.id) : undefined,
      })
      setRecipes(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, canMake, selectedIngredients])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  useEffect(() => {
    api.getIngredients().then(setAllIngredients).catch(() => {})
  }, [])

  function addIngredient(ing) {
    if (!selectedIngredients.find(i => i.id === ing.id)) {
      setSelectedIngredients(prev => [...prev, { id: ing.id, name: ing.name }])
    }
    setIngSearch('')
    setShowIngDropdown(false)
  }

  function removeIngredient(id) {
    setSelectedIngredients(prev => prev.filter(i => i.id !== id))
  }

  function clearFilters() {
    setCanMake(false)
    setSelectedIngredients([])
    setIngSearch('')
  }

  const filteredSuggestions = allIngredients.filter(i =>
    i.name.toLowerCase().includes(ingSearch.toLowerCase()) &&
    !selectedIngredients.find(s => s.id === i.id)
  )

  const activeFilters = (canMake ? 1 : 0) + selectedIngredients.length

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur z-10 px-4 pt-12 pb-3 border-b border-zinc-800/50">
        <h1 className="text-2xl font-bold text-amber-400 mb-3">Cocktail Codex</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search recipes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-colors ${
              activeFilters > 0
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold text-zinc-950 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            {/* Can make toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-300">Can make now</span>
              <button
                onClick={() => setCanMake(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative ${canMake ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${canMake ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </label>

            {/* Ingredient multi-select */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Must contain ingredients</label>

              {/* Selected chips */}
              {selectedIngredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedIngredients.map(ing => (
                    <span key={ing.id} className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {ing.name}
                      <button onClick={() => removeIngredient(ing.id)} className="hover:text-white">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <input
                  ref={ingInputRef}
                  type="text"
                  placeholder="Search ingredients..."
                  value={ingSearch}
                  onChange={e => { setIngSearch(e.target.value); setShowIngDropdown(true) }}
                  onFocus={() => setShowIngDropdown(true)}
                  onBlur={() => setTimeout(() => setShowIngDropdown(false), 150)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
                {showIngDropdown && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                    {filteredSuggestions.map(ing => (
                      <button
                        key={ing.id}
                        type="button"
                        onMouseDown={() => addIngredient(ing)}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                      >
                        {ing.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-2/3 mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 bg-zinc-800 rounded-full w-16" />
                  <div className="h-5 bg-zinc-800 rounded-full w-20" />
                  <div className="h-5 bg-zinc-800 rounded-full w-14" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button onClick={fetchRecipes} className="text-amber-400 text-sm underline">Retry</button>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-1">No recipes found</p>
            <p className="text-sm">Try adjusting your filters or add a new recipe</p>
          </div>
        )}

        {!loading && !error && Object.entries(grouped).map(([spirit, spiritRecipes]) => (
          <div key={spirit}>
            <button
              onClick={() => toggleCollapse(spirit)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-400"
            >
              <span>{spirit}</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 normal-case tracking-normal">{spiritRecipes.length}</span>
                {collapsed[spirit] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {!collapsed[spirit] && (
              <div className="space-y-3 mb-2">
                {spiritRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
