import { NavLink } from 'react-router-dom'
import { GlassWater, PlusCircle, Package } from 'lucide-react'

const links = [
  { to: '/', icon: GlassWater, label: 'Recipes' },
  { to: '/add', icon: PlusCircle, label: 'Add' },
  { to: '/cabinet', icon: Package, label: 'Cabinet' },
]

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 safe-bottom z-50">
      <div className="flex items-stretch max-w-md mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-3 gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
