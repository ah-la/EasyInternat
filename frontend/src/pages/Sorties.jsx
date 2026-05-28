import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, Eye, Trash2, UsersRound, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <Card className="rounded-3xl border-sky-100 bg-white/95 p-5 shadow-[0_18px_45px_rgba(14,165,233,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-2 text-3xl font-black text-primary">{value}</p>
        </div>
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
  )
}

function DetailsModal({ sortie, onClose }) {
  if (!sortie) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-primary">Details sortie</h2>
            <p className="mt-1 text-sm font-semibold text-muted">{sortie.stagiaire}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft" title="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Chambre', sortie.chambre || '-'],
            ['Categorie', sortie.categorie || '-'],
            ['Telephone', sortie.telephone || '-'],
            ['Date sortie', `${sortie.dateSortie || '-'} ${sortie.heureSortie || ''}`.trim()],
            ['Date retour prevue', `${sortie.dateRetour || '-'} ${sortie.heureRetour || ''}`.trim()],
            ['Statut', sortie.statut || '-'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sky-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-muted">{label}</p>
              <p className="mt-1 text-sm font-black text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-sky-100 bg-cyan-soft/50 p-4">
          <p className="text-xs font-black uppercase text-muted">Motif</p>
          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-primary">{sortie.motif || '-'}</p>
        </div>
      </div>
    </div>
  )
}

export default function Sorties() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', statut: '' })
  const [details, setDetails] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const role = getCurrentRole()
  const isAdmin = role === 'admin'

  const loadRows = () => {
    setLoading(true)
    store.getSorties(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRows()
  }, [filters])

  const summary = useMemo(() => {
    const today = todayString()
    return {
      sortiesToday: rows.filter((row) => row.dateSortieRaw === today).length,
      outside: rows.filter((row) => row.statut === 'Sorti' || row.statut === 'Retard').length,
      returnsToday: rows.filter((row) => row.dateRetourRaw === today && row.statut !== 'Retourne').length,
      late: rows.filter((row) => row.statut === 'Retard').length
    }
  }, [rows])

  const markReturned = async (sortie) => {
    setSaving(true)
    try {
      const updated = await store.updateSortie(sortie.id, { statut: 'retourne' })
      setRows((current) => current.map((row) => (row.id === sortie.id ? updated : row)))
      toast.success('Sortie marquee comme retournee.')
    } catch (error) {
      toast.error(error.response?.data?.message || "Le statut n'a pas pu etre modifie.")
    } finally {
      setSaving(false)
    }
  }

  const deleteRow = async () => {
    if (!deleteTarget) return
    try {
      await store.deleteSortie(deleteTarget.id)
      setRows((current) => current.filter((row) => row.id !== deleteTarget.id))
      toast.success('Sortie supprimee avec succes.')
    } catch (error) {
      toast.error(error.response?.data?.message || "La sortie n'a pas pu etre supprimee.")
    } finally {
      setDeleteTarget(null)
    }
  }

  const columns = [
    { accessorKey: 'stagiaire', header: 'Stagiaire' },
    { accessorKey: 'chambre', header: 'Chambre' },
    { accessorKey: 'categorie', header: 'Categorie' },
    { accessorKey: 'telephone', header: 'Telephone' },
    {
      accessorKey: 'dateSortie',
      header: 'Date sortie',
      cell: ({ row }) => (
        <div>
          <p>{row.original.dateSortie || '-'}</p>
          <p className="text-xs font-bold text-muted">{row.original.heureSortie || ''}</p>
        </div>
      )
    },
    {
      accessorKey: 'dateRetour',
      header: 'Date retour prevue',
      cell: ({ row }) => (
        <div>
          <p>{row.original.dateRetour || '-'}</p>
          <p className="text-xs font-bold text-muted">{row.original.heureRetour || ''}</p>
        </div>
      )
    },
    {
      accessorKey: 'motif',
      header: 'Motif',
      cell: ({ getValue }) => <span className="line-clamp-2">{getValue() || '-'}</span>
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={getValue() === 'Retard' ? 'danger' : statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-nowrap items-center justify-center gap-2">
          <button type="button" onClick={() => setDetails(row.original)} title="Voir details" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => markReturned(row.original)} disabled={row.original.statut === 'Retourne' || saving} title="Marquer retourne" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 bg-white text-success shadow-subtle transition hover:scale-105 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40">
            <CheckCircle2 className="h-4 w-4" />
          </button>
          {isAdmin ? (
            <button type="button" onClick={() => setDeleteTarget(row.original)} title="Supprimer" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-danger shadow-subtle transition hover:scale-105 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Sorties aujourd'hui" value={summary.sortiesToday} icon={CalendarCheck} tone="bg-cyan-soft text-primary" />
        <StatCard label="Stagiaires dehors" value={summary.outside} icon={UsersRound} tone="bg-sky-50 text-secondary" />
        <StatCard label="Retours prevus aujourd'hui" value={summary.returnsToday} icon={CheckCircle2} tone="bg-green-50 text-success" />
        <StatCard label="Retards" value={summary.late} icon={CalendarCheck} tone="bg-red-50 text-danger" />
      </div>

      <DataTable
        title="Registre des sorties"
        columns={columns}
        rows={rows}
        loading={loading}
        showHeading={false}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
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
              value={filters.statut}
              onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            >
              <option value="">Statut</option>
              <option value="sorti">Sorti</option>
              <option value="retourne">Retourne</option>
              <option value="retard">Retard</option>
            </select>
          </div>
        }
      />

      <DetailsModal sortie={details} onClose={() => setDetails(null)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la sortie"
        message={`Voulez-vous supprimer la sortie de ${deleteTarget?.stagiaire || 'ce stagiaire'} ?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteRow}
      />
    </div>
  )
}
