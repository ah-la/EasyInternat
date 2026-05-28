import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, LogOut, Send } from 'lucide-react'
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

export default function StagiaireReclamation() {
  const [form, setForm] = useState(emptyForm)
  const [profile, setProfile] = useState(null)
  const [reclamations, setReclamations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
      toast.success('Reclamation envoyee.')
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
        <div className="max-w-sm">
          <p className="font-semibold text-slate-700">{row.original.reponse_admin || '-'}</p>
          {row.original.reponse_at_label ? (
            <p className="mt-1 text-xs font-bold text-muted">
              {row.original.reponse_at_label}
              {row.original.reponse_by ? ` par ${row.original.reponse_by}` : ''}
            </p>
          ) : null}
        </div>
      )
    }
  ], [])

  return (
    <div className="app-shell min-h-screen bg-bg p-6 text-text">
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

      <Card className="mx-auto w-full max-w-xl p-8 transition duration-300 hover:shadow-lg">
        <h1 className="text-3xl font-bold text-primary">Nouvelle reclamation</h1>
        <p className="mt-2 text-sm text-muted">Decrivez le probleme pour faciliter son traitement.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option>Chambre</option>
            <option>Maintenance</option>
            <option>Securite</option>
            <option>Restauration</option>
            <option>Autre</option>
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
          title="Mes reclamations"
          columns={columns}
          rows={reclamations}
          loading={loading}
          emptyMessage="Aucune reclamation envoyee"
          searchable={false}
          pageSize={5}
          exportBeforeActions
        />
      </div>
    </div>
  )
}
