import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import PublicLayout from './layouts/PublicLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const Stagiaires = lazy(() => import('./pages/Stagiaires.jsx'))
const StagiaireForm = lazy(() => import('./pages/StagiaireForm.jsx'))
const StagiaireProfile = lazy(() => import('./pages/StagiaireProfile.jsx'))
const Chambres = lazy(() => import('./pages/Chambres.jsx'))
const ChambreForm = lazy(() => import('./pages/ChambreForm.jsx'))
const Paiements = lazy(() => import('./pages/Paiements.jsx'))
const PaiementForm = lazy(() => import('./pages/PaiementForm.jsx'))
const Sorties = lazy(() => import('./pages/Sorties.jsx'))
const Reclamations = lazy(() => import('./pages/Reclamations.jsx'))
const Responsables = lazy(() => import('./pages/Responsables.jsx'))
const ResponsableForm = lazy(() => import('./pages/ResponsableForm.jsx'))
const Demandes = lazy(() => import('./pages/Demandes.jsx'))
const Actions = lazy(() => import('./pages/Actions.jsx'))
const StagiaireSortie = lazy(() => import('./pages/StagiaireSortie.jsx'))
const StagiaireReclamation = lazy(() => import('./pages/StagiaireReclamation.jsx'))

function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6 text-primary">
      <div className="rounded-2xl border border-sky-100 bg-white px-5 py-4 text-sm font-black shadow-subtle">
        Chargement...
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/demande" element={<Navigate to="/" replace />} />
          </Route>

        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="stagiaires" element={<Stagiaires />} />
            <Route path="stagiaires/new" element={<StagiaireForm />} />
            <Route path="stagiaires/:id" element={<StagiaireProfile />} />
            <Route path="stagiaires/:id/edit" element={<StagiaireForm />} />
            <Route path="demandes" element={<Demandes />} />
            <Route path="chambres" element={<Chambres />} />
            <Route path="chambres/new" element={<ChambreForm />} />
            <Route path="chambres/:numero/edit" element={<ChambreForm />} />
            <Route path="paiements" element={<Paiements />} />
            <Route path="paiements/new" element={<PaiementForm />} />
            <Route path="paiements/:id/edit" element={<PaiementForm />} />
            <Route path="sorties" element={<Sorties />} />
            <Route path="reclamations" element={<Reclamations />} />
            <Route path="responsables" element={<Responsables />} />
            <Route path="responsables/new" element={<ResponsableForm />} />
            <Route path="responsables/:id/edit" element={<ResponsableForm />} />
            <Route path="actions" element={<Actions />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['responsable_filles', 'responsable_garcons']} />}>
          <Route path="/responsable" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="stagiaires" element={<Stagiaires />} />
            <Route path="stagiaires/new" element={<StagiaireForm />} />
            <Route path="stagiaires/:id" element={<StagiaireProfile />} />
            <Route path="stagiaires/:id/edit" element={<StagiaireForm />} />
            <Route path="demandes" element={<Demandes />} />
            <Route path="chambres" element={<Chambres />} />
            <Route path="chambres/new" element={<ChambreForm />} />
            <Route path="chambres/:numero/edit" element={<ChambreForm />} />
            <Route path="paiements" element={<Paiements />} />
            <Route path="paiements/new" element={<PaiementForm />} />
            <Route path="paiements/:id/edit" element={<PaiementForm />} />
            <Route path="sorties" element={<Sorties />} />
            <Route path="reclamations" element={<Reclamations />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['stagiaire']} />}>
          <Route path="/stagiaire/sortie" element={<StagiaireSortie />} />
          <Route path="/stagiaire/reclamation" element={<StagiaireReclamation />} />
        </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </>
  )
}
