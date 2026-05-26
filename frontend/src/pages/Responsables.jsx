import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import { store } from '../lib/store.js'

export default function Responsables() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    store.getResponsables().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [])

  const deleteRow = async (id) => {
    await store.deleteResponsable(id)
    setRows((current) => current.filter((row) => row.id !== id))
  }

  const columns = [
    { accessorKey: 'nom', header: 'Nom' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'categorie', header: 'Categorie' },
    { accessorKey: 'statut', header: 'Statut' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-nowrap items-center justify-center gap-2">
          <Link
            to={`/admin/responsables/${row.original.id}/edit`}
            title="Modifier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => deleteRow(row.original.id)}
            title="Supprimer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-danger shadow-subtle transition hover:scale-105 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      title="Responsables"
      columns={columns}
      rows={rows}
      loading={loading}
      showHeading={false}
      actions={
        <Button as={Link} to="/admin/responsables/new">
          <Plus className="h-4 w-4" />
          Ajouter responsable
        </Button>
      }
    />
  )
}
