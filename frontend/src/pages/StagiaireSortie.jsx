import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, LogOut, MessageSquareText, Send } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { clearCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const emptyForm = {
  dateSortie: '',
  dateRetour: '',
  motif: ''
}

export default function StagiaireSortie() {
  const [form, setForm] = useState(emptyForm)
  const navigate = useNavigate()

  const logout = () => {
    clearCurrentRole()
    navigate('/', { replace: true })
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      await store.createSortie({
        date_sortie: form.dateSortie,
        date_retour: form.dateRetour,
        motif: form.motif
      })
      toast.success('Sortie enregistree et envoyee au responsable.')
      setForm(emptyForm)
    } catch (error) {
      toast.error(error.response?.data?.message || "La sortie n'a pas pu etre envoyee.")
    }
  }

  return (
    <div className="app-shell min-h-screen bg-bg p-6 text-text">
      <div className="mx-auto mb-4 flex w-full max-w-2xl flex-wrap justify-end gap-2">
        <Button as={Link} to="/stagiaire/reclamation" variant="secondary">
          <MessageSquareText className="h-4 w-4" />
          Envoyer une reclamation
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

      <Card className="mx-auto w-full max-w-2xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-cyan-soft text-primary">
            <CalendarClock className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-primary">Declarer une sortie</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Indiquez la date de sortie, la date de retour prevue et le motif.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">Date de sortie</span>
            <input required className="input" type="date" value={form.dateSortie} onChange={(event) => setForm({ ...form, dateSortie: event.target.value })} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">Date retour prevue</span>
            <input required className="input" type="date" value={form.dateRetour} onChange={(event) => setForm({ ...form, dateRetour: event.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-primary">Motif</span>
            <textarea required className="input min-h-24" placeholder="Weekend, vacances, rendez-vous..." value={form.motif} onChange={(event) => setForm({ ...form, motif: event.target.value })} />
          </label>

          <Button type="submit" className="sm:col-span-2">
            <Send className="h-4 w-4" />
            Envoyer la sortie
          </Button>
        </form>
      </Card>
    </div>
  )
}
