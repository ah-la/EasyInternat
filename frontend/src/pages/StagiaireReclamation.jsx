import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, LogOut, Send } from 'lucide-react'
import { toast } from 'sonner'
import StagiaireMiniProfile from '../components/StagiaireMiniProfile.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { logoutUser } from '../lib/logout.js'
import { store } from '../lib/store.js'

const emptyForm = {
  type: 'Chambre',
  sujet: '',
  message: ''
}

const reclamationTypes = ['Chambre', 'Maintenance', 'Securite', 'Nourriture', 'Autre']

export default function StagiaireReclamation() {
  const [form, setForm] = useState(emptyForm)
  const [profile, setProfile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    store.getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])

  const logout = async () => {
    await logoutUser()
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
      await store.createReclamation({
        ...form,
        sujet: form.sujet.trim(),
        message: form.message.trim()
      })
      toast.success('Reclamation envoyee avec succes.')
      setForm(emptyForm)
    } catch (error) {
      toast.error(error.response?.data?.message || "La reclamation n'a pas pu etre envoyee.")
    } finally {
      setSubmitting(false)
    }
  }

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
    </div>
  )
}
