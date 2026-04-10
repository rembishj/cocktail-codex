import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { api } from '../api/client'
import RecipeCard from '../components/RecipeCard'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [canMake, setCanMake] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getRecipes({
        search: search || undefined,
        canMake: canMake ? 'true' : undefined,
        ingredient: selectedIngredient || undefined,
      })
      setRecipes(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, canMake, selectedIngredient])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  useEffect(() => {
    api.getIngredients().then(setIngredients).catch(() => {})
  }, [])

  const activeFilters = (canMake ? 1 : 0) + (selectedIngredient ? 1 : 0)

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

            {/* Ingredient filter */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Filter by ingredient</label>
              <div className="relative">
                <select
                  value={selectedIngredient}
                  onChange={e => setSelectedIngredient(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 appearance-none focus:outline-none focus:border-amber-500"
                >
                  <option value="">Any ingredient</option>
                  {ingredients.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setCanMake(false); setSelectedIngredient('') }}
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

        {!loading && !error && recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
