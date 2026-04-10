import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, CheckCircle2, XCircle, GlassWater, AlertCircle } from 'lucide-react'
import { api } from '../api/client'

const CATEGORY_COLOR = {
  spirit: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  liqueur: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  wine: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  beer: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  mixer: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  juice: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  syrup: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  bitters: 'bg-red-500/20 text-red-300 border-red-500/30',
  garnish: 'bg-green-500/20 text-green-300 border-green-500/30',
  other: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    api.getRecipe(id)
      .then(setRecipe)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await api.deleteRecipe(id)
      navigate('/')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return (
    <div className="max-w-md mx-auto px-4 pt-14 animate-pulse">
      <div className="h-8 bg-zinc-900 rounded w-1/2 mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-900 rounded-xl" />)}
      </div>
    </div>
  )

  if (!recipe) return null

  const { name, description, instructions, glass_type, can_make, ingredients = [] } = recipe
  const required = ingredients.filter(i => !i.optional)
  const optional = ingredients.filter(i => i.optional)
  const missing = required.filter(i => !i.in_stock)

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur z-10 px-4 pt-12 pb-3 border-b border-zinc-800/50">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 -ml-1 p-1">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={`/recipe/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700"
            >
              <Edit2 size={14} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                confirmDelete
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-red-400'
              }`}
            >
              <Trash2 size={14} />
              {confirmDelete ? 'Confirm' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Title + status */}
        <div>
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-2xl font-bold text-zinc-100 flex-1">{name}</h1>
            {can_make
              ? <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={22} />
              : <XCircle className="text-zinc-600 shrink-0 mt-1" size={22} />
            }
          </div>
          {glass_type && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <GlassWater size={14} />
              {glass_type}
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
        )}

        {/* Missing ingredients warning */}
        {missing.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded-xl">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">
              Missing: {missing.map(i => i.ingredient_name).join(', ')}
            </p>
          </div>
        )}

        {/* Ingredients */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Ingredients</h2>
          <div className="space-y-2">
            {required.map(ing => (
              <IngredientRow key={ing.ingredient_id} ing={ing} />
            ))}
            {optional.length > 0 && (
              <>
                <p className="text-xs text-zinc-600 pt-1">Optional</p>
                {optional.map(ing => (
                  <IngredientRow key={ing.ingredient_id} ing={ing} optional />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        {instructions && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Instructions</h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{instructions}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function IngredientRow({ ing }) {
  const colors = CATEGORY_COLOR[ing.category] || CATEGORY_COLOR.other
  const missingStyle = !ing.in_stock && !ing.optional
    ? 'bg-red-950/30 border-red-900/40 text-red-300'
    : colors

  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${missingStyle}`}>
      <span className="text-sm font-medium">{ing.ingredient_name}</span>
      {(ing.amount || ing.unit) && (
        <span className="text-sm opacity-70">
          {ing.amount && Number(ing.amount) % 1 === 0 ? parseInt(ing.amount) : ing.amount}
          {ing.unit && ` ${ing.unit}`}
        </span>
      )}
    </div>
  )
}
