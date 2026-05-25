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
import { getCurrentRole } from '../../lib/authRole.js'

function makeItems(basePath, role) {
  return [
    { label: 'Dashboard', to: basePath, icon: LayoutDashboard, end: true },
    { label: 'Stagiaires', to: `${basePath}/stagiaires`, icon: UsersRound },
    { label: 'Demandes', to: `${basePath}/demandes`, icon: FileCheck2 },
    { label: 'Chambres', to: `${basePath}/chambres`, icon: BedDouble },
    { label: 'Paiements', to: `${basePath}/paiements`, icon: CreditCard },
    { label: 'Sorties', to: `${basePath}/presences`, icon: ClipboardCheck },
    { label: 'Reclamations', to: `${basePath}/reclamations`, icon: MessageSquareText },
    { label: 'Responsables', to: '/admin/responsables', icon: UserCog, adminOnly: true }
  ].filter((item) => !item.adminOnly || role === 'admin')
}

export default function Sidebar() {
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const visibleItems = makeItems(basePath, role)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-white/95 px-4 py-5 shadow-soft backdrop-blur-xl lg:block">
      <Logo compact />

      <nav className="mt-10 space-y-1">
        {visibleItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition',
                isActive ? 'text-primary' : 'text-slate-600 hover:bg-cyan-soft hover:text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-cyan-soft"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
