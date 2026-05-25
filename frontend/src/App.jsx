import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import PublicLayout from './layouts/PublicLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Stagiaires from './pages/Stagiaires.jsx'
import StagiaireForm from './pages/StagiaireForm.jsx'
import StagiaireProfile from './pages/StagiaireProfile.jsx'
import Chambres from './pages/Chambres.jsx'
import ChambreForm from './pages/ChambreForm.jsx'
import Paiements from './pages/Paiements.jsx'
import PaiementForm from './pages/PaiementForm.jsx'
import Presences from './pages/Presences.jsx'
import Reclamations from './pages/Reclamations.jsx'
import Responsables from './pages/Responsables.jsx'
import ResponsableForm from './pages/ResponsableForm.jsx'
import Demandes from './pages/Demandes.jsx'
import StagiairePresence from './pages/StagiairePresence.jsx'
import StagiaireReclamation from './pages/StagiaireReclamation.jsx'

export default function App() {
  return (
    <>
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
            <Route path="presences" element={<Presences />} />
            <Route path="reclamations" element={<Reclamations />} />
            <Route path="responsables" element={<Responsables />} />
            <Route path="responsables/new" element={<ResponsableForm />} />
            <Route path="responsables/:id/edit" element={<ResponsableForm />} />
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
            <Route path="presences" element={<Presences />} />
            <Route path="reclamations" element={<Reclamations />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['stagiaire']} />}>
          <Route path="/stagiaire/presence" element={<StagiairePresence />} />
          <Route path="/stagiaire/reclamation" element={<StagiaireReclamation />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}
