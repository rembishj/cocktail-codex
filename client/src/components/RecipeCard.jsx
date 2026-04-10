import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, GlassWater } from 'lucide-react'

const CATEGORY_COLOR = {
  spirit: 'bg-amber-500/20 text-amber-300',
  liqueur: 'bg-purple-500/20 text-purple-300',
  wine: 'bg-rose-500/20 text-rose-300',
  beer: 'bg-yellow-500/20 text-yellow-300',
  mixer: 'bg-blue-500/20 text-blue-300',
  juice: 'bg-orange-500/20 text-orange-300',
  syrup: 'bg-pink-500/20 text-pink-300',
  bitters: 'bg-red-500/20 text-red-300',
  garnish: 'bg-green-500/20 text-green-300',
  other: 'bg-zinc-500/20 text-zinc-300',
}

export default function RecipeCard({ recipe }) {
  const { id, name, glass_type, can_make, ingredients = [] } = recipe

  return (
    <Link
      to={`/recipe/${id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 active:bg-zinc-800 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-base font-semibold text-zinc-100 leading-tight">{name}</h2>
        {can_make
          ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          : <XCircle size={18} className="text-zinc-600 shrink-0 mt-0.5" />
        }
      </div>

      {glass_type && (
        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-3">
          <GlassWater size={12} />
          {glass_type}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {ingredients.map((ing) => (
          <span
            key={ing.ingredient_id}
            className={`text-xs px-2 py-0.5 rounded-full ${
              ing.optional
                ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                : ing.in_stock
                ? CATEGORY_COLOR[ing.category] || CATEGORY_COLOR.other
                : 'bg-red-950/50 text-red-400 border border-red-900/50'
            }`}
          >
            {ing.ingredient_name}
            {ing.optional && <span className="opacity-60 ml-0.5">*</span>}
          </span>
        ))}
      </div>
    </Link>
  )
}
