import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import { getCurrentRole } from '../lib/authRole.js'

function pageTitle(pathname, role) {
  const path = pathname.replace(/\/$/, '') || pathname
  if (path.includes('/responsables/new')) return 'Ajouter responsable'
  if (path.includes('/responsables/') && path.endsWith('/edit')) return 'Modifier responsable'
  if (path.includes('/responsables')) return 'Responsables'

  const clean = path.replace('/responsable', '/admin')
  if (clean.startsWith('/admin/responsables/new')) return 'Ajouter responsable'
  if (clean.startsWith('/admin/responsables/') && clean.endsWith('/edit')) return 'Modifier responsable'
  if (clean.startsWith('/admin/responsables')) return 'Responsables'
  if (clean === '/admin') return 'Dashboard'
  if (clean.startsWith('/admin/stagiaires/new')) return 'Ajouter stagiaire'
  if (clean.startsWith('/admin/stagiaires/') && clean.endsWith('/edit')) return 'Modifier stagiaire'
  if (clean.startsWith('/admin/stagiaires')) return 'Stagiaires'
  if (clean.startsWith('/admin/chambres/new')) return 'Ajouter chambre'
  if (clean.startsWith('/admin/chambres/') && clean.endsWith('/edit')) return 'Modifier chambre'
  if (clean.startsWith('/admin/chambres')) return 'Chambres'
  if (clean.startsWith('/admin/paiements/new')) return 'Ajouter paiement'
  if (clean.startsWith('/admin/paiements')) return 'Paiements'
  if (clean.startsWith('/admin/demandes')) return 'Demandes'
  if (clean.startsWith('/admin/sorties')) return 'Registre des sorties'
  if (clean.startsWith('/admin/reclamations')) return 'Reclamations'
  if (clean.startsWith('/admin/actions')) return 'Historique des actions'
  return 'Dashboard'
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const role = getCurrentRole()

  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),#f0f9ff] text-text">
      <Sidebar />
      <main className="min-h-screen overflow-x-hidden px-4 pb-10 sm:px-6 lg:ml-20 lg:px-10">
        <Topbar title={pageTitle(pathname, role)} />
        <Outlet />
      </main>
    </div>
  )
}
