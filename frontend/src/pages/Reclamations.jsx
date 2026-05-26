import { useEffect, useState } from 'react'
import { Eye, MessageSquareReply, X } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const categoryClass = (category = '') =>
  String(category).toLowerCase().includes('fille')
    ? 'border-pink-200 bg-pink-50 text-pink-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

export default function Reclamations() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', chambre: '', statut: '', type: '', date: '' })
  const [selected, setSelected] = useState(null)
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
    setSelected((current) => (current?.id === row.id ? updated : current))
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
          <Badge className={categoryClass(row.original.categorie)}>{row.original.categorie}</Badge>
          <p className="text-sm font-bold text-primary">{row.original.type}</p>
        </div>
      )
    },
    {
      accessorKey: 'sujet',
      header: 'Sujet',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelected(row.original)}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-black text-primary shadow-subtle transition hover:scale-[1.02] hover:bg-cyan-soft"
        >
          <Eye className="h-4 w-4" />
          Voir details
        </button>
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
    <>
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

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Reclamation #{selected.id}</p>
                <h2 className="mt-1 text-2xl font-black text-primary">{selected.sujet}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 rounded-2xl border border-sky-50 bg-cyan-soft/35 p-4 text-sm font-semibold text-slate-700 sm:grid-cols-2">
              <p><span className="text-muted">Stagiaire:</span> {selected.nom} {selected.prenom}</p>
              <p><span className="text-muted">CIN:</span> {selected.cin}</p>
              <p><span className="text-muted">Telephone:</span> {selected.telephone}</p>
              <p><span className="text-muted">Chambre:</span> {selected.chambre || '-'}</p>
              <p><span className="text-muted">Categorie:</span> {selected.categorie}</p>
              <p><span className="text-muted">Type:</span> {selected.type}</p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-black text-primary">Message complet</p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-sky-50 bg-white p-4 text-sm font-semibold leading-7 text-slate-700 shadow-subtle">
                  {selected.message}
                </p>
              </div>
              <div>
                <p className="text-sm font-black text-primary">Reponse admin</p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-sky-50 bg-white p-4 text-sm font-semibold leading-7 text-slate-700 shadow-subtle">
                  {selected.reponse_admin || '-'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Badge tone={statusTone(selected.statut)}>{selected.statut}</Badge>
              <button
                type="button"
                onClick={() => answerReclamation(selected)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-soft transition hover:scale-[1.02] hover:bg-primary-dark"
              >
                <MessageSquareReply className="h-4 w-4" />
                Repondre
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
