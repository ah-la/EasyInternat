import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Eye, MessageSquareReply, Wrench, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { store } from '../lib/store.js'

const categoryClass = (category = '') =>
  String(category).toLowerCase().includes('fille')
    ? 'border-pink-200 bg-pink-50 text-pink-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

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

function DetailsModal({ selected, onClose, onReply }) {
  if (!selected) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Reclamation #{selected.id}</p>
            <h2 className="mt-1 text-2xl font-black text-primary">{selected.sujet}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft" title="Fermer">
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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-subtle">
            <p className="text-xs font-black uppercase text-muted">Creee le</p>
            <p className="mt-1 text-sm font-black text-primary">{selected.created_at_label || '-'}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-subtle">
            <p className="text-xs font-black uppercase text-muted">Reponse envoyee</p>
            <p className="mt-1 text-sm font-black text-primary">{selected.reponse_at_label || '-'}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-subtle">
            <p className="text-xs font-black uppercase text-muted">Par</p>
            <p className="mt-1 text-sm font-black text-primary">{selected.reponse_by || '-'}</p>
          </div>
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
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(selected.statut)}>{selected.statut}</Badge>
          </div>
          <button
            type="button"
            onClick={() => onReply(selected)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-soft transition hover:scale-[1.02] hover:bg-primary-dark"
          >
            <MessageSquareReply className="h-4 w-4" />
            Repondre
          </button>
        </div>
      </div>
    </div>
  )
}

function ResponseModal({ target, onClose, onSubmit, saving }) {
  const [reponse, setReponse] = useState('')

  useEffect(() => {
    if (!target) return
    setReponse(target.reponse_admin || '')
  }, [target])

  if (!target) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(target, reponse)
        }}
        className="w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Reponse reclamation #{target.id}</p>
            <h2 className="mt-1 text-xl font-black text-primary">{target.sujet}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-primary">Reponse</span>
          <textarea
            rows={5}
            className="input min-h-36 resize-y"
            placeholder="Ecrire la reponse pour traiter, ou laisser vide pour mettre en cours..."
            value={reponse}
            onChange={(event) => setReponse(event.target.value)}
          />
          <p className="mt-2 text-xs font-semibold text-muted">
            Reponse vide = En cours. Reponse remplie = Traitee.
          </p>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving}>
            <MessageSquareReply className="h-4 w-4" />
            {saving ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function Reclamations() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ statut: '' })
  const [selected, setSelected] = useState(null)
  const [replyTarget, setReplyTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    store.getReclamations(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  const summary = useMemo(() => ({
    pending: rows.filter((row) => row.statut_api === 'en_attente').length,
    done: rows.filter((row) => row.statut_api === 'traitee').length,
    maintenance: rows.filter((row) => String(row.type || '').toLowerCase().includes('maintenance')).length,
    chambres: rows.filter((row) => String(row.type || '').toLowerCase().includes('chambre')).length,
  }), [rows])

  const submitResponse = async (row, reponse) => {
    setSaving(true)
    try {
      const hasResponse = reponse.trim().length > 0
      const payload = hasResponse
        ? { reponse_admin: reponse.trim(), statut: 'traitee' }
        : { reponse_admin: '', statut: 'en_cours' }
      const updated = await store.updateReclamation(row.id, payload)
      setRows((current) => current.map((item) => (item.id === row.id ? updated : item)))
      setSelected((current) => (current?.id === row.id ? updated : current))
      setReplyTarget(null)
      toast.success(hasResponse ? 'Reponse envoyee.' : 'Reclamation mise en cours.')
    } catch (error) {
      toast.error(error.response?.data?.message || "La reponse n'a pas pu etre envoyee.")
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { accessorKey: 'id', header: 'Ref.' },
    { accessorKey: 'created_at_label', header: 'Date creation' },
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
          onClick={() => setReplyTarget(row.original)}
          title="Repondre"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
        >
          <MessageSquareReply className="h-4 w-4" />
        </button>
      )
    }
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="En attente" value={summary.pending} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        <StatCard label="Traitees" value={summary.done} icon={CheckCircle2} tone="bg-green-50 text-success" />
        <StatCard label="Maintenance" value={summary.maintenance} icon={Wrench} tone="bg-cyan-soft text-primary" />
        <StatCard label="Chambres" value={summary.chambres} icon={AlertTriangle} tone="bg-red-50 text-danger" />
      </div>

      <DataTable
        title="Reclamations"
        columns={columns}
        rows={rows}
        loading={loading}
        showHeading={false}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.statut}
              onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            >
              <option value="">Statut</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="traitee">Traitee</option>
            </select>
          </div>
        }
      />

      <DetailsModal selected={selected} onClose={() => setSelected(null)} onReply={setReplyTarget} />
      <ResponseModal target={replyTarget} onClose={() => setReplyTarget(null)} onSubmit={submitResponse} saving={saving} />
    </div>
  )
}
