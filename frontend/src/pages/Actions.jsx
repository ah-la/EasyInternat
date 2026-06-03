import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { store } from '../lib/store.js'

const actionLabels = {
  demande_accepted: 'Demande acceptee',
  demande_refused: 'Demande refusee',
  paiement_created: 'Paiement cree',
  paiement_updated: 'Paiement modifie',
  paiement_deleted: 'Paiement supprime',
  reclamation_answered: 'Reclamation traitee',
  sortie_status_updated: 'Sortie modifiee'
}

function labelAction(action) {
  return actionLabels[action] || action
}

export default function Actions() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ action: '', target_type: '' })

  const loadRows = () => {
    setLoading(true)
    store.getActions(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRows()
  }, [filters])

  const actionOptions = useMemo(() => [...new Set(rows.map((row) => row.action).filter(Boolean))], [rows])
  const targetOptions = useMemo(() => [...new Set(rows.map((row) => row.cible).filter(Boolean))], [rows])

  const columns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'utilisateur', header: 'Utilisateur' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ getValue }) => <span className="font-bold text-primary">{labelAction(getValue())}</span>
    },
    { accessorKey: 'cible', header: 'Module' },
    { accessorKey: 'cible_id', header: 'ID cible' },
    { accessorKey: 'description', header: 'Description' }
  ]

  return (
    <DataTable
      title="Historique des actions"
      columns={columns}
      rows={rows}
      loading={loading}
      showHeading={false}
      emptyMessage="Aucune action enregistree."
      filters={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.action}
            onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            title="Filtrer par action"
          >
            <option value="">Action</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>{labelAction(action)}</option>
            ))}
          </select>
          <select
            value={filters.target_type}
            onChange={(event) => setFilters((current) => ({ ...current, target_type: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            title="Filtrer par module"
          >
            <option value="">Module</option>
            {targetOptions.map((target) => (
              <option key={target} value={`App\\Models\\${target}`}>{target}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setFilters({ action: '', target_type: '' })}
            title="Reinitialiser"
            className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      }
    />
  )
}
