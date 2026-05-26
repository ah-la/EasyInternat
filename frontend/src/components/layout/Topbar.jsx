import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BedDouble, ClipboardCheck, CreditCard, FileCheck2, LayoutDashboard, LogOut, MessageSquareText, UserRound, UsersRound } from 'lucide-react'
import { cn } from '../../lib/cn.js'
import { clearCurrentRole, getCurrentRole, getRoleInfo } from '../../lib/authRole.js'

function mobileItems(basePath, roleName) {
  return [
    { label: 'Dashboard', to: basePath, icon: LayoutDashboard },
    { label: 'Stagiaires', to: `${basePath}/stagiaires`, icon: UsersRound },
    { label: 'Demandes', to: `${basePath}/demandes`, icon: FileCheck2 },
    { label: 'Chambres', to: `${basePath}/chambres`, icon: BedDouble },
    { label: 'Paiements', to: `${basePath}/paiements`, icon: CreditCard },
    { label: 'Sorties', to: `${basePath}/presences`, icon: ClipboardCheck },
    { label: 'Reclamations', to: `${basePath}/reclamations`, icon: MessageSquareText },
    { label: 'Responsables', to: '/admin/responsables', icon: UsersRound, adminOnly: true }
  ].filter((item) => !item.adminOnly || roleName === 'admin')
}

export default function Topbar({ title = 'Dashboard' }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const roleName = getCurrentRole()
  const role = getRoleInfo(roleName)
  const basePath = roleName === 'admin' ? '/admin' : '/responsable'

  const logout = () => {
    clearCurrentRole()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-8 border-b border-sky-100 bg-bg/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-normal text-primary">{title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-sky-100 bg-white/90 px-3 text-left shadow-subtle">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-soft text-primary">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold text-primary">{role.label}</span>
              <span className="block text-xs text-muted">{role.subtitle}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex h-12 items-center gap-2 rounded-2xl border border-sky-100 bg-white/90 px-3 text-sm font-bold text-primary shadow-subtle transition hover:scale-[1.02] hover:border-danger/40 hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Deconnexion</span>
          </button>
        </div>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2 pb-1 lg:hidden">
        {mobileItems(basePath, roleName).map(({ label, to, icon: Icon }) => {
          const active = pathname === to

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-bold transition',
                active ? 'border-secondary/40 bg-cyan-soft text-primary' : 'border-border bg-white text-slate-600'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
