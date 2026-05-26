import { useEffect, useState } from 'react'
import { MessageSquareReply } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

export default function Reclamations() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', chambre: '', statut: '', type: '', date: '' })
  const role = getCurrentRole()

  useEffect(() => {
    setLoading(true)
    store.getReclamations(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  const answerReclamation = async (row) => {
    const reponse = window.prompt('Reponse admin', row.reponse_admin || '')
    if (reponse === null) return

    const updated = await store.updateReclamation(row.id, { reponse_admin: reponse, statut: 'traitee' })
    setRows((current) => current.map((item) => (item.id === row.id ? updated : item)))
  }

  const columns = [
    { accessorKey: 'id', header: 'Ref.' },
    {
      accessorKey: 'stagiaire',
      header: 'Stagiaire',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-black text-primary">{row.original.nom} {row.original.prenom}</p>
          <p className="text-xs font-semibold text-muted">CIN {row.original.cin}</p>
          <p className="text-xs font-semibold text-muted">{row.original.telephone}</p>
        </div>
      )
    },
    { accessorKey: 'chambre', header: 'Chambre' },
    {
      accessorKey: 'type',
      header: 'Categorie',
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge tone="info">{row.original.categorie}</Badge>
          <p className="text-sm font-bold text-primary">{row.original.type}</p>
        </div>
      )
    },
    {
      accessorKey: 'sujet',
      header: 'Sujet',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-bold text-primary">{row.original.sujet}</p>
          <p className="line-clamp-3 text-sm text-slate-600">{row.original.message}</p>
        </div>
      )
    },
    { accessorKey: 'statut', header: 'Statut', cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge> },
    {
      accessorKey: 'reponse_admin',
      header: 'Reponse',
      cell: ({ getValue }) => <span className="line-clamp-3 text-sm text-slate-600">{getValue() || '-'}</span>
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => answerReclamation(row.original)}
          title="Repondre"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
        >
          <MessageSquareReply className="h-4 w-4" />
        </button>
      )
    }
  ]

  return (
    <DataTable
      title="Reclamations"
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
          <input
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            placeholder="Categorie"
            className="h-10 w-32 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
          <select
            value={filters.statut}
            onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
          >
            <option value="">Statut</option>
            <option value="en_attente">En attente</option>
            <option value="traitee">Traitee</option>
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
