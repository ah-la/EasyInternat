import { NavLink, useNavigate } from 'react-router-dom'
import {
  BedDouble,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  UserCog,
  UsersRound
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn.js'
import { getCurrentRole, getRoleInfo } from '../../lib/authRole.js'
import { logoutUser } from '../../lib/logout.js'

function makeItems(basePath, role) {
  return [
    {
      title: 'Vue generale',
      items: [{ label: 'Dashboard', to: basePath, icon: LayoutDashboard, end: true }]
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Stagiaires', to: `${basePath}/stagiaires`, icon: UsersRound },
        { label: 'Demandes', to: `${basePath}/demandes`, icon: FileCheck2 },
        { label: 'Chambres', to: `${basePath}/chambres`, icon: BedDouble },
        { label: 'Paiements', to: `${basePath}/paiements`, icon: CreditCard },
        { label: 'Responsables', to: '/admin/responsables', icon: UserCog, adminOnly: true }
      ]
    },
    {
      title: 'Suivi',
      items: [
        { label: 'Sorties', to: `${basePath}/sorties`, icon: ClipboardCheck },
        { label: 'Reclamations', to: `${basePath}/reclamations`, icon: MessageSquareText },
        { label: 'Historique', to: '/admin/actions', icon: History, adminOnly: true }
      ]
    }
  ].filter((item) => !item.adminOnly || role === 'admin')
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || role === 'admin')
    }))
    .filter((section) => section.items.length > 0)
}

export default function Sidebar() {
  const role = getCurrentRole()
  const roleInfo = getRoleInfo(role)
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const sections = makeItems(basePath, role)
  const navigate = useNavigate()

  const logout = async () => {
    await logoutUser()
    navigate('/', { replace: true })
  }

  return (
    <aside className="sidebar-scrollbar group/sidebar fixed inset-y-0 left-0 z-30 hidden w-20 overflow-y-auto overflow-x-hidden border-r border-sky-100 bg-white/95 px-3 py-4 shadow-[18px_0_50px_rgba(14,165,233,0.08)] backdrop-blur-2xl transition-all duration-300 hover:w-72 hover:px-4 lg:block">
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-secondary/40 to-transparent" />
      <div className="h-16 w-14 overflow-hidden transition-all duration-300 group-hover/sidebar:w-64">
        <img
          src="/assets/easyinternat-logo-transparent.png"
          alt="EasyInternat"
          className="h-16 w-48 max-w-none object-contain object-left transition-all duration-300 group-hover/sidebar:h-20 group-hover/sidebar:w-64"
        />
      </div>

      <div className="mt-4 hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-cyan-soft via-white to-white p-4 shadow-subtle group-hover/sidebar:block">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">EasyInternat</p>
        <p className="mt-2 text-sm font-bold text-primary">{roleInfo.label}</p>
        <p className="mt-1 text-xs font-medium text-muted">{roleInfo.subtitle}</p>
      </div>

      <nav className="mt-6 space-y-5 pb-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 hidden px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 group-hover/sidebar:block">{section.title}</p>
            <div className="space-y-1">
              {section.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={label}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-10 items-center gap-3 overflow-visible rounded-xl px-2 text-sm font-bold transition-all duration-200 group-hover/sidebar:px-3',
                      isActive
                        ? 'translate-x-1 text-primary shadow-[0_14px_30px_rgba(14,165,233,0.16)]'
                        : 'text-slate-600 hover:translate-x-1 hover:bg-cyan-soft/80 hover:text-primary'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <>
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl border border-secondary/20 bg-gradient-to-r from-cyan-soft via-white to-white"
                            transition={{ duration: 0.22 }}
                          />
                          <span className="absolute left-0 top-2 z-10 h-6 w-1 rounded-r-full bg-secondary shadow-[0_0_18px_rgba(14,165,233,0.75)]" />
                        </>
                      )}
                      <span
                        className={cn(
                          'relative z-10 grid h-8 w-8 place-items-center rounded-xl transition',
                          isActive ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-secondary'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="relative z-10 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">{label}</span>
                      <span className="pointer-events-none absolute left-14 z-30 hidden rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs font-black text-primary shadow-[0_16px_32px_rgba(7,59,92,0.14)] group-hover:flex group-hover/sidebar:hidden">
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 hidden px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 group-hover/sidebar:block">Session</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={logout}
              title="Deconnexion"
              className="group relative flex h-10 w-full items-center gap-3 overflow-visible rounded-xl px-2 text-sm font-bold text-slate-500 transition-all duration-200 hover:translate-x-1 hover:bg-red-50 hover:text-danger group-hover/sidebar:px-3"
            >
              <span className="relative z-10 grid h-8 w-8 place-items-center rounded-xl bg-slate-50 transition group-hover:bg-white group-hover:text-danger">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="relative z-10 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">Deconnexion</span>
              <span className="pointer-events-none absolute left-14 z-30 hidden rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-black text-danger shadow-[0_16px_32px_rgba(7,59,92,0.14)] group-hover:flex group-hover/sidebar:hidden">
                Deconnexion
              </span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}
