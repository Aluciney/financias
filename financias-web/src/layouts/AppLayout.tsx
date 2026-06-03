import { Calculator, LayoutDashboard, PiggyBank, Wallet } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

const linkBase = 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Wallet className="h-4 w-4" />
            </span>
            Financias
          </span>

          <div className="flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/rendimentos" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <PiggyBank className="h-4 w-4" />
              Rendimentos
            </NavLink>
            <NavLink to="/simulador" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <Calculator className="h-4 w-4" />
              Simulador
            </NavLink>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  )
}
