import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

export default function Stagiaires() {
  const [rows, setRows] = useState([])
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const visibleRows = useMemo(() => filterStagiairesByRole(rows, role), [rows, role])

  useEffect(() => {
    store.getStagiaires().then(setRows).catch(() => setRows([]))
  }, [])

  const deleteRow = async (id) => {
    await store.deleteStagiaire(id)
    setRows((current) => current.filter((row) => row.id !== id))
  }

  const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nom', header: 'Stagiaire' },
    { accessorKey: 'cin', header: 'CIN' },
    { accessorKey: 'genre', header: 'Genre' },
    { accessorKey: 'chambre', header: 'Chambre' },
    { accessorKey: 'paiement', header: 'Paiement' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-2">
          <Link
            to={`${basePath}/stagiaires/${row.original.id}/edit`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2 text-xs font-semibold text-primary hover:border-secondary/50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Link>
          <button
            type="button"
            onClick={() => deleteRow(row.original.id)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-100 bg-white px-2 text-xs font-semibold text-danger hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      title="Stagiaires"
      columns={columns}
      rows={visibleRows}
      showHeading={false}
      actions={
        <Button as={Link} to={`${basePath}/stagiaires/new`}>
          <Plus className="h-4 w-4" />
          Ajouter stagiaire
        </Button>
      }
    />
  )
}
