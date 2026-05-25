import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const columns = [
  { accessorKey: 'id', header: 'Reference' },
  { accessorKey: 'stagiaire', header: 'Stagiaire' },
  { accessorKey: 'chambre', header: 'Chambre' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'sujet', header: 'Sujet' },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'statut', header: 'Statut' },
  { accessorKey: 'priorite', header: 'Priorite' }
]

export default function Reclamations() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    Promise.all([store.getStagiaires(), store.getReclamations()]).then(([stagiaires, reclamations]) => {
      const visibleStagiaires = filterStagiairesByRole(stagiaires, getCurrentRole())
      setRows(reclamations.filter((reclamation) => visibleStagiaires.some((stagiaire) => stagiaire.nom === reclamation.stagiaire)))
    })
  }, [])

  return <DataTable title="Reclamations" columns={columns} rows={rows} showHeading={false} />
}
