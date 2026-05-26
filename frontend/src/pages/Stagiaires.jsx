import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const genreClass = (genre = '') =>
  String(genre).toLowerCase().includes('fille')
    ? 'border-pink-200 bg-pink-50 text-pink-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

export default function Stagiaires() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', category: '', chambre: '', payment_status: '' })
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const visibleRows = useMemo(() => filterStagiairesByRole(rows, role), [rows, role])

  useEffect(() => {
    setLoading(true)
    store.getStagiaires(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  const deleteRow = async (id) => {
    if (!window.confirm('Vous voulez vraiment supprimer ce stagiaire ?')) return
    await store.deleteStagiaire(id)
    setRows((current) => current.filter((row) => row.id !== id))
    toast.success('Stagiaire supprime avec succes.')
  }

  const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nom', header: 'Stagiaire' },
    { accessorKey: 'cin', header: 'CIN' },
    {
      accessorKey: 'genre',
      header: 'Genre',
      cell: ({ getValue }) => <Badge className={genreClass(getValue())}>{getValue()}</Badge>
    },
    { accessorKey: 'chambre', header: 'Chambre' },
    {
      accessorKey: 'paiement',
      header: 'Paiement',
      cell: ({ row, getValue }) => (
        <div className="space-y-1">
          <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
          {row.original.payment_due_month ? (
            <p className="text-xs font-semibold text-muted">Mois: {row.original.payment_due_month}</p>
          ) : null}
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`${basePath}/stagiaires/${row.original.id}`}
            title="Voir profil"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:border-secondary/50 hover:bg-cyan-soft"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`${basePath}/stagiaires/${row.original.id}/edit`}
            title="Modifier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:border-secondary/50 hover:bg-cyan-soft"
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
      title="Stagiaires"
      columns={columns}
      rows={visibleRows}
      loading={loading}
      showHeading={false}
      actions={
        <Button as={Link} to={`${basePath}/stagiaires/new`}>
          <Plus className="h-4 w-4" />
          Ajouter stagiaire
        </Button>
      }
      filters={
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Recherche"
            className="h-10 w-36 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
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
            value={filters.payment_status}
            onChange={(event) => setFilters((current) => ({ ...current, payment_status: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
          >
            <option value="">Paiement</option>
            <option value="paye">Paye</option>
            <option value="en_retard">En retard</option>
            <option value="a_payer">Non paye</option>
          </select>
        </div>
      }
    />
  )
}
