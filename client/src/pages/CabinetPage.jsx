import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, ChevronDown, ChevronRight, Package } from 'lucide-react'
import { api } from '../api/client'

const CATEGORY_ORDER = ['spirit', 'liqueur', 'wine', 'beer', 'mixer', 'juice', 'syrup', 'bitters', 'garnish', 'other']

const CATEGORY_LABEL = {
  spirit: 'Spirits', liqueur: 'Liqueurs', wine: 'Wine', beer: 'Beer',
  mixer: 'Mixers', juice: 'Juices', syrup: 'Syrups', bitters: 'Bitters',
  garnish: 'Garnishes', other: 'Other',
}

const CATEGORIES = ['spirit', 'liqueur', 'wine', 'beer', 'mixer', 'juice', 'syrup', 'bitters', 'garnish', 'other']

export default function CabinetPage() {
  const [cabinet, setCabinet] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('spirit')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.getCabinet()
      .then(setCabinet)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggleStock(ingredient) {
    const updated = { ...ingredient, in_stock: !ingredient.in_stock }
    setCabinet(prev => prev.map(i => i.id === ingredient.id ? updated : i))
    try {
      await api.updateCabinet(ingredient.id, { in_stock: updated.in_stock, notes: ingredient.notes })
    } catch {
      setCabinet(prev => prev.map(i => i.id === ingredient.id ? ingredient : i))
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    try {
      const ing = await api.createIngredient({ name: newName.trim(), category: newCategory })
      await api.updateCabinet(ing.id, { in_stock: true })
      const updated = await api.getCabinet()
      setCabinet(updated)
      setNewName('')
      setShowAdd(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return cabinet
    return cabinet.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  }, [cabinet, search])

  const grouped = useMemo(() => {
    const groups = {}
    for (const item of filtered) {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    return groups
  }, [filtered])

  const totalInStock = cabinet.filter(i => i.in_stock).length
  const total = cabinet.length

  function toggleCollapse(cat) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur z-10 px-4 pt-12 pb-3 border-b border-zinc-800/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">Cabinet</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{totalInStock} of {total} in stock</p>
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Add ingredient form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="mb-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ingredient name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <div className="relative">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100 appearance-none focus:outline-none pr-6"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding || !newName.trim()}
                className="flex-1 py-2 bg-amber-500 disabled:opacity-40 text-zinc-950 text-sm font-semibold rounded-lg"
              >
                {adding ? 'Adding...' : 'Add to Cabinet'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 text-zinc-500 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            placeholder="Search ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {loading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && total === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Your cabinet is empty.</p>
            <p className="text-xs mt-1">Add ingredients to get started.</p>
          </div>
        )}

        {!loading && CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(cat => (
          <div key={cat}>
            <button
              onClick={() => toggleCollapse(cat)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-400"
            >
              <span>{CATEGORY_LABEL[cat]}</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">
                  {grouped[cat].filter(i => i.in_stock).length}/{grouped[cat].length}
                </span>
                {collapsed[cat]
                  ? <ChevronRight size={14} />
                  : <ChevronDown size={14} />
                }
              </div>
            </button>

            {!collapsed[cat] && (
              <div className="space-y-1.5">
                {grouped[cat].map(ingredient => (
                  <CabinetItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    onToggle={() => toggleStock(ingredient)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CabinetItem({ ingredient, onToggle }) {
  const { name, in_stock } = ingredient
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors active:scale-[0.98] ${
        in_stock
          ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
          : 'bg-zinc-950 border-zinc-900 text-zinc-500'
      }`}
    >
      <span className="text-sm font-medium">{name}</span>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        in_stock
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-zinc-700'
      }`}>
        {in_stock && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}
