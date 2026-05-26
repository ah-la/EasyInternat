import { NavLink } from 'react-router-dom'
import {
  BedDouble,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  MessageSquareText,
  UserCog,
  UsersRound
} from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from '../Logo.jsx'
import { cn } from '../../lib/cn.js'
import { getCurrentRole, getRoleInfo } from '../../lib/authRole.js'

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
        { label: 'Sorties', to: `${basePath}/presences`, icon: ClipboardCheck },
        { label: 'Reclamations', to: `${basePath}/reclamations`, icon: MessageSquareText }
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

  return (
    <aside className="sidebar-scrollbar group/sidebar fixed inset-y-0 left-0 z-30 hidden w-20 overflow-y-auto overflow-x-hidden border-r border-sky-100 bg-white/95 px-3 py-5 shadow-[18px_0_50px_rgba(14,165,233,0.08)] backdrop-blur-2xl transition-all duration-300 hover:w-72 hover:px-4 lg:block">
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-secondary/40 to-transparent" />
      <div className="w-14 overflow-hidden transition-all duration-300 group-hover/sidebar:w-64">
        <Logo compact />
      </div>

      <div className="mt-6 hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-cyan-soft via-white to-white p-4 shadow-subtle group-hover/sidebar:block">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">EasyInternat</p>
        <p className="mt-2 text-sm font-bold text-primary">{roleInfo.label}</p>
        <p className="mt-1 text-xs font-medium text-muted">{roleInfo.subtitle}</p>
      </div>

      <nav className="mt-8 space-y-7 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 hidden px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 group-hover/sidebar:block">{section.title}</p>
            <div className="space-y-1.5">
              {section.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-12 items-center gap-3 overflow-hidden rounded-xl px-2 text-sm font-bold transition-all duration-200 group-hover/sidebar:px-3',
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
                          <span className="absolute left-0 top-2 z-10 h-8 w-1 rounded-r-full bg-secondary shadow-[0_0_18px_rgba(14,165,233,0.75)]" />
                        </>
                      )}
                      <span
                        className={cn(
                          'relative z-10 grid h-9 w-9 place-items-center rounded-xl transition',
                          isActive ? 'bg-secondary text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-secondary'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="relative z-10 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
