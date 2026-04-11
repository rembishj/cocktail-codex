import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

function getBaseSpirit(recipe) {
  const spirits = recipe.ingredients
    .filter(i => i.category === 'spirit' && !i.optional)
    .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
  return spirits[0]?.ingredient_name || 'Other'
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getRecipes().then(setRecipes).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const spiritGroups = useMemo(() => {
    const groups = {}
    for (const recipe of recipes) {
      const spirit = getBaseSpirit(recipe)
      if (!groups[spirit]) groups[spirit] = []
      groups[spirit].push(recipe)
    }
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Other') return 1
      if (b === 'Other') return -1
      return a.localeCompare(b)
    })
  }, [recipes])

  return (
    <div className="max-w-md mx-auto">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-bold text-amber-400">Cocktail Codex</h1>
        <p className="text-sm text-zinc-500 mt-1">Select a spirit to browse recipes</p>
      </div>

      <div className="px-4 py-2">
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && spiritGroups.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-1">No recipes yet</p>
            <p className="text-sm">Tap + to add your first recipe</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 gap-3">
            {spiritGroups.map(([spirit, spiritRecipes]) => {
              const canMakeCount = spiritRecipes.filter(r => r.can_make).length
              return (
                <button
                  key={spirit}
                  onClick={() => navigate(`/spirit/${encodeURIComponent(spirit)}`)}
                  className="flex flex-col justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-28 text-left active:bg-zinc-800 transition-colors"
                >
                  <span className="text-base font-semibold text-zinc-100 leading-tight">{spirit}</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xs text-zinc-500">
                      {spiritRecipes.length} {spiritRecipes.length === 1 ? 'recipe' : 'recipes'}
                    </span>
                    {canMakeCount > 0 && (
                      <span className="text-xs text-emerald-400">
                        {canMakeCount} ready
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
