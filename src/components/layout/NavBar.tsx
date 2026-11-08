import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
  }`

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          Roadmad · <span className="text-slate-400">Formaciones</span>
        </span>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Roadmap
          </NavLink>
          <NavLink to="/product-definitions" className={linkClass}>
            Producto
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
