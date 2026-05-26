import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

function InfoLine({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-white px-3 py-2">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
  )
}

export default function StagiaireProfile() {
  const { id } = useParams()
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    store
      .getStagiaireProfile(id)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <Card className="text-sm font-semibold text-muted">Chargement du profil...</Card>
  }

  if (!profile) {
    return <Card className="text-sm font-semibold text-danger">Profil introuvable ou acces refuse.</Card>
  }

  const paiementColumns = [
    { accessorKey: 'mois', header: 'Mois' },
    { accessorKey: 'montant', header: 'Montant' },
    { accessorKey: 'statut', header: 'Statut', cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge> },
    { accessorKey: 'date', header: 'Date paiement' }
  ]

  const chambre = profile.chambreDetails || {}

  const reclamationColumns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'type', header: 'Categorie' },
    { accessorKey: 'sujet', header: 'Sujet' },
    { accessorKey: 'statut', header: 'Statut', cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge> },
    { accessorKey: 'reponse_admin', header: 'Reponse' }
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-secondary">Profil stagiaire</p>
          <h2 className="text-2xl font-bold text-primary">{profile.fullName}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to={`${basePath}/stagiaires`} variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button as={Link} to={`${basePath}/stagiaires/${profile.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <Card className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoLine label="Nom" value={profile.nom_simple} />
          <InfoLine label="Prenom" value={profile.prenom} />
          <InfoLine label="CIN" value={profile.cin} />
          <InfoLine label="Telephone" value={profile.telephone} />
          <InfoLine label="Email" value={profile.email} />
          <InfoLine label="Genre" value={profile.genre} />
          <InfoLine label="Filiere" value={profile.filiere} />
          <InfoLine label="Categorie" value={profile.categorie} />
        </div>
      </Card>

      <Card className="min-w-0">
        <h3 className="mb-3 text-lg font-bold text-primary">Chambre</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoLine label="Numero" value={profile.chambre || chambre.numero} />
          <InfoLine label="Etage" value={chambre.etage} />
          <InfoLine label="Capacite" value={chambre.capacite} />
          <InfoLine label="Statut" value={chambre.statut} />
        </div>
      </Card>

      <DataTable title="Paiements" columns={paiementColumns} rows={profile.paiements || []} />
      <DataTable title="Reclamations" columns={reclamationColumns} rows={profile.reclamations || []} />
    </div>
  )
}
