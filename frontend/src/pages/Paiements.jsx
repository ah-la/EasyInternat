import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const columns = [
  { accessorKey: 'mois', header: 'Mois' },
  { accessorKey: 'stagiaire', header: 'Stagiaire' },
  { accessorKey: 'montant', header: 'Montant' },
  { accessorKey: 'statut', header: 'Statut' },
  { accessorKey: 'date', header: 'Date paiement' }
]

export default function Paiements() {
  const [rows, setRows] = useState([])
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'

  useEffect(() => {
    Promise.all([store.getStagiaires(), store.getPaiements()]).then(([stagiaires, paiements]) => {
      const visibleStagiaires = filterStagiairesByRole(stagiaires, role)
      setRows(paiements.filter((paiement) => visibleStagiaires.some((stagiaire) => stagiaire.nom === paiement.stagiaire)))
    })
  }, [role])

  return (
    <DataTable
      title="Paiements"
      columns={columns}
      rows={rows}
      showHeading={false}
      actions={
        <Button as={Link} to={`${basePath}/paiements/new`}>
          <Plus className="h-4 w-4" />
          Ajouter paiement
        </Button>
      }
    />
  )
}
