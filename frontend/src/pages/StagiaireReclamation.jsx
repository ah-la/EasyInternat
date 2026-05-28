import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Eye, LogOut, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import StagiaireMiniProfile from '../components/StagiaireMiniProfile.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { clearCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const emptyForm = {
  type: 'Chambre',
  sujet: '',
  message: ''
}

const reclamationTypes = ['Chambre', 'Maintenance', 'Securite', 'Nourriture', 'Autre']

function ResponseModal({ reclamation, onClose }) {
  if (!reclamation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Reclamation #{reclamation.id}</p>
            <h2 className="mt-1 text-xl font-black text-primary">{reclamation.sujet}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-sky-50 bg-cyan-soft/35 p-4">
            <p className="text-xs font-black uppercase text-muted">Statut</p>
            <div className="mt-2">
              <Badge tone={statusTone(reclamation.statut)}>{reclamation.statut}</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-primary">Reponse admin</p>
            <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-sky-50 bg-white p-4 text-sm font-semibold leading-7 text-slate-700 shadow-subtle">
              {reclamation.reponse_admin || 'Aucune reponse pour le moment.'}
            </p>
          </div>
          {reclamation.reponse_at_label ? (
            <p className="text-xs font-bold text-muted">
              Repondu le {reclamation.reponse_at_label}
              {reclamation.reponse_by ? ` par ${reclamation.reponse_by}` : ''}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function StagiaireReclamation() {
  const [form, setForm] = useState(emptyForm)
  const [profile, setProfile] = useState(null)
  const [reclamations, setReclamations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, reclamationData] = await Promise.all([
        store.getMyProfile(),
        store.getReclamations()
      ])
      setProfile(profileData)
      setReclamations(reclamationData)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger vos donnees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const logout = () => {
    clearCurrentRole()
    navigate('/', { replace: true })
  }

  const validate = () => {
    if (form.sujet.trim().length < 3) {
      toast.error('Sujet trop court.')
      return false
    }

    if (form.message.trim().length < 10) {
      toast.error('Message trop court.')
      return false
    }

    return true
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const created = await store.createReclamation({
        ...form,
        sujet: form.sujet.trim(),
        message: form.message.trim()
      })
      toast.success('Reclamation envoyee avec succes.')
      setReclamations((current) => [created, ...current])
      setForm(emptyForm)
    } catch (error) {
      toast.error(error.response?.data?.message || "La reclamation n'a pas pu etre envoyee.")
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo(() => [
    { accessorKey: 'created_at_label', header: 'Date' },
    {
      accessorKey: 'sujet',
      header: 'Reclamation',
      cell: ({ row }) => (
        <div>
          <p className="font-black text-primary">{row.original.sujet}</p>
          <p className="text-xs font-bold text-muted">{row.original.type}</p>
        </div>
      )
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'reponse_admin',
      header: 'Reponse admin',
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-2">
          <p className="max-h-12 max-w-xs overflow-hidden font-semibold leading-6 text-slate-700">{row.original.reponse_admin || '-'}</p>
          <button
            type="button"
            onClick={() => setSelectedResponse(row.original)}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs font-black text-primary shadow-subtle transition hover:-translate-y-0.5 hover:bg-cyan-soft"
          >
            <Eye className="h-4 w-4" />
            Voir reponse
          </button>
        </div>
      )
    }
  ], [])

  return (
    <div className="app-shell min-h-screen bg-bg p-4 text-text sm:p-6">
      <div className="mx-auto mb-4 flex w-full max-w-xl flex-wrap justify-end gap-2">
        <Button as={Link} to="/stagiaire/sortie" variant="secondary">
          <CalendarClock className="h-4 w-4" />
          Declarer une sortie
        </Button>
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-primary shadow-subtle hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </button>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <StagiaireMiniProfile profile={profile} />
      </div>

      <Card className="mx-auto w-full max-w-xl p-5 transition duration-300 hover:shadow-lg sm:p-8">
        <h1 className="text-3xl font-bold text-primary">Nouvelle reclamation</h1>
        <p className="mt-2 text-sm text-muted">Decrivez le probleme pour faciliter son traitement.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {reclamationTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          <input required className="input" placeholder="Sujet" value={form.sujet} onChange={(event) => setForm({ ...form, sujet: event.target.value })} />
          <textarea required className="input min-h-36 resize-y" placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          <Button type="submit" disabled={submitting} className="w-full transition duration-300 hover:-translate-y-0.5">
            <Send className="h-4 w-4" />
            {submitting ? 'Envoi en cours...' : 'Envoyer'}
          </Button>
        </form>
      </Card>

      <div className="mx-auto mt-6 w-full max-w-4xl">
        <DataTable
          title="Suivi des reclamations"
          columns={columns}
          rows={reclamations}
          loading={loading}
          emptyMessage="Aucune reclamation envoyee"
          searchable={false}
          pageSize={5}
          showExport={false}
        />
      </div>
      <ResponseModal reclamation={selectedResponse} onClose={() => setSelectedResponse(null)} />
    </div>
  )
}
