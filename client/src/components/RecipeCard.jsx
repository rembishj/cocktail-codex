import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, GlassWater } from 'lucide-react'

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
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                : 'bg-red-950/60 text-red-400 border border-red-900/50'
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
