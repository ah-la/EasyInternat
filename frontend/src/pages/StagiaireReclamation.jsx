import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, LogOut, Send } from 'lucide-react'
import { toast } from 'sonner'
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
  const navigate = useNavigate()

  const logout = () => {
    clearCurrentRole()
    navigate('/', { replace: true })
  }

  const submit = async (event) => {
    event.preventDefault()
    await store.createReclamation(form)
    toast.success('Reclamation envoyee a l admin et au responsable.')
    setForm(emptyForm)
  }

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

      <Card className="mx-auto w-full max-w-xl p-8">
        <h1 className="text-3xl font-bold text-primary">Nouvelle reclamation</h1>
        <p className="mt-2 text-sm text-muted">Decrivez le probleme pour faciliter son traitement.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option>Chambre</option>
            <option>Securite</option>
            <option>Restauration</option>
            <option>Autre</option>
          </select>
          <input required className="input" placeholder="Sujet" value={form.sujet} onChange={(event) => setForm({ ...form, sujet: event.target.value })} />
          <textarea required className="input min-h-36 resize-y" placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4" />
            Envoyer
          </Button>
        </form>
      </Card>
    </div>
  )
}
