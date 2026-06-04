import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, LogOut, MessageSquareText, Send } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import StagiaireMiniProfile from '../components/StagiaireMiniProfile.jsx'
import { logoutUser } from '../lib/logout.js'
import { store } from '../lib/store.js'

const emptyForm = {
  dateSortie: '',
  heureSortie: '',
  dateRetour: '',
  heureRetour: '',
  motif: 'Weekend',
  motifAutre: ''
}

const motifOptions = ['Weekend', 'Famille', 'Maladie', 'Vacances', 'Autre']

export default function StagiaireSortie() {
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
    if (!form.dateSortie) {
      toast.error('Date sortie obligatoire.')
      return false
    }

    if (!form.dateRetour) {
      toast.error('Date retour obligatoire.')
      return false
    }

    if (!form.heureSortie) {
      toast.error('Heure sortie obligatoire.')
      return false
    }

    if (!form.heureRetour) {
      toast.error('Heure retour obligatoire.')
      return false
    }

    if (form.dateRetour < form.dateSortie) {
      toast.error('Date retour doit etre apres la date sortie.')
      return false
    }

    if (form.motif === 'Autre' && form.motifAutre.trim().length < 5) {
      toast.error('Message trop court pour le motif.')
      return false
    }

    return true
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await store.createSortie({
        date_sortie: form.dateSortie,
        heure_sortie: form.heureSortie,
        date_retour: form.dateRetour,
        heure_retour_prevue: form.heureRetour,
        motif: form.motif === 'Autre' ? form.motifAutre.trim() : form.motif
      })
      toast.success('Sortie declaree avec succes.')
      setForm(emptyForm)
    } catch (error) {
      toast.error(error.response?.data?.message || "La sortie n'a pas pu etre envoyee.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell min-h-screen bg-bg p-4 text-text sm:p-6">
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

      <div className="mx-auto w-full max-w-2xl">
        <StagiaireMiniProfile profile={profile} />
      </div>

      <Card className="mx-auto w-full max-w-2xl p-5 sm:p-8">
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
            <span className="mb-2 block text-sm font-semibold text-primary">Heure de sortie</span>
            <input required className="input" type="time" value={form.heureSortie} onChange={(event) => setForm({ ...form, heureSortie: event.target.value })} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">Date retour prevue</span>
            <input required className="input" type="date" value={form.dateRetour} onChange={(event) => setForm({ ...form, dateRetour: event.target.value })} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary">Heure retour prevue</span>
            <input required className="input" type="time" value={form.heureRetour} onChange={(event) => setForm({ ...form, heureRetour: event.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-primary">Motif</span>
            <select className="input" value={form.motif} onChange={(event) => setForm({ ...form, motif: event.target.value, motifAutre: '' })}>
              {motifOptions.map((motif) => <option key={motif}>{motif}</option>)}
            </select>
          </label>
          {form.motif === 'Autre' ? (
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-primary">Precisez le motif</span>
              <textarea
                className="input min-h-24"
                placeholder="Expliquez votre motif..."
                value={form.motifAutre}
                onChange={(event) => setForm({ ...form, motifAutre: event.target.value })}
              />
            </label>
          ) : null}

          <Button type="submit" disabled={submitting} className="sm:col-span-2 transition duration-300 hover:-translate-y-0.5">
            <Send className="h-4 w-4" />
            {submitting ? 'Envoi en cours...' : 'Declarer ma sortie'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
