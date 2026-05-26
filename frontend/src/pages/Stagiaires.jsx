import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const genreClass = (genre = '') =>
  String(genre).toLowerCase().includes('fille')
    ? 'border-pink-200 bg-pink-50 text-pink-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

export default function Stagiaires() {
  const [rows, setRows] = useState([])
  const [chambres, setChambres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', category: '', chambre: '', payment_status: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const visibleRows = useMemo(() => filterStagiairesByRole(rows, role), [rows, role])

  useEffect(() => {
    setLoading(true)
    store.getStagiaires(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    store.getChambres().then(setChambres).catch(() => setChambres([]))
  }, [])

  const resetFilters = () => setFilters({ search: '', category: '', chambre: '', payment_status: '' })

  const deleteRow = async () => {
    if (!deleteTarget) return
    await store.deleteStagiaire(deleteTarget.id)
    setRows((current) => current.filter((row) => row.id !== deleteTarget.id))
    setDeleteTarget(null)
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
            onClick={() => setDeleteTarget(row.original)}
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
    <>
      <DataTable
        title="Stagiaires"
        columns={columns}
        rows={visibleRows}
        loading={loading}
        showHeading={false}
        searchable={false}
        emptyMessage="Aucun stagiaire trouve."
        actions={
          <>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Rechercher dans stagiaires..."
            className="h-11 w-full rounded-xl border border-sky-100 bg-white/90 px-3 text-sm font-semibold text-primary shadow-subtle outline-none transition placeholder:text-muted focus:border-secondary focus:ring-4 focus:ring-secondary/15 sm:w-72"
          />
          <Button as={Link} to={`${basePath}/stagiaires/new`}>
            <Plus className="h-4 w-4" />
            Ajouter stagiaire
          </Button>
          </>
        }
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
          <select
            value={filters.chambre}
            onChange={(event) => setFilters((current) => ({ ...current, chambre: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
          >
            <option value="">Chambre</option>
            {chambres.map((chambre) => (
              <option key={chambre.id} value={chambre.numero}>{chambre.numero}</option>
            ))}
          </select>
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
          <button
            type="button"
            onClick={resetFilters}
            title="Reinitialiser les filtres"
            className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      }
    />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer le stagiaire"
        message={`Vous voulez vraiment supprimer ${deleteTarget?.nom || 'ce stagiaire'} ? Cette action est definitive.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteRow}
      />
    </>
  )
}
