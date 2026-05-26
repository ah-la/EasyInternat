import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

export default function Sorties() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', chambre: '', statut: '', date: '' })
  const role = getCurrentRole()

  useEffect(() => {
    setLoading(true)
    store.getSorties(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  const updateStatus = async (id, statut) => {
    await store.updateSortie(id, { statut: statut === 'Validee' ? 'validee' : 'refusee' })
    setRows((current) => current.map((row) => (row.id === id ? { ...row, statut } : row)))
  }

  const columns = [
    { accessorKey: 'id', header: 'Ref.' },
    { accessorKey: 'stagiaire', header: 'Stagiaire' },
    { accessorKey: 'genre', header: 'Genre' },
    { accessorKey: 'dateSortie', header: 'Date sortie' },
    { accessorKey: 'dateRetour', header: 'Date retour' },
    { accessorKey: 'motif', header: 'Motif' },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Validee')}
            title="Valider"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 bg-white text-success shadow-subtle transition hover:scale-105 hover:bg-green-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Refusee')}
            title="Refuser"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-danger shadow-subtle transition hover:scale-105 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      title="Sorties"
      columns={columns}
      rows={rows}
      loading={loading}
      showHeading={false}
      filters={
        <div className="flex flex-wrap items-center gap-2">
          {role === 'admin' ? (
            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            >
              <option value="">Tous</option>
              <option value="filles">Filles</option>
              <option value="garcons">Garcons</option>
            </select>
          ) : null}
          <input
            value={filters.chambre}
            onChange={(event) => setFilters((current) => ({ ...current, chambre: event.target.value }))}
            placeholder="Chambre"
            className="h-10 w-28 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
          <select
            value={filters.statut}
            onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
          >
            <option value="">Statut</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validee</option>
            <option value="refusee">Refusee</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
            className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
        </div>
      }
    />
  )
}
